import {useLayoutEffect,useRef,useState} from 'react';
import type {KeyboardEvent,PointerEvent} from 'react';
import {fit} from './floatingGeometry';
type Position={x:number;y:number};
export function useMovablePanel(storageKey:string,margin=12){
  const panel=useRef<HTMLElement>(null),drag=useRef<{id:number;x:number;y:number;left:number;top:number}|null>(null);
  const [dragging,setDragging]=useState(false);
  const [position,setPosition]=useState<Position|null>(()=>{try{const p=JSON.parse(localStorage.getItem(storageKey)||'null');return p&&Number.isFinite(p.x)&&Number.isFinite(p.y)?{x:fit(p.x,0,1),y:fit(p.y,0,1)}:null;}catch{return null;}});
  const current=useRef(position);current.current=position;
  const bounds=()=>{const r=panel.current!.getBoundingClientRect();return {x:Math.max(0,innerWidth-r.width-margin*2),y:Math.max(0,innerHeight-r.height-margin*2)};};
  useLayoutEffect(()=>{
    const el=panel.current;if(!el)return;
    const update=()=>{if(!current.current){el.style.removeProperty('left');el.style.removeProperty('top');el.style.removeProperty('bottom');return;}const b=bounds();el.style.left=`${margin+current.current.x*b.x}px`;el.style.top=`${margin+current.current.y*b.y}px`;el.style.bottom='auto';};
    update();const observer=new ResizeObserver(update);observer.observe(el);window.addEventListener('resize',update);return()=>{observer.disconnect();window.removeEventListener('resize',update);};
  },[position,margin]);
  const save=(p:Position|null)=>{try{if(p)localStorage.setItem(storageKey,JSON.stringify(p));else localStorage.removeItem(storageKey);}catch{}};
  const move=(left:number,top:number)=>{const b=bounds(),p={x:b.x?fit((left-margin)/b.x,0,1):0,y:b.y?fit((top-margin)/b.y,0,1):0};current.current=p;setPosition(p);return p;};
  const reset=()=>{drag.current=null;setDragging(false);current.current=null;setPosition(null);save(null);};
  const end=(e:PointerEvent<HTMLButtonElement>)=>{if(drag.current?.id!==e.pointerId)return;drag.current=null;setDragging(false);save(current.current);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);};
  return {panel,dragging,position,reset,handle:{
    onPointerDown:(e:PointerEvent<HTMLButtonElement>)=>{if(e.button!==0)return;e.preventDefault();e.currentTarget.focus();const r=panel.current!.getBoundingClientRect();drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,left:r.left,top:r.top};e.currentTarget.setPointerCapture(e.pointerId);setDragging(true);},
    onPointerMove:(e:PointerEvent<HTMLButtonElement>)=>{const d=drag.current;if(d?.id===e.pointerId)move(d.left+e.clientX-d.x,d.top+e.clientY-d.y);},
    onPointerUp:end,onPointerCancel:end,onLostPointerCapture:()=>{drag.current=null;setDragging(false);},
    onKeyDown:(e:KeyboardEvent<HTMLButtonElement>)=>{const moves:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(e.key==='Home'){e.preventDefault();reset();return;}const d=moves[e.key];if(!d)return;e.preventDefault();e.stopPropagation();const r=panel.current!.getBoundingClientRect(),step=e.shiftKey?30:10;save(move(r.left+d[0]*step,r.top+d[1]*step));}
  }};
}

import {useLayoutEffect,useRef} from 'react';
import {placeBubble} from './floatingGeometry';
export function useBubbleAnchor(active:boolean){
  const anchor=useRef<HTMLElement>(null),bubble=useRef<HTMLDivElement>(null);
  useLayoutEffect(()=>{
    if(!active)return;
    let frame=0,previous='';
    const update=()=>{
      const a=anchor.current,b=bubble.current;
      if(a&&b){
        const rect=a.getBoundingClientRect(),box=b.getBoundingClientRect();
        const next=placeBubble(rect,box,{width:document.documentElement.clientWidth,height:window.innerHeight});
        const signature=JSON.stringify(next);
        if(signature!==previous){previous=signature;b.style.setProperty('--bubble-left',`${next.left}px`);b.style.setProperty('--bubble-top',`${next.top}px`);b.style.setProperty('--bubble-tail',`${next.tail}px`);b.dataset.side=next.side;}
      }
      frame=requestAnimationFrame(update);
    };
    update();return()=>cancelAnimationFrame(frame);
  },[active]);
  return {anchor,bubble};
}

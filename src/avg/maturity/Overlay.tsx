import {useEffect,useRef} from 'react';
import type {ReactNode} from 'react';
export function Overlay({label,onClose,children,className=''}:{label:string;onClose:()=>void;children:ReactNode;className?:string}){
 const ref=useRef<HTMLElement>(null),close=useRef(onClose);close.current=onClose;
 useEffect(()=>{const previous=document.activeElement as HTMLElement;ref.current?.focus();return()=>{requestAnimationFrame(()=>{if(previous?.isConnected&&!previous.closest('[inert]'))previous.focus();});};},[label]);
 return <div className={`maturity-shade ${className}`} onPointerDown={e=>{if(e.target===e.currentTarget)close.current();}}><section ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={label} className="maturity-sheet" onKeyDown={e=>{
 if(e.key==='Escape'){e.stopPropagation();close.current();}
 if(e.key==='Tab'){const items=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,select,summary,[tabindex="0"]')).filter(x=>x.getClientRects().length);if(!items.length){e.preventDefault();return;}const i=items.indexOf(document.activeElement as HTMLElement);if(e.shiftKey&&(i<=0)){e.preventDefault();items.at(-1)?.focus();}else if(!e.shiftKey&&(i<0||i===items.length-1)){e.preventDefault();items[0].focus();}}
 }}><button className="maturity-close" aria-label={`关闭${label}`} onClick={onClose}>×</button>{children}</section></div>;
}

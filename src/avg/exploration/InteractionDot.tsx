import type { CSSProperties } from 'react';
import type { Point } from './types';

export function InteractionDot({point,mobilePoint,label,onClick,disabled=false,visited=false,reveal=false,guided=false,onHover,objectId,kind='observe'}:{
  point:Point;mobilePoint?:Point;label:string;onClick:()=>void;disabled?:boolean;visited?:boolean;reveal?:boolean;guided?:boolean;onHover?:(active:boolean)=>void;objectId?:string;kind?:'door'|'take'|'observe';
}) {
  return <button className={`interaction-dot ${visited?'is-visited':''} ${reveal?'is-revealed':''} ${guided?'is-guided':''}`} style={{'--dot-x':`${point[0]}%`,'--dot-y':`${point[1]}%`,'--mobile-dot-x':`${mobilePoint?.[0]??point[0]}%`,'--mobile-dot-y':`${mobilePoint?.[1]??point[1]}%`} as CSSProperties}
    aria-label={label} disabled={disabled} data-object={objectId} data-kind={kind} onClick={onClick} onMouseEnter={()=>onHover?.(true)} onMouseLeave={()=>onHover?.(false)} onFocus={()=>onHover?.(true)} onBlur={()=>onHover?.(false)}>
    <i aria-hidden="true"/><span className="dot-label">{label}</span>
  </button>;
}

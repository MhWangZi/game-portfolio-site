import poses from './poses.json';
import { useId } from 'react';
import './actions.css';
export function ActionSprite({pose}:{pose:string}) {
  const key=useId();
  const definition=poses.find(p=>p.id===pose);
  if(!definition)return null;
  const x=(definition.cell%4)*384,y=Math.floor(definition.cell/4)*(1024/3);
  return <svg aria-hidden="true" className="avg-sprite action-sprite" viewBox={`${x+20} ${y+22} 344 316`} preserveAspectRatio="xMidYMax meet">
    <defs>
      <filter id={`${key}-key`} colorInterpolationFilters="sRGB" x="0" y="0" width="1536" height="1024" filterUnits="userSpaceOnUse">
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  6 6 6 0 -.35"/>
        <feMorphology operator="dilate" radius="12"/><feMorphology operator="erode" radius="12"/>
      </filter>
      <mask id={`${key}-mask`} x="0" y="0" width="1536" height="1024" maskUnits="userSpaceOnUse">
        <image href="./media/avg/companion-actions.png" width="1536" height="1024" filter={`url(#${key}-key)`}/>
      </mask>
    </defs>
    <image href="./media/avg/companion-actions.png" width="1536" height="1024" mask={`url(#${key}-mask)`}/>
  </svg>;
}

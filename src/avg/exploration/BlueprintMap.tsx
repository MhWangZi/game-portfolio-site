import layout from './map-layout.json';
import {cinematicRooms} from './cinematicData';
import {rooms,type RoomId} from '../world';
export function BlueprintMap({current,unlocked}:{current:RoomId;unlocked:boolean}){
  const visible=cinematicRooms.filter(r=>unlocked||!['secret','storage'].includes(r.id));
  const ids=new Set(visible.map(r=>r.id)),seen=new Set<string>();
  const edges=visible.flatMap(r=>r.objects.flatMap(o=>{
    const a=o.transition.action;if(a?.type!=='room'||!ids.has(a.target))return[];
    const key=[r.id,a.target].sort().join(':');if(seen.has(key))return[];seen.add(key);return[{from:r.id,to:a.target,key}];
  }));
  return <figure className="blueprint-map"><svg viewBox="0 0 710 235" role="img" aria-label={`建筑路线图，当前位置：${rooms[current].label}`}>
    {edges.map(e=>{const a=layout[e.from],b=layout[e.to];return <path key={e.key} d={`M${a[0]},${a[1]} H${(a[0]+b[0])/2} V${b[1]} H${b[0]}`} fill="none" stroke="currentColor"/>;})}
    {visible.map(r=>{const [x,y]=layout[r.id];return <g key={r.id} data-current={r.id===current} transform={`translate(${x},${y})`}><rect x="-42" y="-15" width="84" height="30" rx="1"/><text textAnchor="middle" dominantBaseline="central">{rooms[r.id].label}</text>{r.id===current&&<text className="map-you" y="31" textAnchor="middle">你在这里</text>}</g>;})}
  </svg><figcaption>沿画面里的门走。图上的线只记路线。</figcaption></figure>;
}

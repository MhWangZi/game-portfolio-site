import type {CSSProperties} from 'react';
import type {RoomId} from '../world';
export function SceneTraces({room,challenge,tension,still}:{room:RoomId;challenge:boolean;tension:number;still:boolean}){
 return <div className={`world-traces ${still?'traces-still':''}`} aria-hidden="true">
  {room==='duty'&&challenge&&<span className="clock-memory" style={{left:'46.5%',top:'11.5%'} as CSSProperties}/>}
  {tension>=3&&['projection','archive','corridor'].includes(room)&&<div className="tense-room-light"/>}
 </div>;
}

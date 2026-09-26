import type {RoomId} from '../world';
import definitions from './sceneDiffs.json';
import './sceneDiffs.css';

export const sceneDiffs=definitions as {id:string;room:RoomId;anchor:[number,number];pose:string;asset:string}[];
export const sceneDiff=(id:string)=>sceneDiffs.find(diff=>diff.id===id);

/** Localized transparent artwork stays registered to the 1536×1024 room plate. */
export function SceneDiffLayer({room,traces,still}:{room:RoomId;traces:string[];still:boolean}){
  return <div className={`scene-diff-layer ${still?'scene-diff-still':''}`} aria-hidden="true">
    {sceneDiffs.filter(diff=>diff.room===room&&traces.includes(diff.id)).map(diff=><img key={diff.id} data-scene-diff={diff.id} src={diff.asset} alt="" draggable={false}/>)}
  </div>;
}

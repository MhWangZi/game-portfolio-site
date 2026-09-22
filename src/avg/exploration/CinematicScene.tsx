import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { RoomId } from '../world';
import type { WorldAction } from './types';
import type { CinematicSave, CinematicObject, SceneTransition } from './cinematicTypes';
import { resolveSceneState } from './cinematicTypes';
import type { AtmosphereAudio } from './AtmosphereAudio';
import { cinematicRooms } from './cinematicData';
import { InteractionDot } from './InteractionDot';
import { preloadSceneImage as preload } from './sceneImages';
import feedbackConfig from './feedback.json';
import {sceneFeedback,type FeedbackRule} from './feedback';
import './feedback.css';
const polygonArea = (polygon: number[][]) => Math.abs(polygon.reduce((area,p,i)=>{const q=polygon[(i+1)%polygon.length];return area+p[0]*q[1]-q[0]*p[1];},0)/2);
export function CinematicScene({room,save,disabled,still,hints,audio,onCommit,onAction,onSpeak,guide=false,visits={}}: {
  guide?:boolean;visits?:Record<string,number>;
  room: RoomId; save:CinematicSave; disabled:boolean; still:boolean; hints:boolean; audio:AtmosphereAudio;
  onCommit:(room:RoomId,transition:SceneTransition)=>void;
  onAction:(action:WorldAction)=>void; onSpeak:(text:string,object:CinematicObject)=>void;
}) {
  const definition=cinematicRooms.find(r=>r.id===room)!;
  const state=resolveSceneState(definition,save);
  const src=definition.variants[state];
  const [visual,setVisual]=useState(src),[old,setOld]=useState<string|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[ready,setReady]=useState(false),[visited,setVisited]=useState<string[]>([]);
  const [camera,setCamera]=useState<SceneTransition['camera']>();
  const timers=useRef<ReturnType<typeof setTimeout>[]>([]), generation=useRef(0), alive=useRef(true);
  const [feedback,setFeedback]=useState<FeedbackRule|null>(null);
  const [guiding,setGuiding]=useState(false),guideStarted=useRef(false);
  useEffect(()=>{
    if(!guide){setGuiding(false);return;}
    if(!ready||disabled||guideStarted.current)return;
    guideStarted.current=true;setGuiding(true);
    timers.current.push(setTimeout(()=>setGuiding(false),feedbackConfig.guidance.durationMs));
  },[guide,ready,disabled]);
  const callbacks=useRef({onCommit,onAction,onSpeak});callbacks.current={onCommit,onAction,onSpeak};
  useEffect(()=>{
    alive.current=true;
    const pendingTimers=timers.current;
    // Adjacent states load quietly; a failed prefetch never commits inventory or progress.
    for(const image of new Set(Object.values(definition.variants))) void preload(image).catch(()=>{});
    return()=>{alive.current=false;pendingTimers.forEach(clearTimeout);};
  },[definition]);
  useEffect(()=>{if(src!==visual && !busy){setOld(visual);setVisual(src);}},[src,visual,busy]);
  useEffect(()=>{if(old){const t=setTimeout(()=>setOld(null),still?180:850);return()=>clearTimeout(t);}},[old,still]);
  const available=(object:CinematicObject)=> (!object.states || object.states.includes(state)) && (!object.requiresItem || save.inventory.includes(object.requiresItem)) && (!object.excludesItem || !save.inventory.includes(object.excludesItem));
  async function interact(object:CinematicObject) {
    if(disabled||busy||!ready) return;
    const transition=object.transition, ticket=++generation.current;
    if(transition.action?.type==='room'){callbacks.current.onAction(transition.action);return;}
    setError('');setBusy(true);audio.play(transition.sound??'take');
    try {
      const next=transition.state?definition.variants[transition.state]:undefined;
      if(next) await preload(next);
      if(!alive.current||ticket!==generation.current)return;
      if(next&&next!==visual){setOld(visual);setVisual(next);}
      if(transition.camera) setCamera({...transition.camera,duration:still?300:transition.camera.duration});
      callbacks.current.onCommit(room,transition);
      const reaction=sceneFeedback(feedbackConfig.reactions,room,object.id,state,visits);
      if(reaction){setFeedback(reaction);if(reaction.sound==='purr')audio.playPurr();timers.current.push(setTimeout(()=>setFeedback(null),reaction.durationMs));}
      if(transition.speech||transition.give)callbacks.current.onSpeak(transition.speech??'',object);
      setVisited(v=>[...new Set([...v,object.id])]);
      const wait=still?Math.min(transition.wait??550,350):transition.wait??850;
      timers.current.push(setTimeout(()=>{
        if(!alive.current)return;
        setOld(null);setBusy(false);
        if(transition.action)callbacks.current.onAction(transition.action);
      },wait));
    } catch(e) { if(alive.current){setBusy(false);setError((e as Error).message);} }
  }
  // Small details must sit above the furniture that contains them in the SVG hit layer.
  const objects=definition.objects.filter(available).sort((a,b)=>polygonArea(b.polygon)-polygonArea(a.polygon));
  return <div className={`cinematic-room ${busy?'changing-state':''} ${still?'film-still':''}`} data-scene-state={state} data-scene-busy={busy}>
    <div className="cinematic-camera" style={{'--focus-x':`${camera?.x??50}%`,'--focus-y':`${camera?.y??50}%`,'--focus-scale':camera?.scale??1,'--focus-duration':`${camera?.duration??850}ms`} as CSSProperties}>
      <img className="cinematic-plate" src={visual} alt={`${room}，${state}`} draggable={false} onLoad={()=>setReady(true)} onError={()=>setError('房间图像未接通，请刷新重试。')}/>
      {old&&<img className="cinematic-plate outgoing-plate" src={old} alt="" draggable={false}/ >}
      {feedback&&<svg className="scene-feedback" data-feedback={feedback.visual} aria-hidden="true" viewBox="0 0 24 14" style={{left:feedback.point[0]+'%',top:feedback.point[1]+'%','--feedback-duration':feedback.durationMs+'ms'} as CSSProperties}><path d="M3 4l3 3 3-3M15 4l3 3 3-3M9 10q3 3 6 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/></svg>}
      <div className="scene-dot-layer" aria-label="场景中的可互动物件">
        {objects.map(object=><InteractionDot key={object.id} objectId={object.id} guided={guiding&&feedbackConfig.guidance.objects.includes(object.id)} kind={object.transition.action?.type==='room'?'door':object.transition.give?'take':'observe'} point={object.point??[object.polygon.reduce((n,p)=>n+p[0],0)/object.polygon.length,object.polygon.reduce((n,p)=>n+p[1],0)/object.polygon.length]} label={object.label} reveal={hints} visited={visited.includes(object.id)} disabled={disabled||busy||!ready} onClick={()=>void interact(object)}/>)}
      </div>
    </div>
    <div className="quiet-film-grain" aria-hidden="true"/>
    {!ready&&!error&&<div className="cinematic-loading" role="status">灯正在亮起…</div>}
    <div className="cinematic-error" role="status">{error}</div>
  </div>;
}

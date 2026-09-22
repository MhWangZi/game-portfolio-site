import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import definition from './archive-cabinet.json';
import type { Point, WorldAction } from './types';
import type { TokenId } from '../story';
import type { AtmosphereAudio } from './AtmosphereAudio';
import { InteractionDot } from './InteractionDot';
import { preloadSceneImage } from './sceneImages';

type Drawer={id:string;label:string;point:Point;action:WorldAction};
type Phase='cabinet'|'closed'|'open';
const drawers=definition.drawers as Drawer[];
export function ArchiveCabinet({audio,still,disabled,onRead,onReturn,onExit}:{audio:AtmosphereAudio;still:boolean;disabled:boolean;onRead:(action:WorldAction)=>void;onReturn:(token:TokenId)=>void;onExit:(state:{selected:boolean;read:boolean})=>void}) {
  const [phase,setPhase]=useState<Phase>('cabinet'),[selected,setSelected]=useState<Drawer|null>(null),[seen,setSeen]=useState(false),[returned,setReturned]=useState<string[]>([]);
  const [old,setOld]=useState<string|null>(null),[busy,setBusy]=useState(true),[error,setError]=useState(''),[focus,setFocus]=useState<Point>([50,50]);
  const alive=useRef(true),initialStill=useRef(still),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),phaseRef=useRef(phase);phaseRef.current=phase;
  useEffect(()=>{alive.current=true;void preloadSceneImage(definition.images.cabinet).then(()=>{if(alive.current)timer.current=setTimeout(()=>{if(alive.current)setBusy(false);},initialStill.current?150:1100);}).catch(e=>{if(alive.current){setError(e.message);setBusy(false);}});for(const src of Object.values(definition.images))void preloadSceneImage(src).catch(()=>{});return()=>{alive.current=false;clearTimeout(timer.current);};},[]);
  useEffect(()=>{if(!old)return;const t=setTimeout(()=>setOld(null),still?180:900);return()=>clearTimeout(t);},[old,still]);
  async function change(next:Phase,after?:()=>void) {
    setBusy(true);setError('');
    try{await preloadSceneImage(definition.images[next]);if(!alive.current)return;
      timer.current=setTimeout(()=>{if(!alive.current)return;setOld(definition.images[phaseRef.current]);setPhase(next);
        timer.current=setTimeout(()=>{if(!alive.current)return;setBusy(false);after?.();},still?150:900);
      },still?100:600);
    }catch(e){if(alive.current){setBusy(false);setError((e as Error).message);}}
  }
  function retrieve(drawer:Drawer){if(busy||disabled)return;setSelected(drawer);setSeen(false);setFocus(drawer.point);audio.play('drawer');void change('closed');}
  function read(){if(!selected||busy||disabled)return;audio.play('paper');if(phase==='open'){setSeen(true);onRead(selected.action);}else void change('open',()=>{setSeen(true);onRead(selected.action);});}
  function putBack(){if(!selected||busy||disabled)return;audio.play('drawer');void change('cabinet',()=>{if(seen){setReturned(ids=>[...new Set([...ids,selected.id])]);onReturn(definition.returnToken as TokenId);}setSelected(null);setSeen(false);});}
  return <section className={`archive-focus ${busy?'archive-moving':''} ${still?'archive-still':''}`} aria-label="档案柜近景" data-archive-phase={phase} data-archive-busy={busy} inert={disabled}>
    <div className="archive-camera" style={{'--drawer-x':`${focus[0]}%`,'--drawer-y':`${focus[1]}%`} as CSSProperties}>
      <img src={definition.images[phase]} alt={phase==='cabinet'?'三层小柜与三列四层大柜':phase==='closed'?'取出的档案放在桌上，系绳尚未解开':'档案展开在阅览桌上'} draggable={false}/>
      {old&&<img className="outgoing-plate" src={old} alt=""/>}
      {phase==='cabinet'?drawers.map(drawer=><InteractionDot key={drawer.id} point={drawer.point} label={`取出档案：${drawer.label}`} objectId={drawer.id} visited={returned.includes(drawer.id)} disabled={disabled||busy} onClick={()=>retrieve(drawer)}/>):<>
        <InteractionDot point={phase==='closed'?[62.4,56]:[53,56]} label={phase==='closed'?'解开系绳，翻开档案':'再次翻阅这份档案'} onClick={read} disabled={disabled||busy}/>
        <InteractionDot point={phase==='closed'?[33,73.5]:[22,71]} label="把档案放回原位" onClick={putBack} disabled={disabled||busy}/>
        <p className="folder-index">{selected?.label}</p>
      </>}
    </div>
    <header><button onClick={()=>onExit({selected:!!selected,read:seen})} disabled={busy}>←退回档案角</button><span>{phase==='cabinet'?'ARCHIVE / 15 FILES':selected?.label}</span></header>
    <p className="archive-guidance">{error|| (busy?'':phase==='cabinet'?'轻触把手上的圆点。读完后，请放回原位。':phase==='closed'?'解开系绳，或把档案放回去。':'纸页已经展开。合上后，亲手放回原位。')}</p>
  </section>;
}

import {useEffect,useRef,useState} from 'react';
import {consoleLines} from './story';
import {reelFrames} from './reel';
import {AnalogProjection} from './AnalogProjection';
import {Sprite} from './Cats';
import config from './hidden-reel-config.json';
import './hidden-reel.css';
export function HiddenChapter({onFinish,onExit,still,onDepth,audioError,onRetryAudio,onDislocation,sound=true}:{onFinish:()=>void;onExit:()=>void;still:boolean;onDepth:(depth:number)=>void;audioError?:string;onRetryAudio:()=>void;onDislocation:()=>void;sound?:boolean}){
 const [depth,setDepth]=useState(0),[line,setLine]=useState(0),[hit,setHit]=useState<number[]>([]),[mark,setMark]=useState<{x:number;y:number;ok:boolean;serial:number}|null>(null),[reply,setReply]=useState(''),[reactionBeat,setReactionBeat]=useState(0);
 const root=useRef<HTMLElement>(null),busy=useRef(false),timers=useRef<ReturnType<typeof setTimeout>[]>([]),sounds=useRef<Record<string,HTMLAudioElement>>({}),serial=useRef(0),callbacks=useRef({onFinish,onDepth,onDislocation});callbacks.current={onFinish,onDepth,onDislocation};
 useEffect(()=>{for(const [id,src]of Object.entries(config.sounds)){const a=new Audio(src);a.volume=.32;a.preload='auto';sounds.current[id]=a;}const pending=timers.current;return()=>{pending.forEach(clearTimeout);Object.values(sounds.current).forEach(a=>a.pause());};},[]);
 useEffect(()=>{root.current?.focus();callbacks.current.onDepth(depth);if(depth===5){const t=setTimeout(()=>setDepth(6),config.dislocationMs);return()=>clearTimeout(t);}if(depth===6){const t=setInterval(()=>setLine(v=>v+1),400);return()=>clearInterval(t);}},[depth]);
 useEffect(()=>{setReply('');setReactionBeat(0);if(depth>=6)return;const t=setInterval(()=>setReactionBeat(v=>v+1),6500);return()=>clearInterval(t);},[depth]);
 useEffect(()=>{if(depth===6&&line>consoleLines.length+3)callbacks.current.onFinish();},[depth,line]);
 function cue(ok:boolean){if(!sound)return;const a=sounds.current[ok?'correct':'wrong'];if(a){a.currentTime=0;void a.play().catch(()=>{});}}
 function reject(){cue(false);setReply(config.rejections[serial.current++%config.rejections.length]);timers.current.push(setTimeout(()=>setReply(''),2200));}
 function inspect(x:number,y:number){if(busy.current||depth>4)return;const target=config.targets[depth].findIndex(([a,b,w,h])=>x>=a&&x<=a+w&&y>=b&&y<=b+h),ok=target>=0&&!hit.includes(target);cue(ok);setMark({x,y,ok,serial:serial.current++});busy.current=true;
  if(ok){const next=[...hit,target];setHit(next);timers.current.push(setTimeout(()=>{setMark(null);busy.current=false;if(next.length===config.targets[depth].length){setHit([]);if(depth===4)callbacks.current.onDislocation();setDepth(v=>v+1);}},config.holdMs));}
  else timers.current.push(setTimeout(()=>{setMark(null);busy.current=false;},450));
 }
 return <section ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-label="旧录像测试" className={`ica-reel ${still?'ica-still':''}`} data-depth={depth} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();onExit();}if(e.key==='Tab'){const nodes=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled)'));const first=nodes[0],last=nodes.at(-1);if(first&&(!nodes.includes(document.activeElement as HTMLElement)||e.shiftKey&&document.activeElement===first||!e.shiftKey&&document.activeElement===last)){e.preventDefault();(e.shiftKey?last:first)?.focus();}}}}>
  <button className="ica-exit" aria-label="退出录像" title="退出录像" onClick={onExit}>×</button>
  {depth<5?<div className="ica-screen" onClick={e=>{const r=e.currentTarget.getBoundingClientRect();inspect((e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*100);}}>
   <AnalogProjection frame={depth} still={still} alt={reelFrames[depth].alt}/>
   {config.targets[depth].map(([x,y,w,h],i)=><button key={i} className="ica-target" aria-label={`检查影像区域${i+1}`} style={{left:`${x}%`,top:`${y}%`,width:`${w}%`,height:`${h}%`}} onClick={e=>{e.stopPropagation();inspect(x+w/2,y+h/2);}}/>)}
   {mark&&<svg key={mark.serial} className="ica-mark" style={{left:`${mark.x}%`,top:`${mark.y}%`}} viewBox="0 0 12 12" aria-label={mark.ok?'正确':'错误'} shapeRendering="crispEdges"><path d={mark.ok?'M1 6h2v2h2V6h2V4h2V2h2v4H9v2H7v2H5v2H3V10H1Z':'M1 1h2v2h2v2h2V3h2V1h2v2H9v2H7v2h2v2h2v2H9V9H7V7H5v2H3v2H1V9h2V7h2V5H3V3H1Z'}/></svg>}
  </div>:depth===5?<div className="ica-dislocation" aria-label="影像和记录发生错位"><div className="ica-last-frame"><AnalogProjection frame={5} still={still} alt="空椅子仍在灯下"/></div>{Array.from({length:9},(_,i)=><div className="ica-echo" key={i} style={{left:`${4+i*5}%`,top:`${8+i*8}%`,transform:`rotate(${i%2?1:-1}deg)`}} aria-hidden="true">VISITOR_00　/　STILL HERE<br/>MEMORY RETAINED　________</div>)}</div>:<div className="collapse-console" role="status"><pre>{consoleLines.slice(0,line).join('\n')}<span>▌</span></pre><progress aria-label="重新载入" max={consoleLines.length} value={Math.min(line,consoleLines.length)}/></div>}
  {depth<6&&<aside className={`ica-locked-helper reaction-${depth} beat-${reactionBeat%2}`} aria-label="助手操作已锁定" onPointerDown={e=>{e.preventDefault();reject();}}>{<p className="ica-wingdings" aria-label={reply||config.reactions[Math.min(depth,5)][reactionBeat%2]}>{Array.from(reply||config.reactions[Math.min(depth,5)][reactionBeat%2]).map(c=>c===' '?' ':String.fromCharCode(0xf000+c.charCodeAt(0))).join('')}</p>}<button aria-label="被锁定的私人助手" onKeyDown={e=>{if(['Enter',' ','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();reject();}}} onContextMenu={e=>{e.preventDefault();reject();}}><Sprite index={depth>=3?19:18}/></button></aside>}
  {audioError&&depth===5&&<button className="ica-audio-retry" aria-label="重试音乐播放" onClick={onRetryAudio}>♪</button>}
 </section>;
}

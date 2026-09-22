import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Upload, Gauge } from 'lucide-react';
import type { MusicController } from '../MusicBox';
import type { AtmosphereAudio } from './AtmosphereAudio';
import './mechanical-music.css';
import keepsake from '../reel-keepsake.json';
const clock=(n:number)=>`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`;
export function MechanicalMusicBox({music,audio}:{music:MusicController;audio:AtmosphereAudio}) {
 const [changing,setChanging]=useState(false),[winding,setWinding]=useState(false);
 const timers=useRef<ReturnType<typeof setTimeout>[]>([]),fileInput=useRef<HTMLInputElement>(null);
 useEffect(()=>{const pending=timers.current;for(const name of ['musicbox-close','musicbox-empty','musicbox-winding']){const image=new Image();image.src=`./media/exploration/${name}.png`;}return()=>pending.forEach(clearTimeout);},[]);
 const windingDrag=useRef<{x:number;y:number;angle:number;total:number}|null>(null),suppressClick=useRef(false);
 const current=music.library.find(t=>t.id===music.selected),disabled=changing||music.locked;
 function wind(){if(disabled)return;audio.play('wind');setWinding(true);void music.play(music.selected);timers.current.push(setTimeout(()=>setWinding(false),1000));}
 function install(id:string){if(disabled||id===music.selected)return;const resume=music.playing;audio.play('cylinder');music.select(id);setChanging(true);timers.current.push(setTimeout(()=>{setChanging(false);if(resume)void music.play(id);},720));}
 function step(direction:number){const index=music.library.findIndex(t=>t.id===music.selected);install(music.library[(index+direction+music.library.length)%music.library.length].id);}
 return <div className={`mechanical-box player-box ${music.playing?'box-playing':''} ${changing?'changing-cylinder':''} ${winding?'winding-box':''}`}>
  <div className="mechanical-art"><img src={`./media/exploration/${changing?'musicbox-empty':winding?'musicbox-winding':'musicbox-close'}.png`} alt="胡桃木八音盒与右侧发条"/><div className="cylinder-glimmer" aria-hidden="true"/><button className="wind-key" onClick={()=>{if(suppressClick.current){suppressClick.current=false;return;}wind();}} onPointerDown={e=>{if(disabled)return;const r=e.currentTarget.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;windingDrag.current={x,y,angle:Math.atan2(e.clientY-y,e.clientX-x),total:0};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{const d=windingDrag.current;if(!d)return;const angle=Math.atan2(e.clientY-d.y,e.clientX-d.x);let delta=angle-d.angle;if(delta>Math.PI)delta-=Math.PI*2;if(delta<-Math.PI)delta+=Math.PI*2;d.angle=angle;d.total+=Math.max(0,delta);if(d.total>Math.PI/2){suppressClick.current=true;windingDrag.current=null;wind();}}} onPointerUp={()=>{windingDrag.current=null;}} onPointerCancel={()=>{windingDrag.current=null;suppressClick.current=false;}} disabled={disabled} aria-label="拧动发条钥匙，播放当前滚筒" title="上发条播放"/></div>
  <div className="player-deck">
   <h3>{current?.title??'—'}</h3>
   <div className="player-timeline"><input type="range" aria-label="播放位置" title="播放位置" min="0" max={music.duration||1} step=".1" value={Math.min(music.elapsed,music.duration||0)} disabled={disabled||!music.duration} onChange={e=>music.seek(Number(e.target.value))}/><div><time>{clock(music.elapsed)}</time><time>{clock(music.duration)}</time></div></div>
   <div className="player-transport"><button aria-label="上一首" title="上一首" disabled={disabled} onClick={()=>step(-1)}><SkipBack/></button><button className="player-play" aria-label={music.playing?'暂停':'播放'} title={music.playing?'暂停':'播放'} disabled={disabled} onClick={music.playing?music.pause:wind}>{music.playing?<Pause/>:<Play/>}</button><button aria-label="下一首" title="下一首" disabled={disabled} onClick={()=>step(1)}><SkipForward/></button></div>
   <div className="player-tools"><label title="音量"><Volume2 aria-hidden="true"/><input aria-label="八音盒音量" type="range" min="0" max="1" step=".01" disabled={music.locked} value={music.volume} onChange={e=>music.setVolume(Number(e.target.value))}/></label><label title="播放速度"><Gauge aria-hidden="true"/><select aria-label="播放速度" value={music.rate} disabled={music.locked} onChange={e=>music.setRate(Number(e.target.value))}>{[.5,.75,1,1.25,1.5,2].map(n=><option key={n} value={n}>{n}×</option>)}</select></label><button aria-label="导入本地音乐" title="导入本地音乐" disabled={music.locked} onClick={()=>fileInput.current?.click()}><Upload/></button><input ref={fileInput} hidden type="file" aria-label="选择本地音频文件" accept="audio/*,.mp3,.ogg,.wav,.flac,.m4a" multiple onChange={e=>{music.importFiles(e.target.files);e.target.value='';}}/></div>
  </div>
  <div className="cylinder-drawer" aria-label="音乐滚筒抽屉">{music.library.map(track=><button key={track.id} className="music-cylinder" data-keepsake={track.id===keepsake.track.id} aria-label={`装入滚筒：${track.title}`} aria-pressed={track.id===music.selected} disabled={disabled} onClick={()=>install(track.id)}><i aria-hidden="true"><b/></i><span>{track.id===keepsake.track.id&&<em className="keepsake-seal">✦ 00</em>}<strong>{track.title}</strong></span></button>)}</div>
  {music.error&&<p role="status">{music.error}</p>}
 </div>;
}

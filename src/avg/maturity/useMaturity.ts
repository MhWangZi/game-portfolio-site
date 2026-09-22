import {useCallback,useEffect,useRef,useState} from 'react';
import type {RoomId,Speech} from '../world';
import type {TokenId} from '../story';
import config from './config.json';
import {isLost,maturityStorage,migrateMaturity,reportFacts,resetRound} from './model';
import type {MaturitySave} from './model';
import {readStored,writeStored} from '../../lib/storage/versioned';
export type MaturityView='permit'|'desk'|'journal'|'radio'|'report'|null;
type Context={room:RoomId;blocked:boolean;silent:boolean;safeMusic:boolean;speechVisible:boolean;flags:string[];keys:TokenId[];loops:number;music:{playing:boolean;selected:string;elapsed:number};speak:(speech:Speech)=>void};
export function useMaturity(context:Context){
 const [save,setSave]=useState(()=>readStored(maturityStorage,migrateMaturity));
 const current=useRef(save);current.current=save;
 const ctx=useRef(context);ctx.current=context;
 const [view,setView]=useState<MaturityView>(null);
 const [pinned,setPinned]=useState(false);
 const [silence,setSilence]=useState(false);
 const [anchor,setAnchor]=useState<number[]|null>(null);
 const viewRef=useRef(view);viewRef.current=view;
 const lastInput=useRef(Date.now()),lastAmbient=useRef(0),visits=useRef<{room:string;at:number}[]>([]),idleRooms=useRef(new Set<string>()),delayed=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const change=useCallback((f:(s:MaturitySave)=>MaturitySave)=>{const next=f(current.current);current.current=next;writeStored(maturityStorage,next);setSave(next);},[]);
 const speak=useCallback((key:string)=>{const s=(config.speeches as Record<string,Speech>)[key];if(s)ctx.current.speak(s);},[]);
 const reply=useCallback((speech:Speech)=>ctx.current.speak(speech),[]);
 const cancel=useCallback(()=>{clearTimeout(delayed.current);delayed.current=undefined;setSilence(false);setAnchor(null);},[]);
 const interacted=useCallback(()=>{lastInput.current=Date.now();visits.current=[];cancel();},[cancel]);
 const remember=useCallback((fact:string)=>{interacted();if(!current.current.facts.includes(fact))change(s=>({...s,facts:[...s.facts,fact]}));},[change,interacted]);
 const close=useCallback(()=>{if(viewRef.current==='desk'&&current.current.clearance)speak('reviewClose');setView(null);lastInput.current=Date.now();},[speak]);
 const open=useCallback((next:Exclude<MaturityView,null>)=>{interacted();setView(next);},[interacted]);
 const grant=useCallback(()=>{if(!current.current.clearance){change(s=>({...s,clearance:true}));speak('grant');}setView('desk');},[change,speak]);
 const read=useCallback((id:string)=>{
  interacted();change(s=>({...s,records:[...new Set([...s.records,id])]}));
  if(['birth','protocol'].includes(id)){
   const room=ctx.current.room;setSilence(true);
   delayed.current=setTimeout(()=>{setSilence(false);if(ctx.current.room===room&&!ctx.current.blocked&&!document.hidden)speak('sensitive');},config.sensitivePauseMs);
  }
 },[change,interacted,speak]);
 const returned=useCallback((id:string)=>{remember('archive:return');change(s=>({...s,returned:[...new Set([...s.returned,id])]}));},[change,remember]);
 const station=useCallback((id:string)=>{if(current.current.stations.includes(id))return;change(s=>({...s,stations:[...s.stations,id]}));speak('radio:'+id);},[change,speak]);
 const patchFails=useRef(0);
 const failPatch=useCallback(()=>{interacted();if(++patchFails.current===3)speak('patchFail');},[interacted,speak]);
 const finish=useCallback(()=>{const s=current.current;change(v=>({...v,report:{date:new Date().toLocaleDateString('zh-CN'),facts:reportFacts(s),tokens:[...ctx.current.keys],ending:true}}));},[change]);
 const reset=useCallback((round:number)=>{cancel();idleRooms.current.clear();patchFails.current=0;visits.current=[];setPinned(false);change(s=>resetRound(s,round));},[change,cancel]);
 useEffect(()=>{if(current.current.round!==context.loops)reset(context.loops);},[context.loops,reset]);
 useEffect(()=>{
  const facts=context.keys.map(id=>'token:'+id);if(facts.some(f=>!current.current.facts.includes(f)))change(s=>({...s,facts:[...new Set([...s.facts,...facts])]}));
 },[context.keys,change]);
 useEffect(()=>{
  cancel();lastInput.current=Date.now();
  visits.current=[...visits.current.filter(v=>Date.now()-v.at<config.lostWindowMs),{room:context.room,at:Date.now()}];
  if(isLost(visits.current,Date.now(),config.lostWindowMs,config.lostChanges)){
   delayed.current=setTimeout(()=>{if(!ctx.current.blocked&&!ctx.current.speechVisible&&!viewRef.current&&!document.hidden){speak('lost');visits.current=[];}},9000);
  }
  return cancel;
 },[context.room,cancel,speak]);
 useEffect(()=>{
  if(context.blocked){cancel();lastInput.current=Date.now();}
 },[context.blocked,cancel]);
 useEffect(()=>{
  const input=()=>{lastInput.current=Date.now();cancel();};
  const visibility=()=>{lastInput.current=Date.now();cancel();};
  window.addEventListener('pointerdown',input);window.addEventListener('keydown',input);document.addEventListener('visibilitychange',visibility);
  const timer=setInterval(()=>{
   const c=ctx.current,now=Date.now();if(document.hidden||c.blocked||c.silent||c.speechVisible||c.music.playing||viewRef.current){lastInput.current=now;return;}
   if(now-lastInput.current<config.idleMs||now-lastAmbient.current<config.idleCooldownMs)return;
   if(c.room==='lounge'&&current.current.facts.includes('challenge:formal-level')&&!current.current.echoes.includes('challenge')){change(s=>({...s,echoes:[...s.echoes,'challenge']}));speak('challenge');lastAmbient.current=now;return;}
   if(c.room==='workshop'&&c.flags.includes('repair_not_erase')&&!current.current.echoes.includes('promise')){change(s=>({...s,echoes:[...s.echoes,'promise']}));speak('promise');lastAmbient.current=now;return;}
   if(c.room==='duty'&&(c.flags.includes('calls_visitor')||c.flags.includes('name_blank'))&&!current.current.echoes.includes('register')){change(s=>({...s,echoes:[...s.echoes,'register']}));speak(c.flags.includes('calls_visitor')?'registerEcho':'blankEcho');lastAmbient.current=now;return;}
   const line=(config.idle as Record<string,Speech>)[c.room];if(!line||idleRooms.current.has(c.room))return;
   idleRooms.current.add(c.room);lastAmbient.current=now;setAnchor((config.idleAnchors as Record<string,number[]>)[c.room]??null);c.speak(c.keys.length>=3?{text:'……我在这儿。你慢慢看。只是，等下走的时候，记得跟我说一声。',face:10,motion:'blink',pose:'care'}:line);
  },1000);
  return()=>{clearInterval(timer);clearTimeout(delayed.current);window.removeEventListener('pointerdown',input);window.removeEventListener('keydown',input);document.removeEventListener('visibilitychange',visibility);};
 },[cancel,change,speak]);
 const heardThisPlay=useRef(''),pendingSong=useRef(false);
 useEffect(()=>{
  const m=context.music;if(!m.playing){heardThisPlay.current='';pendingSong.current=false;return;}
  if(pendingSong.current&&m.selected==='room-forgot'&&context.safeMusic&&!context.speechVisible&&!viewRef.current){pendingSong.current=false;change(s=>({...s,echoes:[...new Set([...s.echoes,'songReturn'])]}));speak('songReturn');}
  if(m.elapsed<2||heardThisPlay.current===m.selected)return;heardThisPlay.current=m.selected;
  if(current.current.heard.includes(m.selected)&&m.selected==='room-forgot'&&!current.current.echoes.includes('songReturn'))pendingSong.current=true;
  if(!current.current.heard.includes(m.selected))change(s=>({...s,heard:[...s.heard,m.selected]}));
 },[context.music.playing,context.music.elapsed,context.music.selected,context.safeMusic,context.speechVisible,change,speak]);
 return {save,change,view,setView,open,close,grant,speak,reply,remember,read,returned,station,failPatch,finish,reset,silence,anchor,pinned,setPinned};
}
export type MaturityController=ReturnType<typeof useMaturity>;

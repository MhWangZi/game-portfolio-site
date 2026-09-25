import {useEffect,useRef} from 'react';
import type {Speech} from '../world';
import lines from './ambient-lines.json';

export type AmbientCue = keyof typeof lines;
export function classifyAbsence(ms:number):AmbientCue|null {
  return ms>=45*60_000?'awayLong':ms>=15*60_000?'awayShort':null;
}

/** Browser-life cues never write save state and never interrupt story interactions. */
export function useAmbientPerformance({safe,onCue}:{safe:boolean;onCue:(speech:Speech)=>void}) {
  const current=useRef({safe,onCue});current.current={safe,onCue};
  const absentAt=useRef<number|null>(null);
  const lastCue=useRef(0);
  useEffect(()=>{
    const pending=new Set<number>();
    const visibility=()=>{
      if(document.hidden){absentAt.current=Date.now();return;}
      if(absentAt.current===null)return;
      const cue=classifyAbsence(Date.now()-absentAt.current);
      absentAt.current=null;
      if(!cue)return;
      const started=Date.now();
      const timer=window.setInterval(()=>{
        if(document.hidden||Date.now()-started>12000){clearInterval(timer);pending.delete(timer);return;}
        if(!current.current.safe)return;
        clearInterval(timer);pending.delete(timer);lastCue.current=Date.now();current.current.onCue(lines[cue] as Speech);
      },800);
      pending.add(timer);
    };
    let began=0,lastX=0,lastDirection=0,reversals=0,lastMove=0;
    const pointer=(e:PointerEvent)=>{
      if(e.buttons||!current.current.safe||Date.now()-lastCue.current<90_000)return;
      if(!(e.target instanceof Element)||!e.target.closest('.companion-body')){began=0;reversals=0;return;}
      const now=Date.now(),dx=e.clientX-lastX;
      if(!began||now-lastMove>700){began=now;reversals=0;lastDirection=0;}
      if(Math.abs(dx)>8){const direction=Math.sign(dx);if(lastDirection&&direction!==lastDirection)reversals++;lastDirection=direction;}
      lastX=e.clientX;lastMove=now;
      if(now-began>=2800&&reversals>=8){began=0;reversals=0;lastCue.current=now;current.current.onCue(lines.jiggle as Speech);}
    };
    document.addEventListener('visibilitychange',visibility);
    window.addEventListener('pointermove',pointer,{passive:true});
    return()=>{document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pointermove',pointer);pending.forEach(clearInterval);};
  },[]);
}

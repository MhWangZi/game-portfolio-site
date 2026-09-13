import { useEffect, useRef, useState } from 'react';
import type { NarrativeEvent, EventSession, EventNode } from './types';
import './narrative.css';
export function NarrativeEventView({event,session,onChoose,onSpeak,onClose,still=false}:{event:NarrativeEvent;session:EventSession;onChoose:(id:string)=>void;onSpeak:(node:EventNode)=>void;onClose:()=>void;still?:boolean}) {
  const node=event.nodes[session.node],text=node.narration.join('\n'),letters=Array.from(text);
  const reduced=still||window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [shown,setShown]=useState(reduced?letters.length:0),selected=useRef(false);
  const callbacks=useRef({onChoose,onSpeak,onClose});callbacks.current={onChoose,onSpeak,onClose};
  const progress=useRef(shown);progress.current=shown;
  useEffect(()=>{callbacks.current.onSpeak(node);},[node]);
  useEffect(()=>{if(reduced)return;const t=setInterval(()=>setShown(n=>Math.min(letters.length,n+1)),25);const end=setTimeout(()=>clearInterval(t),letters.length*25+50);return()=>{clearInterval(t);clearTimeout(end);};},[letters.length,reduced]);
  useEffect(()=>{if(event.presentation!=='ambient')return;const t=setTimeout(()=>callbacks.current.onClose(),10000+(reduced?0:letters.length*25));return()=>clearTimeout(t);},[event,letters.length,reduced]);
  const choose=(index:number)=>{
    if(event.presentation==='ambient'||!node.choices[index]||selected.current)return;
    if(progress.current<letters.length){setShown(letters.length);return;}
    selected.current=true;callbacks.current.onChoose(node.choices[index].id);
  };
  const chooser=useRef(choose);chooser.current=choose;
  useEffect(()=>{const key=(e:KeyboardEvent)=>{
    const target=e.target as HTMLElement;
    if(e.repeat||e.ctrlKey||e.altKey||e.metaKey||target.closest('input,textarea,select,[contenteditable="true"],[role="dialog"]'))return;
    if(e.key==='Escape'){e.preventDefault();callbacks.current.onClose();}
    else if(/^[1-9]$/.test(e.key)&&event.presentation!=='ambient'){e.preventDefault();chooser.current(Number(e.key)-1);}
  };window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[event.presentation]);
  return <article className="narrative-event scene-conversation reading-slate" aria-label="场景中的对话" data-presentation={event.presentation??'exchange'} data-event={event.id} data-event-node={session.node}>
    <header className="slate-heading"><span aria-hidden="true"/><button onClick={onClose} aria-label="结束这段观察">移开目光 · Esc</button></header>
    <div className="event-observation" onClick={()=>setShown(letters.length)} title={shown<letters.length?'点击显示全文':undefined}>
      <p aria-label={text}><span aria-hidden="true">{letters.slice(0,shown).join('')}<span style={{visibility:'hidden'}}>{letters.slice(shown).join('')}</span></span></p>
    </div>
    {event.presentation!=='ambient'&&<div className="event-choices">{node.choices.map((choice,i)=><button key={choice.id} onClick={()=>choose(i)}><kbd>{i+1}</kbd><span>{choice.text}</span></button>)}</div>}
  </article>;
}

import {useState} from 'react';
import {records,tokens} from '../story';
import type {TokenId} from '../story';
import config from './config.json';
import {Overlay} from './Overlay';
import {narrativeEvents} from '../narrative/data';
import type {MaturityController} from './useMaturity';
export function JournalContent({model,keys,playlistRead,compact=false}:{model:MaturityController;keys:TokenId[];playlistRead:boolean;compact?:boolean}){
 const [topic,setTopic]=useState<'music'|'patch'>('music');
 const seen=new Set(model.save.records);if(playlistRead)seen.add('playlist');
 const notes=records.filter(r=>seen.has(r.id));
 const observations=narrativeEvents.filter(e=>['coat-owner','fifth-seat','chair-distance','wet-step'].includes(e.id)&&model.save.facts.includes('event:'+e.id)).map(e=><article key={e.id}><small>随手记 · 已观察</small><h3>{e.title}</h3>{e.nodes[e.entry].narration.map(t=><p key={t}>{t}</p>)}</article>);
 const level=model.save.hints[topic];
 const source=topic==='music'?'playlist':'protocol';
 const hint=config.hints[topic][seen.has(source)?Math.max(0,level-1):0];
 function ask(){const next=seen.has(source)?Math.min(3,level+1):1;model.change(s=>({...s,hints:{...s.hints,[topic]:next}}));model.remember('hint:'+topic);model.reply({text:config.hints[topic][next-1],face:9,motion:'point',pose:next===3?'paper':'listen'});}
 return <div className={`journal-content ${compact?'compact':''}`}><header><small>FIELD NOTES / ONLY WHAT YOU FOUND</small><h2>巡检手帐</h2><p>记下看见的，留下还没想明白的。</p></header><section className="journal-notes">{notes.length?notes.map(r=><article key={r.id}><small>档案角 · {r.id==='playlist'?'左侧小柜中层':r.id==='protocol'?'左侧小柜最下层':'已读档案'}</small><h3>{r.title}</h3>{r.text.map(t=><p key={t}>{t}</p>)}</article>):!model.save.stations.length&&!observations.length?<p className="journal-empty">纸页还空着。读过的档案会留下记录。</p>:null}{model.save.stations.map(id=>{const s=config.radio.stations.find(x=>x.id===id);return s?<article key={id}><small>天台信号站 · {s.frequency.toFixed(1)}MHz</small><h3>{s.name}</h3><p>{s.description}</p></article>:null;})}{observations}</section><section><h3>口袋里的纪念物</h3><div className="journal-tokens">{tokens.filter(t=>keys.includes(t.id)).map(t=><span key={t.id}>{t.icon} {t.name}</span>)}{!keys.length&&<p>还没有收下东西。</p>}</div></section><section className="journal-help"><h3>问问助手</h3><div><button aria-pressed={topic==='music'} onClick={()=>setTopic('music')}>曲序</button><button aria-pressed={topic==='patch'} onClick={()=>setTopic('patch')}>接线</button></div>{level>0&&<p role="status">{hint}</p>}<button onClick={ask}>{!level?'给一点方向':level<3&&seen.has(source)?'再说明一点':'再看这条提示'}</button>{!seen.has(source)&&level>0&&<small>先去读到这张纸，之后再一起比较。</small>}</section></div>;
}
export function Journal({model,keys,playlistRead}:{model:MaturityController;keys:TokenId[];playlistRead:boolean}){return <Overlay label="巡检手帐" onClose={model.close} className="journal-overlay"><JournalContent model={model} keys={keys} playlistRead={playlistRead}/></Overlay>;}

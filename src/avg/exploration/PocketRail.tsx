import {useState} from 'react';
import {tokens,type TokenId} from '../story';
export function PocketRail({owned,onOpen}:{owned:TokenId[];onOpen:()=>void}){
 const [detail,setDetail]=useState<string|null>(null);
 return <div className="pocket-rail" aria-label="五个纪念物槽"><button className="pocket-open" onClick={onOpen} aria-label={`口袋 ${owned.length}/5`}>口袋<small>{owned.length}/5</small></button>{tokens.map(t=><div className="pocket-slot" key={t.id} data-owned={owned.includes(t.id)} onMouseLeave={()=>setDetail(null)}><button aria-label={`${t.name}：${owned.includes(t.id)?'已收集':'未收集'}`} aria-expanded={detail===t.id} onMouseEnter={()=>setDetail(t.id)} onFocus={()=>setDetail(t.id)} onBlur={()=>setDetail(null)} onClick={()=>setDetail(t.id)}>{owned.includes(t.id)?t.icon:'·'}</button>{detail===t.id&&<aside role="tooltip"><strong>{t.name}</strong><p>{t.hint}</p></aside>}</div>)}</div>;
}

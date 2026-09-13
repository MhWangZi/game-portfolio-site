import type { RoomId } from '../world';
import type { WorldAction } from '../exploration/types';

export type EventCondition = { flag?: string; notFlag?: string; minKeys?: number; item?: string; minLoops?: number };
export type EventChoice = { id:string; text:string; next?:string; flags?:string[]; clearFlags?:string[]; action?:WorldAction };
export type EventNode = { narration:string[]; assistant:string; face?:number; pose?:string; choices:EventChoice[] };
export type NarrativeEvent = {
  id:string; room:RoomId; title:string; object:string; purpose:string;
  enabled?:boolean; presentation?:'ambient'|'exchange';
  entry:string; revisit:string; entryRules?:{when:EventCondition;node:string}[];
  nodes:Record<string,EventNode>;
};
export type NarrativeSave = { flags:string[]; visits:Record<string,number>; choices:Record<string,string[]> };
export type EventSession = {id:string;node:string};
export type EventContext = {keys:number;inventory:string[];loops:number};
export const narrativeStorage='mw-narrative-events-v1';
export const blankNarrative=():NarrativeSave=>({flags:[],visits:{},choices:{}});
export function readNarrative():NarrativeSave {
  try {
    const v=JSON.parse(localStorage.getItem(narrativeStorage)||'null');
    if(v) return {
      flags:Array.isArray(v.flags)?v.flags.filter((x:unknown)=>typeof x==='string'):[],
      visits:Object.fromEntries(Object.entries(v.visits||{}).filter(([,n])=>Number.isInteger(n)&&Number(n)>=0)) as Record<string,number>,
      choices:Object.fromEntries(Object.entries(v.choices||{}).filter(([,x])=>Array.isArray(x)&&x.every(s=>typeof s==='string'))) as Record<string,string[]>,
    };
  } catch { /* Optional conversations remain playable without storage. */ }
  return blankNarrative();
}
export function matchesEvent(condition:EventCondition,save:NarrativeSave,context:EventContext) {
  return (!condition.flag||save.flags.includes(condition.flag))&&(!condition.notFlag||!save.flags.includes(condition.notFlag))&&(condition.minKeys===undefined||context.keys>=condition.minKeys)&&(!condition.item||context.inventory.includes(condition.item))&&(condition.minLoops===undefined||context.loops>=condition.minLoops);
}
export function beginEvent(event:NarrativeEvent,save:NarrativeSave,context:EventContext) {
  const node=event.entryRules?.find(rule=>matchesEvent(rule.when,save,context))?.node??(save.visits[event.id]?event.revisit:event.entry);
  return {session:{id:event.id,node},save:{...save,visits:{...save.visits,[event.id]:(save.visits[event.id]||0)+1}}};
}
export function advanceEvent(event:NarrativeEvent,session:EventSession,save:NarrativeSave,choiceId:string) {
  const choice=event.nodes[session.node]?.choices.find(c=>c.id===choiceId);
  if(!choice) return null;
  return {
    session:choice.next?{id:event.id,node:choice.next}:null,
    save:{...save,flags:[...new Set([...save.flags.filter(flag=>!choice.clearFlags?.includes(flag)),...(choice.flags||[])])],choices:{...save.choices,[event.id]:[...new Set([...(save.choices[event.id]||[]),`${session.node}/${choice.id}`])] }},
    action:choice.action,
  };
}

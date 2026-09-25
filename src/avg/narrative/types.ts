import type { RoomId } from '../world';
import type { WorldAction } from '../exploration/types';
import type { Speech } from '../world';

export type EventCondition = { flag?: string; notFlag?: string; minKeys?: number; item?: string; minLoops?: number; dark?:boolean; room?:string; fact?:string };
export type ResponseSet = {first:Speech; repeat?:Speech; alternates?:Speech[]; variants?:{when:EventCondition;speech:Speech}[]; cooldownMs?:number};
export type EventChoice = { id:string; text:string; next?:string; flags?:string[]; clearFlags?:string[]; action?:WorldAction; followup?:ResponseSet };
export type EventNode = { narration:string[]; assistant:string; face?:number; pose?:string; dismissLabel?:string; choices:EventChoice[]; contextual?:boolean; variants?:{when:EventCondition;narration?:string[];assistant?:string;pose?:string}[] };
export type NarrativeEvent = {
  id:string; room:RoomId; title:string; object:string; purpose:string;
  enabled?:boolean; presentation?:'ambient'|'exchange';
  entry:string; revisit:string; entryRules?:{when:EventCondition;node:string}[];
  nodes:Record<string,EventNode>;
};
export type NarrativeSave = { flags:string[]; visits:Record<string,number>; choices:Record<string,string[]>; responses?:Record<string,number> };
export type EventSession = {id:string;node:string};
export type EventContext = {keys:number;inventory:string[];loops:number;dark?:boolean;room?:string;facts?:string[]};
export const narrativeStorage='mw-narrative-events-v1';
export const blankNarrative=():NarrativeSave=>({flags:[],visits:{},choices:{}});
export function readNarrative():NarrativeSave {
  try {
    const v=JSON.parse(localStorage.getItem(narrativeStorage)||'null');
    if(v) return {
      flags:Array.isArray(v.flags)?v.flags.filter((x:unknown)=>typeof x==='string'):[],
      visits:Object.fromEntries(Object.entries(v.visits||{}).filter(([,n])=>Number.isInteger(n)&&Number(n)>=0)) as Record<string,number>,
      choices:Object.fromEntries(Object.entries(v.choices||{}).filter(([,x])=>Array.isArray(x)&&x.every(s=>typeof s==='string'))) as Record<string,string[]>,
      responses:Object.fromEntries(Object.entries(v.responses||{}).filter(([,n])=>Number.isSafeInteger(n)&&Number(n)>=0)) as Record<string,number>,
    };
  } catch { /* Optional conversations remain playable without storage. */ }
  return blankNarrative();
}
export function matchesEvent(condition:EventCondition,save:NarrativeSave,context:EventContext) {
  return (!condition.flag||save.flags.includes(condition.flag))&&(!condition.notFlag||!save.flags.includes(condition.notFlag))&&(condition.minKeys===undefined||context.keys>=condition.minKeys)&&(!condition.item||context.inventory.includes(condition.item))&&(condition.minLoops===undefined||context.loops>=condition.minLoops)&&(condition.dark===undefined||condition.dark===context.dark)&&(!condition.room||condition.room===context.room)&&(!condition.fact||context.facts?.includes(condition.fact));
}
export function responseFor(response:ResponseSet,count:number,save:NarrativeSave,context:EventContext):Speech {
  const variant=response.variants?.find(v=>matchesEvent(v.when,save,context));
  if(variant)return variant.speech;
  if(count===0)return response.first;
  const repeats=[response.repeat??response.first,...(response.alternates??[])];
  return repeats[(count-1)%repeats.length];
}
export function recordResponse(save:NarrativeSave,key:string):NarrativeSave {
  return {...save,responses:{...save.responses,[key]:(save.responses?.[key]??0)+1}};
}
export function resolveEventNode(node:EventNode,save:NarrativeSave,context:EventContext):EventNode {
  // A remembered choice and the room's rising tension can both be true.
  // Layer matching scene details in data order; a later tension cue may change
  // the line without discarding a flag-specific narration or pose.
  return (node.variants??[]).filter(v=>matchesEvent(v.when,save,context)).reduce<EventNode>(
    (resolved,variant)=>({...resolved,...variant,...(variant.assistant?{contextual:false}:{})}),node
  );
}
export function beginEvent(event:NarrativeEvent,save:NarrativeSave,context:EventContext) {
  const node=event.entryRules?.find(rule=>matchesEvent(rule.when,save,context))?.node??(save.visits[event.id]?event.revisit:event.entry);
  return {session:{id:event.id,node},save:{...save,visits:{...save.visits,[event.id]:(save.visits[event.id]||0)+1}}};
}
export function advanceEvent(event:NarrativeEvent,session:EventSession,save:NarrativeSave,choiceId:string,context:EventContext={keys:0,inventory:[],loops:0}) {
  const choice=event.nodes[session.node]?.choices.find(c=>c.id===choiceId);
  if(!choice) return null;
  const key=`CHOICE.${event.id}.${session.node}.${choiceId}`;
  const updated={...save,flags:[...new Set([...save.flags.filter(flag=>!choice.clearFlags?.includes(flag)),...(choice.flags||[])])],choices:{...save.choices,[event.id]:[...new Set([...(save.choices[event.id]||[]),`${session.node}/${choice.id}`])] }};
  // Old saves already record choices even though they predate response counters.
  const count=save.responses?.[key]??(save.choices[event.id]?.includes(`${session.node}/${choiceId}`)?1:0);
  return {
    session:choice.next?{id:event.id,node:choice.next}:null,
    save:choice.followup?{...updated,responses:{...updated.responses,[key]:count+1}}:updated,
    action:choice.action,
    speech:choice.followup?responseFor(choice.followup,count,updated,context):undefined,
  };
}

import type { Speech } from '../world';

/** An immutable snapshot supplied by the world; this module owns no save or room. */
export type CompanionContext = {
  room:string; dark:boolean; tension:number; flags:string[]; inventory:string[]; loops:number;
};
export type ReactionRule = {
  id:string; events:string[]; priority:number;
  when?:{room?:string;dark?:boolean;minTension?:number;maxTension?:number;flags?:string[];anyFlags?:string[];item?:string};
  speech:Speech;
};
export function matchesReaction(rule:ReactionRule,event:string,context:CompanionContext) {
  const w=rule.when;
  return rule.events.includes(event)&&(!w||(
    (!w.room||w.room===context.room)&&(w.dark===undefined||w.dark===context.dark)&&
    (w.minTension===undefined||context.tension>=w.minTension)&&(w.maxTension===undefined||context.tension<=w.maxTension)&&
    (!w.flags||w.flags.every(f=>context.flags.includes(f)))&&(!w.anyFlags||w.anyFlags.some(f=>context.flags.includes(f)))&&
    (!w.item||context.inventory.includes(w.item))));
}
export function resolveReaction(rules:ReactionRule[],event:string,context:CompanionContext,fallback:Speech):Speech {
  return rules.filter(r=>matchesReaction(r,event,context)).sort((a,b)=>b.priority-a.priority)[0]?.speech??fallback;
}

export function markRecordClosed(flags:string[],record:string) {
  if(!['birth','protocol'].includes(record)||flags.includes(`reacted_record_${record}`))return null;
  return [...new Set([...flags,`read_${record}`,`reacted_record_${record}`])];
}

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {blankNarrative,advanceEvent,beginEvent,resolveEventNode,responseFor,recordResponse,readNarrative} from '../src/avg/narrative/types.ts';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const events=read('src/avg/narrative/events.json'),controls=read('src/avg/narrative/interaction-responses.json');
const ids=read('docs/缺口扩充稿合入审定_2026-09-23.json').choiceFollowupIds;
const base={keys:0,inventory:[],loops:0,dark:false,room:'duty'};
test('all 27 requested exit choices have real first and repeat responses while preserving flags and actions',()=>{
 assert.equal(ids.length,27);
 for(const id of ids){const [,e,n,c]=id.split('.'),event=events.find(x=>x.id===e),choice=event.nodes[n].choices.find(x=>x.id===c),session={id:e,node:n};
  const save={...blankNarrative(),flags:['calls_visitor']};const first=advanceEvent(event,session,save,c,base);
  assert.equal(first.session,null,id);assert.equal(first.speech.text,choice.followup.first.text,id);assert.equal(first.save.responses[id],1);assert.deepEqual(first.action,choice.action);assert(first.save.flags.includes('calls_visitor'));
  const again=advanceEvent(event,session,JSON.parse(JSON.stringify(first.save)),c,base);assert.equal(again.speech.text,choice.followup.repeat.text,id);assert.equal(again.save.responses[id],2);assert.notEqual(first.speech.text,again.speech.text);
 }
});
test('branch conditions see updated flags, tension changes response, older saves do not replay first-time farewells',()=>{
 const event=events.find(x=>x.id==='tool-care'),session={id:event.id,node:'fix'},choice=event.nodes.fix.choices[0];
 const fixed=advanceEvent(event,session,{...blankNarrative(),flags:['repair_not_erase']},choice.id,base);assert.match(fixed.speech.text,/先修不扔/);
 const register=events.find(x=>x.id==='visitor-register'),s={id:register.id,node:'visitor'};
 assert.match(advanceEvent(register,s,blankNarrative(),'continue',{...base,keys:3}).speech.text,/别反悔/);
 const old={...blankNarrative(),choices:{'visitor-register':['visitor/continue']}};
 assert.equal(advanceEvent(register,s,old,'continue',base).speech.text,register.nodes.visitor.choices[0].followup.repeat.text);
 const reset=advanceEvent(register,s,blankNarrative(),'continue',base);assert.equal(reset.save.responses['CHOICE.visitor-register.visitor.continue'],1);
});
test('archive exit distinguishes read-but-unreturned from returned and unread files',()=>{
 const response=controls['CONTROL.archive-exit'];
 assert.match(responseFor(response,0,blankNarrative(),{...base,facts:['unreturned']}).text,/还没放回/);
 assert.doesNotMatch(responseFor(response,0,blankNarrative(),base).text,/抽屉推平整了|还没放回/);
 assert.match(responseFor(response,0,blankNarrative(),{...base,facts:['unread']}).text,/还没翻开/);
 const save=recordResponse(blankNarrative(),'CONTROL.music-open');assert.equal(save.responses['CONTROL.music-open'],1);assert.deepEqual(save.flags,[]);
});
test('authored followup questions are reachable without forcing ambient observations; dark is not leaked into other rooms',()=>{
 assert.equal(events.filter(e=>e.enabled!==false&&e.presentation==='ambient').length,17);
 const live=events.filter(e=>e.enabled!==false&&e.nodes['editorial-question']);assert.equal(live.length,18);
 for(const e of live){const b=beginEvent(e,blankNarrative(),base);assert(e.nodes[b.session.node].choices.some(c=>c.next==='editorial-question'));assert(e.nodes['editorial-question'].assistant);}
 assert(events.some(e=>e.enabled!==false&&e.presentation==='ambient'&&e.nodes[e.entry].choices.some(c=>c.next==='editorial-question')));
 const cat=events.find(e=>e.id==='cat-seat');assert.match(resolveEventNode(cat.nodes.start,blankNarrative(),{...base,room:'lounge',dark:true}).narration[0],/暗处/);
 for(const e of events.filter(e=>e.enabled!==false&&e.room!=='lounge'))for(const node of Object.values(e.nodes))for(const c of node.choices)assert(!c.followup?.variants?.some(v=>v.when.dark));
});
test('response counters load safely from legacy and malformed browser saves',()=>{
 const original=globalThis.localStorage;
 try{globalThis.localStorage={getItem:()=>JSON.stringify({flags:['calls_visitor'],visits:{},choices:{},responses:{ok:2,negative:-2,broken:'3'}})};
  const restored=readNarrative();assert.deepEqual(restored.responses,{ok:2});assert.deepEqual(restored.flags,['calls_visitor']);
  globalThis.localStorage={getItem:()=>JSON.stringify({flags:[],visits:{},choices:{}})};assert.deepEqual(readNarrative().responses,{});
 }finally{globalThis.localStorage=original;}
});

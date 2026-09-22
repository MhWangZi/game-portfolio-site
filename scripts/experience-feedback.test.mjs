import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {sceneFeedback,guideFinished} from '../src/avg/exploration/feedback.ts';
import {resolveCompanionPresentation as resolve} from '../src/avg/companion/presentation.ts';
const read=p=>fs.readFileSync(new URL('../src/avg/'+p,import.meta.url),'utf8');
const cfg=JSON.parse(read('exploration/feedback.json'));
test('purring starts on third pet, immediately in darkness, never for other props; visits span room remounts',()=>{
  for(const n of [0,1])assert.equal(sceneFeedback(cfg.reactions,'lounge','cat','idle',{'cat-seat':n}),undefined);
  assert.ok(sceneFeedback(cfg.reactions,'lounge','cat-taken','taken',{'cat-seat':2}));
  assert.ok(sceneFeedback(cfg.reactions,'lounge','cat-dark','taken-dark',{}));
  assert.equal(sceneFeedback(cfg.reactions,'lounge','sofa','dark',{'cat-seat':9}),undefined);
  assert.equal(sceneFeedback(cfg.reactions,'lounge','cat','idle',{}),undefined);
});
test('register guidance stops after completing either branch, not after merely opening it',()=>{
  assert.equal(guideFinished(cfg.guidance,{'visitor-register':['start/visitor']}),false);
  for(const branch of cfg.guidance.completionChoices)assert.equal(guideFinished(cfg.guidance,{'visitor-register':[branch]}),true);
});
test('music panel foregrounds music poses, but film and meaningful remembered reactions retain priority',()=>{
  const input={speech:{text:'之前拿取',face:9,motion:'point',pose:'care'},visible:true,dragging:false,settling:false,adjust:false,corrupt:false,listening:true,resting:false,depth:0,musicFocused:true};
  assert.equal(resolve(input).index,16);
  assert.equal(resolve({...input,listeningPose:'listen'}).gesture,'listen');
  assert.equal(resolve({...input,musicFocused:false}).gesture,'care');
  assert.equal(resolve({...input,remembering:true}).gesture,'care');
  assert.equal(resolve({...input,corrupt:true}).pose,'guard');
  assert.equal(resolve({...input,listening:false,visible:false}).pose,'idle');
});
test('every performance pose points to existing artwork',()=>{
 const performance=JSON.parse(read('companion/performance.json')),poses=JSON.parse(read('companion/poses.json')).map(p=>p.id);
 for(const pose of [...Object.values(performance.events),...performance.music.poses])assert.ok(pose==='music'||poses.includes(pose),pose);
});
test('door lowpass stays scheduled across room commit, reaches target at reveal, and reverse transition closes it',async()=>{
 let code=read('exploration/AtmosphereAudio.ts');
 for(const [variable,file] of [['profiles','room-sound'],['settings','acoustics'],['feedback','feedback']])code=code.replace(`import ${variable} from './${file}.json';`,`const ${variable}=${read('exploration/'+file+'.json')};`);
 code=code.replace("import { RoomAcoustics } from './RoomAcoustics';",'class RoomAcoustics{constructor(c,m){this.input=m}setRoom(){}dispose(){}}');
 const compiled=ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 const {AtmosphereAudio}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
 const param=()=>({value:1,events:[],cancelAndHoldAtTime(t){this.events.push(['hold',t])},setValueAtTime(v,t){this.events.push(['set',v,t])},setTargetAtTime(v,t){this.events.push(['target',v,t])},linearRampToValueAtTime(v,t){this.events.push(['linear',v,t])},exponentialRampToValueAtTime(v,t){this.events.push(['exp',v,t])}});
 const node=()=>({connect(n){return n},disconnect(){},start(){},stop(){},frequency:param(),gain:param(),Q:param()});
 const c={currentTime:10,sampleRate:1000,state:'running',createOscillator:node,createGain:node,createBiquadFilter:node,createBufferSource:node,createBuffer(ch,n){const data=new Float32Array(n);return{getChannelData:()=>data}},close(){}};
 const audio=new AtmosphereAudio();audio.context=c;audio.master=node();audio.roomFilter=node();audio.roomGain=node();
 audio.playDoor('wood',600,'corridor',300);
 const events=[...audio.roomFilter.frequency.events];
 assert.deepEqual(events.slice(-2),[['exp',220,10.3],['exp',4200,10.600000000000001]]);
 c.currentTime=10.3;audio.setRoom('corridor');assert.deepEqual(audio.roomFilter.frequency.events,events);
 c.currentTime=11;audio.playDoor('wood',600,'duty',300);assert.equal(audio.roomFilter.frequency.events.at(-1)[1],570);
 audio.dispose();
});

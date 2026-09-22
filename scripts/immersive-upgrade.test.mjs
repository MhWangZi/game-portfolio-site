import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {routeStyle} from '../src/avg/exploration/routeTransition.ts';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const config=JSON.parse(read('src/avg/exploration/route-transitions.json'));
const scenes=JSON.parse(read('src/avg/exploration/cinematic-scenes.json'));
test('every configured special transition is a real route; reverse trips retain timing and reverse direction',()=>{
 for(const route of config.routes){const [a,b]=route.rooms;assert.ok(scenes.find(r=>r.id===a).objects.some(o=>o.transition.action?.type==='room'&&o.transition.action.target===b));
  const forward=routeStyle(config,a,b,false),back=routeStyle(config,b,a,false);assert.equal(forward.kind,back.kind);assert.equal(forward.direction,-back.direction);assert.ok(forward.swap>=forward.duration*.4&&forward.swap<=forward.duration*.6);
 }
 for(const r of scenes)for(const o of r.objects)if(o.transition.action?.type==='room'){assert.ok(config.routes.some(route=>route.rooms.includes(r.id)&&route.rooms.includes(o.transition.action.target)),`missing route: ${r.id} -> ${o.transition.action.target}`);const result=routeStyle(config,r.id,o.transition.action.target,true);assert.equal(result.kind,'still');assert.equal(result.duration,180);assert.equal(result.swap,90);}
});
test('sound and map configuration cover all ten rooms with bounded acoustic levels',()=>{
 const sounds=JSON.parse(read('src/avg/exploration/acoustics.json')),layout=JSON.parse(read('src/avg/exploration/map-layout.json'));
 for(const r of scenes){assert.equal(layout[r.id].length,2);const p=sounds.rooms[r.id];assert.ok(p.rt60>0&&p.rt60<=2);assert.ok(p.wet>=0&&p.wet<=.25);}
 assert.ok(sounds.rooms.corridor.rt60>sounds.rooms.lounge.rt60);assert.ok(sounds.rooms.rooftop.wet<sounds.rooms.lounge.wet);
});
test('room impulses are finite, stereo, decaying and cached; crossfades mute the previous wet branch',async()=>{
 const code=read('src/avg/exploration/RoomAcoustics.ts').replace("import settings from './acoustics.json';",`const settings=${read('src/avg/exploration/acoustics.json')};`);
 const compiled=ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 const {RoomAcoustics}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
 const params=()=>({value:0,events:[],cancelScheduledValues(){},setTargetAtTime(v){this.events.push(v)},setValueAtTime(v){this.events.push(v)},linearRampToValueAtTime(v){this.events.push(v)}});
 const buffers=[],gains=[],convolvers=[];
 const node=()=>({connect(n){return n},disconnect(){}});
 const context={sampleRate:12000,currentTime:0,createGain(){const n={...node(),gain:params()};gains.push(n);return n},createConvolver(){const n={...node(),buffer:null};convolvers.push(n);return n},createBuffer(ch,n,sr){const data=Array.from({length:ch},()=>new Float32Array(n));const b={getChannelData:i=>data[i],length:n,sampleRate:sr};buffers.push(b);return b}};
 const acoustics=new RoomAcoustics(context,node());acoustics.setRoom('corridor');const corridor=buffers[0];
 const rms=a=>Math.sqrt(a.reduce((s,x)=>s+x*x,0)/a.length);
 for(let ch=0;ch<2;ch++){const a=corridor.getChannelData(ch);assert.ok(a.every(Number.isFinite));assert.ok(rms(a.slice(-100))<rms(a.slice(0,100))*.01);}
 assert.notDeepEqual(corridor.getChannelData(0),corridor.getChannelData(1));
 acoustics.setRoom('lounge');acoustics.setRoom('corridor');assert.equal(buffers.length,2);assert.equal(convolvers[1].buffer,corridor);assert.equal(gains[1].gain.events.at(-1),0);acoustics.dispose();
});

import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('./host-player.js',import.meta.url),'utf8');
function boot(){
 const events=new Map(),commands=[],messages=[];
 const parent={postMessage:(...args)=>messages.push(args)};
 const window={parent,avgGameCommand:command=>commands.push(JSON.parse(command)),addEventListener:(name,fn)=>events.set(name,fn)};
 const document={createElement:()=>({}),head:{append:()=>{}}};
 vm.runInNewContext(source,{window,parent,document,location:{search:'?embed=1',origin:'https://example.com'},URLSearchParams});
 return {events,commands,messages,parent};
}
test('accept only the exact parent window, origin, channel and allowed action',()=>{
 const b=boot();
 const valid={source:b.parent,origin:'https://example.com',data:{channel:'mhwangzi-avg-v1',action:'pause',requestId:'test'}};
 for(const event of [{...valid,source:{}},{...valid,origin:'https://evil.example'}, {...valid,data:{...valid.data,channel:'other'}},{...valid,data:{...valid.data,action:'changeScene'}}])b.events.get('message')(event);
 assert.equal(b.commands.length,0);
 b.events.get('message')(valid);assert.equal(b.commands.length,1);assert.equal(b.commands[0].action,'pause');assert.equal(b.commands[0].requestId,'test');
});
test('game events target the same origin and Escape requests a host return',()=>{
 const b=boot();b.events.get('avg-game-event')({detail:{type:'paused'}});
 assert.equal(b.messages.at(-1)[0].type,'paused');assert.equal(b.messages.at(-1)[1],'https://example.com');
 b.events.get('keydown')({key:'Escape',preventDefault(){},stopPropagation(){}});
 assert.equal(b.messages.at(-1)[0].type,'return-request');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {placeBubble} from '../src/avg/ui/floatingGeometry.ts';
test('bubble remains inside viewport and its tail follows the real assistant across all edges',()=>{
 for(const width of [375,1280])for(const left of [8,width/2,width-116])for(const top of [64,350,550]){
  const anchor={left,top,width:108,height:108},box={width:Math.min(379,width-24),height:150};
  const p=placeBubble(anchor,box,{width,height:720});
  assert.ok(left+p.left>=12&&left+p.left+box.width<=width-12);
  assert.ok(top+p.top>=12&&top+p.top+box.height<=708);
  assert.ok(Math.abs(left+p.left+p.tail-(left+54))<1);
  if(top===64)assert.equal(p.side,'below');
 }
});
test('normal room doors have a matching way back, including the projector entrance',()=>{
 const rooms=JSON.parse(fs.readFileSync(new URL('../src/avg/exploration/cinematic-scenes.json',import.meta.url),'utf8'));
 for(const room of rooms)for(const object of room.objects){const action=object.transition.action;if(action?.type!=='room')continue;
  const target=rooms.find(r=>r.id===action.target);
  assert.ok(target?.objects.some(o=>o.transition.action?.type==='room'&&o.transition.action.target===room.id),`${room.id}->${action.target} has no return door`);
 }
 assert.equal(rooms.find(r=>r.id==='archive').objects.some(o=>o.transition.action?.target==='projection'),false);
});

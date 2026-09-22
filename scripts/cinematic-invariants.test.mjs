import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {commitTransition,resolveSceneState} from '../src/avg/exploration/cinematicTypes.ts';
const root=path.resolve(import.meta.dirname,'..');
const rooms=JSON.parse(fs.readFileSync(path.join(root,'src/avg/exploration/cinematic-scenes.json'),'utf8'));
const scene=id=>rooms.find(r=>r.id===id);
const empty=()=>({inventory:[],states:{},sound:true});
test('all scene states have real image files and every transition points to a declared state',()=>{
  for(const room of rooms) {
    assert.ok(Object.keys(room.variants).length>=2,room.id+' must have multiple real images');
    for(const src of Object.values(room.variants)) assert.ok(fs.existsSync(path.join(root,'public',src.replace(/^\.\//,''))),src);
    for(const object of room.objects) {
      if(object.transition.state)assert.ok(room.variants[object.transition.state],room.id+'/'+object.id);
      if(object.transition.action?.type==='room')assert.ok(scene(object.transition.action.target));
      assert.ok(object.polygon.length>=3);
    }
  }
});
test('music box cannot reappear when a collected room changes lighting or the cat wakes',()=>{
  const lounge=scene('lounge');let save=commitTransition(empty(),'lounge',lounge.objects.find(o=>o.id==='take-musicbox').transition);
  assert.deepEqual(save.inventory,['musicbox']);
  for(const state of ['idle','awake','dark']){
    save={...save,states:{lounge:state}};
    assert.ok(resolveSceneState(lounge,save).startsWith('taken'));
  }
  save=commitTransition(save,'lounge',{give:'musicbox'});
  assert.equal(save.inventory.length,1);
});
test('cassette requires pickup then insertion before playback and is removed from inventory on insertion',()=>{
  const secret=scene('secret');let save=empty();
  for(const [id,expected] of [['old-tape','taken'],['vhs-insert','loaded'],['vhs-play','playing']]){
    const object=secret.objects.find(o=>o.id===id);
    assert.ok(object.states.includes(resolveSceneState(secret,save)));
    if(object.requiresItem)assert.ok(save.inventory.includes(object.requiresItem));
    save=commitTransition(save,'secret',object.transition);
    assert.equal(resolveSceneState(secret,save),expected);
    assert.equal(save.inventory.includes('tape'),expected==='taken');
  }
});
test('state changes preserve independent rooms, inventory, and sound preferences',()=>{
  const before={inventory:['musicbox'],states:{archive:'active'},sound:false};
  const after=commitTransition(before,'secret',{state:'taken',give:'tape'});
  assert.equal(after.states.archive,'active');assert.equal(after.sound,false);assert.deepEqual(before.inventory,['musicbox']);
  assert.deepEqual(after.inventory,['musicbox','tape']);
});
test('all eleven portfolio documents and four story records are reachable from separate drawers',()=>{
  const drawers=JSON.parse(fs.readFileSync(path.join(root,'src/avg/exploration/archive-cabinet.json'),'utf8')).drawers;
  const ids=drawers.map(o=>o.action.id);
  assert.equal(new Set(ids).size,15);
  assert.equal(ids.filter(id=>id.startsWith('record:')).length,4);
  const source=fs.readFileSync(path.join(root,'src/data/works.ts'),'utf8');
  for(const id of ids.filter(id=>id.startsWith('work:')).map(id=>id.slice(5)))assert.ok(source.includes(`id: '${id}'`),id);
});

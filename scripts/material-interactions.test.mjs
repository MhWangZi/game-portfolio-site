import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const scenes=read('src/avg/exploration/cinematic-scenes.json'),cabinet=read('src/avg/exploration/archive-cabinet.json'),events=read('src/avg/narrative/events.json');
test('the archive room has one cabinet entrance; fifteen files use the corrected small3 and large3x4 geometry',()=>{
  const archive=scenes.find(r=>r.id==='archive');
  assert.equal(archive.objects.filter(o=>o.transition.action?.type==='cabinet').length,1);
  assert.equal(archive.objects.filter(o=>o.id.startsWith('drawer-')).length,0);
  assert.equal(cabinet.drawers.length,15);
  assert.equal(cabinet.drawers.filter(d=>d.point[0]<40).length,3);
  for(const x of [48.7,59.45,70.2])assert.equal(cabinet.drawers.filter(d=>Math.abs(d.point[0]-x)<.01).length,4);
  for(const src of Object.values(cabinet.images))assert.ok(fs.existsSync(path.join(root,'public',src.replace('./',''))));
});
test('key documents have exactly one physical entry and no optional dialogue reopens them',()=>{
  const sceneActions=scenes.flatMap(r=>r.objects.map(o=>o.transition.action)).filter(Boolean);
  const eventActions=events.filter(e=>e.enabled).flatMap(e=>Object.values(e.nodes).flatMap(n=>n.choices.map(c=>c.action))).filter(Boolean);
  for(const id of ['record:playlist','record:protocol','record:birth']){
    const entrances=[...sceneActions,...eventActions,...cabinet.drawers.map(d=>d.action)].filter(a=>a.type==='panel'&&a.id===id);
    assert.equal(entrances.length,1,id);
  }
  assert.ok(!scenes.some(r=>r.objects.some(o=>o.transition.action?.type==='collect'&&o.transition.action.id==='dark')));
  assert.equal(cabinet.returnToken,'dark');
});
test('every scene interaction has a bounded point; ambient inquiries do not reopen documents',()=>{
  for(const room of scenes)for(const o of room.objects){assert.equal(o.point.length,2);assert.ok(o.point.every(n=>n>=0&&n<=100),o.id);}
  assert.equal(events.filter(e=>e.enabled&&e.presentation==='ambient').length,14);
  assert.equal(events.filter(e=>e.enabled&&e.presentation==='exchange').length,12);
  assert(events.filter(e=>e.enabled&&e.presentation==='ambient').every(e=>e.nodes[e.entry].choices.every(c=>c.action?.type!=='panel')));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveCompanionPresentation as resolve} from '../src/avg/companion/presentation.ts';

const base={speech:{text:'旧台词',face:12,motion:'glitch',pose:'paper'},visible:true,dragging:false,settling:false,adjust:false,corrupt:false,listening:false,resting:false,depth:0};
test('closing or timing out a frightened dialogue restores neutral art and stops its motion',()=>{
  for(const face of [8,12,13,18,19]) for(const pose of [undefined,'paper','halt','wait']) {
    const next=resolve({...base,speech:{...base.speech,face,pose},visible:false});
    assert.deepEqual(next,{pose:'idle',index:8,motion:'idle'});
    assert.deepEqual(resolve({...base,speech:{...base.speech,face,pose},visible:false,resting:true}),{pose:'sleep',index:11,motion:'idle'});
  }
});
test('authored reactions and current fear remain visible only while their dialogue is active',()=>{
  assert.equal(resolve(base).gesture,'paper');
  assert.equal(resolve({...base,speech:{...base.speech,pose:undefined}}).index,17);
  assert.equal(resolve({...base,speech:{text:'普通交流',face:9,motion:'point'}}).pose,'explain');
});
test('dragging, landing, music and film state are not overridden by a stale dialogue face',()=>{
  assert.equal(resolve({...base,dragging:true}).index,12);
  assert.equal(resolve({...base,settling:true}).pose,'landing');
  assert.equal(resolve({...base,adjust:true}).pose,'sizing');
  assert.equal(resolve({...base,visible:false,listening:true}).index,16);
  assert.equal(resolve({...base,visible:false,corrupt:true}).index,18);
  assert.equal(resolve({...base,visible:false,corrupt:true,depth:4}).pose,'breakdown');
});
test('a familiar keepsake stays attentive after speech closes and never falls back to headphones',()=>{
 const remembered=resolve({...base,visible:false,remembering:true,listening:true});
 assert.equal(remembered.gesture,'listen');assert.notEqual(remembered.index,16);
 const restored=resolve({...base,speech:{text:'你还在',face:8,motion:'blink',pose:'relief'},corrupt:false,depth:0});
 assert.equal(restored.gesture,'relief');assert.equal(restored.index,8);
});

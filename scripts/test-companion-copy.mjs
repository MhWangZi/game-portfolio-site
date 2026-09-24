import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseLivingText} from '../src/avg/companion/livingText.ts';

test('authored tags never appear in spoken or accessible text',()=>{
  const result=parseLivingText('还在{warm}这里{/warm}。{pause:0.5s}{whisper}别出声{/whisper}');
  assert.equal(result.plain,'还在这里。别出声');
  assert.equal(result.glyphs.find(g=>g.char==='这').tone,'warm');
  assert.equal(result.glyphs.find(g=>g.char==='别').tone,'whisper');
  assert.ok(result.glyphs.find(g=>g.char==='别').delayMs-result.glyphs.find(g=>g.char==='。').delayMs>=500);
});

test('every authored line has balanced, supported tags',()=>{
  const paths=['src/avg/narrative/events.json','src/avg/narrative/interaction-responses.json','src/avg/maturity/config.json','src/avg/companion/ambient-lines.json'];
  let checked=0;
  const inspect=value=>{
    if(typeof value==='string'&&value.includes('{')){
      const tokens=[...value.matchAll(/\{([^}]+)\}/g)].map(m=>m[1]);
      const stack=[];
      for(const token of tokens){
        if(token.startsWith('pause:'))assert.match(token,/^pause:(xs|\d+(\.\d+)?s)$/);
        else if(token.startsWith('/'))assert.equal(stack.pop(),token.slice(1));
        else stack.push(token);
      }
      assert.equal(stack.length,0,value);checked++;
    } else if(Array.isArray(value))value.forEach(inspect);
    else if(value&&typeof value==='object')Object.values(value).forEach(inspect);
  };
  for(const path of paths)inspect(JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8')));
  assert.ok(checked>=25,`Only ${checked} tagged lines were found`);
});

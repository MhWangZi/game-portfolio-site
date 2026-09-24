import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {migrateMaturity,resetRound,resetExploration,signalStrength,isLost,reportFacts} from '../src/avg/maturity/model.ts';
import {resolveCompanionPresentation} from '../src/avg/companion/presentation.ts';
test('new and corrupt saves recover without deleting existing narrative keys',()=>{
 for(const v of [null,42,'bad',[],{frequency:NaN,stations:'bad',hints:{music:90},records:[1,'birth','birth']}]){const s=migrateMaturity(v);assert.equal(s.version,1);assert(Number.isFinite(s.frequency));assert(Array.isArray(s.records));assert(s.hints.music<=3);}
 const s=migrateMaturity({clearance:true,reading:{work:'click-down',page:'process',scroll:402},frequency:400,returned:['drawer-4','drawer-4']});assert.equal(s.frequency,108);assert.equal(s.reading.scroll,402);assert.equal(s.returned.length,1);
});
test('new round keeps review permission and ending record but not old facts',()=>{
 const s=migrateMaturity({clearance:true,records:['protocol'],facts:['token:echo'],stations:['jazz'],report:{date:'2026/9/23',facts:['真实记录'],tokens:['echo'],ending:true}});const next=resetRound(s,2);assert.equal(next.clearance,true);assert.deepEqual(next.records,[]);assert.deepEqual(next.report,s.report);assert.equal(next.round,2);
});
test('manual exploration reset revokes desk permission and clears previous review while retaining loop count',()=>{
 const s=migrateMaturity({clearance:true,reading:{work:'click-down',page:'process',scroll:402},records:['birth'],report:{date:'2026/9/23',facts:['old'],tokens:['echo'],ending:true},round:3});
 const next=resetExploration(s.round);
 assert.equal(next.clearance,false);
 assert.deepEqual(next.reading,{work:'',page:'overview',scroll:0});
 assert.equal(next.report,null);
 assert.deepEqual(next.records,[]);
 assert.equal(next.round,3);
});
test('radio uses smooth forgiving tuning and no hard frequency cliff',()=>{assert.equal(signalStrength(98.6,98.6,.8),1);assert(signalStrength(98.9,98.6,.8)>.5);assert.equal(signalStrength(100,98.6,.8),0);});
test('lost hint needs repeated alternating visits within its active window',()=>{const v=['duty','corridor','duty','corridor','duty','corridor'].map((room,i)=>({room,at:i*5000}));assert(isLost(v,26000,60000,5));assert(!isLost(v,100000,60000,5));assert(!isLost(v.slice(0,4),26000,60000,5));assert(!isLost([...v,{room:'lab',at:26000}],27000,60000,5));});
test('report contains only observed behavior and never invents coat folding',()=>{const s=migrateMaturity({facts:['event:coat-owner']});assert.deepEqual(reportFacts(s),['你来过这间亮着灯的工作区。']);const actual=migrateMaturity({returned:['drawer-4'],stations:['jazz'],facts:['token:echo']});assert.equal(reportFacts(actual).length,3);assert(!reportFacts(actual).join('').includes('衣角'));});
test('film lock outranks a pending drag or music pose',()=>{const p=resolveCompanionPresentation({speech:{text:'',face:19,motion:'glitch'},visible:true,dragging:true,settling:false,adjust:false,corrupt:true,listening:true,resting:false,depth:4});assert.equal(p.pose,'breakdown');});
test('immediate music memories get their expression, then return to the music performance',()=>{const input={speech:{text:'又是这首。',face:9,motion:'blink',pose:'listen',priority:'immediate'},visible:true,dragging:false,settling:false,adjust:false,corrupt:false,listening:true,musicFocused:true,resting:false,depth:0};assert.equal(resolveCompanionPresentation(input).gesture,'listen');assert.equal(resolveCompanionPresentation({...input,visible:false}).pose,'music');});
test('journal hint points to the actual small cabinet drawers',()=>{const config=JSON.parse(fs.readFileSync('src/avg/maturity/config.json','utf8')),cabinet=JSON.parse(fs.readFileSync('src/avg/exploration/archive-cabinet.json','utf8'));assert.equal(cabinet.drawers[1].action.id,'record:playlist');assert.equal(cabinet.drawers[2].action.id,'record:protocol');assert.match(config.hints.music[0],/左侧三层小柜的中层/);assert.match(config.hints.patch[0],/最下层/);});

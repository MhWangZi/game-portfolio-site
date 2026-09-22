export const maturityStorage='mw-maturity-v1';
export type Report={date:string;facts:string[];tokens:string[];ending:boolean};
export type MaturitySave={version:1;clearance:boolean;reading:{work:string;page:string;scroll:number};frequency:number;stations:string[];records:string[];returned:string[];facts:string[];heard:string[];echoes:string[];hints:{music:number;patch:number};report:Report|null;round:number};
const strings=(v:unknown)=>Array.isArray(v)?[...new Set(v.filter((x):x is string=>typeof x==='string'))]:[];
export function migrateMaturity(raw:unknown):MaturitySave {
 const d=raw&&typeof raw==='object'?raw as Partial<MaturitySave>:{};
 const r=d.reading;
 return {version:1,clearance:d.clearance===true,reading:{work:typeof r?.work==='string'?r.work:'',page:typeof r?.page==='string'?r.page:'overview',scroll:Number.isFinite(r?.scroll)?Math.max(0,Number(r?.scroll)):0},frequency:Number.isFinite(d.frequency)?Math.max(88,Math.min(108,Number(d.frequency))):88,
 stations:strings(d.stations),records:strings(d.records),returned:strings(d.returned),facts:strings(d.facts),heard:strings(d.heard),echoes:strings(d.echoes),
 hints:{music:Math.min(3,Math.max(0,Number(d.hints?.music)||0)),patch:Math.min(3,Math.max(0,Number(d.hints?.patch)||0))},
 report:d.report&&typeof d.report.date==='string'?{date:d.report.date,facts:strings(d.report.facts),tokens:strings(d.report.tokens),ending:d.report.ending===true}:null,round:Math.max(0,Number(d.round)||0)};
}
export function resetRound(s:MaturitySave,round:number):MaturitySave{return {...migrateMaturity(null),clearance:s.clearance,reading:s.reading,report:s.report,round};}
export function signalStrength(frequency:number,station:number,tolerance:number):number{return Math.max(0,1-Math.abs(frequency-station)/tolerance);}
export function isLost(visits:{room:string;at:number}[],now:number,windowMs:number,changes:number):boolean {
 const recent=visits.filter(v=>now-v.at<=windowMs);
 return recent.length>=changes+1&&new Set(recent.map(v=>v.room)).size===2&&recent.every((v,i)=>!i||v.room!==recent[i-1].room);
}
export function reportFacts(s:MaturitySave):string[]{
 const facts:string[]=[];
 if(s.clearance)facts.push('你在调阅公函上留下了一枚印章。');
 if(s.returned.length)facts.push(`你将${s.returned.length}份看过的档案归还原格。`);
 if(s.facts.includes('token:echo'))facts.push('你依序聆听了三首八音盒里的旧日旋律。');
 if(s.stations.includes('jazz'))facts.push('你在天台的雨声里调到了一段旋律。');
 if(s.stations.includes('call'))facts.push('你听见了旧线路里重复的呼叫。');
 if(s.facts.includes('event:cat-seat'))facts.push('你在猫身边停留过。');
 if(s.records.includes('protocol'))facts.push('你翻开了那张被标为废弃的启动流程。');
 return facts.length?facts:['你来过这间亮着灯的工作区。'];
}

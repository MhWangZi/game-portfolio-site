import {useState} from 'react';
import {contactItems} from '../../data/siteContent';
import {tokens} from '../story';
import type {TokenId} from '../story';
import {reportFacts} from './model';
import {Overlay} from './Overlay';
import type {MaturityController} from './useMaturity';
export function ReportView({model,keys}:{model:MaturityController;keys:TokenId[]}){
 const [error,setError]=useState(''),[preview,setPreview]=useState('');
 const report=model.save.report??{date:new Date().toLocaleDateString('zh-CN'),facts:reportFacts(model.save),tokens:keys,ending:false};
 const message=report.ending?'灯又亮了。……今天这趟班，多谢你陪我上完。':'你带来的声音，今天都留在这里了。有空再来。';
 async function download(){try{
  await document.fonts.ready;const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1800;const c=canvas.getContext('2d');if(!c)throw new Error('当前浏览器不能生成图片。');
  c.fillStyle='#e9ddbd';c.fillRect(0,0,1200,1800);c.fillStyle='#414c3c';c.fillRect(0,0,1200,26);c.strokeStyle='#bba579';c.strokeRect(48,48,1104,1704);
  c.fillStyle='#6d5237';c.font='24px serif';c.fillText('MW / VISITOR RECORD',88,128);c.font='bold 52px serif';c.fillText('工作区异常巡检交接报告',88,218);c.font='26px serif';c.fillText(report.date,88,273);
  let y=375;const line=(text:string,size=30)=>{c.font=`${size}px serif`;let row='';for(const char of text){if(c.measureText(row+char).width>1000){c.fillText(row,88,y);y+=size*1.6;row='';}row+=char;}if(row){c.fillText(row,88,y);y+=size*1.6;}};
  for(const fact of report.facts){line('· '+fact);y+=22;}y=Math.max(y+40,860);c.fillStyle='#914e3d';line('留在口袋里的东西',32);c.fillStyle='#6d5237';for(const id of report.tokens){const t=tokens.find(t=>t.id===id);if(t)line(t.name,27);}
  y=Math.max(y+45,1200);line(message,31);line('——私人助手',26);y=1490;c.strokeStyle='#bba579';c.beginPath();c.moveTo(88,y-30);c.lineTo(1112,y-30);c.stroke();line('MhWangZi · 游戏策划 / 游戏原型',26);
  for(const contact of contactItems.filter(x=>['mail','code','video'].includes(x.kind)))line(`${contact.label}：${contact.kind==='mail'?contact.value:contact.href}`,21);
  const url=canvas.toDataURL('image/png');setPreview(url);setError('');const a=document.createElement('a');a.href=url;a.download='工作区巡检交接报告.png';document.body.appendChild(a);a.click();a.remove();
 }catch(e){setError((e as Error).message);}}
 return <Overlay label="巡检交接报告" onClose={model.close} className="report-overlay"><article className="visit-report"><small>MW / VISITOR RECORD</small><h2>工作区异常巡检<br/>交接报告</h2><time>{report.date}</time><section>{report.facts.map(f=><p key={f}>· {f}</p>)}</section><div className="report-stamps">{report.tokens.map(id=>{const t=tokens.find(x=>x.id===id);return t?<span key={id}>{t.icon}<small>{t.name}</small></span>:null;})}</div><blockquote>{message}<cite>——私人助手</cite></blockquote><footer><strong>MhWangZi · 游戏策划</strong>{contactItems.filter(x=>['mail','code','video'].includes(x.kind)).map(x=><a key={x.kind} href={x.href} target={x.external?'_blank':undefined} rel="noreferrer">{x.label} ↗</a>)}</footer><button onClick={()=>void download()}>保存这张交接报告 ↓</button>{preview&&<div className="report-export"><p role="status">图片已生成。若浏览器未开始下载，可以保存下方图片。</p><a href={preview} download="工作区巡检交接报告.png">下载PNG ↓</a><img src={preview} alt="生成的巡检交接报告，1200乘1800像素"/></div>}{error&&<p role="alert">{error}</p>}</article></Overlay>;
}

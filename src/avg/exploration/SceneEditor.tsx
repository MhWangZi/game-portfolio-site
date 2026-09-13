import { useRef, useState } from 'react';
import type { CinematicRoom, CinematicObject } from './cinematicTypes';
import { cinematicRooms } from './cinematicData';
import { rooms } from '../world';
import './scene-editor.css';
export default function SceneEditor() {
  const [data,setData]=useState<CinematicRoom[]>(()=>structuredClone(cinematicRooms));
  const [roomIndex,setRoomIndex]=useState(0),[state,setState]=useState('idle'),[node,setNode]=useState(0),[text,setText]=useState(''),[error,setError]=useState('');
  const svg=useRef<SVGSVGElement>(null),drag=useRef<number|null>(null);
  const scene=data[roomIndex],object=scene.objects[node];
  function changeObject(next:CinematicObject) {setData(all=>all.map((room,i)=>i===roomIndex?{...room,objects:room.objects.map((o,j)=>j===node?next:o)}:room));}
  function choose(index:number){setNode(index);setText(JSON.stringify(scene.objects[index],null,2));setError('');}
  function download(){const blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='cinematic-scenes.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  return <div className="scene-editor">
    <header><strong>场景状态与物件编辑台</strong><span>拖动实心圆点 · 编辑行为 · 导出配置</span><a href="./">返回游戏</a><button onClick={download}>导出全部场景JSON</button></header>
    <aside>
      <label>房间<select aria-label="编辑房间" value={roomIndex} onChange={e=>{setRoomIndex(Number(e.target.value));setState('idle');setNode(0);setText('');}}>{data.map((s,i)=><option key={s.id} value={i}>{rooms[s.id].label}</option>)}</select></label>
      <label>状态图<select aria-label="预览状态图" value={state} onChange={e=>setState(e.target.value)}>{Object.keys(scene.variants).map(s=><option key={s}>{s}</option>)}</select></label>
      <nav aria-label="物件节点">{scene.objects.map((o,i)=><button key={o.id} aria-pressed={node===i} onClick={()=>choose(i)}>{o.label}<small>{o.id}</small></button>)}</nav>
    </aside>
    <main>
      <div className="editor-canvas"><img src={scene.variants[state]??scene.variants[scene.initial]} alt={`${rooms[scene.id].label}状态图`}/>
        <svg ref={svg} viewBox="0 0 100 100" preserveAspectRatio="none" onPointerMove={e=>{if(drag.current===null||!svg.current)return;const m=svg.current.getScreenCTM();if(!m)return;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse());if(drag.current===-1){changeObject({...object,point:[+Math.max(0,Math.min(100,p.x)).toFixed(2),+Math.max(0,Math.min(100,p.y)).toFixed(2)]});return;}const polygon=object.polygon.map((v,i)=>i===drag.current?[+Math.max(0,Math.min(100,p.x)).toFixed(2),+Math.max(0,Math.min(100,p.y)).toFixed(2)] as [number,number]:v);changeObject({...object,polygon});}} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
          {scene.objects.map((o,i)=><polygon key={o.id} points={o.polygon.map(p=>p.join(',')).join(' ')} className={i===node?'selected':''} onClick={()=>choose(i)}/>)}
          {object.point&&<circle cx={object.point[0]} cy={object.point[1]} r="1.1" style={{fill:'#fff0ad',stroke:'#17231b'}} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);drag.current=-1;}}/>}
          {object.polygon.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r=".55" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);drag.current=i;}}/>)}
        </svg>
      </div>
      <div className="editor-inspector"><label>物件名称<input aria-label="物件名称" value={object.label} onChange={e=>changeObject({...object,label:e.target.value})}/></label><label>目标状态<select aria-label="目标状态" value={object.transition.state??''} onChange={e=>changeObject({...object,transition:{...object.transition,state:e.target.value||undefined}})}><option value="">保持当前画面</option>{Object.keys(scene.variants).map(s=><option key={s}>{s}</option>)}</select></label><label>助手台词<textarea aria-label="助手台词" value={object.transition.speech??''} onChange={e=>changeObject({...object,transition:{...object.transition,speech:e.target.value}})}/></label></div>
      <details><summary>完整节点配置：条件、物品、声音、镜头与动作</summary><button onClick={()=>setText(JSON.stringify(object,null,2))}>读取当前节点</button><textarea aria-label="完整节点JSON" className="node-json" value={text} onChange={e=>setText(e.target.value)}/><button onClick={()=>{try{const value=JSON.parse(text);if(!value.id||!value.label||!Array.isArray(value.polygon)||!value.transition)throw Error('节点需要id、label、polygon和transition');changeObject(value);setError('已应用到编辑副本');}catch(e){setError((e as Error).message);}}}>应用节点JSON</button><p role="status">{error}</p></details>
      <p className="editor-note">导出的文件对应src/avg/exploration/cinematic-scenes.json。实心圆点是实际交互位置，外围多边形仅作为物件构图参考。状态图、物品条件和动作分开配置。档案柜近景的15格位置与资料绑定另见archive-cabinet.json。编辑副本不会改动游玩存档。</p>
    </main>
  </div>;
}

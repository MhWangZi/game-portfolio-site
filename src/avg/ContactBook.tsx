import { contactItems } from '../data/siteContent';
import type { TokenId } from './story';

export function ContactBook({collect}:{collect:(id:TokenId)=>void}) {
  return <article className="contact-book">
    <section className="address-left"><small>CORRESPONDENCE / AFTER HOURS</small><div className="envelope-mark" aria-hidden="true">MW</div><h3>寄往房间外</h3><p>关于游戏、工具，<br/>或者你发现的奇怪小东西。</p><p className="address-postscript">地址抄在右页。<br/>有空再写，也没关系。</p></section>
    <section className="address-right"><small>ADDRESS BOOK / 01</small><h3>留下一个回声</h3>
      {contactItems.map((c,i)=><a key={c.kind} href={c.href} target={c.external?'_blank':undefined} rel={c.external?'noreferrer':undefined} onClick={()=>{if(c.kind==='video'||c.kind==='radio')collect('visitor');}}><span className="address-number">0{i+1}</span><span><strong>{c.label}</strong><small>{c.value}</small></span><em aria-hidden="true">↗</em></a>)}
      <p className="address-foot">轻触地址，打开对应的联系入口。</p>
    </section>
  </article>;
}

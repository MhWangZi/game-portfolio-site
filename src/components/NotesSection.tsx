const notes = [
  {
    label: 'Combat',
    title: '弹反为什么比普通防御更容易留下记忆点',
    body: '弹反不是单纯的防御按钮，它把读招、时机、反馈和反击收益压缩到一个瞬间。Parry Arena 里我尝试用体力、窗口和 Boss 行为限制它的万能性。',
  },
  {
    label: 'Economy',
    title: '搜打撤经济的风险感来自哪里',
    body: '入局成本、撤离收益、交易流通和系统回收共同决定风险感。只看货币产出不够，还要看失败后玩家失去什么、下一局为什么还愿意进。',
  },
  {
    label: 'Narrative',
    title: '规则怪谈文字冒险需要什么样的压力',
    body: '静态文本很容易变成读小说，所以我用行动点、风险值、身份差异文本和多结局，让阅读过程里一直存在选择和代价。',
  },
]

export function NotesSection() {
  return (
    <section className="personal-section notes-section" id="notes">
      <div className="section-heading compact">
        <p className="eyebrow">NOTES / OBSERVATION</p>
        <h2>一些设计笔记</h2>
        <p>这里不是正式报告，更像我把游戏体验拆开之后留下的观察、复盘和问题。</p>
      </div>
      <div className="notes-grid">
        {notes.map((note, index) => (
          <article className="note-card" key={note.title}>
            <span>{String(index + 1).padStart(2, '0')} / {note.label}</span>
            <h3>{note.title}</h3>
            <p>{note.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

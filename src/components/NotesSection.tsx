const notes = [
  {
    label: 'Combat',
    question: '弹反为什么容易形成记忆点？',
    observation: '防御、读招和反击收益集中在同一瞬间。',
    adjustment: '强化攻击预兆，保留体力消耗。',
    result: '成功更清楚，失败代价更可见。',
  },
  {
    label: 'Economy',
    question: '搜打撤经济的风险感来自哪里？',
    observation: '入局成本、撤离收益和仓储压力共同生效。',
    adjustment: '把来源、消耗、回收放进同一张流转表。',
    result: '风险判断不只停留在产出数量。',
  },
  {
    label: 'Narrative',
    question: '规则怪谈文字冒险需要什么压力？',
    observation: '静态文本容易滑向线性阅读。',
    adjustment: '用行动点、风险值和身份差异制造代价。',
    result: '同一线索在不同角色下出现权重差。',
  },
  {
    label: 'Tooling',
    question: '工具插件解决的是哪一步卡点？',
    observation: '遮挡、碰撞和 NPC 配置容易打断制作节奏。',
    adjustment: '把高频节点操作收进按钮、表单和检查项。',
    result: '新手流程更连续，迭代路径更短。',
  },
]

export function NotesSection() {
  return (
    <section className="personal-section notes-section" id="notes">
      <div className="section-heading compact">
        <p className="eyebrow">NOTES / DESIGN OBSERVATION</p>
        <h2>设计笔记</h2>
        <p>短问题，短观察，保留可继续调整的入口。</p>
      </div>
      <div className="notes-grid">
        {notes.map((note, index) => (
          <article className="note-card" key={note.question}>
            <span>{String(index + 1).padStart(2, '0')} / {note.label}</span>
            <h3>{note.question}</h3>
            <dl className="note-structure">
              <div>
                <dt>观察</dt>
                <dd>{note.observation}</dd>
              </div>
              <div>
                <dt>调整</dt>
                <dd>{note.adjustment}</dd>
              </div>
              <div>
                <dt>结果</dt>
                <dd>{note.result}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}

const notes = [
  {
    label: 'Combat',
    question: '弹反为什么容易形成记忆点？',
    observation: '防御、读招、时机和反击收益被压缩到一个瞬间。',
    reasoning: '窗口越短，成功反馈越需要清晰；收益越高，失败代价越需要被看见。',
    adjustment: '继续调整攻击预兆、体力消耗和 Boss 行为，避免单一操作覆盖全部解法。',
  },
  {
    label: 'Economy',
    question: '搜打撤经济的风险感来自哪里？',
    observation: '风险感同时来自入局成本、撤离收益、交易流通和系统回收。',
    reasoning: '只观察货币产出会漏掉失败损失、仓储压力和下一局动机。',
    adjustment: '把资源来源、消耗、回收与保险机制拆成同一张流转表继续观察。',
  },
  {
    label: 'Narrative',
    question: '规则怪谈文字冒险需要什么压力？',
    observation: '静态文本容易变成线性阅读，行动点和风险值能让阅读产生代价。',
    reasoning: '身份差异文本和多结局会让同一线索在不同角色下产生不同权重。',
    adjustment: '减少无效选项，强化关键线索、风险阈值和结局条件之间的关系。',
  },
  {
    label: 'Tooling',
    question: '工具插件解决的是哪一步卡点？',
    observation: '遮挡、碰撞、地图底图、角色库和 NPC 配置容易打断新手制作流程。',
    reasoning: '高频但重复的节点操作适合被收束成可视化按钮、表单和检查项。',
    adjustment: '继续把场景体检、旧场景升级和角色包导入导出整理成稳定路径。',
  },
]

export function NotesSection() {
  return (
    <section className="personal-section notes-section" id="notes">
      <div className="section-heading compact">
        <p className="eyebrow">NOTES / DESIGN OBSERVATION</p>
        <h2>设计笔记</h2>
        <p>关于规则、数值、关卡、反馈和玩家选择的短记录。篇幅不长，重点放在问题本身和推导过程。</p>
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
                <dt>推导</dt>
                <dd>{note.reasoning}</dd>
              </div>
              <div>
                <dt>可能的调整</dt>
                <dd>{note.adjustment}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}

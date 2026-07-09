const processSteps = [
  { title: '观察', body: '路径、误判、失败点。' },
  { title: '拆解', body: '资源、成本、奖励。' },
  { title: '假设', body: '一个问题，一轮边界。' },
  { title: '原型', body: '最小可运行版本。' },
  { title: '复盘', body: '截图、表格、下一版。' },
]

export function ProcessSection() {
  return (
    <section className="personal-section process-section" id="process">
      <div className="section-heading compact">
        <p className="eyebrow">PROCESS / DESIGN METHOD</p>
        <h2>原型方法</h2>
        <p>从问题到版本，再回到问题。</p>
      </div>
      <div className="process-line">
        {processSteps.map((step, index) => (
          <article className="process-step" key={step.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

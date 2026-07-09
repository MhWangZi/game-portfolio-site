const processSteps = [
  { title: '观察', body: '记录玩家路径、反馈节点、失败原因和重复行为。' },
  { title: '拆解', body: '把系统拆成规则、资源、成本、奖励和下一步目标。' },
  { title: '假设', body: '提出一个可验证的问题，限定本轮原型的规则边界。' },
  { title: '原型', body: '用最小可运行版本验证核心循环是否成立。' },
  { title: '复盘', body: '根据体验、截图、表格和测试记录调整下一版。' },
]

export function ProcessSection() {
  return (
    <section className="personal-section process-section" id="process">
      <div className="section-heading compact">
        <p className="eyebrow">PROCESS / DESIGN METHOD</p>
        <h2>原型方法</h2>
        <p>一个设计想法通常先被拆成小问题，再进入可运行版本。记录重点放在规则边界、反馈是否清晰，以及下一轮如何调整。</p>
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

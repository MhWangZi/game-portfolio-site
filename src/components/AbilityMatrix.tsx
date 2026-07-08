import { abilityGroups } from '../data/works'

export function AbilityMatrix() {
  return (
    <section className="section-shell" id="abilities">
      <div className="section-heading compact">
        <p className="eyebrow">Capability</p>
        <h2>能力矩阵</h2>
        <p>能力区只写能被作品证明的内容：原型、系统拆解、竞品分析、长期品类经验。每个方向都能在上方作品卡里找到对应证据。</p>
      </div>

      <div className="ability-grid">
        {abilityGroups.map((group) => (
          <article className="ability-card" key={group.title}>
            <h3>{group.title}</h3>
            <p>{group.summary}</p>
            <div className="tag-row">
              {group.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

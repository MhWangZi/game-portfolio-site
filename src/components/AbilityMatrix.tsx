import { abilityGroups } from '../data/works'

export function AbilityMatrix() {
  return (
    <section className="section-shell" id="abilities">
      <div className="section-heading compact">
        <p className="eyebrow">Capability</p>
        <h2>能力矩阵</h2>
        <p>招聘方需要快速看到你能承担什么工作，所以能力区直接绑定到作品证据，而不是写空泛形容词。</p>
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

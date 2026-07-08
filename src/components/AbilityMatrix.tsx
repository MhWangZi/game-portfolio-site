import { BadgeCheck } from 'lucide-react'
import { abilityGroups } from '../data/works'

export function AbilityMatrix() {
  return (
    <section className="section-shell" id="abilities">
      <div className="section-heading compact">
        <p className="eyebrow">Capability Archive</p>
        <h2>能力档案</h2>
        <p>所有能力都绑定到作品证据，避免空泛自夸。招聘方可以顺着证据回到对应作品、下载包或分析截图。</p>
      </div>

      <div className="ability-grid">
        {abilityGroups.map((group, index) => (
          <article className="ability-card" key={group.title}>
            <span className="ability-index">{String(index + 1).padStart(2, '0')}</span>
            <h3>{group.title}</h3>
            <p>{group.summary}</p>
            <div className="tag-row">
              {group.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            {group.evidence?.length ? (
              <div className="evidence-list">
                <strong>作品证据</strong>
                {group.evidence.map((item) => (
                  <span key={item}>
                    <BadgeCheck size={14} />
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

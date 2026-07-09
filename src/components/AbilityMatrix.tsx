import { BadgeCheck, Fingerprint, Radar } from 'lucide-react'
import { abilityGroups } from '../data/works'

export function AbilityMatrix() {
  return (
    <section className="section-shell interest-section" id="interests">
      <div className="section-heading compact">
        <p className="eyebrow">INTERESTS / SYSTEM NOTES</p>
        <div className="section-heading-title">
          <span className="section-heading-icon">
            <Radar size={20} />
          </span>
          <h2>长期设计命题</h2>
        </div>
        <p>反复回到的系统问题与项目切片。</p>
      </div>

      <div className="ability-grid">
        {abilityGroups.map((group, index) => (
          <article className="ability-card" key={group.title}>
            <span className="ability-index">{String(index + 1).padStart(2, '0')}</span>
            <div className="ability-title">
              <Fingerprint size={18} />
              <h3>{group.title}</h3>
            </div>
            <p>{group.summary}</p>
            <div className="tag-row">
              {group.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            {group.evidence?.length ? (
              <div className="evidence-list">
                <strong>关联记录</strong>
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

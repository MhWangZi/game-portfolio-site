import { BadgeCheck, Fingerprint } from 'lucide-react'
import { abilityGroups } from '../data/works'

export function AbilityMatrix() {
  return (
    <section className="section-shell interest-section" id="interests">
      <div className="section-heading compact">
        <p className="eyebrow">INTERESTS / SYSTEM NOTES</p>
        <h2>长期设计命题</h2>
        <p>
          这些条目记录反复出现的问题：玩家为什么继续投入，资源为什么流动，
          战斗为什么有节奏，一个规则如何变成可玩的体验。
        </p>
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

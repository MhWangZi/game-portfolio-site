import { BadgeCheck, Fingerprint } from 'lucide-react'
import { abilityGroups } from '../data/works'

export function AbilityMatrix() {
  return (
    <section className="section-shell interest-section" id="interests">
      <div className="section-heading compact">
        <p className="eyebrow">INTERESTS / SYSTEMS I WATCH</p>
        <h2>我喜欢研究的系统</h2>
        <p>
          这些不是简历式能力标签，而是我反复会回到的几个问题：玩家为什么继续玩、资源为什么流动、
          战斗为什么有节奏、一个规则如何变成可玩的体验。
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
                <strong>相关记录</strong>
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

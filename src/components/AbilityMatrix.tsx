import { BadgeCheck, Fingerprint } from 'lucide-react'
import { abilityGroups } from '../data/works'

export function AbilityMatrix() {
  return (
    <section className="section-shell" id="abilities">
      <div className="section-heading compact">
        <p className="eyebrow">CAPABILITY CHIPS / EVIDENCE MAP</p>
        <h2>能力证据矩阵</h2>
        <p>
          能力不单独写成标签，而是挂到具体作品、下载包和拆解图上。每张卡都回答一个问题：
          这项能力在什么项目里被证明过？
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

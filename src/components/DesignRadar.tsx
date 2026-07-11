import { ArrowUpRight, CircuitBoard, Crosshair, Gamepad2, ScanSearch, Wrench } from 'lucide-react'
import { useMemo, useState } from 'react'
import { abilityGroups } from '../data/works'
import { focusItems } from '../data/siteContent'
import type { WorkItem } from '../types'
import { getKindShortLabel } from '../utils/workPresentation'

type DesignRadarProps = {
  works: WorkItem[]
  onOpen: (id: string) => void
  onProjectPreview: (work: WorkItem) => void
}

const focusIcons = {
  prototype: Gamepad2,
  systems: CircuitBoard,
  behavior: ScanSearch,
  tooling: Wrench,
}

const abilityIndexes = {
  prototype: [0],
  systems: [2, 3, 5],
  behavior: [1, 4],
  tooling: [6],
}

export function DesignRadar({ works, onOpen, onProjectPreview }: DesignRadarProps) {
  const [activeId, setActiveId] = useState(focusItems[0].id)
  const activeFocus = focusItems.find((item) => item.id === activeId) ?? focusItems[0]
  const ActiveIcon = focusIcons[activeFocus.id]
  const evidence = activeFocus.evidenceIds
    .map((id) => works.find((work) => work.id === id))
    .filter((work): work is WorkItem => Boolean(work))
  const skillPool = useMemo(
    () => [...new Set(abilityIndexes[activeFocus.id].flatMap((index) => abilityGroups[index]?.items ?? []))].slice(0, 7),
    [activeFocus.id],
  )

  return (
    <section className="dc-chapter dc-design-radar" id="radar" data-chapter>
      <div className="dc-section-heading" data-reveal>
        <div><span>02</span><strong>DESIGN RADAR</strong></div>
        <h2>近期设计命题</h2>
        <p>四个入口，一组持续变化的项目坐标。</p>
      </div>

      <div className="dc-radar-layout">
        <div className="dc-radar-map" data-reveal-media>
          <div className="dc-radar-rings" aria-hidden="true"><i /><i /><i /></div>
          <div className="dc-radar-core" key={activeFocus.id}>
            <Crosshair size={28} />
            <span>{activeFocus.index}</span>
            <strong>{activeFocus.title}</strong>
          </div>
          {focusItems.map((item) => {
            const Icon = focusIcons[item.id]
            return (
              <button
                className={`dc-radar-node node-${item.id} ${item.id === activeId ? 'active' : ''}`}
                type="button"
                key={item.id}
                onClick={() => setActiveId(item.id)}
                onMouseEnter={() => setActiveId(item.id)}
                onFocus={() => setActiveId(item.id)}
              >
                <span>{item.index}</span><Icon size={18} /><strong>{item.title}</strong><em>{item.label}</em>
              </button>
            )
          })}
        </div>

        <aside className="dc-radar-panel" key={`panel-${activeFocus.id}`} data-reveal>
          <div className="dc-panel-kicker"><ActiveIcon size={17} />ACTIVE VECTOR / {activeFocus.index}</div>
          <h3>{activeFocus.title}</h3>
          <p>{activeFocus.summary}</p>

          <div className="dc-skill-lattice">
            {skillPool.map((skill) => <span key={skill}>{skill}</span>)}
          </div>

          <div className="dc-evidence-stack">
            <div className="dc-stack-title"><span>LINKED FILES</span><strong>{String(evidence.length).padStart(2, '0')}</strong></div>
            {evidence.map((work, index) => (
              <button
                type="button"
                key={work.id}
                onMouseEnter={() => onProjectPreview(work)}
                onFocus={() => onProjectPreview(work)}
                onClick={() => onOpen(work.id)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><strong>{work.shortTitle ?? work.title}</strong><em>{getKindShortLabel(work)}</em></div>
                <ArrowUpRight size={15} />
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}

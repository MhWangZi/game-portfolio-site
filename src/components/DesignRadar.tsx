import { ArrowUpRight, CircuitBoard, Crosshair, Gamepad2, ScanSearch, Wrench } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import type { FragmentId } from '../data/indexZeroArchive'
import { abilityGroups } from '../data/works'
import { focusItems } from '../data/siteContent'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { gsap, useGSAP } from '../lib/gsap'
import type { WorkItem } from '../types'
import { getKindShortLabel } from '../utils/workPresentation'
import { CorruptedFragment } from './index-zero/CorruptedFragment'

type DesignRadarProps = {
  works: WorkItem[]
  onOpen: (id: string) => void
  onProjectPreview: (work: WorkItem) => void
  isFragmentRecovered: (id: FragmentId) => boolean
  onRecoverFragment: (id: FragmentId) => void
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

export function DesignRadar({
  works,
  onOpen,
  onProjectPreview,
  isFragmentRecovered,
  onRecoverFragment,
}: DesignRadarProps) {
  const [activeId, setActiveId] = useState(focusItems[0].id)
  const rootRef = useRef<HTMLElement | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const activeFocus = focusItems.find((item) => item.id === activeId) ?? focusItems[0]
  const ActiveIcon = focusIcons[activeFocus.id]
  const evidence = activeFocus.evidenceIds
    .map((id) => works.find((work) => work.id === id))
    .filter((work): work is WorkItem => Boolean(work))
  const skillPool = useMemo(
    () => [...new Set(abilityIndexes[activeFocus.id].flatMap((index) => abilityGroups[index]?.items ?? []))].slice(0, 7),
    [activeFocus.id],
  )

  useGSAP(
    () => {
      if (!rootRef.current) return
      const selector = gsap.utils.selector(rootRef.current)
      const targets = selector(
        '.dc-radar-core, .dc-radar-panel > *, .dc-skill-lattice > span, .dc-evidence-stack > *',
      )

      if (reducedMotion) {
        gsap.set(targets, { autoAlpha: 1, clearProps: 'transform,clipPath' })
        return
      }

      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      timeline
        .fromTo(
          selector('.dc-radar-core'),
          { autoAlpha: 0, scale: 0.76, rotation: 7 },
          { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.52, ease: 'back.out(1.45)' },
          0,
        )
        .fromTo(
          selector('.dc-radar-panel > .dc-panel-kicker, .dc-radar-panel > h3, .dc-radar-panel > p'),
          { autoAlpha: 0, x: 24, clipPath: 'inset(0 0 34% 0)' },
          {
            autoAlpha: 1,
            x: 0,
            clipPath: 'inset(0 0 0% 0)',
            duration: 0.48,
            stagger: 0.055,
          },
          0.08,
        )
        .fromTo(
          selector('.dc-skill-lattice > span'),
          { autoAlpha: 0, y: 12, scale: 0.94 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.34, stagger: 0.03 },
          0.24,
        )
        .fromTo(
          selector('.dc-evidence-stack > *'),
          { autoAlpha: 0, x: 18 },
          { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.045 },
          0.32,
        )
        .fromTo(
          selector('.dc-radar-node.active'),
          { boxShadow: '0 0 0 rgba(231, 169, 79, 0)', scale: 0.97 },
          {
            boxShadow: '0 0 28px rgba(231, 169, 79, 0.14)',
            scale: 1,
            duration: 0.44,
            clearProps: 'boxShadow,scale',
          },
          0.04,
        )
    },
    {
      scope: rootRef,
      dependencies: [activeFocus.id, reducedMotion],
      revertOnUpdate: true,
    },
  )

  return (
    <section className="dc-chapter dc-design-radar" id="radar" data-chapter ref={rootRef}>
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
          <div className="dc-radar-anomaly-row">
            <span>UNCOMMITTED FIELD</span>
            <CorruptedFragment
              fragmentId="fragment-02"
              isRecovered={isFragmentRecovered('fragment-02')}
              onRecover={onRecoverFragment}
            />
          </div>

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

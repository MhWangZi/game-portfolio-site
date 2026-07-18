import { ArrowRight, Download, FileText, Filter, PackageCheck } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { gsap, useGSAP } from '../lib/gsap'
import type { WorkItem, WorkKind } from '../types'
import {
  getArchiveCode,
  getDownloadLabel,
  getKindLabel,
  getKindShortLabel,
  getWorkImageSources,
  getWorkKind,
} from '../utils/workPresentation'
import { SafeImage } from './SafeImage'

type ProjectIndexProps = {
  works: WorkItem[]
  onOpen: (id: string) => void
  onProjectPreview: (work: WorkItem) => void
}

type FilterId = 'all' | 'playable' | 'analysis' | 'tooling'

const filters: Array<{ id: FilterId; label: string; kind?: WorkKind }> = [
  { id: 'all', label: 'ALL FILES' },
  { id: 'playable', label: 'PLAYABLE', kind: 'Playable Prototype' },
  { id: 'analysis', label: 'ANALYSIS', kind: 'System Analysis' },
  { id: 'tooling', label: 'TOOLING', kind: 'Tooling Project' },
]

export function ProjectIndex({ works, onOpen, onProjectPreview }: ProjectIndexProps) {
  const [filterId, setFilterId] = useState<FilterId>('all')
  const [activeId, setActiveId] = useState(works[0]?.id ?? '')
  const rootRef = useRef<HTMLElement | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const activeFilter = filters.find((filter) => filter.id === filterId) ?? filters[0]
  const visibleWorks = useMemo(
    () => activeFilter.kind ? works.filter((work) => getWorkKind(work) === activeFilter.kind) : works,
    [activeFilter.kind, works],
  )
  const activeWork = visibleWorks.find((work) => work.id === activeId) ?? visibleWorks[0]

  useEffect(() => {
    if (!activeWork) return
    setActiveId(activeWork.id)
    onProjectPreview(activeWork)
  }, [activeWork, onProjectPreview])

  const previewWork = (work: WorkItem) => {
    setActiveId(work.id)
    onProjectPreview(work)
  }

  useGSAP(
    () => {
      if (!rootRef.current) return
      const selector = gsap.utils.selector(rootRef.current)
      const rows = selector('.dc-command-list > button')

      if (reducedMotion) {
        gsap.set(rows, { autoAlpha: 1, clearProps: 'transform,clipPath' })
        return
      }

      gsap.fromTo(
        rows,
        { autoAlpha: 0, x: -18, clipPath: 'inset(0 0 0 8%)' },
        {
          autoAlpha: 1,
          x: 0,
          clipPath: 'inset(0 0 0 0%)',
          duration: 0.45,
          stagger: 0.035,
          ease: 'power3.out',
        },
      )
    },
    { scope: rootRef, dependencies: [filterId, reducedMotion], revertOnUpdate: true },
  )

  useGSAP(
    () => {
      if (!activeWork || !rootRef.current) return
      const selector = gsap.utils.selector(rootRef.current)
      const previewTargets = selector('.dc-index-preview, .dc-index-preview-copy > *')

      if (reducedMotion) {
        gsap.set(previewTargets, { autoAlpha: 1, clearProps: 'transform,clipPath' })
        return
      }

      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      timeline
        .fromTo(
          selector('.dc-index-preview'),
          { autoAlpha: 0, x: 34, clipPath: 'inset(0 0 0 13%)' },
          {
            autoAlpha: 1,
            x: 0,
            clipPath: 'inset(0 0 0 0%)',
            duration: 0.58,
            overwrite: 'auto',
          },
          0,
        )
        .fromTo(
          selector('.dc-index-preview-media img, .dc-index-preview-media .dc-image-fallback'),
          { scale: 1.07, xPercent: 2 },
          { scale: 1, xPercent: 0, duration: 0.72, ease: 'expo.out' },
          0,
        )
        .fromTo(
          selector('.dc-index-preview-copy > *'),
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.035 },
          0.18,
        )
    },
    {
      scope: rootRef,
      dependencies: [activeWork?.id, reducedMotion],
      revertOnUpdate: true,
    },
  )

  return (
    <section className="dc-chapter dc-project-index" id="projects" data-chapter ref={rootRef}>
      <div className="dc-section-heading dc-index-heading" data-reveal>
        <div><span>04</span><strong>PROJECT INDEX</strong></div>
        <h2>全部项目索引</h2>
        <p>编号、问题和当前状态。完整内容进入项目档案。</p>
      </div>

      <div className="dc-index-filter" data-reveal>
        <span><Filter size={15} />FILTER</span>
        {filters.map((filter) => (
          <button
            className={filter.id === filterId ? 'active' : ''}
            type="button"
            key={filter.id}
            onClick={() => setFilterId(filter.id)}
          >
            {filter.label}
            <em>{String(filter.kind ? works.filter((work) => getWorkKind(work) === filter.kind).length : works.length).padStart(2, '0')}</em>
          </button>
        ))}
      </div>

      <div className="dc-index-layout">
        <div className="dc-command-list" data-reveal>
          {visibleWorks.map((work) => {
            const originalIndex = works.findIndex((item) => item.id === work.id)
            const code = getArchiveCode(work, originalIndex)
            return (
              <button
                className={work.id === activeWork?.id ? 'active' : ''}
                type="button"
                key={work.id}
                onMouseEnter={() => previewWork(work)}
                onFocus={() => previewWork(work)}
                onClick={() => onOpen(work.id)}
              >
                <span>{code}</span>
                <div>
                  <strong>{work.title}</strong>
                  <p>{work.designQuestion}</p>
                </div>
                <em>{getKindShortLabel(work)}</em>
                <ArrowRight size={14} />
              </button>
            )
          })}
        </div>

        {activeWork ? (
          <aside className="dc-index-preview" key={activeWork.id} data-reveal-media>
            <div className="dc-index-preview-media">
              <SafeImage
                sources={getWorkImageSources(activeWork)}
                alt={`${activeWork.title} 项目预览`}
                fallbackLabel={activeWork.shortTitle ?? activeWork.title}
              />
              <span>{getKindLabel(activeWork)}</span>
            </div>
            <div className="dc-index-preview-copy">
              <p className="dc-panel-kicker">ACTIVE FILE / {activeWork.scenePreset?.toUpperCase()}</p>
              <h3>{activeWork.shortTitle ?? activeWork.title}</h3>
              <p>{activeWork.archiveSummary ?? activeWork.oneLine}</p>
              <div className="dc-index-tags">
                {activeWork.skills.slice(0, 4).map((skill) => <span key={skill}>{skill}</span>)}
              </div>
              <div className="dc-index-state">
                <span>{activeWork.download ? <PackageCheck size={15} /> : <FileText size={15} />}</span>
                <div>
                  <small>FILE STATE</small>
                  <strong>{activeWork.download ? getDownloadLabel(activeWork) : '设计档案已索引'}</strong>
                </div>
              </div>
              <div className="dc-index-actions">
                <button className="dc-primary-button" type="button" onClick={() => onOpen(activeWork.id)}>
                  打开项目档案<ArrowRight size={15} />
                </button>
                {activeWork.download ? (
                  <a className="dc-icon-button" href={activeWork.download.url} download aria-label={getDownloadLabel(activeWork)}>
                    <Download size={17} />
                  </a>
                ) : null}
              </div>
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  )
}

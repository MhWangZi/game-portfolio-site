import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ArrowRight, Download, FileText, Filter, PackageCheck } from 'lucide-react'
import type { WorkItem, WorkKind } from '../types'
import { allSkillTags } from '../data/works'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type WorkRegistryProps = {
  works: WorkItem[]
  selectedId: string
  onSelect: (id: string) => void
}

function getWorkKind(work: WorkItem): WorkKind {
  return work.kind ?? (work.skills.includes('可玩原型') ? 'Playable Prototype' : 'System Analysis')
}

function getArchiveCode(kind: WorkKind, index: number) {
  return `${kind === 'Playable Prototype' ? 'P' : 'S'}-${String(index + 1).padStart(2, '0')}`
}

export function WorkRegistry({ works, selectedId, onSelect }: WorkRegistryProps) {
  const [filter, setFilter] = useState('全部')
  const gridRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const filters = useMemo(() => ['全部', ...allSkillTags], [])
  const visibleWorks = useMemo(
    () => (filter === '全部' ? works : works.filter((work) => work.skills.includes(filter))),
    [filter, works],
  )
  const prototypeCount = useMemo(() => works.filter((work) => getWorkKind(work) === 'Playable Prototype').length, [works])
  const analysisCount = works.length - prototypeCount

  useLayoutEffect(() => {
    if (reducedMotion || !gridRef.current) return
    const cards = gridRef.current.querySelectorAll('.work-card')
    gsap.fromTo(
      cards,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.04, ease: 'power2.out' },
    )
  }, [filter, reducedMotion])

  return (
    <section className="section-shell" id="works">
      <div className="section-heading registry-heading">
        <p className="eyebrow">PROJECT FILES / INDEX</p>
        <h2>作品档案库</h2>
        <p>
          可玩原型看构建包、核心循环和操作验证；系统分析看拆解维度、判断依据和可迁移结论。
          所有作品都按同一套档案格式归档。
        </p>
        <div className="registry-stats" aria-label="Work category counts">
          <span>
            <strong>{prototypeCount}</strong>
            Playable Prototype
          </span>
          <span>
            <strong>{analysisCount}</strong>
            System Analysis
          </span>
          <span>
            <strong>{works.filter((work) => work.download).length}</strong>
            Build Package
          </span>
        </div>
      </div>

      <div className="filter-row" aria-label="Work filters">
        <span className="filter-label">
          <Filter size={16} />
          筛选
        </span>
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            className={item === filter ? 'filter-chip active' : 'filter-chip'}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="work-grid" ref={gridRef}>
        {visibleWorks.map((work) => {
          const originalIndex = works.findIndex((item) => item.id === work.id)
          const kind = getWorkKind(work)
          const archiveCode = getArchiveCode(kind, originalIndex)
          const isPrototype = kind === 'Playable Prototype'
          return (
            <button
              className={[
                'work-card',
                isPrototype ? 'prototype-card' : 'analysis-card',
                work.id === selectedId ? 'active' : '',
              ].join(' ')}
              id={`card-${work.id}`}
              key={work.id}
              type="button"
              onClick={() => onSelect(work.id)}
            >
              <span className="card-number-ghost">{archiveCode}</span>
              <span className="card-media">
                <img src={work.media[0]?.src} alt="" aria-hidden="true" />
                <span className="card-badge">
                  <i />
                  {kind}
                </span>
                {work.download ? (
                  <span className="card-download">
                    <Download size={13} />
                    可下载
                  </span>
                ) : (
                  <span className="card-download ghost">
                    <FileText size={13} />
                    设计证据
                  </span>
                )}
              </span>
              <span className="card-topline">
                <span className="card-index">{archiveCode}</span>
                <span className="card-engine">{work.engine ?? 'Game project'}</span>
              </span>
              <strong>{work.title}</strong>
              <span className="card-role">{work.role}</span>
              <span className="card-summary">{work.oneLine ?? work.summary}</span>
              <span className="card-proof-line">
                <PackageCheck size={14} />
                {work.proof?.[0]?.value ?? work.period ?? '作品证据已归档'}
              </span>
              <span className="tag-row">
                {work.skills.slice(0, 4).map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </span>
              <span className="card-cta">
                打开档案
                <ArrowRight size={15} />
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

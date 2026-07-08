import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ArrowRight, Download, FileText, Filter, NotebookPen } from 'lucide-react'
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
  const prefix = kind === 'Playable Prototype' ? 'P' : kind === 'Tooling Project' ? 'T' : 'S'
  return `${prefix}-${String(index + 1).padStart(2, '0')}`
}

function getLearningLine(work: WorkItem) {
  if (work.id === 'hd2d-kit') return '我最近在做这个 Godot 插件：把遮挡、碰撞、地图、角色库和 NPC 配置整理成新手能按步骤使用的工具流。'
  if (work.id === 'parry-arena') return '我在这里练习把防守行为做成主要进攻来源，并控制弹反的收益边界。'
  if (work.id === 'anchored-gaze') return '我想看“攻击改变空间结构”能不能带来追击、控场和逃脱之间的取舍。'
  if (work.id === 'static-signal') return '我在尝试让文字冒险不只靠阅读推进，而是有风险、行动点和分支压力。'
  if (work.kind === 'Playable Prototype') return '这个项目主要用于验证一个小循环是否能跑起来，以及哪些规则值得继续做。'
  return '这是一篇系统观察，我把玩家路径、资源循环和设计取舍整理成可以复查的结构。'
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
    <section className="section-shell projects-section" id="projects">
      <div className="section-heading registry-heading">
        <p className="eyebrow">PROJECTS / RECENT WORK</p>
        <h2>近期项目</h2>
        <p>
          有些是能下载试玩的小原型，有些是系统拆解和竞品观察。它们共同记录我如何把一个问题拆成规则、
          循环、玩家选择和下一步改动。
        </p>
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
          const isTooling = kind === 'Tooling Project'
          const downloadLabel = isTooling ? '插件包' : isPrototype ? '可试玩' : '可下载文档'
          return (
            <button
              className={[
                'work-card',
                isTooling ? 'tooling-card' : isPrototype ? 'prototype-card' : 'analysis-card',
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
                  {isTooling ? 'Tool' : isPrototype ? 'Prototype' : 'Note'}
                </span>
                {work.download ? (
                  <span className="card-download">
                    <Download size={13} />
                    {downloadLabel}
                  </span>
                ) : (
                  <span className="card-download ghost">
                    <FileText size={13} />
                    观察
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
              <span className="card-learning">
                <NotebookPen size={14} />
                {getLearningLine(work)}
              </span>
              <span className="tag-row">
                {work.skills.slice(0, 4).map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </span>
              <span className="card-cta">
                查看记录
                <ArrowRight size={15} />
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

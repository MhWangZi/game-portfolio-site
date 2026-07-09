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
  if (work.id === 'hd2d-kit') return '记录 Godot 新手工具流：遮挡、碰撞、地图、角色库和 NPC 配置被组织成可重复步骤。'
  if (work.id === 'parry-arena') return '验证防守行为转化为进攻来源时，弹反窗口、体力消耗和敌人压力之间的边界。'
  if (work.id === 'anchored-gaze') return '测试“攻击改变空间结构”在追击、控场和逃脱之间形成的取舍。'
  if (work.id === 'static-signal') return '记录文字冒险里的行动点、风险值和分支压力如何改变阅读节奏。'
  if (work.kind === 'Playable Prototype') return '验证一个小循环能否跑通，以及哪些规则值得进入下一轮。'
  return '条目记录玩家路径、资源循环和设计取舍，保留可复查的结构。'
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
        <p className="eyebrow">RECENT / PROTOTYPE LOG</p>
        <h2>近期原型迭代</h2>
        <p>
          当前推进中的可玩版本，记录规则边界、反馈节奏、操作手感和下一轮调整方向。
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
                查看设计记录
                <ArrowRight size={15} />
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

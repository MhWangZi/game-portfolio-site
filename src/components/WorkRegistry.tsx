import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ArrowRight, Activity, Download, FileText, Filter, NotebookPen } from 'lucide-react'
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
  if (work.id === 'hd2d-kit') return '工具流：遮挡、碰撞、地图与 NPC 配置。'
  if (work.id === 'parry-arena') return '焦点：弹反窗口、体力消耗、敌人压力。'
  if (work.id === 'anchored-gaze') return '焦点：视线、距离、空间封锁。'
  if (work.id === 'static-signal') return '焦点：行动点、风险值、分支压力。'
  if (work.kind === 'Playable Prototype') return '焦点：短循环与下一版。'
  return '焦点：路径、资源与取舍。'
}

function getCardLine(work: WorkItem) {
  if (work.id === 'hd2d-kit') return '场景工具 / 新手流程'
  if (work.id === 'parry-arena') return '弹反窗口 / 波次成长'
  if (work.id === 'anchored-gaze') return '视线压力 / 锚点收集'
  if (work.id === 'static-signal') return '行动点 / 风险分支'
  if (work.id === 'godot-prototype-suite') return '移动 / 场景 / 卡牌模块'
  if (work.id === 'delta-economy') return '货币流 / 回收机制'
  if (work.id === 'wuthering-values') return '属性层级 / 成长曲线'
  if (work.id === 'equipment-analysis') return '随机词条 / 长线负担'
  if (work.id === 'action-combat') return '动作广度 / 操作精度'
  if (work.id === 'roguelite-systems') return '失败反馈 / 长线动机'
  return work.oneLine ?? work.summary
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
        <div className="section-heading-title">
          <span className="section-heading-icon">
            <Activity size={20} />
          </span>
          <h2>近期原型迭代</h2>
        </div>
        <p>当前推进中的可玩版本，持续更新规则边界、反馈表现与下一轮调整方向。</p>
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
              <span className="card-summary">{getCardLine(work)}</span>
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

import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ArrowRight, Filter } from 'lucide-react'
import type { WorkItem } from '../types'
import { allSkillTags } from '../data/works'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type WorkRegistryProps = {
  works: WorkItem[]
  selectedId: string
  onSelect: (id: string) => void
}

export function WorkRegistry({ works, selectedId, onSelect }: WorkRegistryProps) {
  const [filter, setFilter] = useState('全部')
  const gridRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const filters = useMemo(() => ['全部', ...allSkillTags.slice(0, 8)], [])
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
      { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.05, ease: 'power2.out' },
    )
  }, [filter, reducedMotion])

  return (
    <section className="section-shell" id="works">
      <div className="section-heading">
        <p className="eyebrow">Registry</p>
        <h2>全部作品</h2>
        <p>参考案例库结构：先用卡片扫描，再进入单个作品的职责、证据和下载区。</p>
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
        {visibleWorks.map((work, index) => (
          <button
            className={work.id === selectedId ? 'work-card active' : 'work-card'}
            id={`card-${work.id}`}
            key={work.id}
            type="button"
            onClick={() => onSelect(work.id)}
          >
            <span className="card-index">{String(index + 1).padStart(2, '0')}</span>
            <span className="card-engine">{work.engine ?? 'Game project'}</span>
            <strong>{work.title}</strong>
            <span className="card-role">{work.role}</span>
            <span className="card-summary">{work.summary}</span>
            <span className="tag-row">
              {work.skills.slice(0, 4).map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </span>
            <span className="card-cta">
              查看详情
              <ArrowRight size={15} />
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

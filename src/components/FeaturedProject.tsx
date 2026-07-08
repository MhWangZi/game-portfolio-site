import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Layers3,
  MousePointer2,
  Sparkles,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'
import { works } from '../data/works'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import type { WorkItem } from '../types'

type FeaturedProjectProps = {
  work: WorkItem
  onSelect: (id: string) => void
}

type ArchiveCase = {
  id: string
  caseNo: string
  title: string
  subtitle: string
  description: string
  image: string
  imageAlt: string
  tags: string[]
  metrics: string[]
  buttonLabel: string
}

type Direction = 'next' | 'prev'

const archiveCases: ArchiveCase[] = [
  {
    id: 'parry-arena',
    caseNo: 'CASE 01',
    title: 'Parry Arena',
    subtitle: '一个围绕“防反时机”构建的战斗原型',
    description: '我用这个原型验证玩家在高压战斗中如何识别攻击节奏、承担风险并获得反馈。',
    image: './media/portfolio/parry-arena-gameplay.png',
    imageAlt: 'Parry Arena 弹反竞技场实机战斗截图',
    tags: ['Combat', 'Prototype', 'Timing', 'Feedback'],
    metrics: ['Prototype', 'Combat', 'Risk', 'Loop'],
    buttonLabel: '查看设计记录',
  },
  {
    id: 'anchored-gaze',
    caseNo: 'CASE 02',
    title: 'Anchored Gaze',
    subtitle: '关于观察、凝视与空间压迫感的交互实验',
    description: '尝试用视线、距离和环境反馈制造不安感，而不是单纯依赖怪物追逐。',
    image: './media/portfolio/anchored-gaze-cover.png',
    imageAlt: 'Anchored Gaze 万众瞩目标题界面截图',
    tags: ['Horror', 'Interaction', 'Atmosphere', 'Level Design'],
    metrics: ['Prototype', 'UX', 'Space', 'Pressure'],
    buttonLabel: '查看设计记录',
  },
  {
    id: 'static-signal',
    caseNo: 'CASE 03',
    title: 'STATIC SIGNAL',
    subtitle: '用规则怪谈搭建文字冒险的压力结构',
    description: '通过行动点、风险值、线索和身份差异文本，让阅读过程也有选择和代价。',
    image: './media/portfolio/static-signal-interface.png',
    imageAlt: 'STATIC SIGNAL 静默信号身份选择界面截图',
    tags: ['Narrative', 'TRPG', 'Interaction', 'Editor'],
    metrics: ['Narrative', 'System', 'UX', 'Tools'],
    buttonLabel: '查看设计记录',
  },
  {
    id: 'delta-economy',
    caseNo: 'CASE 04',
    title: 'System Breakdown',
    subtitle: '把复杂系统拆成规则、反馈和玩家选择',
    description: '这里记录我如何分析一个机制是否清晰、是否可复用、是否能形成长期决策。',
    image: './media/portfolio/delta-economy.webp',
    imageAlt: '三角洲行动烽火地带经济系统拆解图',
    tags: ['System', 'Analysis', 'Design Notes'],
    metrics: ['System', 'Economy', 'Loop', 'Choice'],
    buttonLabel: '阅读拆解',
  },
]

const workMap = new Map(works.map((item) => [item.id, item]))

function wrapIndex(index: number) {
  return (index + archiveCases.length) % archiveCases.length
}

export function FeaturedProject({ work, onSelect }: FeaturedProjectProps) {
  const initialIndex = useMemo(() => {
    const index = archiveCases.findIndex((item) => item.id === work.id)
    return index >= 0 ? index : 0
  }, [work.id])
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [direction, setDirection] = useState<Direction>('next')
  const [isHoverPaused, setIsHoverPaused] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)
  const reducedMotion = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const touchStartX = useRef<number | null>(null)

  const activeCase = archiveCases[activeIndex]
  const activeWork = workMap.get(activeCase.id)
  const activeIsPrototype = activeWork?.kind === 'Playable Prototype'
  const previousCase = archiveCases[wrapIndex(activeIndex - 1)]
  const nextCase = archiveCases[wrapIndex(activeIndex + 1)]
  const progress = ((activeIndex + 1) / archiveCases.length) * 100

  const moveTo = useCallback(
    (targetIndex: number, nextDirection?: Direction) => {
      const normalized = wrapIndex(targetIndex)
      if (normalized === activeIndex) return
      setDirection(nextDirection ?? (normalized > activeIndex ? 'next' : 'prev'))
      setActiveIndex(normalized)
      setPulseKey((key) => key + 1)
    },
    [activeIndex],
  )

  useEffect(() => {
    if (reducedMotion || isHoverPaused) return
    const timer = window.setTimeout(() => moveTo(activeIndex + 1, 'next'), 6200)
    return () => window.clearTimeout(timer)
  }, [activeIndex, isHoverPaused, moveTo, reducedMotion])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return
      if (event.altKey || event.ctrlKey || event.metaKey) return

      if (event.key === 'ArrowRight') {
        moveTo(activeIndex + 1, 'next')
      }
      if (event.key === 'ArrowLeft') {
        moveTo(activeIndex - 1, 'prev')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, moveTo])

  const resetTilt = () => {
    rootRef.current?.style.setProperty('--tilt-x', '0deg')
    rootRef.current?.style.setProperty('--tilt-y', '0deg')
    rootRef.current?.style.setProperty('--drift-x', '0px')
    rootRef.current?.style.setProperty('--drift-y', '0px')
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5

    event.currentTarget.style.setProperty('--tilt-x', `${(-y * 4).toFixed(2)}deg`)
    event.currentTarget.style.setProperty('--tilt-y', `${(x * 5).toFixed(2)}deg`)
    event.currentTarget.style.setProperty('--drift-x', `${(x * 14).toFixed(2)}px`)
    event.currentTarget.style.setProperty('--drift-y', `${(y * 10).toFixed(2)}px`)
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') touchStartX.current = event.clientX
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch' || touchStartX.current === null) return
    const delta = event.clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < 42) return
    moveTo(activeIndex + (delta < 0 ? 1 : -1), delta < 0 ? 'next' : 'prev')
  }

  const carouselStyle = {
    '--archive-progress': `${progress}%`,
  } as CSSProperties

  return (
    <section className="featured-section archive-carousel-section personal-section" id="featured">
      <div className="section-heading archive-carousel-heading">
        <p className="eyebrow">DESIGN ARCHIVE / PROTOTYPE LOG</p>
        <h2>翻开我的近期设计记录</h2>
        <p>
          我把几个项目整理成“打开一页档案”的形式：看截图、看当时想验证的问题，
          也能直接跳到记录和下载包。
        </p>
      </div>

      <div
        className={`archive-carousel-shell direction-${direction}`}
        ref={rootRef}
        style={carouselStyle}
        onMouseEnter={() => setIsHoverPaused(true)}
        onMouseLeave={() => {
          setIsHoverPaused(false)
          resetTilt()
        }}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <div className="archive-carousel-stage" aria-live="polite">
          <article className="archive-ghost-card ghost-prev" aria-hidden="true">
            <img src={previousCase.image} alt="" />
            <span>{previousCase.caseNo}</span>
          </article>
          <article className="archive-ghost-card ghost-next" aria-hidden="true">
            <img src={nextCase.image} alt="" />
            <span>{nextCase.caseNo}</span>
          </article>

          <article className="archive-dossier-card" key={`${activeCase.id}-${pulseKey}`}>
            <div className="archive-card-topline">
              <span>{activeCase.caseNo}</span>
              <strong>{activeWork?.kind ?? 'Design Case'}</strong>
            </div>

            <div className="archive-image-frame">
              <img src={activeCase.image} alt={activeCase.imageAlt} />
              <div className="archive-scanline" aria-hidden="true" />
            </div>

            <div className="archive-card-copy">
              <span>OPEN LOG</span>
              <h3>{activeCase.title}</h3>
              <p>{activeCase.subtitle}</p>
            </div>

            <div className="archive-data-lane" aria-label="Project data lane">
              {activeCase.metrics.map((metric) => (
                <span key={metric}>{metric}</span>
              ))}
            </div>
          </article>
        </div>

        <aside className="archive-case-panel" key={`panel-${activeCase.id}-${pulseKey}`}>
          <div className="archive-case-number">
            <span>{activeCase.caseNo}</span>
            <strong>{String(activeIndex + 1).padStart(2, '0')}</strong>
            <em>/ {String(archiveCases.length).padStart(2, '0')}</em>
          </div>

          <div className="archive-panel-copy">
            <p className="panel-kicker">
              <Layers3 size={16} />
              Design slice
            </p>
            <h3>{activeCase.title}</h3>
            <h4>{activeCase.subtitle}</h4>
            <p>{activeCase.description}</p>
          </div>

          <div className="archive-tag-rack" aria-label={`${activeCase.title} tags`}>
            {activeCase.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <div className="archive-insight-card">
            <Sparkles size={17} />
            <div>
              <strong>这页记录我在看什么</strong>
              <span>{activeWork?.oneLine ?? activeWork?.summary ?? activeCase.description}</span>
            </div>
          </div>

          <div className="archive-panel-actions">
            <button type="button" className="primary-action archive-open-button" onClick={() => onSelect(activeCase.id)}>
              {activeCase.buttonLabel}
              <ArrowRight size={16} />
            </button>
            {activeWork?.download ? (
              <a className="secondary-action archive-download-button" href={activeWork.download.url} download>
                <Download size={16} />
                {activeIsPrototype ? '构建包' : 'Word 文档'}
              </a>
            ) : (
              <span className="archive-file-note">
                <FileText size={16} />
                设计拆解
              </span>
            )}
          </div>

          <div className="archive-switch-controls" aria-label="Carousel controls">
            <button type="button" onClick={() => moveTo(activeIndex - 1, 'prev')}>
              <ChevronLeft size={16} />
              [PREV]
            </button>
            <button type="button" onClick={() => moveTo(activeIndex + 1, 'next')}>
              [NEXT]
              <ChevronRight size={16} />
            </button>
          </div>
        </aside>

        <div className="archive-timeline" aria-label="Design archive timeline">
          <div className="archive-progress-line" aria-hidden="true">
            <span />
          </div>
          <div className="archive-tabs">
            {archiveCases.map((item, index) => (
              <button
                type="button"
                key={item.id}
                className={index === activeIndex ? 'active' : ''}
                onClick={() => moveTo(index)}
              >
                <MousePointer2 size={14} />
                <span>{item.caseNo}</span>
                <strong>{item.title}</strong>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

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
    subtitle: '围绕防反时机构建的战斗原型',
    description: '通过攻击预兆、判定窗口和反馈节奏，测试高压战斗中的风险与回报。',
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
    subtitle: '观察、距离与空间压迫感的交互实验',
    description: '用视线、环境反馈和移动限制，建立缓慢累积的不安感。',
    image: './media/portfolio/anchored-gaze-cover.png',
    imageAlt: 'Anchored Gaze 万众瞩目标题界面截图',
    tags: ['Horror', 'Interaction', 'Atmosphere', 'Level Design'],
    metrics: ['Prototype', 'UX', 'Space', 'Pressure'],
    buttonLabel: '查看设计记录',
  },
  {
    id: 'hd2d-kit',
    caseNo: 'CASE 03',
    title: 'HD2D Kit',
    subtitle: '像素场景与镜头层次的视觉实验',
    description: '整理光照、层级、材质和镜头参数，形成可复用的场景搭建流程。',
    image: './media/portfolio/hd2d-kit-cover.png',
    imageAlt: 'HD2D Kit 工具与像素角色资源封面',
    tags: ['Godot', 'Tooling', 'HD-2D', 'Workflow'],
    metrics: ['Tooling', 'Scene', 'Layer', 'Prototype'],
    buttonLabel: '查看记录',
  },
]

const workMap = new Map(works.map((item) => [item.id, item]))

function wrapIndex(index: number) {
  return (index + archiveCases.length) % archiveCases.length
}

export function FeaturedProject({ work: _work, onSelect }: FeaturedProjectProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState<Direction>('next')
  const [isHoverPaused, setIsHoverPaused] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)
  const reducedMotion = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const touchStartX = useRef<number | null>(null)

  const activeCase = archiveCases[activeIndex]
  const activeWork = workMap.get(activeCase.id)
  const activeIsPrototype = activeWork?.kind === 'Playable Prototype'
  const activeIsTooling = activeWork?.kind === 'Tooling Project'
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
        <p className="eyebrow">DESIGN ARCHIVE / CASE FILES</p>
        <h2>设计档案</h2>
        <p>
          每个条目对应一个具体设计问题：一次战斗节奏的验证，一组资源循环的拆解，或一个交互原型的形成过程。
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
              <strong>设计问题</strong>
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
                {activeIsTooling ? '插件包' : activeIsPrototype ? '构建包' : 'Word 文档'}
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

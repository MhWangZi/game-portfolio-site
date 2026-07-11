import { ArrowLeft, ArrowRight, Download, FileText, FolderOpen, MousePointer2 } from 'lucide-react'
import { useEffect, useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { useProjectRotation } from '../hooks/useProjectRotation'
import type { WorkItem } from '../types'
import { getDownloadLabel, getKindLabel, getWorkImageSources } from '../utils/workPresentation'
import { SafeImage } from './SafeImage'

type CaseFilesProps = {
  works: WorkItem[]
  onOpen: (id: string) => void
  onActiveProjectChange: (work: WorkItem) => void
}

function wrapIndex(index: number, length: number) {
  return (index + length) % length
}

export function CaseFiles({ works, onOpen, onActiveProjectChange }: CaseFilesProps) {
  const rotation = useProjectRotation({ length: works.length, delay: 7200 })
  const rootRef = useRef<HTMLDivElement | null>(null)
  const touchStartX = useRef<number | null>(null)
  const activeWork = works[rotation.activeIndex] ?? works[0]
  const previousWork = works[wrapIndex(rotation.activeIndex - 1, works.length)]
  const nextWork = works[wrapIndex(rotation.activeIndex + 1, works.length)]
  const progress = works.length ? ((rotation.activeIndex + 1) / works.length) * 100 : 0

  useEffect(() => {
    if (activeWork) onActiveProjectChange(activeWork)
  }, [activeWork, onActiveProjectChange])

  if (!activeWork || !previousWork || !nextWork) return null

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    event.currentTarget.style.setProperty('--case-tilt-x', `${(-y * 3).toFixed(2)}deg`)
    event.currentTarget.style.setProperty('--case-tilt-y', `${(x * 4).toFixed(2)}deg`)
    event.currentTarget.style.setProperty('--case-drift-x', `${(x * 14).toFixed(2)}px`)
    event.currentTarget.style.setProperty('--case-drift-y', `${(y * 10).toFixed(2)}px`)
  }

  const resetPointer = () => {
    rootRef.current?.style.setProperty('--case-tilt-x', '0deg')
    rootRef.current?.style.setProperty('--case-tilt-y', '0deg')
    rootRef.current?.style.setProperty('--case-drift-x', '0px')
    rootRef.current?.style.setProperty('--case-drift-y', '0px')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') rotation.next()
    if (event.key === 'ArrowLeft') rotation.previous()
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') touchStartX.current = event.clientX
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch' || touchStartX.current === null) return
    const distance = event.clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(distance) < 44) return
    if (distance < 0) rotation.next()
    else rotation.previous()
  }

  const style = { '--case-progress': `${progress}%` } as CSSProperties

  return (
    <section className="dc-chapter dc-case-files" id="cases" data-chapter>
      <div className="dc-section-heading dc-case-heading" data-reveal>
        <div><span>03</span><strong>CASE FILES</strong></div>
        <h2>核心设计档案</h2>
        <p>每个条目只回答一个具体设计问题。</p>
      </div>

      <div
        className={`dc-case-shell direction-${rotation.direction}`}
        ref={rootRef}
        style={style}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onMouseEnter={() => rotation.setPaused(true)}
        onMouseLeave={() => {
          rotation.setPaused(false)
          resetPointer()
        }}
      >
        <div className="dc-case-stage" data-reveal-media>
          <div className="dc-case-ghost ghost-previous" aria-hidden="true">
            <SafeImage sources={getWorkImageSources(previousWork)} alt="" fallbackLabel={previousWork.shortTitle ?? previousWork.title} />
          </div>
          <div className="dc-case-ghost ghost-next" aria-hidden="true">
            <SafeImage sources={getWorkImageSources(nextWork)} alt="" fallbackLabel={nextWork.shortTitle ?? nextWork.title} />
          </div>

          <article className="dc-case-card" key={`case-${activeWork.id}`}>
            <div className="dc-case-media">
              <SafeImage
                sources={getWorkImageSources(activeWork)}
                alt={`${activeWork.title} 项目画面`}
                fallbackLabel={activeWork.shortTitle ?? activeWork.title}
              />
              <span className="dc-media-scan" aria-hidden="true" />
              <div className="dc-case-media-label">
                <span>CASE {String(rotation.activeIndex + 1).padStart(2, '0')}</span>
                <strong>{getKindLabel(activeWork)}</strong>
              </div>
            </div>
            <div className="dc-case-card-title">
              <span>OPEN LOG / {activeWork.scenePreset?.toUpperCase()}</span>
              <h3>{activeWork.shortTitle ?? activeWork.title}</h3>
              <p>{activeWork.designQuestion}</p>
            </div>
          </article>
        </div>

        <aside className="dc-case-console" key={`console-${activeWork.id}`}>
          <div className="dc-case-number">
            <span>CASE</span>
            <strong>{String(rotation.activeIndex + 1).padStart(2, '0')}</strong>
            <em>/ {String(works.length).padStart(2, '0')}</em>
          </div>
          <div className="dc-panel-kicker"><FolderOpen size={16} />DESIGN QUESTION</div>
          <h3>{activeWork.title}</h3>
          <p className="dc-case-question">{activeWork.designQuestion}</p>
          <p className="dc-case-summary">{activeWork.archiveSummary ?? activeWork.oneLine}</p>

          <div className="dc-case-tags">
            {activeWork.skills.slice(0, 4).map((skill) => <span key={skill}>{skill}</span>)}
          </div>

          <div className="dc-case-actions">
            <button className="dc-primary-button" type="button" onClick={() => onOpen(activeWork.id)}>
              打开档案<ArrowRight size={15} />
            </button>
            {activeWork.download ? (
              <a className="dc-secondary-button" href={activeWork.download.url} download>
                <Download size={15} />{getDownloadLabel(activeWork)}
              </a>
            ) : (
              <span className="dc-file-status"><FileText size={15} />LOG ONLY</span>
            )}
          </div>

          <div className="dc-case-switches">
            <button type="button" onClick={rotation.previous}><ArrowLeft size={16} />PREV</button>
            <button type="button" onClick={rotation.next}>NEXT<ArrowRight size={16} /></button>
          </div>
        </aside>

        <div className="dc-case-timeline">
          <div className="dc-case-progress"><i /></div>
          <div className="dc-case-tabs">
            {works.map((work, index) => (
              <button
                className={index === rotation.activeIndex ? 'active' : ''}
                type="button"
                key={work.id}
                onClick={() => rotation.goTo(index)}
              >
                <MousePointer2 size={13} />
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{work.shortTitle ?? work.title}</strong>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

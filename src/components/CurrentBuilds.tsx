import { ArrowDown, ArrowLeft, ArrowRight, Download, ExternalLink, Play, Timer } from 'lucide-react'
import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { useProjectRotation } from '../hooks/useProjectRotation'
import type { WorkItem } from '../types'
import { getDownloadLabel, getKindLabel, getWorkImageSources } from '../utils/workPresentation'
import { SafeImage } from './SafeImage'

type CurrentBuildsProps = {
  works: WorkItem[]
  onActiveProjectChange: (work: WorkItem) => void
  onOpen: (id: string) => void
  onNextChapter: () => void
}

export function CurrentBuilds({ works, onActiveProjectChange, onOpen, onNextChapter }: CurrentBuildsProps) {
  const rotation = useProjectRotation({ length: works.length, delay: 6600 })
  const activeWork = works[rotation.activeIndex] ?? works[0]
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    if (activeWork) onActiveProjectChange(activeWork)
  }, [activeWork, onActiveProjectChange])

  if (!activeWork) return null

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

  return (
    <section className="dc-chapter dc-current-builds" id="current" data-chapter>
      <div
        className={`dc-build-stage direction-${rotation.direction}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onMouseEnter={() => rotation.setPaused(true)}
        onMouseLeave={() => rotation.setPaused(false)}
      >
        <div className="dc-build-image" key={`image-${activeWork.id}`} data-reveal-media>
          <SafeImage
            sources={getWorkImageSources(activeWork)}
            alt={`${activeWork.title} 项目主视觉`}
            fallbackLabel={activeWork.shortTitle ?? activeWork.title}
            eager
          />
          <div className="dc-build-image-grid" aria-hidden="true" />
        </div>

        <div className="dc-build-shade" aria-hidden="true" />

        <div className="dc-build-copy" key={`copy-${activeWork.id}`}>
          <div className="dc-kicker-row">
            <span>GAME DESIGN NOTES / CURRENT BUILDS</span>
            <em>{String(rotation.activeIndex + 1).padStart(2, '0')} / {String(works.length).padStart(2, '0')}</em>
          </div>
          <p className="dc-site-title">玩法原型与系统记录</p>
          <h1>{activeWork.shortTitle ?? activeWork.title}</h1>
          <p className="dc-build-question">{activeWork.designQuestion}</p>
          <p className="dc-build-summary">{activeWork.archiveSummary ?? activeWork.oneLine}</p>

          <div className="dc-build-tags" aria-label={`${activeWork.title} 标签`}>
            {activeWork.skills.slice(0, 4).map((skill) => <span key={skill}>{skill}</span>)}
          </div>

          <div className="dc-build-actions">
            <button type="button" className="dc-primary-button" onClick={() => onOpen(activeWork.id)}>
              <Play size={16} />打开项目档案<ArrowRight size={15} />
            </button>
            {activeWork.download ? (
              <a className="dc-secondary-button" href={activeWork.download.url} download>
                <Download size={16} />{getDownloadLabel(activeWork)}
              </a>
            ) : null}
          </div>
        </div>

        <aside className="dc-build-telemetry" key={`telemetry-${activeWork.id}`}>
          <div className="dc-telemetry-title"><Timer size={15} />LIVE BUILD TELEMETRY</div>
          <dl>
            <div><dt>TYPE</dt><dd>{getKindLabel(activeWork)}</dd></div>
            <div><dt>ENGINE</dt><dd>{activeWork.engine ?? 'DESIGN FILE'}</dd></div>
            <div><dt>STATUS</dt><dd>{activeWork.download ? 'BUILD AVAILABLE' : 'LOG INDEXED'}</dd></div>
            <div><dt>PERIOD</dt><dd>{activeWork.period ?? '2026'}</dd></div>
          </dl>
          {activeWork.links?.[0] ? (
            <a href={activeWork.links[0].url} target="_blank" rel="noreferrer">
              外部记录<ExternalLink size={14} />
            </a>
          ) : null}
        </aside>

        <div className="dc-build-controls" aria-label="当前项目切换">
          <button type="button" onClick={rotation.previous} aria-label="上一个项目"><ArrowLeft size={17} /></button>
          <div className="dc-build-timeline">
            {works.map((work, index) => (
              <button
                className={index === rotation.activeIndex ? 'active' : ''}
                type="button"
                key={work.id}
                onClick={() => rotation.goTo(index)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{work.shortTitle ?? work.title}</strong>
                <i />
              </button>
            ))}
          </div>
          <button type="button" onClick={rotation.next} aria-label="下一个项目"><ArrowRight size={17} /></button>
        </div>

        <button className="dc-scroll-cue" type="button" onClick={onNextChapter}>
          <span>NEXT / DESIGN RADAR</span><ArrowDown size={16} />
        </button>
      </div>
    </section>
  )
}

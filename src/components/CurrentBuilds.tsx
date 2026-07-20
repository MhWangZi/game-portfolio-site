import { ArrowDown, ArrowLeft, ArrowRight, Download, ExternalLink, Play, Timer } from 'lucide-react'
import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react'
import type { FragmentId } from '../data/indexZeroArchive'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useProjectRotation } from '../hooks/useProjectRotation'
import { gsap, useGSAP } from '../lib/gsap'
import type { WorkItem } from '../types'
import { getDownloadLabel, getKindLabel, getWorkImageSources } from '../utils/workPresentation'
import { CorruptedFragment } from './index-zero/CorruptedFragment'
import { SafeImage } from './SafeImage'

type CurrentBuildsProps = {
  works: WorkItem[]
  onActiveProjectChange: (work: WorkItem) => void
  onOpen: (id: string) => void
  onNextChapter: () => void
  isFragmentRecovered: (id: FragmentId) => boolean
  onRecoverFragment: (id: FragmentId) => void
  showObservationComplete: boolean
}

export function CurrentBuilds({
  works,
  onActiveProjectChange,
  onOpen,
  onNextChapter,
  isFragmentRecovered,
  onRecoverFragment,
  showObservationComplete,
}: CurrentBuildsProps) {
  const rotation = useProjectRotation({ length: works.length, delay: 6600 })
  const activeWork = works[rotation.activeIndex] ?? works[0]
  const rootRef = useRef<HTMLElement | null>(null)
  const touchStartX = useRef<number | null>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (activeWork) onActiveProjectChange(activeWork)
  }, [activeWork, onActiveProjectChange])

  useGSAP(
    () => {
      if (!activeWork || !rootRef.current) return

      const selector = gsap.utils.selector(rootRef.current)
      const animatedTargets = selector(
        '.dc-build-image, .dc-build-copy > *, .dc-build-telemetry, .dc-build-telemetry > *, .dc-build-controls',
      )

      if (reducedMotion) {
        gsap.set(animatedTargets, { autoAlpha: 1, clearProps: 'transform,clipPath' })
        return
      }

      const direction = rotation.direction === 'next' ? 1 : -1
      const initialDelay = document.documentElement.dataset.archiveReady === 'true' ? 0 : 1.18
      const timeline = gsap.timeline({
        delay: initialDelay,
        defaults: { ease: 'power3.out' },
      })

      timeline
        .fromTo(
          selector('.dc-build-image'),
          {
            autoAlpha: 0,
            x: direction * 58,
            scale: 1.075,
            clipPath: direction > 0 ? 'inset(0 0 0 34%)' : 'inset(0 34% 0 0)',
          },
          {
            autoAlpha: 1,
            x: 0,
            scale: 1,
            clipPath: 'inset(0 0% 0 0%)',
            duration: 0.88,
          },
          0,
        )
        .fromTo(
          selector('.dc-build-image img, .dc-build-image .dc-image-fallback'),
          { xPercent: direction * 2.5, scale: 1.075 },
          { xPercent: 0, scale: 1.025, duration: 1.05, ease: 'expo.out' },
          0.02,
        )
        .fromTo(
          selector('.dc-build-copy > *'),
          { autoAlpha: 0, y: 34, clipPath: 'inset(0 0 38% 0)' },
          {
            autoAlpha: 1,
            y: 0,
            clipPath: 'inset(0 0 0% 0)',
            duration: 0.62,
            stagger: 0.048,
          },
          0.14,
        )
        .fromTo(
          selector('.dc-build-telemetry'),
          { autoAlpha: 0, y: 26, scale: 0.975 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.68 },
          0.36,
        )
        .fromTo(
          selector('.dc-build-telemetry > *'),
          { autoAlpha: 0, x: 12 },
          { autoAlpha: 1, x: 0, duration: 0.38, stagger: 0.045 },
          0.48,
        )
        .fromTo(
          selector('.dc-build-controls'),
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.52 },
          0.56,
        )
    },
    {
      scope: rootRef,
      dependencies: [activeWork?.id, rotation.direction, reducedMotion],
      revertOnUpdate: true,
    },
  )

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
    <section className="dc-chapter dc-current-builds" id="current" data-chapter ref={rootRef}>
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
          <p className="dc-index-anomaly-note">
            PUBLIC INDEX / 一段
            <CorruptedFragment
              fragmentId="fragment-01"
              isRecovered={isFragmentRecovered('fragment-01')}
              onRecover={onRecoverFragment}
            />
            的条目未能对齐当前版本。
          </p>

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
            <div>
              <dt>STATUS</dt>
              <dd data-testid="current-build-status">
                {showObservationComplete
                  ? 'OBSERVATION COMPLETE'
                  : activeWork.download ? 'BUILD AVAILABLE' : 'LOG INDEXED'}
              </dd>
            </div>
            <div><dt>PERIOD</dt><dd>{activeWork.period ?? '2026'}</dd></div>
            <div className="dc-telemetry-revision">
              <dt>REVISION</dt>
              <dd>
                <CorruptedFragment
                  fragmentId="fragment-04"
                  isRecovered={isFragmentRecovered('fragment-04')}
                  onRecover={onRecoverFragment}
                />
              </dd>
            </div>
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

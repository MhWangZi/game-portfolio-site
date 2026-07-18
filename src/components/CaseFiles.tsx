import { ArrowLeft, ArrowRight, Download, FileText, FolderOpen, MousePointer2 } from 'lucide-react'
import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useProjectRotation } from '../hooks/useProjectRotation'
import { gsap, useGSAP } from '../lib/gsap'
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

type TiltController = {
  rotateX: (value: number) => void
  rotateY: (value: number) => void
  previousX: (value: number) => void
  previousY: (value: number) => void
  nextX: (value: number) => void
  nextY: (value: number) => void
}

export function CaseFiles({ works, onOpen, onActiveProjectChange }: CaseFilesProps) {
  const rotation = useProjectRotation({ length: works.length, delay: 7200 })
  const rootRef = useRef<HTMLDivElement | null>(null)
  const touchStartX = useRef<number | null>(null)
  const tiltController = useRef<TiltController | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const activeWork = works[rotation.activeIndex] ?? works[0]
  const previousWork = works[wrapIndex(rotation.activeIndex - 1, works.length)]
  const nextWork = works[wrapIndex(rotation.activeIndex + 1, works.length)]

  useEffect(() => {
    if (activeWork) onActiveProjectChange(activeWork)
  }, [activeWork, onActiveProjectChange])

  useGSAP(
    () => {
      if (!activeWork || !rootRef.current) return

      const selector = gsap.utils.selector(rootRef.current)
      const card = selector('.dc-case-card')[0] as HTMLElement | undefined
      const previousGhost = selector('.ghost-previous')[0] as HTMLElement | undefined
      const nextGhost = selector('.ghost-next')[0] as HTMLElement | undefined

      if (!card) return

      gsap.set(card, { transformPerspective: 1100, transformOrigin: 'center center' })

      if (!reducedMotion && previousGhost && nextGhost) {
        tiltController.current = {
          rotateX: gsap.quickTo(card, 'rotationX', { duration: 0.42, ease: 'power3.out', overwrite: 'auto' }),
          rotateY: gsap.quickTo(card, 'rotationY', { duration: 0.42, ease: 'power3.out', overwrite: 'auto' }),
          previousX: gsap.quickTo(previousGhost, 'x', { duration: 0.72, ease: 'power3.out' }),
          previousY: gsap.quickTo(previousGhost, 'y', { duration: 0.72, ease: 'power3.out' }),
          nextX: gsap.quickTo(nextGhost, 'x', { duration: 0.72, ease: 'power3.out' }),
          nextY: gsap.quickTo(nextGhost, 'y', { duration: 0.72, ease: 'power3.out' }),
        }
      } else {
        tiltController.current = null
      }

      const animatedTargets = selector(
        '.dc-case-card, .dc-case-card-title > *, .dc-case-console > *, .dc-case-progress i',
      )
      if (reducedMotion) {
        gsap.set(animatedTargets, { autoAlpha: 1, clearProps: 'transform,clipPath' })
        return
      }

      const direction = rotation.direction === 'next' ? 1 : -1
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

      timeline
        .fromTo(
          card,
          {
            autoAlpha: 0,
            x: direction * 48,
            rotationY: direction * -4,
            scale: 0.975,
            clipPath: direction > 0 ? 'inset(0 0 0 14%)' : 'inset(0 14% 0 0)',
          },
          {
            autoAlpha: 1,
            x: 0,
            rotationY: 0,
            scale: 1,
            clipPath: 'inset(0 0% 0 0%)',
            duration: 0.72,
          },
          0,
        )
        .fromTo(
          selector('.dc-case-media img, .dc-case-media .dc-image-fallback'),
          { scale: 1.07, xPercent: direction * 2 },
          { scale: 1, xPercent: 0, duration: 0.95, ease: 'expo.out' },
          0,
        )
        .fromTo(
          selector('.dc-case-card-title > *'),
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.46, stagger: 0.045 },
          0.28,
        )
        .fromTo(
          selector('.dc-case-console > *'),
          { autoAlpha: 0, x: direction * 20, y: 10 },
          { autoAlpha: 1, x: 0, y: 0, duration: 0.48, stagger: 0.045 },
          0.18,
        )
        .fromTo(
          selector('.dc-case-number strong'),
          { color: '#f7cf8f', textShadow: '0 0 26px rgba(231, 169, 79, 0.55)' },
          { color: '#f2f0e9', textShadow: '0 0 0 rgba(231, 169, 79, 0)', duration: 0.46 },
          0.16,
        )

      gsap.to(selector('.dc-case-progress i'), {
        scaleX: works.length ? (rotation.activeIndex + 1) / works.length : 0,
        transformOrigin: 'left center',
        duration: 0.55,
        ease: 'power3.inOut',
      })

      return () => {
        tiltController.current = null
      }
    },
    {
      scope: rootRef,
      dependencies: [activeWork?.id, rotation.direction, reducedMotion, works.length],
      revertOnUpdate: true,
    },
  )

  if (!activeWork || !previousWork || !nextWork) return null

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || reducedMotion || !tiltController.current) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    tiltController.current.rotateX(-y * 3)
    tiltController.current.rotateY(x * 4)
    tiltController.current.previousX(x * 14)
    tiltController.current.previousY(y * 10)
    tiltController.current.nextX(-x * 14)
    tiltController.current.nextY(-y * 10)
  }

  const resetPointer = () => {
    tiltController.current?.rotateX(0)
    tiltController.current?.rotateY(0)
    tiltController.current?.previousX(0)
    tiltController.current?.previousY(0)
    tiltController.current?.nextX(0)
    tiltController.current?.nextY(0)
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

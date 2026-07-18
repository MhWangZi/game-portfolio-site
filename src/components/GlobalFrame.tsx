import { ArrowUpRight, Crosshair, Radio } from 'lucide-react'
import { useRef } from 'react'
import { chapters, statusSignals } from '../data/siteContent'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { gsap, useGSAP } from '../lib/gsap'
import type { ChapterId } from '../types'

type GlobalFrameProps = {
  activeChapter: ChapterId
  onNavigate: (id: ChapterId) => void
}

export function GlobalFrame({ activeChapter, onNavigate }: GlobalFrameProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const activeItem = chapters.find((chapter) => chapter.id === activeChapter) ?? chapters[0]

  const handleNavigation = (event: React.MouseEvent<HTMLAnchorElement>, id: ChapterId) => {
    event.preventDefault()
    onNavigate(id)
  }

  useGSAP(
    () => {
      if (reducedMotion || !rootRef.current) return
      const selector = gsap.utils.selector(rootRef.current)
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

      timeline
        .fromTo(
          selector('.dc-active-readout strong'),
          { autoAlpha: 0, x: 12, clipPath: 'inset(0 0 0 38%)' },
          { autoAlpha: 1, x: 0, clipPath: 'inset(0 0 0 0%)', duration: 0.34 },
          0,
        )
        .fromTo(
          selector('.dc-topnav a.active, .dc-chapter-rail button.active'),
          { boxShadow: '0 0 0 rgba(231, 169, 79, 0)', scale: 0.96 },
          {
            boxShadow: '0 0 20px rgba(231, 169, 79, 0.16)',
            scale: 1,
            duration: 0.42,
            clearProps: 'boxShadow,scale',
          },
          0.02,
        )
    },
    {
      scope: rootRef,
      dependencies: [activeChapter, reducedMotion],
      revertOnUpdate: true,
    },
  )

  return (
    <div className="dc-global-frame" ref={rootRef}>
      <header className="dc-topbar" data-reveal>
        <a className="dc-brand" href="#current" onClick={(event) => handleNavigation(event, 'current')}>
          <span>GDN</span>
          <strong>GAME DESIGN NOTES</strong>
        </a>

        <div className="dc-active-readout" aria-live="polite">
          <Crosshair size={14} />
          <span>ACTIVE</span>
          <strong>{activeItem.index} / {activeItem.label}</strong>
        </div>

        <nav className="dc-topnav" aria-label="主要章节">
          {chapters.map((chapter) => (
            <a
              className={chapter.id === activeChapter ? 'active' : ''}
              href={`#${chapter.id}`}
              key={chapter.id}
              onClick={(event) => handleNavigation(event, chapter.id)}
            >
              <span>{chapter.index}</span>
              {chapter.shortLabel}
            </a>
          ))}
        </nav>
      </header>

      <aside className="dc-chapter-rail" aria-label="当前章节">
        <div className="dc-rail-line" aria-hidden="true"><i /></div>
        {chapters.map((chapter) => (
          <button
            className={chapter.id === activeChapter ? 'active' : ''}
            type="button"
            key={chapter.id}
            onClick={() => onNavigate(chapter.id)}
            aria-label={`${chapter.index} ${chapter.shortLabel}`}
          >
            <span>{chapter.index}</span>
            <strong>{chapter.label}</strong>
          </button>
        ))}
      </aside>

      <div className="dc-signal-strip" aria-hidden="true">
        <Radio size={13} />
        <div>
          {[...statusSignals, ...statusSignals].map((signal, index) => (
            <span key={`${signal}-${index}`}>{signal}<ArrowUpRight size={11} /></span>
          ))}
        </div>
      </div>
    </div>
  )
}

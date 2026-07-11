import { ArrowUpRight, Crosshair, Radio } from 'lucide-react'
import { chapters, statusSignals } from '../data/siteContent'
import type { ChapterId } from '../types'

type GlobalFrameProps = {
  activeChapter: ChapterId
  onNavigate: (id: ChapterId) => void
}

export function GlobalFrame({ activeChapter, onNavigate }: GlobalFrameProps) {
  const activeItem = chapters.find((chapter) => chapter.id === activeChapter) ?? chapters[0]

  const handleNavigation = (event: React.MouseEvent<HTMLAnchorElement>, id: ChapterId) => {
    event.preventDefault()
    onNavigate(id)
  }

  return (
    <>
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
    </>
  )
}

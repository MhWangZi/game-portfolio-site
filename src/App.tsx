import { useEffect, useMemo, useState } from 'react'
import { AboutSection } from './components/AboutSection'
import { AbilityMatrix } from './components/AbilityMatrix'
import { BootOverlay } from './components/BootOverlay'
import { FeaturedProject } from './components/FeaturedProject'
import { Hero } from './components/Hero'
import { NotesSection } from './components/NotesSection'
import { PortfolioScene } from './components/PortfolioScene'
import { ProcessSection } from './components/ProcessSection'
import { SiteFooter } from './components/SiteFooter'
import { WorkDetail } from './components/WorkDetail'
import { WorkRegistry } from './components/WorkRegistry'
import { works } from './data/works'
import { useArchiveAnimations } from './hooks/useArchiveAnimations'

function App() {
  useArchiveAnimations()

  const firstWorkId = works[0]?.id ?? ''
  const [selectedId, setSelectedId] = useState(() => {
    const hash = window.location.hash.replace('#', '')
    return works.some((work) => work.id === hash) ? hash : firstWorkId
  })
  const selectedWork = useMemo(
    () => works.find((work) => work.id === selectedId) ?? works[0],
    [selectedId],
  )
  const featuredWork = useMemo(
    () => works.find((work) => work.featured) ?? works.find((work) => work.id === 'parry-arena') ?? works[0],
    [],
  )
  const downloadableCount = useMemo(() => works.filter((work) => work.download).length, [])

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (works.some((work) => work.id === hash)) setSelectedId(hash)
    }

    window.addEventListener('hashchange', handleHashChange)
    handleHashChange()
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const selectWork = (id: string) => {
    setSelectedId(id)
    window.history.replaceState(null, '', `#${id}`)
    document.getElementById('work-detail')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  return (
    <div className="app-shell">
      <BootOverlay />
      <div
        className="ambient-image"
        style={{ backgroundImage: 'url("./media/generated/archive-console-bg.png")' }}
        aria-hidden="true"
      />
      <PortfolioScene theme={selectedWork.visualTheme ?? 'particles'} />
      <div className="content-layer">
        <header className="topbar">
          <a className="brand-mark" href="#top" aria-label="回到首页">
            <span>YYQ</span>
            <strong>Game Design Notes</strong>
          </a>
          <nav aria-label="Primary navigation">
            <a href="#about">关于</a>
            <a href="#projects">项目</a>
            <a href="#notes">笔记</a>
            <a href="#process">方法</a>
            <a href="#contact">联系</a>
          </nav>
        </header>

        <main>
          <Hero
            workCount={works.length}
            downloadableCount={downloadableCount}
            featuredWork={featuredWork}
            onPrimaryAction={() => document.getElementById('projects')?.scrollIntoView()}
          />
          <AboutSection />
          <FeaturedProject work={featuredWork} onSelect={selectWork} />
          <WorkRegistry works={works} selectedId={selectedId} onSelect={selectWork} />
          <WorkDetail work={selectedWork} />
          <NotesSection />
          <ProcessSection />
          <AbilityMatrix />
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}

export default App

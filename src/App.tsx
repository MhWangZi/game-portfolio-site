import { useEffect, useMemo, useState } from 'react'
import { AbilityMatrix } from './components/AbilityMatrix'
import { Hero } from './components/Hero'
import { PortfolioScene } from './components/PortfolioScene'
import { SiteFooter } from './components/SiteFooter'
import { WorkDetail } from './components/WorkDetail'
import { WorkRegistry } from './components/WorkRegistry'
import { works } from './data/works'

function App() {
  const firstWorkId = works[0]?.id ?? ''
  const [selectedId, setSelectedId] = useState(() => {
    const hash = window.location.hash.replace('#', '')
    return works.some((work) => work.id === hash) ? hash : firstWorkId
  })
  const selectedWork = useMemo(
    () => works.find((work) => work.id === selectedId) ?? works[0],
    [selectedId],
  )

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
      <PortfolioScene theme={selectedWork.visualTheme ?? 'particles'} />
      <div className="content-layer">
        <header className="topbar">
          <a href="#top" aria-label="Go to top">
            Game Portfolio
          </a>
          <nav aria-label="Primary navigation">
            <a href="#works">作品</a>
            <a href="#abilities">能力</a>
            <a href="#contact">联系</a>
          </nav>
        </header>

        <main>
          <Hero workCount={works.length} onPrimaryAction={() => document.getElementById('works')?.scrollIntoView()} />
          <WorkRegistry works={works} selectedId={selectedId} onSelect={selectWork} />
          <WorkDetail work={selectedWork} />
          <AbilityMatrix />
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}

export default App

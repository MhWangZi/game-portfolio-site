import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BootOverlay } from './components/BootOverlay'
import { CaseFiles } from './components/CaseFiles'
import { ContactSection } from './components/ContactSection'
import { CurrentBuilds } from './components/CurrentBuilds'
import { DesignRadar } from './components/DesignRadar'
import { FieldNotes } from './components/FieldNotes'
import { GlobalFrame } from './components/GlobalFrame'
import { PortfolioScene } from './components/PortfolioScene'
import { ProjectDossier } from './components/ProjectDossier'
import { ProjectIndex } from './components/ProjectIndex'
import { PseudoAdmin } from './components/PseudoAdmin'
import { works } from './data/works'
import { useChapterController } from './hooks/useChapterController'
import { useConsoleAnimations } from './hooks/useConsoleAnimations'
import { useDossierRoute } from './hooks/useDossierRoute'
import { useVisitCounter } from './hooks/useVisitCounter'
import type { SceneState, WorkItem } from './types'

function isAdminHash(hash: string) {
  return hash.replace(/^#/, '').replace(/^\/+/, '') === 'admin'
}

function DesignConsole() {
  const consoleRef = useRef<HTMLDivElement | null>(null)
  useConsoleAnimations(consoleRef)
  const { activeChapter, navigateTo } = useChapterController()
  const { openWork, openDossier, closeDossier } = useDossierRoute(works)

  const heroWorks = useMemo(
    () => works.filter((work) => work.heroOrder).sort((left, right) => (left.heroOrder ?? 99) - (right.heroOrder ?? 99)),
    [],
  )
  const caseWorks = useMemo(
    () => works.filter((work) => work.caseOrder).sort((left, right) => (left.caseOrder ?? 99) - (right.caseOrder ?? 99)),
    [],
  )

  const [currentBuildId, setCurrentBuildId] = useState(heroWorks[0]?.id ?? works[0].id)
  const [radarProjectId, setRadarProjectId] = useState('parry-arena')
  const [caseProjectId, setCaseProjectId] = useState(caseWorks[0]?.id ?? works[0].id)
  const [indexProjectId, setIndexProjectId] = useState(works[0].id)

  const selectCurrentBuild = useCallback((work: WorkItem) => setCurrentBuildId(work.id), [])
  const selectRadarProject = useCallback((work: WorkItem) => setRadarProjectId(work.id), [])
  const selectCaseProject = useCallback((work: WorkItem) => setCaseProjectId(work.id), [])
  const selectIndexProject = useCallback((work: WorkItem) => setIndexProjectId(work.id), [])

  const activeSceneProjectId = openWork?.id ?? (
    activeChapter === 'current' ? currentBuildId
      : activeChapter === 'radar' ? radarProjectId
        : activeChapter === 'cases' ? caseProjectId
          : activeChapter === 'projects' ? indexProjectId
            : currentBuildId
  )
  const activeSceneWork = works.find((work) => work.id === activeSceneProjectId) ?? heroWorks[0] ?? works[0]
  const sceneState: SceneState = {
    activeChapter,
    activeProjectId: activeSceneWork.id,
    preset: activeSceneWork.scenePreset ?? 'neutral',
  }

  return (
    <div className="app-shell design-console-site" ref={consoleRef}>
      <BootOverlay />
      <div
        className="dc-ambient-image"
        style={{ backgroundImage: 'url("./media/generated/archive-console-bg.png")' }}
        aria-hidden="true"
      />
      <PortfolioScene state={sceneState} />
      <GlobalFrame activeChapter={activeChapter} onNavigate={navigateTo} />

      <main className="dc-main">
        <CurrentBuilds
          works={heroWorks}
          onActiveProjectChange={selectCurrentBuild}
          onOpen={openDossier}
          onNextChapter={() => navigateTo('radar')}
        />
        <DesignRadar works={works} onOpen={openDossier} onProjectPreview={selectRadarProject} />
        <CaseFiles works={caseWorks} onOpen={openDossier} onActiveProjectChange={selectCaseProject} />
        <ProjectIndex works={works} onOpen={openDossier} onProjectPreview={selectIndexProject} />
        <FieldNotes />
        <ContactSection
          onBackToTop={() => navigateTo('current')}
          onOpenRecent={() => openDossier(heroWorks[0]?.id ?? works[0].id)}
        />
      </main>

      <ProjectDossier
        work={openWork}
        workIndex={openWork ? works.findIndex((work) => work.id === openWork.id) : 0}
        onClose={closeDossier}
      />
    </div>
  )
}

function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(() => isAdminHash(window.location.hash))
  useVisitCounter(isAdminRoute)

  useEffect(() => {
    const handleHashChange = () => setIsAdminRoute(isAdminHash(window.location.hash))
    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('popstate', handleHashChange)
    handleHashChange()
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('popstate', handleHashChange)
    }
  }, [])

  if (isAdminRoute) {
    return (
      <div className="app-shell pseudo-admin-app">
        <div
          className="ambient-image"
          style={{ backgroundImage: 'url("./media/generated/archive-console-bg.png")' }}
          aria-hidden="true"
        />
        <PortfolioScene state={{ activeChapter: 'admin', preset: 'signal-branch', activeProjectId: 'admin' }} />
        <PseudoAdmin />
      </div>
    )
  }

  return <DesignConsole />
}

export default App

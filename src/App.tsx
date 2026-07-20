import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BootOverlay } from './components/BootOverlay'
import { CaseFiles } from './components/CaseFiles'
import { CaseZeroArchive } from './components/index-zero/CaseZeroArchive'
import { ArchiveIntegrityNode } from './components/index-zero/ArchiveIntegrityNode'
import { RecoveryInterface } from './components/index-zero/RecoveryInterface'
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
import { useIndexZeroPuzzle, type IndexZeroPuzzleController } from './hooks/useIndexZeroPuzzle'
import { useVisitCounter } from './hooks/useVisitCounter'
import type { SceneState, WorkItem } from './types'

type AppRoute = 'public' | 'admin' | 'recovery' | 'case-zero'

function getAppRoute(hash: string): AppRoute {
  const route = hash.replace(/^#/, '').replace(/^\/+/, '')
  if (route === 'admin') return 'admin'
  if (route === 'recovery') return 'recovery'
  if (route === 'case-00') return 'case-zero'
  return 'public'
}

function navigateToHash(hash: string, replace = false) {
  const normalizedHash = hash.startsWith('#') ? hash : `#${hash}`
  if (replace) {
    window.history.replaceState(null, '', normalizedHash)
    window.dispatchEvent(new Event('hashchange'))
    return
  }

  if (window.location.hash === normalizedHash) {
    window.dispatchEvent(new Event('hashchange'))
    return
  }
  window.location.hash = normalizedHash.slice(1)
}

type DesignConsoleProps = {
  puzzle: IndexZeroPuzzleController
}

function DesignConsole({ puzzle }: DesignConsoleProps) {
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
  const [showObservationComplete, setShowObservationComplete] = useState(puzzle.phraseVerified)

  useEffect(() => {
    if (!puzzle.phraseVerified) {
      setShowObservationComplete(false)
      return
    }

    setShowObservationComplete(true)
    const timer = window.setTimeout(() => setShowObservationComplete(false), 2200)
    return () => window.clearTimeout(timer)
  }, [puzzle.phraseVerified])

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
          isFragmentRecovered={puzzle.isFragmentRecovered}
          onRecoverFragment={puzzle.recoverFragment}
          showObservationComplete={showObservationComplete}
        />
        <DesignRadar
          works={works}
          onOpen={openDossier}
          onProjectPreview={selectRadarProject}
          isFragmentRecovered={puzzle.isFragmentRecovered}
          onRecoverFragment={puzzle.recoverFragment}
        />
        <CaseFiles
          works={caseWorks}
          onOpen={openDossier}
          onActiveProjectChange={selectCaseProject}
          isFragmentRecovered={puzzle.isFragmentRecovered}
          onRecoverFragment={puzzle.recoverFragment}
        />
        <ProjectIndex works={works} onOpen={openDossier} onProjectPreview={selectIndexProject} />
        <FieldNotes
          isFragmentRecovered={puzzle.isFragmentRecovered}
          onRecoverFragment={puzzle.recoverFragment}
        />
        <ContactSection
          onBackToTop={() => navigateTo('current')}
          onOpenRecent={() => openDossier(heroWorks[0]?.id ?? works[0].id)}
          recoveryAvailable={puzzle.allFragmentsRecovered}
          recoveryCompleted={puzzle.phraseVerified}
        />
      </main>

      <ProjectDossier
        work={openWork}
        workIndex={openWork ? works.findIndex((work) => work.id === openWork.id) : 0}
        onClose={closeDossier}
      />
      <ArchiveIntegrityNode
        recoveredFragmentIds={puzzle.recoveredFragmentIds}
        recoveredCount={puzzle.recoveredCount}
        allFragmentsRecovered={puzzle.allFragmentsRecovered}
        avoidBottomControls={activeChapter === 'current'}
      />
    </div>
  )
}

function App() {
  const [route, setRoute] = useState<AppRoute>(() => getAppRoute(window.location.hash))
  const puzzle = useIndexZeroPuzzle()
  useVisitCounter(route === 'admin')

  useEffect(() => {
    const handleHashChange = () => setRoute(getAppRoute(window.location.hash))
    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('popstate', handleHashChange)
    handleHashChange()
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('popstate', handleHashChange)
    }
  }, [])

  useEffect(() => {
    if (route !== 'case-zero' || puzzle.phraseVerified) return
    navigateToHash('#/recovery', true)
  }, [route, puzzle.phraseVerified])

  if (route === 'admin') {
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

  if (route === 'recovery' || (route === 'case-zero' && !puzzle.phraseVerified)) {
    return (
      <RecoveryInterface
        recoveredCount={puzzle.recoveredCount}
        onBackToSite={() => navigateToHash('#current')}
        onRecoveryComplete={() => {
          puzzle.completeRecovery()
          navigateToHash('#/case-00', true)
        }}
      />
    )
  }

  if (route === 'case-zero') {
    return (
      <CaseZeroArchive
        onBackToSite={() => navigateToHash('#current')}
        onResetPuzzle={() => {
          puzzle.resetPuzzle()
          navigateToHash('#current', true)
        }}
      />
    )
  }

  return <DesignConsole puzzle={puzzle} />
}

export default App

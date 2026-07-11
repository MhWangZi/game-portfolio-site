import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { WorkItem } from '../types'

function projectIdFromHash(works: WorkItem[]) {
  const value = window.location.hash.replace(/^#\/?/, '')
  return works.some((work) => work.id === value) ? value : null
}

export function useDossierRoute(works: WorkItem[]) {
  const [openWorkId, setOpenWorkId] = useState<string | null>(() => projectIdFromHash(works))
  const restoreScrollY = useRef<number | null>(null)

  useEffect(() => {
    const syncRoute = () => {
      const nextId = projectIdFromHash(works)
      setOpenWorkId(nextId)

      if (!nextId && restoreScrollY.current !== null) {
        const nextScrollY = restoreScrollY.current
        restoreScrollY.current = null
        window.requestAnimationFrame(() => window.scrollTo({ top: nextScrollY, behavior: 'auto' }))
      }
    }

    window.addEventListener('hashchange', syncRoute)
    window.addEventListener('popstate', syncRoute)
    syncRoute()
    return () => {
      window.removeEventListener('hashchange', syncRoute)
      window.removeEventListener('popstate', syncRoute)
    }
  }, [works])

  const openDossier = useCallback((id: string) => {
    restoreScrollY.current = window.scrollY
    window.history.pushState({ ...window.history.state, dossier: true }, '', `#${id}`)
    setOpenWorkId(id)
  }, [])

  const closeDossier = useCallback(() => {
    if (window.history.state?.dossier) {
      window.history.back()
      return
    }

    window.history.replaceState(null, '', '#projects')
    setOpenWorkId(null)
    document.getElementById('projects')?.scrollIntoView({ block: 'start' })
  }, [])

  const openWork = useMemo(
    () => works.find((work) => work.id === openWorkId) ?? null,
    [openWorkId, works],
  )

  return { openWork, openWorkId, openDossier, closeDossier }
}

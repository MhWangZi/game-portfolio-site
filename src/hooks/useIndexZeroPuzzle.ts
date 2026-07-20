import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  INDEX_ZERO_STORAGE_KEY,
  indexZeroFragmentIds,
  type FragmentId,
} from '../data/indexZeroArchive'

type StoredPuzzleState = {
  version: 1
  recoveredFragmentIds: FragmentId[]
  phraseVerified: boolean
}

const emptyPuzzleState: StoredPuzzleState = {
  version: 1,
  recoveredFragmentIds: [],
  phraseVerified: false,
}

const fragmentIdSet = new Set<string>(indexZeroFragmentIds)

function sanitizePuzzleState(value: unknown): StoredPuzzleState {
  if (!value || typeof value !== 'object') return emptyPuzzleState

  const candidate = value as Partial<StoredPuzzleState>
  if (candidate.version !== 1) return emptyPuzzleState

  const recoveredFragmentIds = Array.isArray(candidate.recoveredFragmentIds)
    ? [...new Set(candidate.recoveredFragmentIds.filter(
      (id): id is FragmentId => typeof id === 'string' && fragmentIdSet.has(id),
    ))]
    : []

  const phraseVerified = candidate.phraseVerified === true

  return {
    version: 1,
    recoveredFragmentIds: phraseVerified ? [...indexZeroFragmentIds] : recoveredFragmentIds,
    phraseVerified,
  }
}

function readPuzzleState() {
  try {
    const rawState = window.localStorage.getItem(INDEX_ZERO_STORAGE_KEY)
    return rawState ? sanitizePuzzleState(JSON.parse(rawState)) : emptyPuzzleState
  } catch {
    return emptyPuzzleState
  }
}

function persistPuzzleState(state: StoredPuzzleState) {
  try {
    window.localStorage.setItem(INDEX_ZERO_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // The in-memory React state remains usable when storage is blocked.
  }
}

export function useIndexZeroPuzzle() {
  const [state, setState] = useState<StoredPuzzleState>(readPuzzleState)

  useEffect(() => {
    const syncStoredState = (event: StorageEvent) => {
      if (event.key !== INDEX_ZERO_STORAGE_KEY) return
      if (!event.newValue) {
        setState(emptyPuzzleState)
        return
      }

      try {
        setState(sanitizePuzzleState(JSON.parse(event.newValue)))
      } catch {
        setState(emptyPuzzleState)
      }
    }

    window.addEventListener('storage', syncStoredState)
    return () => window.removeEventListener('storage', syncStoredState)
  }, [])

  const updateState = useCallback((update: (current: StoredPuzzleState) => StoredPuzzleState) => {
    setState((current) => {
      const nextState = sanitizePuzzleState(update(current))
      persistPuzzleState(nextState)
      return nextState
    })
  }, [])

  const recoverFragment = useCallback((id: FragmentId) => {
    if (!fragmentIdSet.has(id)) return

    updateState((current) => {
      if (current.recoveredFragmentIds.includes(id)) return current
      return {
        ...current,
        recoveredFragmentIds: [...current.recoveredFragmentIds, id],
      }
    })
  }, [updateState])

  const completeRecovery = useCallback(() => {
    updateState(() => ({
      version: 1,
      recoveredFragmentIds: [...indexZeroFragmentIds],
      phraseVerified: true,
    }))
  }, [updateState])

  const resetPuzzle = useCallback(() => {
    try {
      window.localStorage.removeItem(INDEX_ZERO_STORAGE_KEY)
    } catch {
      // Reset the in-memory state even if storage removal is blocked.
    }
    setState(emptyPuzzleState)
  }, [])

  const recoveredFragmentSet = useMemo(
    () => new Set<FragmentId>(state.recoveredFragmentIds),
    [state.recoveredFragmentIds],
  )

  const isFragmentRecovered = useCallback(
    (id: FragmentId) => recoveredFragmentSet.has(id),
    [recoveredFragmentSet],
  )

  return {
    recoveredFragmentIds: state.recoveredFragmentIds,
    recoveredCount: state.recoveredFragmentIds.length,
    allFragmentsRecovered: state.recoveredFragmentIds.length === indexZeroFragmentIds.length,
    phraseVerified: state.phraseVerified,
    isFragmentRecovered,
    recoverFragment,
    completeRecovery,
    resetPuzzle,
  }
}

export type IndexZeroPuzzleController = ReturnType<typeof useIndexZeroPuzzle>

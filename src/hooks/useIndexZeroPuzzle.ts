import { useCallback, useMemo, useState } from 'react'
import {
  indexZeroFragmentIds,
  type FragmentId,
} from '../data/indexZeroArchive'

type PuzzleState = {
  version: 1
  recoveredFragmentIds: FragmentId[]
  phraseVerified: boolean
}

const emptyPuzzleState: PuzzleState = {
  version: 1,
  recoveredFragmentIds: [],
  phraseVerified: false,
}

const fragmentIdSet = new Set<string>(indexZeroFragmentIds)

export function useIndexZeroPuzzle() {
  const [state, setState] = useState<PuzzleState>(emptyPuzzleState)

  const recoverFragment = useCallback((id: FragmentId) => {
    if (!fragmentIdSet.has(id)) return

    setState((current) => {
      if (current.recoveredFragmentIds.includes(id)) return current
      return {
        ...current,
        recoveredFragmentIds: [...current.recoveredFragmentIds, id],
      }
    })
  }, [])

  const completeRecovery = useCallback(() => {
    setState({
      version: 1,
      recoveredFragmentIds: [...indexZeroFragmentIds],
      phraseVerified: true,
    })
  }, [])

  const resetPuzzle = useCallback(() => {
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

import { useCallback, useEffect, useRef, useState } from 'react'
import { chapters } from '../data/siteContent'
import type { ChapterId } from '../types'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

type ChapterObservation = {
  ratio: number
  top: number
  visible: boolean
}

export function useChapterController() {
  const [activeChapter, setActiveChapter] = useState<ChapterId>('current')
  const observations = useRef(new Map<ChapterId, ChapterObservation>())
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const elements = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter((element): element is HTMLElement => Boolean(element))

    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id as ChapterId
          observations.current.set(id, {
            ratio: entry.intersectionRatio,
            top: entry.boundingClientRect.top,
            visible: entry.isIntersecting,
          })
        })

        const targetLine = window.innerHeight * 0.28
        const next = [...observations.current.entries()]
          .filter(([, item]) => item.visible)
          .sort(([, left], [, right]) => {
            const leftScore = Math.abs(left.top - targetLine) - left.ratio * 120
            const rightScore = Math.abs(right.top - targetLine) - right.ratio * 120
            return leftScore - rightScore
          })[0]

        if (next) setActiveChapter(next[0])
      },
      { rootMargin: '-12% 0px -56% 0px', threshold: [0, 0.08, 0.2, 0.4, 0.65] },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  const navigateTo = useCallback(
    (id: ChapterId) => {
      document.getElementById(id)?.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      })
    },
    [reducedMotion],
  )

  return { activeChapter, navigateTo }
}

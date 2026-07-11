import { useCallback, useEffect, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export type RotationDirection = 'next' | 'previous'

type ProjectRotationOptions = {
  length: number
  delay?: number
  autoplay?: boolean
  initialIndex?: number
}

function wrapIndex(index: number, length: number) {
  if (length <= 0) return 0
  return (index + length) % length
}

export function useProjectRotation({
  length,
  delay = 6800,
  autoplay = true,
  initialIndex = 0,
}: ProjectRotationOptions) {
  const [activeIndex, setActiveIndex] = useState(() => wrapIndex(initialIndex, length))
  const [direction, setDirection] = useState<RotationDirection>('next')
  const [paused, setPaused] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (activeIndex < length) return
    setActiveIndex(0)
  }, [activeIndex, length])

  const goTo = useCallback(
    (targetIndex: number, nextDirection?: RotationDirection) => {
      const normalized = wrapIndex(targetIndex, length)
      setActiveIndex((current) => {
        if (normalized === current) return current
        setDirection(nextDirection ?? (normalized > current ? 'next' : 'previous'))
        return normalized
      })
    },
    [length],
  )

  const next = useCallback(() => goTo(activeIndex + 1, 'next'), [activeIndex, goTo])
  const previous = useCallback(() => goTo(activeIndex - 1, 'previous'), [activeIndex, goTo])

  useEffect(() => {
    if (!autoplay || reducedMotion || paused || length < 2) return
    const timer = window.setTimeout(next, delay)
    return () => window.clearTimeout(timer)
  }, [autoplay, delay, length, next, paused, reducedMotion])

  return {
    activeIndex,
    direction,
    paused,
    setPaused,
    goTo,
    next,
    previous,
  }
}

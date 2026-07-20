import { useEffect, useRef, type KeyboardEvent } from 'react'
import {
  getIndexZeroFragment,
  type FragmentId,
} from '../../data/indexZeroArchive'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { gsap, useGSAP } from '../../lib/gsap'

type CorruptedFragmentProps = {
  fragmentId: FragmentId
  isRecovered: boolean
  onRecover: (id: FragmentId) => void
  className?: string
}

export function CorruptedFragment({
  fragmentId,
  isRecovered,
  onRecover,
  className = '',
}: CorruptedFragmentProps) {
  const fragment = getIndexZeroFragment(fragmentId)
  const rootRef = useRef<HTMLSpanElement | null>(null)
  const textRef = useRef<HTMLSpanElement | null>(null)
  const dwellTimerRef = useRef<number | null>(null)
  const previousRecoveredRef = useRef(isRecovered)
  const reducedMotion = usePrefersReducedMotion()

  const clearDwellTimer = () => {
    if (dwellTimerRef.current === null) return
    window.clearTimeout(dwellTimerRef.current)
    dwellTimerRef.current = null
  }

  const recover = () => {
    clearDwellTimer()
    if (!isRecovered) onRecover(fragmentId)
  }

  const startDwellTimer = () => {
    if (isRecovered || dwellTimerRef.current !== null) return
    dwellTimerRef.current = window.setTimeout(recover, 700)
  }

  useEffect(() => () => {
    if (dwellTimerRef.current !== null) window.clearTimeout(dwellTimerRef.current)
  }, [])

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    recover()
  }

  useGSAP(
    () => {
      const root = rootRef.current
      const text = textRef.current
      if (!root || !text) return

      const newlyRecovered = !previousRecoveredRef.current && isRecovered
      previousRecoveredRef.current = isRecovered

      if (!isRecovered) {
        text.textContent = fragment.corruptedText
        gsap.set(root, { clearProps: 'transform,filter' })
        return
      }

      if (!newlyRecovered || reducedMotion) {
        text.textContent = fragment.recoveredText
        gsap.set(root, { clearProps: 'transform,filter' })
        return
      }

      text.textContent = fragment.corruptedText
      const timeline = gsap.timeline({ defaults: { ease: 'steps(2)' } })

      fragment.corruptionFrames.forEach((frame, index) => {
        timeline
          .call(() => {
            text.textContent = frame
          }, [], index * 0.07)
          .to(
            root,
            {
              x: index % 2 === 0 ? 2 : -2,
              y: index === 1 ? -1 : 1,
              filter: index === 1 ? 'contrast(1.35)' : 'contrast(1.08)',
              duration: 0.055,
            },
            index * 0.07,
          )
      })

      timeline
        .call(() => {
          text.textContent = fragment.recoveredText
        }, [], 0.23)
        .to(root, {
          x: 0,
          y: 0,
          filter: 'contrast(1)',
          duration: 0.22,
          ease: 'power3.out',
          clearProps: 'transform,filter',
        }, 0.23)
    },
    {
      scope: rootRef,
      dependencies: [fragmentId, isRecovered, reducedMotion],
      revertOnUpdate: true,
    },
  )

  return (
    <span
      className={`index-zero-fragment-shell ${isRecovered ? 'is-recovered' : 'is-corrupted'} ${className}`.trim()}
      ref={rootRef}
      data-fragment-id={fragmentId}
    >
      <button
        className="index-zero-fragment corrupted"
        type="button"
        data-testid={`index-zero-${fragmentId}`}
        aria-label={isRecovered
          ? `片段 ${fragment.index} 已恢复：${fragment.recoveredText}`
          : `发现异常片段 ${fragment.index}`}
        onClick={recover}
        onKeyDown={handleKeyDown}
        onPointerEnter={(event) => {
          if (event.pointerType !== 'touch') startDwellTimer()
        }}
        onPointerLeave={clearDwellTimer}
        onFocus={startDwellTimer}
        onBlur={clearDwellTimer}
      >
        <span ref={textRef}>{isRecovered ? fragment.recoveredText : fragment.corruptedText}</span>
      </button>
    </span>
  )
}

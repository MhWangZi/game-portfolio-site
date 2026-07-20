import { ScanLine } from 'lucide-react'
import { useRef } from 'react'
import { indexZeroFragments, type FragmentId } from '../../data/indexZeroArchive'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { gsap, useGSAP } from '../../lib/gsap'

type ArchiveIntegrityNodeProps = {
  recoveredFragmentIds: FragmentId[]
  recoveredCount: number
  allFragmentsRecovered: boolean
  avoidBottomControls?: boolean
}

export function ArchiveIntegrityNode({
  recoveredFragmentIds,
  recoveredCount,
  allFragmentsRecovered,
  avoidBottomControls = false,
}: ArchiveIntegrityNodeProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  const previousCountRef = useRef(recoveredCount)
  const reducedMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (!rootRef.current) return
      const countChanged = previousCountRef.current !== recoveredCount
      previousCountRef.current = recoveredCount
      if (!countChanged || reducedMotion) return

      const selector = gsap.utils.selector(rootRef.current)
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      timeline
        .fromTo(
          selector('.index-zero-integrity-value'),
          { autoAlpha: 0.35, y: 5 },
          { autoAlpha: 1, y: 0, duration: 0.32 },
          0,
        )
        .fromTo(
          selector('.index-zero-integrity-scan'),
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: 0.38 },
          0,
        )
        .to(selector('.index-zero-integrity-scan'), {
          scaleX: 0,
          transformOrigin: 'right center',
          duration: 0.28,
        }, 0.4)
    },
    {
      scope: rootRef,
      dependencies: [recoveredCount, reducedMotion],
      revertOnUpdate: true,
    },
  )

  return (
    <aside
      className={`index-zero-integrity ${allFragmentsRecovered ? 'is-complete' : ''} ${avoidBottomControls ? 'avoid-bottom-controls' : ''}`}
      ref={rootRef}
      data-testid="archive-integrity"
      tabIndex={0}
      aria-label={`档案完整度 ${recoveredCount} / ${indexZeroFragments.length}`}
    >
      <span className="index-zero-integrity-scan" aria-hidden="true" />
      <div className="index-zero-integrity-label system-label">
        <ScanLine size={13} aria-hidden="true" />
        ARCHIVE INTEGRITY
      </div>
      <strong className="index-zero-integrity-value" aria-live="polite">
        {allFragmentsRecovered
          ? '5 FRAGMENTS RECOVERED'
          : `${recoveredCount} / ${indexZeroFragments.length}`}
      </strong>
      <span className="index-zero-integrity-message system-label">
        {allFragmentsRecovered ? 'UNREGISTERED ENTRY FOUND' : 'PUBLIC INDEX / PARTIAL'}
      </span>
      <span className="index-zero-integrity-detail" aria-hidden="true">
        {indexZeroFragments.map((fragment) => (
          <i
            className={recoveredFragmentIds.includes(fragment.id) ? 'recovered' : ''}
            key={fragment.id}
          >
            {fragment.index}
          </i>
        ))}
      </span>
    </aside>
  )
}

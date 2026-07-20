import { useRef } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { gsap, useGSAP } from '../../lib/gsap'

type RecoverySequenceProps = {
  active: boolean
  onComplete: () => void
}

export function RecoverySequence({ active, onComplete }: RecoverySequenceProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const completedRef = useRef(false)
  const reducedMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (!active || !rootRef.current || completedRef.current) return

      const selector = gsap.utils.selector(rootRef.current)
      const finish = () => {
        if (completedRef.current) return
        completedRef.current = true
        onComplete()
      }

      gsap.set(rootRef.current, { autoAlpha: 1 })
      gsap.set(selector('.recovery-sequence-document'), {
        autoAlpha: 0,
        clipPath: 'inset(0 0 100% 0)',
      })
      gsap.set(selector('.recovery-sequence-log > span, .recovery-sequence-error, .recovery-sequence-memory'), {
        autoAlpha: 0,
        y: 7,
      })
      gsap.set(selector('.recovery-sequence-progress > i'), {
        scaleX: 0,
        transformOrigin: 'left center',
      })
      gsap.set(selector('.recovery-sequence-redaction'), {
        scaleX: 0,
      })

      if (reducedMotion) {
        const reducedTimeline = gsap.timeline({ onComplete: finish })
        reducedTimeline
          .set(selector('.recovery-sequence-document'), {
            autoAlpha: 1,
            clipPath: 'inset(0 0 0% 0)',
          })
          .set(selector('.recovery-sequence-log > span:first-child'), { autoAlpha: 1, y: 0 })
          .to(selector('.recovery-sequence-progress > i'), {
            scaleX: 1,
            duration: 0.3,
            ease: 'none',
          }, 0)
          .set(selector('.recovery-sequence-memory'), { autoAlpha: 1, y: 0 }, 0.28)
        return
      }

      const timeline = gsap.timeline({
        defaults: { ease: 'power2.out' },
        onComplete: finish,
      })

      timeline
        .fromTo(
          selector('.recovery-sequence-scan'),
          { autoAlpha: 0, yPercent: -80 },
          { autoAlpha: 1, yPercent: 0, duration: 0.16 },
          0,
        )
        .to(selector('.recovery-sequence-scan'), {
          y: () => window.innerHeight * 0.72,
          duration: 0.62,
          ease: 'power1.inOut',
        }, 0.12)
        .to(selector('.recovery-sequence-document'), {
          autoAlpha: 1,
          clipPath: 'inset(0 0 0% 0)',
          duration: 0.58,
          ease: 'power2.inOut',
        }, 0.16)
        .to(selector('.recovery-sequence-log > span'), {
          autoAlpha: 1,
          y: 0,
          duration: 0.16,
          stagger: 0.11,
          ease: 'steps(2)',
        }, 0.32)
        .to(selector('.recovery-sequence-progress > i'), {
          scaleX: 0.76,
          duration: 0.74,
          ease: 'power1.inOut',
        }, 0.22)
        .to(selector('.recovery-sequence-error'), {
          autoAlpha: 1,
          y: 0,
          duration: 0.2,
          ease: 'steps(2)',
        }, 1.08)
        .to(selector('.recovery-sequence-document'), {
          x: 4,
          duration: 0.06,
          repeat: 1,
          yoyo: true,
          ease: 'none',
        }, 1.08)
        .to(selector('.recovery-sequence-memory'), {
          autoAlpha: 1,
          y: 0,
          duration: 0.24,
        }, 1.38)
        .to(selector('.recovery-sequence-progress > i'), {
          scaleX: 1,
          duration: 0.34,
          ease: 'power2.inOut',
        }, 1.38)
        .to(selector('.recovery-redaction-left'), {
          scaleX: 1,
          transformOrigin: 'left center',
          duration: 0.3,
          ease: 'power3.inOut',
        }, 1.68)
        .to(selector('.recovery-redaction-right'), {
          scaleX: 1,
          transformOrigin: 'right center',
          duration: 0.3,
          ease: 'power3.inOut',
        }, 1.68)
        .to(selector('.recovery-sequence-redaction'), {
          scaleX: 0,
          duration: 0.34,
          ease: 'power3.inOut',
        }, 2.0)
    },
    {
      scope: rootRef,
      dependencies: [active, reducedMotion, onComplete],
      revertOnUpdate: true,
    },
  )

  if (!active) return null

  return (
    <div className="recovery-sequence" ref={rootRef} role="status" aria-live="assertive">
      <span className="recovery-sequence-scan" aria-hidden="true" />
      <div className="recovery-sequence-document">
        <div className="recovery-sequence-corners" aria-hidden="true"><i /><i /><i /><i /></div>
        <span className="system-label">ARCHIVE RECOVERY / CASE-00</span>
        <div className="recovery-sequence-log system-label">
          <span>VERIFYING FRAGMENTS...</span>
          <span>RECONSTRUCTING DELETED SENTENCE...</span>
          <span>SEARCHING VERSION HISTORY...</span>
        </div>
        <div className="recovery-sequence-progress" aria-hidden="true"><i /></div>
        <strong className="recovery-sequence-error system-label">
          ERROR: ORIGINAL DOCUMENT DOES NOT EXIST
        </strong>
        <div className="recovery-sequence-memory system-label">
          <span>USING OBSERVER MEMORY AS SOURCE</span>
          <strong>RECORD RESTORED</strong>
        </div>
      </div>
      <div className="recovery-sequence-redaction recovery-redaction-left" aria-hidden="true" />
      <div className="recovery-sequence-redaction recovery-redaction-right" aria-hidden="true" />
    </div>
  )
}

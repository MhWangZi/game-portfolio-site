import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { gsap, useGSAP } from '../lib/gsap'

const bootLines = ['INDEX CURRENT BUILDS', 'MAP DESIGN VECTORS', 'SYNC CASE FILES', 'READY']

export function BootOverlay() {
  const reducedMotion = usePrefersReducedMotion()
  const [visible, setVisible] = useState(() => !reducedMotion)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!reducedMotion) return
    document.documentElement.dataset.archiveReady = 'true'
    setVisible(false)
  }, [reducedMotion])

  useGSAP(
    () => {
      if (reducedMotion || !rootRef.current) return

      const selector = gsap.utils.selector(rootRef.current)
      const gateLines = selector('.dc-boot-gate i')
      const innerLines = selector('.dc-boot-gate span')
      const logLines = selector('.dc-boot-log span')

      gsap.set([gateLines[0], gateLines[2], innerLines[0]], {
        scaleX: 0,
        transformOrigin: 'left center',
      })
      gsap.set([gateLines[1], gateLines[3], innerLines[1]], {
        scaleY: 0,
        transformOrigin: 'top center',
      })
      gsap.set(selector('.dc-boot-heading > *, .dc-boot-log span'), { autoAlpha: 0, y: 8 })
      gsap.set(selector('.dc-boot-progress span'), { scaleX: 0, transformOrigin: 'left center' })

      const timeline = gsap.timeline({
        defaults: { ease: 'power2.out' },
        onComplete: () => {
          document.documentElement.dataset.archiveReady = 'true'
          window.dispatchEvent(new CustomEvent('design-archive:ready'))
          setVisible(false)
        },
      })

      timeline
        .fromTo(
          selector('.dc-boot-core'),
          { autoAlpha: 0, scale: 0.96 },
          { autoAlpha: 1, scale: 1, duration: 0.28 },
          0,
        )
        .to(gateLines[0], { scaleX: 1, duration: 0.18 }, 0.04)
        .to(gateLines[1], { scaleY: 1, duration: 0.18 }, 0.14)
        .to(gateLines[2], { scaleX: 1, duration: 0.18, transformOrigin: 'right center' }, 0.24)
        .to(gateLines[3], { scaleY: 1, duration: 0.18, transformOrigin: 'bottom center' }, 0.34)
        .to(innerLines[0], { scaleX: 1, duration: 0.2 }, 0.39)
        .to(innerLines[1], { scaleY: 1, duration: 0.2 }, 0.48)
        .fromTo(
          selector('.dc-boot-gate'),
          { rotation: 37, scale: 0.88 },
          { rotation: 45, scale: 1, duration: 0.5, ease: 'back.out(1.35)' },
          0.08,
        )
        .to(
          selector('.dc-boot-heading > *'),
          { autoAlpha: 1, y: 0, duration: 0.28, stagger: 0.045 },
          0.28,
        )
        .to(
          logLines,
          { autoAlpha: 1, y: 0, duration: 0.14, stagger: 0.075, ease: 'steps(2)' },
          0.48,
        )
        .to(selector('.dc-boot-progress span'), { scaleX: 1, duration: 0.92, ease: 'power1.inOut' }, 0.2)
        .to(
          selector('.dc-boot-core'),
          { autoAlpha: 0, scale: 1.025, filter: 'blur(5px)', duration: 0.3, ease: 'power2.in' },
          1.12,
        )
        .to(
          selector('.dc-boot-shutter-left'),
          { scaleX: 0, transformOrigin: 'left center', duration: 0.42, ease: 'power3.inOut' },
          1.16,
        )
        .to(
          selector('.dc-boot-shutter-right'),
          { scaleX: 0, transformOrigin: 'right center', duration: 0.42, ease: 'power3.inOut' },
          1.16,
        )
        .to(rootRef.current, { autoAlpha: 0, duration: 0.18 }, 1.43)
    },
    { scope: rootRef, dependencies: [reducedMotion], revertOnUpdate: true },
  )

  if (!visible) return null

  return (
    <div className="dc-boot-overlay" aria-hidden="true" ref={rootRef}>
      <div className="dc-boot-shutter dc-boot-shutter-left" />
      <div className="dc-boot-shutter dc-boot-shutter-right" />
      <div className="dc-boot-core">
        <div className="dc-boot-gate">
          <i /><i /><i /><i />
          <span /><span />
        </div>
        <div className="dc-boot-heading">
          <span>GDN / SYSTEM START</span>
          <strong>DESIGN ARCHIVE</strong>
          <em>玩法原型与系统记录</em>
        </div>
        <div className="dc-boot-log">
          {bootLines.map((line, index) => (
            <span key={line}>
              [{String(index + 1).padStart(2, '0')}] {line}
            </span>
          ))}
        </div>
        <div className="dc-boot-progress"><span /></div>
      </div>
    </div>
  )
}

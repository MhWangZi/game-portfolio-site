import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const bootLines = ['INDEX CURRENT BUILDS', 'MAP DESIGN VECTORS', 'SYNC CASE FILES', 'READY']

export function BootOverlay() {
  const reducedMotion = usePrefersReducedMotion()
  const [visible, setVisible] = useState(() => !reducedMotion)

  useEffect(() => {
    if (reducedMotion) {
      setVisible(false)
      return
    }

    const timer = window.setTimeout(() => setVisible(false), 1680)
    return () => window.clearTimeout(timer)
  }, [reducedMotion])

  if (!visible) return null

  return (
    <div className="dc-boot-overlay" aria-hidden="true">
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
            <span key={line} style={{ '--boot-index': index } as CSSProperties}>
              [{String(index + 1).padStart(2, '0')}] {line}
            </span>
          ))}
        </div>
        <div className="dc-boot-progress"><span /></div>
      </div>
    </div>
  )
}

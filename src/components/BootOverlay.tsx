import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const bootLines = ['MOUNT ARCHIVE', 'INDEX BUILDS', 'LOAD SYSTEM FILES', 'READY']

export function BootOverlay() {
  const reducedMotion = usePrefersReducedMotion()
  const [visible, setVisible] = useState(() => !reducedMotion)

  useEffect(() => {
    if (reducedMotion) {
      setVisible(false)
      return
    }

    const timer = window.setTimeout(() => setVisible(false), 1150)
    return () => window.clearTimeout(timer)
  }, [reducedMotion])

  if (!visible) return null

  return (
    <div className="boot-overlay" aria-hidden="true">
      <div className="boot-panel">
        <div className="boot-panel-top">
          <span>YYQ_ARCHIVE</span>
          <span>v1.0</span>
        </div>
        <div className="boot-title">Interactive Game Design Archive</div>
        <div className="boot-log">
          {bootLines.map((line, index) => (
            <span key={line} style={{ '--boot-index': index } as CSSProperties}>
              [{String(index + 1).padStart(2, '0')}] {line}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

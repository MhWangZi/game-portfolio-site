import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const bootLines = ['MOUNT ARCHIVE', 'INDEX BUILDS', 'SYNC DESIGN EVIDENCE', 'READY']

export function BootOverlay() {
  const reducedMotion = usePrefersReducedMotion()
  const [visible, setVisible] = useState(() => !reducedMotion)

  useEffect(() => {
    if (reducedMotion) {
      setVisible(false)
      return
    }

    const timer = window.setTimeout(() => setVisible(false), 1850)
    return () => window.clearTimeout(timer)
  }, [reducedMotion])

  if (!visible) return null

  return (
    <div className="boot-overlay" aria-hidden="true">
      <div className="boot-shutter boot-shutter-left" />
      <div className="boot-shutter boot-shutter-right" />
      <div className="boot-core">
        <div className="boot-cube">
          <i />
          <i />
          <i />
        </div>
        <div className="boot-title">装载游戏设计档案</div>
        <div className="boot-progress">
          <span />
        </div>
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

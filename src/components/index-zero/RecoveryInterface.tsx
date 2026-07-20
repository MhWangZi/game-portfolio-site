import { ArrowLeft, FileKey2, ScanLine, ShieldAlert } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  INDEX_ZERO_RECOVERY_PHRASE,
  indexZeroFragments,
  normalizeRecoveryPhrase,
  recoveryErrors,
} from '../../data/indexZeroArchive'
import { RecoverySequence } from './RecoverySequence'

type RecoveryInterfaceProps = {
  recoveredCount: number
  onBackToSite: () => void
  onRecoveryComplete: () => void
}

function randomRecoveryError(previousError: string) {
  const candidates = recoveryErrors.filter((error) => error !== previousError)
  return candidates[Math.floor(Math.random() * candidates.length)] ?? recoveryErrors[0]
}

export function RecoveryInterface({
  recoveredCount,
  onBackToSite,
  onRecoveryComplete,
}: RecoveryInterfaceProps) {
  const [phrase, setPhrase] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [phraseMatched, setPhraseMatched] = useState(false)
  const [sequenceActive, setSequenceActive] = useState(false)
  const sequenceTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'RECOVERY INTERFACE｜异常记录恢复入口'
    return () => {
      document.title = previousTitle
      if (sequenceTimerRef.current !== null) window.clearTimeout(sequenceTimerRef.current)
    }
  }, [])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (phraseMatched || sequenceActive) return

    if (normalizeRecoveryPhrase(phrase) !== INDEX_ZERO_RECOVERY_PHRASE) {
      setErrorMessage((current) => randomRecoveryError(current))
      return
    }

    setErrorMessage('')
    setPhraseMatched(true)
    sequenceTimerRef.current = window.setTimeout(() => setSequenceActive(true), 520)
  }

  return (
    <main className="index-zero-surface recovery-interface">
      <div className="index-zero-noise" aria-hidden="true" />
      <header className="recovery-interface-topbar system-label">
        <button type="button" onClick={onBackToSite}>
          <ArrowLeft size={14} />PUBLIC INDEX
        </button>
        <span>INDEX-0 / UNREGISTERED ROUTE</span>
        <strong><span>INTEGRITY </span>{recoveredCount} / {indexZeroFragments.length}</strong>
      </header>

      <section className="recovery-interface-panel" aria-labelledby="recovery-interface-title">
        <div className="recovery-interface-mark" aria-hidden="true">
          <ScanLine size={31} />
          <i /><i /><i /><i />
        </div>

        <div className="recovery-interface-heading">
          <span className="system-label">RESTRICTED / LOCAL MEMORY ONLY</span>
          <h1 className="archive-heading" id="recovery-interface-title">
            <span aria-hidden="true" className="ghost-text">RECOVERY INTERFACE</span>
            RECOVERY INTERFACE
          </h1>
          <h2>异常记录恢复入口</h2>
          <p className="archive-body">请输入由污染片段组成的完整记录。</p>
        </div>

        <form className="recovery-interface-form" onSubmit={handleSubmit}>
          <label className="system-label" htmlFor="recovery-phrase">
            <FileKey2 size={15} />RECOVERY PHRASE
          </label>
          <div className={`recovery-input-frame ${errorMessage ? 'has-error' : ''}`}>
            <input
              id="recovery-phrase"
              data-testid="recovery-phrase"
              type="text"
              value={phrase}
              onChange={(event) => {
                setPhrase(event.target.value)
                if (errorMessage) setErrorMessage('')
              }}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              disabled={phraseMatched || sequenceActive}
              aria-describedby="recovery-instruction recovery-response"
              autoFocus
            />
            <span aria-hidden="true" />
          </div>
          <p id="recovery-instruction">
            已恢复片段：{String(recoveredCount).padStart(2, '0')} / {String(indexZeroFragments.length).padStart(2, '0')}
          </p>

          <button
            className="recovery-verify-button"
            type="submit"
            disabled={!phrase.trim() || phraseMatched || sequenceActive}
          >
            <ScanLine size={16} />
            VERIFY RECORD
          </button>
        </form>

        <div
          className={`recovery-interface-response ${phraseMatched ? 'is-matched' : ''} ${errorMessage ? 'has-error' : ''}`}
          id="recovery-response"
          role={errorMessage ? 'alert' : 'status'}
          aria-live={errorMessage ? 'assertive' : 'polite'}
        >
          {errorMessage ? (
            <><ShieldAlert size={16} /><span>{errorMessage}</span></>
          ) : phraseMatched ? (
            <div>
              <strong>口令匹配。</strong>
              <span>警告：该句并未保存于任何已知版本中。</span>
            </div>
          ) : (
            <span className="system-label">WAITING FOR RECOVERY PHRASE</span>
          )}
        </div>

        <p className="recovery-interface-disclaimer">
          LOCAL PUZZLE INTERFACE / 不包含真实后台权限或未公开资料
        </p>
      </section>

      <RecoverySequence active={sequenceActive} onComplete={onRecoveryComplete} />
    </main>
  )
}

import { ArrowLeft, Eye, FileWarning, RotateCcw, ScanLine } from 'lucide-react'
import { useEffect, useRef } from 'react'
import {
  caseZeroInvestigation,
  caseZeroOpening,
  caseZeroStatus,
  INDEX_ZERO_RECOVERY_PHRASE,
} from '../../data/indexZeroArchive'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'

type CaseZeroArchiveProps = {
  onBackToSite: () => void
  onResetPuzzle: () => void
}

const finalObserverText = '你没有进入后台。\n你只是完成了它缺少的那一段。'

function animateTypedText(target: HTMLElement, value: string, duration: number) {
  const cursor = { length: 0 }
  return gsap.to(cursor, {
    length: value.length,
    duration,
    ease: 'none',
    onUpdate: () => {
      target.textContent = value.slice(0, Math.round(cursor.length))
    },
  })
}

export function CaseZeroArchive({ onBackToSite, onResetPuzzle }: CaseZeroArchiveProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'CASE-00｜未被编写的记录'
    return () => {
      document.title = previousTitle
    }
  }, [])

  useGSAP(
    () => {
      if (!rootRef.current) return
      const selector = gsap.utils.selector(rootRef.current)
      const statusTargets = selector<HTMLElement>('[data-status-cycle]')
      const marginNotes = selector<HTMLElement>('[data-typed-note]')
      const finalTarget = selector<HTMLElement>('[data-final-observer-typed]')[0]
      const documentSections = selector<HTMLElement>('.case-zero-document-section')

      if (reducedMotion) {
        gsap.set(selector(
          '.case-zero-header > *, .case-zero-status-grid > *, .case-zero-document-section, .margin-note, .unauthorized-note',
        ), {
          autoAlpha: 1,
          clearProps: 'transform,clipPath',
        })
        marginNotes.forEach((note) => {
          note.textContent = note.dataset.typedNote ?? ''
        })
        if (finalTarget) finalTarget.textContent = finalObserverText
        return
      }

      const entrance = gsap.timeline({
        defaults: { ease: 'power3.out' },
      })

      entrance
        .fromTo(
          selector('.case-zero-header > *'),
          { autoAlpha: 0, y: 24, clipPath: 'inset(0 0 42% 0)' },
          {
            autoAlpha: 1,
            y: 0,
            clipPath: 'inset(0 0 0% 0)',
            duration: 0.62,
            stagger: 0.065,
          },
          0.08,
        )
        .fromTo(
          selector('.case-zero-status-grid > *'),
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.055 },
          0.32,
        )
        .fromTo(
          selector('.case-zero-title-print'),
          { x: -5, textShadow: '5px 0 rgba(109, 32, 32, 0.55), -3px 0 rgba(231, 169, 79, 0.3)' },
          {
            x: 0,
            textShadow: '0 0 rgba(109, 32, 32, 0), 0 0 rgba(231, 169, 79, 0)',
            duration: 0.48,
          },
          0.18,
        )

      statusTargets.forEach((target, index) => {
        const primary = target.dataset.primary ?? target.textContent ?? ''
        const alternate = target.dataset.alternate ?? primary
        entrance
          .to(target, { autoAlpha: 0.25, duration: 0.08, ease: 'none' }, 0.88 + index * 0.12)
          .call(() => {
            target.textContent = alternate
          }, [], 0.96 + index * 0.12)
          .to(target, { autoAlpha: 1, duration: 0.1, ease: 'steps(2)' }, 0.97 + index * 0.12)
          .to(target, { autoAlpha: 0.35, duration: 0.08, ease: 'none' }, 1.34 + index * 0.12)
          .call(() => {
            target.textContent = primary
          }, [], 1.42 + index * 0.12)
          .to(target, { autoAlpha: 1, duration: 0.14 }, 1.43 + index * 0.12)
      })

      documentSections.forEach((section) => {
        const scan = section.querySelector<HTMLElement>('.case-zero-section-scan')
        gsap.fromTo(
          section,
          { autoAlpha: 0, y: 7, clipPath: 'inset(0 0 10% 0)' },
          {
            autoAlpha: 1,
            y: 0,
            clipPath: 'inset(0 0 0% 0)',
            duration: 0.72,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 82%',
              once: true,
            },
          },
        )

        if (scan) {
          gsap.fromTo(
            scan,
            { xPercent: -115, autoAlpha: 0 },
            {
              xPercent: 115,
              autoAlpha: 0.7,
              duration: 0.85,
              ease: 'power1.inOut',
              scrollTrigger: {
                trigger: section,
                start: 'top 82%',
                once: true,
              },
            },
          )
        }
      })

      marginNotes.forEach((note, index) => {
        const noteText = note.dataset.typedNote ?? ''
        note.textContent = ''
        const typing = animateTypedText(note, noteText, Math.max(0.5, noteText.length * 0.045))
        typing.pause()
        ScrollTrigger.create({
          trigger: note,
          start: 'top 88%',
          once: true,
          onEnter: () => typing.play(),
        })

        if (index === 1) {
          const unauthorized = note.closest('.unauthorized-note')
          const redaction = unauthorized?.querySelector<HTMLElement>('.unauthorized-redaction')
          if (redaction) {
            gsap.fromTo(
              redaction,
              { scaleX: 0, transformOrigin: 'left center' },
              {
                scaleX: 1,
                duration: 0.5,
                delay: 1.2,
                ease: 'power3.inOut',
                scrollTrigger: {
                  trigger: unauthorized,
                  start: 'top 84%',
                  once: true,
                },
              },
            )
          }
        }
      })

      if (finalTarget) {
        finalTarget.textContent = ''
        const typing = animateTypedText(finalTarget, finalObserverText, 1.7)
        typing.pause()
        ScrollTrigger.create({
          trigger: finalTarget,
          start: 'top 84%',
          once: true,
          onEnter: () => typing.play(),
        })
      }
    },
    {
      scope: rootRef,
      dependencies: [reducedMotion],
      revertOnUpdate: true,
    },
  )

  const handleReset = () => {
    if (!window.confirm('清除本地恢复进度并返回公开页面？')) return
    onResetPuzzle()
  }

  return (
    <main className="index-zero-surface case-zero-archive" ref={rootRef}>
      <div className="index-zero-noise" aria-hidden="true" />
      <header className="case-zero-topbar system-label">
        <button type="button" onClick={onBackToSite}><ArrowLeft size={14} />PUBLIC INDEX</button>
        <span>INDEX-0 / RECOVERED MEMORY</span>
        <strong>ACCESS: LOCAL</strong>
      </header>

      <article className="case-zero-document">
        <header className="case-zero-header">
          <div className="case-zero-file-id system-label">
            <FileWarning size={17} />
            UNREGISTERED FILE / REVISION UNKNOWN
          </div>
          <div className="warning-stamp">PARTIAL RECORD</div>
          <h1 className="archive-heading case-zero-title-print" data-text="CASE-00 / THE UNWRITTEN RECORD">
            <span className="ghost-text" aria-hidden="true">CASE-00 / THE UNWRITTEN RECORD</span>
            CASE-00 / THE UNWRITTEN RECORD
          </h1>
          <p className="case-zero-chinese-title">第零号档案 / 未被编写的记录</p>
        </header>

        <dl className="case-zero-status-grid">
          {caseZeroStatus.map(([label, value], index) => {
            const alternate = index === 0
              ? 'WATCHING'
              : index === 2 ? 'SUBJECT' : value
            return (
              <div key={label}>
                <dt className="system-label">{label}</dt>
                <dd
                  className="system-label"
                  data-status-cycle={index === 0 || index === 2 ? 'true' : undefined}
                  data-primary={value}
                  data-alternate={alternate}
                >
                  {value}
                </dd>
              </div>
            )
          })}
        </dl>

        <section className="case-zero-document-section archive-body">
          <span className="case-zero-section-scan" aria-hidden="true" />
          <span className="system-label">00.1 / ORIGIN REPORT</span>
          {caseZeroOpening.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <aside className="margin-note">
            <span className="system-label">MARGIN / 17 SEC</span>
            <p
              data-typed-note="删除完成后仍有写入事件。时间戳早于文件创建时间。"
              aria-label="删除完成后仍有写入事件。时间戳早于文件创建时间。"
            >
              删除完成后仍有写入事件。时间戳早于文件创建时间。
            </p>
          </aside>
        </section>

        <section className="case-zero-document-section archive-body case-zero-phrase-section">
          <span className="case-zero-section-scan" aria-hidden="true" />
          <span className="system-label">00.2 / SOURCE STRING</span>
          <p>该段文字为：</p>
          <blockquote>“{INDEX_ZERO_RECOVERY_PHRASE}。”</blockquote>
          <p>INDEX-0 随后被移除。删除完成后的第十七秒，公开页面出现了第一个污染片段。</p>
          <div className="warning-stamp">UNVERIFIED</div>
        </section>

        <section className="case-zero-document-section archive-body">
          <span className="case-zero-section-scan" aria-hidden="true" />
          <span className="system-label">00.3 / OBSERVATION LOG</span>
          {caseZeroInvestigation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <div className="case-zero-integrity-bar">
            <span className="system-label">当前完整度</span>
            <i aria-hidden="true"><b /></i>
            <strong className="system-label">87%</strong>
          </div>
          <p>剩余部分将在本次访问结束后，由当前观察者补全。</p>

          <aside className="unauthorized-note">
            <span className="system-label">UNAUTHORIZED MARGIN NOTE</span>
            <p
              data-typed-note="原始文档并不存在。所谓恢复，只是一次新的写入。"
              aria-label="原始文档并不存在。所谓恢复，只是一次新的写入。"
            >
              原始文档并不存在。所谓恢复，只是一次新的写入。
            </p>
            <i className="unauthorized-redaction" aria-hidden="true" />
          </aside>
        </section>

        <section className="case-zero-document-section case-zero-observer-section">
          <span className="case-zero-section-scan" aria-hidden="true" />
          <div className="case-zero-author-row">
            <span className="system-label">AUTHOR</span>
            <button type="button" className="redacted case-zero-author">
              <span>████████</span>
              <strong>CURRENT OBSERVER</strong>
            </button>
          </div>

          <div className="case-zero-observer-mark" aria-hidden="true">
            <Eye size={23} />
            <span /><span /><span />
          </div>

          <p
            className="case-zero-final-message archive-heading"
            data-final-observer-text
            aria-hidden="true"
          >
            <span className="case-zero-final-static">{finalObserverText}</span>
            <span className="case-zero-final-typed" data-final-observer-typed />
          </p>
          <p className="sr-only">{finalObserverText}</p>
        </section>

        <footer className="case-zero-footer">
          <button type="button" onClick={onBackToSite}><ArrowLeft size={15} />RETURN TO PUBLIC INDEX</button>
          <button type="button" onClick={handleReset}><RotateCcw size={15} />CLEAR RECOVERY MEMORY</button>
          <span className="system-label"><ScanLine size={13} />LOCAL RECORD / NO IDENTITY COLLECTED</span>
        </footer>
      </article>
    </main>
  )
}

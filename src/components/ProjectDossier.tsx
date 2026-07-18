import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  Images,
  Info,
  Layers3,
  Link,
  PackageCheck,
  Shield,
  Sparkles,
  TimerReset,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { gsap, useGSAP } from '../lib/gsap'
import type { WorkItem } from '../types'
import {
  getArchiveCode,
  getDownloadLabel,
  getKindLabel,
  getWorkImageSources,
} from '../utils/workPresentation'
import { SafeImage } from './SafeImage'

type DossierTab = 'overview' | 'media' | 'design' | 'build' | 'links'

type ProjectDossierProps = {
  work: WorkItem | null
  workIndex: number
  onClose: () => void
}

const tabMeta: Record<DossierTab, { label: string; icon: typeof Info }> = {
  overview: { label: 'OVERVIEW', icon: Info },
  media: { label: 'MEDIA', icon: Images },
  design: { label: 'DESIGN', icon: Layers3 },
  build: { label: 'BUILD', icon: PackageCheck },
  links: { label: 'LINKS', icon: Link },
}

const parryRules = [
  { title: '普通格挡', body: '稳定防守，持续消耗体力。', icon: Shield },
  { title: '完美弹反', body: '严格窗口，将防守转换成高收益反击。', icon: Sparkles },
  { title: '闪避', body: '处理冲撞与危险站位，限制弹反的万能性。', icon: TimerReset },
]

function formatSha(sha?: string) {
  return sha ? `${sha.slice(0, 12)}...${sha.slice(-8)}` : null
}

export function ProjectDossier({ work, workIndex, onClose }: ProjectDossierProps) {
  const [activeTab, setActiveTab] = useState<DossierTab>('overview')
  const [mediaIndex, setMediaIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  const closingRef = useRef(false)
  const reducedMotion = usePrefersReducedMotion()

  const tabs = useMemo(() => {
    const next: DossierTab[] = ['overview']
    if (work?.media.length) next.push('media')
    next.push('design')
    if (work?.download) next.push('build')
    if (work?.links?.length) next.push('links')
    return next
  }, [work])

  const { contextSafe } = useGSAP(
    () => {
      if (!work || !rootRef.current) return
      closingRef.current = false
      const selector = gsap.utils.selector(rootRef.current)
      const targets = selector(
        '.dc-dossier-header, .dc-dossier-visual, .dc-dossier-title-block > *, .dc-dossier-tabs > button',
      )

      if (reducedMotion) {
        gsap.set([rootRef.current, ...targets], {
          autoAlpha: 1,
          clearProps: 'transform,clipPath,filter',
        })
        return
      }

      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      timeline
        .fromTo(
          rootRef.current,
          { autoAlpha: 0, clipPath: 'inset(48% 4% 48% 4%)' },
          { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.62, ease: 'power4.inOut' },
          0,
        )
        .fromTo(
          selector('.dc-dossier-header'),
          { autoAlpha: 0, y: -18 },
          { autoAlpha: 1, y: 0, duration: 0.46 },
          0.28,
        )
        .fromTo(
          selector('.dc-dossier-visual'),
          { autoAlpha: 0, x: -42, clipPath: 'inset(0 12% 0 0)' },
          { autoAlpha: 1, x: 0, clipPath: 'inset(0 0% 0 0)', duration: 0.68 },
          0.2,
        )
        .fromTo(
          selector('.dc-dossier-title-block > *'),
          { autoAlpha: 0, y: 22, clipPath: 'inset(0 0 30% 0)' },
          {
            autoAlpha: 1,
            y: 0,
            clipPath: 'inset(0 0 0% 0)',
            duration: 0.5,
            stagger: 0.055,
          },
          0.3,
        )
        .fromTo(
          selector('.dc-dossier-tabs > button'),
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.36, stagger: 0.035 },
          0.5,
        )
    },
    {
      scope: rootRef,
      dependencies: [work?.id, reducedMotion],
      revertOnUpdate: true,
    },
  )

  useGSAP(
    () => {
      if (!work || !rootRef.current) return
      const selector = gsap.utils.selector(rootRef.current)
      const mediaTargets = selector('.dc-dossier-media-frame, .dc-dossier-media-status')

      if (reducedMotion) {
        gsap.set(mediaTargets, { autoAlpha: 1, clearProps: 'transform,clipPath' })
        return
      }

      gsap.fromTo(
        selector('.dc-dossier-media-frame'),
        { autoAlpha: 0, x: 28, scale: 1.025, clipPath: 'inset(0 0 0 14%)' },
        {
          autoAlpha: 1,
          x: 0,
          scale: 1,
          clipPath: 'inset(0 0% 0 0%)',
          duration: 0.58,
          ease: 'power3.out',
        },
      )
      gsap.fromTo(
        selector('.dc-dossier-media-status'),
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.34, delay: 0.18, ease: 'power2.out' },
      )
    },
    {
      scope: rootRef,
      dependencies: [work?.id, mediaIndex, reducedMotion],
      revertOnUpdate: true,
    },
  )

  useGSAP(
    () => {
      if (!work || !rootRef.current) return
      const selector = gsap.utils.selector(rootRef.current)
      const channelItems = selector(
        '.dc-dossier-channel > div > *, .dc-dossier-channel article, .dc-dossier-channel dl > div',
      )

      if (reducedMotion) {
        gsap.set(channelItems, { autoAlpha: 1, clearProps: 'transform,clipPath' })
        return
      }

      gsap.fromTo(
        channelItems,
        { autoAlpha: 0, y: 18, clipPath: 'inset(0 0 18% 0)' },
        {
          autoAlpha: 1,
          y: 0,
          clipPath: 'inset(0 0 0% 0)',
          duration: 0.42,
          stagger: 0.035,
          ease: 'power3.out',
        },
      )
    },
    {
      scope: rootRef,
      dependencies: [work?.id, activeTab, reducedMotion],
      revertOnUpdate: true,
    },
  )

  const requestClose = contextSafe(() => {
    if (closingRef.current) return
    if (reducedMotion || !rootRef.current) {
      onClose()
      return
    }

    closingRef.current = true
    gsap.timeline({ onComplete: onClose })
      .to(
        rootRef.current.querySelectorAll('.dc-dossier-layout, .dc-dossier-header'),
        { autoAlpha: 0, y: -10, duration: 0.2, ease: 'power2.in' },
        0,
      )
      .to(
        rootRef.current,
        {
          clipPath: 'inset(49% 5% 49% 5%)',
          autoAlpha: 0,
          duration: 0.38,
          ease: 'power4.inOut',
        },
        0.12,
      )
  })

  useEffect(() => {
    if (!work) return
    setActiveTab('overview')
    setMediaIndex(0)
    previousFocus.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.requestAnimationFrame(() => closeButtonRef.current?.focus())

    return () => {
      document.body.style.overflow = previousOverflow
      previousFocus.current?.focus()
    }
  }, [work])

  useEffect(() => {
    if (!work) return
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') requestClose()
      if (activeTab === 'media' && event.key === 'ArrowRight') {
        setMediaIndex((current) => (current + 1) % work.media.length)
      }
      if (activeTab === 'media' && event.key === 'ArrowLeft') {
        setMediaIndex((current) => (current - 1 + work.media.length) % work.media.length)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, requestClose, work])

  if (!work) return null

  const activeMedia = work.media[mediaIndex] ?? work.media[0]
  const archiveCode = getArchiveCode(work, workIndex)
  const sha = formatSha(work.download?.sha256)

  const moveMedia = (offset: number) => {
    if (!work.media.length) return
    setMediaIndex((current) => (current + offset + work.media.length) % work.media.length)
  }

  return (
    <div className="dc-dossier" role="dialog" aria-modal="true" aria-labelledby="dossier-title" ref={rootRef}>
      <div className="dc-dossier-noise" aria-hidden="true" />
      <header className="dc-dossier-header">
        <div className="dc-dossier-id">
          <span>{archiveCode}</span>
          <strong>{getKindLabel(work)}</strong>
        </div>
        <div className="dc-dossier-header-title">
          <span>OPEN FILE</span>
          <strong>{work.shortTitle ?? work.title}</strong>
        </div>
        <button ref={closeButtonRef} type="button" onClick={requestClose} aria-label="关闭项目档案">
          <span>ESC</span><X size={18} />
        </button>
      </header>

      <div className="dc-dossier-layout">
        <section className="dc-dossier-visual">
          <div className="dc-dossier-media-frame" key={`${work.id}-${mediaIndex}`}>
            {activeMedia?.type === 'video' ? (
              <video src={activeMedia.src} poster={activeMedia.poster} controls />
            ) : (
              <SafeImage
                sources={getWorkImageSources(work, mediaIndex)}
                alt={activeMedia?.caption ?? `${work.title} 项目画面`}
                fallbackLabel={work.shortTitle ?? work.title}
                eager
              />
            )}
            <span className="dc-media-scan" aria-hidden="true" />
            <div className="dc-dossier-media-status">
              <span>MEDIA {String(mediaIndex + 1).padStart(2, '0')} / {String(work.media.length).padStart(2, '0')}</span>
              <strong>{activeMedia?.type === 'video' ? 'VIDEO SOURCE' : 'IMAGE SOURCE'}</strong>
            </div>
          </div>

          {work.media.length > 1 ? (
            <div className="dc-dossier-media-controls">
              <button type="button" onClick={() => moveMedia(-1)}><ArrowLeft size={16} />PREV</button>
              <div>
                {work.media.map((item, index) => (
                  <button
                    className={index === mediaIndex ? 'active' : ''}
                    type="button"
                    key={`${item.src}-${index}`}
                    onClick={() => setMediaIndex(index)}
                    aria-label={`查看媒体 ${index + 1}`}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => moveMedia(1)}>NEXT<ArrowRight size={16} /></button>
            </div>
          ) : null}

          <p className="dc-dossier-caption">{activeMedia?.caption ?? work.archiveSummary ?? work.summary}</p>
        </section>

        <section className="dc-dossier-console">
          <div className="dc-dossier-title-block">
            <p>{work.scenePreset?.toUpperCase()} / {archiveCode}</p>
            <h2 id="dossier-title">{work.title}</h2>
            <strong>{work.designQuestion}</strong>
          </div>

          <div className="dc-dossier-tabs" role="tablist" aria-label="项目档案频道">
            {tabs.map((tab) => {
              const Icon = tabMeta[tab].icon
              return (
                <button
                  className={tab === activeTab ? 'active' : ''}
                  type="button"
                  role="tab"
                  aria-selected={tab === activeTab}
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                >
                  <Icon size={14} />{tabMeta[tab].label}
                </button>
              )
            })}
          </div>

          <div className="dc-dossier-channel" key={`${work.id}-${activeTab}`}>
            {activeTab === 'overview' ? (
              <div className="dc-overview-channel">
                <p className="dc-channel-lead">{work.summary}</p>
                <dl className="dc-dossier-meta">
                  <div><dt>职责</dt><dd>{work.role}</dd></div>
                  <div><dt>引擎 / 工具</dt><dd>{work.engine ?? '设计档案'}</dd></div>
                  <div><dt>时间</dt><dd>{work.period ?? '2026'}</dd></div>
                  <div><dt>状态</dt><dd>{work.download ? '文件可用' : '记录已索引'}</dd></div>
                </dl>
                {work.proof?.length ? (
                  <div className="dc-proof-strip">
                    {work.proof.map((item) => (
                      <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>
                    ))}
                  </div>
                ) : null}
                <div className="dc-dossier-tags">
                  {work.skills.map((skill) => <span key={skill}>{skill}</span>)}
                </div>
              </div>
            ) : null}

            {activeTab === 'media' ? (
              <div className="dc-media-channel">
                <div className="dc-channel-heading"><Images size={17} /><span>MEDIA TRACK</span><strong>{work.media.length}</strong></div>
                <p>{activeMedia?.caption ?? work.archiveSummary}</p>
                <div className="dc-media-thumbnails">
                  {work.media.map((media, index) => (
                    <button
                      className={index === mediaIndex ? 'active' : ''}
                      type="button"
                      key={`${media.src}-thumb`}
                      onClick={() => setMediaIndex(index)}
                    >
                      <SafeImage
                        sources={[media.poster ?? media.src]}
                        alt=""
                        fallbackLabel={String(index + 1).padStart(2, '0')}
                      />
                      <span>{String(index + 1).padStart(2, '0')}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === 'design' ? (
              <div className="dc-design-channel">
                {work.flow?.length ? (
                  <div className="dc-flow-track">
                    {work.flow.map((step, index) => (
                      <div key={step}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step}</strong></div>
                    ))}
                  </div>
                ) : null}

                {work.id === 'parry-arena' ? (
                  <div className="dc-parry-rules">
                    {parryRules.map((rule) => {
                      const Icon = rule.icon
                      return <article key={rule.title}><Icon size={17} /><strong>{rule.title}</strong><p>{rule.body}</p></article>
                    })}
                  </div>
                ) : null}

                <div className="dc-highlight-list">
                  {(work.designHighlights ?? []).map((item, index) => (
                    <article key={item.title}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <div><strong>{item.title}</strong><p>{item.body}</p></div>
                    </article>
                  ))}
                </div>

                <div className="dc-contribution-list">
                  <p className="dc-panel-kicker">EXECUTION LOG</p>
                  {work.contribution.map((item) => <div key={item}><Check size={14} /><span>{item}</span></div>)}
                </div>
              </div>
            ) : null}

            {activeTab === 'build' && work.download ? (
              <div className="dc-build-channel">
                <PackageCheck size={34} />
                <p className="dc-panel-kicker">PACKAGE READY</p>
                <h3>{getDownloadLabel(work)}</h3>
                <dl>
                  <div><dt>VERSION</dt><dd>{work.download.version}</dd></div>
                  <div><dt>SIZE</dt><dd>{work.download.size ?? '未标注'}</dd></div>
                  {sha ? <div><dt>SHA-256</dt><dd><code>{sha}</code></dd></div> : null}
                </dl>
                <a className="dc-primary-button" href={work.download.url} download>
                  <Download size={17} />下载文件<ArrowRight size={15} />
                </a>
              </div>
            ) : null}

            {activeTab === 'links' && work.links?.length ? (
              <div className="dc-links-channel">
                <div className="dc-channel-heading"><FolderOpen size={17} /><span>EXTERNAL SIGNALS</span><strong>{work.links.length}</strong></div>
                {work.links.map((item, index) => (
                  <a href={item.url} target="_blank" rel="noreferrer" key={item.label}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div><FileText size={16} /><strong>{item.label}</strong></div>
                    <ExternalLink size={15} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}

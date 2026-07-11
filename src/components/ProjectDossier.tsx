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
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  const tabs = useMemo(() => {
    const next: DossierTab[] = ['overview']
    if (work?.media.length) next.push('media')
    next.push('design')
    if (work?.download) next.push('build')
    if (work?.links?.length) next.push('links')
    return next
  }, [work])

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
      if (event.key === 'Escape') onClose()
      if (activeTab === 'media' && event.key === 'ArrowRight') {
        setMediaIndex((current) => (current + 1) % work.media.length)
      }
      if (activeTab === 'media' && event.key === 'ArrowLeft') {
        setMediaIndex((current) => (current - 1 + work.media.length) % work.media.length)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, onClose, work])

  if (!work) return null

  const activeMedia = work.media[mediaIndex] ?? work.media[0]
  const archiveCode = getArchiveCode(work, workIndex)
  const sha = formatSha(work.download?.sha256)

  const moveMedia = (offset: number) => {
    if (!work.media.length) return
    setMediaIndex((current) => (current + offset + work.media.length) % work.media.length)
  }

  return (
    <div className="dc-dossier" role="dialog" aria-modal="true" aria-labelledby="dossier-title">
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
        <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="关闭项目档案">
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

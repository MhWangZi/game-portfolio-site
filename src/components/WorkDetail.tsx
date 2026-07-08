import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import {
  ExternalLink,
  FileDown,
  FileText,
  Link,
  PackageCheck,
  Shield,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from 'lucide-react'
import type { WorkItem } from '../types'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type WorkDetailProps = {
  work: WorkItem
}

const parryMechanics = [
  {
    title: '普通格挡',
    body: '稳定防守，但消耗体力；用于承接常规压力。',
    icon: Shield,
  },
  {
    title: '完美弹反',
    body: '窗口严格，收益更高；把防守转换成主要进攻来源。',
    icon: Sparkles,
  },
  {
    title: '闪避',
    body: '处理 Boss 冲撞和危险站位，避免弹反成为万能解。',
    icon: TimerReset,
  },
]

function formatSha(sha?: string) {
  return sha ? `${sha.slice(0, 12)}...${sha.slice(-8)}` : '未提供校验值'
}

function getLinkClass(label: string) {
  if (/bilibili|视频/i.test(label)) return 'video-link'
  if (/gamejam|活动/i.test(label)) return 'event-link'
  if (/github|仓库/i.test(label)) return 'github-link'
  return 'doc-link'
}

export function WorkDetail({ work }: WorkDetailProps) {
  const detailRef = useRef<HTMLElement | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const mainMedia = work.media[0]
  const mechanicCards = work.id === 'parry-arena' ? parryMechanics : []
  const isPrototype = work.kind === 'Playable Prototype'
  const evidenceMode = work.kind === 'Playable Prototype' ? 'PLAYABLE VALIDATION' : 'SYSTEM ANALYSIS'
  const downloadTitle = isPrototype ? 'Windows 试玩包 / 项目文件包' : 'Word 拆解文档 / 分析报告'
  const downloadFallback = isPrototype
    ? '当前提供截图、视频或拆解图；构建包后续补充。'
    : '当前提供截图或拆解图；完整 Word 文档后续补充。'
  const downloadReadout = isPrototype ? '可下载构建包' : '可下载 Word 文档'
  const downloadButtonLabel = isPrototype ? '下载文件' : '下载文档'

  useLayoutEffect(() => {
    if (reducedMotion || !detailRef.current) return
    gsap.fromTo(
      detailRef.current.querySelectorAll('[data-detail-animate]'),
      { autoAlpha: 0, y: 22, scale: 0.985 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.48, stagger: 0.06, ease: 'power3.out' },
    )
  }, [reducedMotion, work.id])

  return (
    <section className="work-detail module-screen" id="work-detail" ref={detailRef}>
      <div className="detail-showcase" data-detail-animate>
        <div className="detail-media">
          {mainMedia?.type === 'video' ? (
            <video src={mainMedia.src} poster={mainMedia.poster} controls />
          ) : (
            <img src={mainMedia?.src ?? './media/portfolio/anchored-gaze.webp'} alt={`${work.title} preview`} />
          )}
          <p>{mainMedia?.caption ?? '作品截图、录屏或网页试玩入口待补充。'}</p>
        </div>

        {work.flow?.length ? (
          <div className="detail-flow" aria-label={`${work.title} design flow`}>
            <div className="detail-subhead">
              <span>MECHANIC LOOP</span>
              <strong>机制流程</strong>
            </div>
            <div className="flow-strip detail-flow-strip">
              {work.flow.map((step, index) => (
                <span key={step}>
                  <em>{String(index + 1).padStart(2, '0')}</em>
                  {step}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {mechanicCards.length ? (
          <div className="mechanic-rule-grid" aria-label="Parry Arena mechanic rules">
            {mechanicCards.map((item) => {
              const Icon = item.icon
              return (
                <article key={item.title}>
                  <Icon size={18} />
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              )
            })}
          </div>
        ) : null}

        {work.proof?.length ? (
          <div className="proof-grid">
            {work.proof.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        ) : null}

        <div className="detail-terminal-card">
          <div className="terminal-topline">
            <span>{evidenceMode}</span>
            <strong>{work.download ? (isPrototype ? 'BUILD ONLINE' : 'DOCX READY') : 'REPORT INDEXED'}</strong>
          </div>
          <div className="terminal-focus">
            <span>FOCUS</span>
            <strong>{work.oneLine ?? work.summary}</strong>
          </div>
          <div className="terminal-bars" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="terminal-readout">
            <span>证据入口</span>
            <span>{work.media[0]?.type === 'video' ? '演示视频' : '截图 / 表格'}</span>
            <span>{work.download ? downloadReadout : '拆解档案'}</span>
          </div>
        </div>
      </div>

      <div className="detail-copy" id={work.id} data-detail-animate>
        <div className="detail-title-block">
          <p className="eyebrow">OPEN FILE / {work.kind ?? 'Portfolio Case'}</p>
          <h2>{work.title}</h2>
          <p className="detail-summary">{work.summary}</p>
        </div>

        <div className="meta-grid">
          <div>
            <span>职责</span>
            <strong>{work.role}</strong>
          </div>
          <div>
            <span>引擎 / 工具</span>
            <strong>{work.engine ?? '待补充'}</strong>
          </div>
          <div>
            <span>时间</span>
            <strong>{work.period ?? '待补充'}</strong>
          </div>
          <div>
            <span>视觉主题</span>
            <strong>{work.visualTheme ?? 'particles'}</strong>
          </div>
        </div>

        <div className="highlight-block">
          <div className="detail-subhead">
            <span>DESIGN EVIDENCE</span>
            <strong>设计亮点</strong>
          </div>
          <div className="highlight-grid">
            {(work.designHighlights ?? []).map((item) => (
              <article key={item.title}>
                <ShieldCheck size={16} />
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="contribution-block">
          <div className="detail-subhead">
            <span>MY WORK</span>
            <strong>我负责 / 可证明的部分</strong>
          </div>
          <ul>
            {work.contribution.map((item) => (
              <li key={item}>
                <ShieldCheck size={16} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="tag-row detail-tags">
          {work.skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>

        <div className={work.download ? 'download-box available' : 'download-box'}>
          <div>
            {work.download && isPrototype ? <PackageCheck size={20} /> : <FileText size={20} />}
            <div>
              <strong>{work.download ? downloadTitle : '暂未公开下载包'}</strong>
              <span>
                {work.download
                  ? `${work.download.version} / ${work.download.size ?? '文件大小待补充'}`
                  : downloadFallback}
              </span>
              {work.download?.sha256 ? <code>SHA-256 {formatSha(work.download.sha256)}</code> : null}
            </div>
          </div>
          {work.download ? (
            <a href={work.download.url} download>
              <FileDown size={16} />
              {downloadButtonLabel}
            </a>
          ) : null}
        </div>

        {work.links?.length ? (
          <div className="link-row">
            {work.links.map((link) => (
              <a className={getLinkClass(link.label)} href={link.url} key={link.label} target="_blank" rel="noreferrer">
                <Link size={14} />
                {link.label}
                <ExternalLink size={14} />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

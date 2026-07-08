import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ExternalLink, FileDown, FileText, Link, PackageCheck, ShieldCheck } from 'lucide-react'
import type { WorkItem } from '../types'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type WorkDetailProps = {
  work: WorkItem
}

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

  useLayoutEffect(() => {
    if (reducedMotion || !detailRef.current) return
    gsap.fromTo(
      detailRef.current.querySelectorAll('[data-detail-animate]'),
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.055, ease: 'power2.out' },
    )
  }, [reducedMotion, work.id])

  return (
    <section className="work-detail" id="work-detail" ref={detailRef}>
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
            <div className="flow-strip">
              {work.flow.map((step) => (
                <span key={step}>{step}</span>
              ))}
            </div>
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
            <span>Design Highlights</span>
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
            <span>My Work</span>
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
            {work.download ? <PackageCheck size={20} /> : <FileText size={20} />}
            <div>
              <strong>{work.download ? '可下载试玩 / 文件包' : '暂未公开下载包'}</strong>
              <span>
                {work.download
                  ? `${work.download.version} / ${work.download.size ?? '待补充大小'}`
                  : '当前提供截图、视频或拆解图；构建包后续补充'}
              </span>
              {work.download?.sha256 ? <code>SHA-256 {formatSha(work.download.sha256)}</code> : null}
            </div>
          </div>
          {work.download ? (
            <a href={work.download.url} download>
              <FileDown size={16} />
              下载文件
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

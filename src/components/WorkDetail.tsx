import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { Download, ExternalLink, FileText, ShieldCheck } from 'lucide-react'
import type { WorkItem } from '../types'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type WorkDetailProps = {
  work: WorkItem
}

export function WorkDetail({ work }: WorkDetailProps) {
  const detailRef = useRef<HTMLElement | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const mainMedia = work.media[0]

  useLayoutEffect(() => {
    if (reducedMotion || !detailRef.current) return
    gsap.fromTo(
      detailRef.current.querySelectorAll('[data-detail-animate]'),
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.05, ease: 'power2.out' },
    )
  }, [reducedMotion, work.id])

  return (
    <section className="work-detail" id="work-detail" ref={detailRef}>
      <div className="detail-media" data-detail-animate>
        {mainMedia?.type === 'video' ? (
          <video src={mainMedia.src} poster={mainMedia.poster} controls />
        ) : (
          <img src={mainMedia?.src ?? './media/portfolio/anchored-gaze.webp'} alt={`${work.title} preview`} />
        )}
        <p>{mainMedia?.caption ?? '作品截图、录屏或网页试玩入口待补充。'}</p>
      </div>

      <div className="detail-copy" id={work.id} data-detail-animate>
        <p className="eyebrow">Selected work</p>
        <h2>{work.title}</h2>
        <p className="detail-summary">{work.summary}</p>

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

        <div className="contribution-block">
          <h3>我负责 / 可证明的部分</h3>
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

        <div className="download-box">
          <div>
            <FileText size={18} />
            <div>
              <strong>下载 / 试玩文件</strong>
              <span>
                {work.download
                  ? `${work.download.version} / ${work.download.size ?? '待补充大小'}`
                  : '该作品暂未提供下载包'}
              </span>
            </div>
          </div>
          {work.download ? (
            <a href={work.download.url} download>
              <Download size={16} />
              下载文件
            </a>
          ) : null}
        </div>

        {work.links?.length ? (
          <div className="link-row">
            {work.links.map((link) => (
              <a href={link.url} key={link.label} target="_blank" rel="noreferrer">
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

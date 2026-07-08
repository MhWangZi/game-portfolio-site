import { ArrowRight, Download, FileText, ShieldCheck } from 'lucide-react'
import type { WorkItem } from '../types'

type FeaturedProjectProps = {
  work: WorkItem
  onSelect: (id: string) => void
}

export function FeaturedProject({ work, onSelect }: FeaturedProjectProps) {
  return (
    <section className="featured-section" id="featured">
      <div className="section-heading featured-heading">
        <p className="eyebrow">SYSTEM FILE / FEATURED BUILD</p>
        <h2>重点原型档案</h2>
        <p>这里放最能代表当前方向的可运行项目：先看核心循环，再看操作分工、机制限制和构建包。</p>
      </div>

      <article className="featured-card">
        <div className="featured-media">
          <img src={work.media[0]?.src} alt={`${work.title} preview`} />
          <div className="media-caption">
            <FileText size={16} />
            <span>{work.media[0]?.caption}</span>
          </div>
        </div>

        <div className="featured-copy">
          <div className="archive-kicker">
            <span className="status-chip">
              <i />
              {work.kind}
            </span>
            <span>{work.engine}</span>
          </div>
          <h3>{work.title}</h3>
          <p>{work.oneLine ?? work.summary}</p>

          {work.flow?.length ? (
            <div className="flow-strip" aria-label="Featured project flow">
              {work.flow.map((step) => (
                <span key={step}>{step}</span>
              ))}
            </div>
          ) : null}

          <div className="featured-rules">
            {work.designHighlights?.slice(0, 3).map((item) => (
              <div key={item.title}>
                <ShieldCheck size={16} />
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </div>
            ))}
          </div>

          <div className="featured-actions">
            <button type="button" className="primary-action" onClick={() => onSelect(work.id)}>
              查看完整详情
              <ArrowRight size={16} />
            </button>
            {work.download ? (
              <a className="secondary-action strong" href={work.download.url} download>
                <Download size={16} />
                下载 Windows Build
              </a>
            ) : null}
          </div>
        </div>
      </article>
    </section>
  )
}

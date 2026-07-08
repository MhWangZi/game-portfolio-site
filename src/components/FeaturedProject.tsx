import { ArrowRight, Download, FileText, ShieldCheck, Swords } from 'lucide-react'
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
        <h2>代表原型档案</h2>
        <p>
          先展示最能说明当前方向的可运行项目：核心循环、操作分工、机制限制和构建包放在同一张档案里，
          方便快速判断设计是否真的落地。
        </p>
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
            <div className="flow-strip featured-flow" aria-label="Featured project flow">
              {work.flow.map((step, index) => (
                <span key={step}>
                  <em>{String(index + 1).padStart(2, '0')}</em>
                  {step}
                </span>
              ))}
            </div>
          ) : null}

          <div className="featured-rules">
            {(work.designHighlights ?? []).slice(0, 3).map((item) => (
              <div key={item.title}>
                <ShieldCheck size={16} />
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </div>
            ))}
          </div>

          <div className="featured-build-card">
            <Swords size={18} />
            <div>
              <strong>Playable Build</strong>
              <span>{work.download ? `${work.download.version} / ${work.download.size ?? '文件大小待补充'}` : '当前展示截图与设计证据'}</span>
            </div>
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

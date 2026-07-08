import { ArrowRight, Download, FileText, Lightbulb, Swords } from 'lucide-react'
import type { WorkItem } from '../types'

type FeaturedProjectProps = {
  work: WorkItem
  onSelect: (id: string) => void
}

export function FeaturedProject({ work, onSelect }: FeaturedProjectProps) {
  return (
    <section className="featured-section personal-section" id="featured">
      <div className="section-heading featured-heading">
        <p className="eyebrow">RECENT / PROTOTYPE</p>
        <h2>最近在调的一个原型</h2>
        <p>
          我会把一个想法先做成能玩的版本，再回头看节奏、反馈和规则边界。这个区域放的是目前最适合直接体验的项目。
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

          <div className="learning-card">
            <Lightbulb size={18} />
            <div>
              <strong>我为什么做它</strong>
              <span>
                想验证防守、反击和成长选择能不能组成一个短局循环，而不是只靠数值堆强度。
              </span>
            </div>
          </div>

          <div className="featured-build-card">
            <Swords size={18} />
            <div>
              <strong>现在可以看到什么</strong>
              <span>{work.download ? `${work.download.version} / ${work.download.size ?? '文件大小待补充'}` : '截图、拆解图和设计记录'}</span>
            </div>
          </div>

          <div className="featured-actions">
            <button type="button" className="primary-action" onClick={() => onSelect(work.id)}>
              打开项目记录
              <ArrowRight size={16} />
            </button>
            {work.download ? (
              <a className="secondary-action strong" href={work.download.url} download>
                <Download size={16} />
                下载试玩
              </a>
            ) : null}
          </div>
        </div>
      </article>
    </section>
  )
}

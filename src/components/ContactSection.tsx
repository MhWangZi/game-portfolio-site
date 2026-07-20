import { ArrowUp, ArrowUpRight, Code, FileKey2, Mail, Radio, Send, Video } from 'lucide-react'
import { contactItems } from '../data/siteContent'

type ContactSectionProps = {
  onBackToTop: () => void
  onOpenRecent: () => void
  recoveryAvailable: boolean
  recoveryCompleted: boolean
}

const contactIcons = {
  mail: Mail,
  code: Code,
  video: Video,
  radio: Radio,
}

export function ContactSection({
  onBackToTop,
  onOpenRecent,
  recoveryAvailable,
  recoveryCompleted,
}: ContactSectionProps) {
  return (
    <section className="dc-chapter dc-contact" id="contact" data-chapter>
      <div className="dc-contact-copy" data-reveal>
        <p className="dc-panel-kicker"><Send size={16} />06 / SIGNAL OUT</p>
        <h2>保持联系</h2>
        <p>游戏设计、原型制作、像素风项目与工具开发交流。</p>

        <div className="dc-contact-status">
          <div><span>RECENT BUILD</span><strong>HD2DKIT / V1.76</strong></div>
          <div><span>SIGNAL</span><strong>ONLINE / UTC+8</strong></div>
          <div><span>CHANNELS</span><strong>04 AVAILABLE</strong></div>
        </div>

        <div className="dc-contact-actions">
          <button className="dc-secondary-button" type="button" onClick={onOpenRecent}>
            最近项目<ArrowUpRight size={15} />
          </button>
          <button className="dc-secondary-button" type="button" onClick={onBackToTop}>
            返回顶部<ArrowUp size={15} />
          </button>
        </div>
      </div>

      <div className="dc-contact-grid" data-reveal-media>
        {contactItems.map((item, index) => {
          const Icon = contactIcons[item.kind]
          return (
            <a
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noreferrer' : undefined}
              key={item.label}
            >
              <span className="dc-contact-index">0{index + 1}</span>
              <Icon size={20} />
              <div><span>{item.label}</span><strong>{item.value}</strong></div>
              {item.external ? <ArrowUpRight size={15} /> : null}
            </a>
          )
        })}
      </div>

      <div
        className={`index-zero-recovery-gate ${recoveryAvailable ? 'is-available' : ''}`}
        data-testid="recovery-gate"
      >
        <div className="index-zero-gate-redaction" aria-hidden="true">
          <i /><i />
          <span>ENTRY / ███████████</span>
        </div>
        {recoveryAvailable ? (
          <a href="#/recovery" className="index-zero-recovery-link">
            <FileKey2 size={15} />
            [OPEN RECOVERY INTERFACE]
            <ArrowUpRight size={14} />
          </a>
        ) : (
          <span className="index-zero-gate-locked system-label" aria-hidden="true">
            UNREGISTERED ENTRY / INCOMPLETE
          </span>
        )}
      </div>

      <footer className="dc-contact-footer">
        <span>DESIGN ARCHIVE / GAME DESIGN NOTES</span>
        <span>2026 / CONTINUOUS LOG</span>
        {recoveryCompleted ? <span className="index-zero-memory-note">当前页面暂存本次阅读；刷新后清除。</span> : null}
      </footer>
    </section>
  )
}

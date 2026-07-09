import { ArrowDown, Code, Database, Download, ExternalLink, Play, TerminalSquare } from 'lucide-react'
import type { WorkItem } from '../types'

type HeroProps = {
  workCount: number
  downloadableCount: number
  featuredWork: WorkItem
  onPrimaryAction: () => void
}

const posterLinks = [
  { index: '01', label: 'FOCUS', caption: '设计命题', href: '#about' },
  { index: '02', label: 'LOGS', caption: '原型迭代', href: '#projects' },
  { index: '03', label: 'NOTES', caption: '设计笔记', href: '#notes' },
  { index: '04', label: 'PROCESS', caption: '设计方法', href: '#process' },
  { index: '05', label: 'CONTACT', caption: '保持联系', href: '#contact' },
]

export function Hero({ workCount, downloadableCount, featuredWork, onPrimaryAction }: HeroProps) {
  const featuredIsTooling = featuredWork.kind === 'Tooling Project'
  const featuredIsSystem = featuredWork.kind === 'System Analysis'
  const miniDownloadLabel = featuredIsTooling ? '插件包' : featuredIsSystem ? '文档' : '可下载'

  return (
    <section className="hero-section module-screen personal-hero" id="top">
      <div className="hero-copy" data-hero-block>
        <p className="hero-kicker">GAME DESIGN NOTES / PROTOTYPE LOG</p>
        <h1>玩法原型与系统记录</h1>
        <p className="hero-subtitle">从规则、节奏到反馈，记录一个设计想法被验证、修正、成形的过程。</p>
        <p className="hero-summary">
          收录可运行的小原型、系统拆解、设计笔记与项目复盘。每个条目都围绕一个具体问题展开：
          规则是否清晰，反馈是否有效，玩家是否愿意继续投入。
        </p>

        <div className="signal-marquee" aria-hidden="true">
          <div>
            <span>PLAYABLE PROTOTYPE</span>
            <span>DESIGN NOTES</span>
            <span>SYSTEM LOOP</span>
            <span>PLAYER BEHAVIOR</span>
            <span>GAME DESIGN LOG</span>
            <span>PLAYABLE PROTOTYPE</span>
            <span>DESIGN NOTES</span>
          </div>
        </div>

        <div className="poster-nav personal-poster-nav" aria-label="Personal site quick navigation">
          {posterLinks.map((item) => (
            <a href={item.href} key={item.label}>
              <span>{item.index}</span>
              <strong>{item.label}</strong>
              <em>{item.caption}</em>
            </a>
          ))}
        </div>

        <div className="hero-actions">
          <button className="primary-action" type="button" onClick={onPrimaryAction}>
            <Play size={18} />
            进入设计记录
          </button>
          <a className="secondary-action strong" href="#projects">
            <ArrowDown size={18} />
            查看近期原型
          </a>
          <a className="secondary-action" href="#notes">
            <Code size={18} />
            阅读设计笔记
          </a>
        </div>
      </div>

      <aside className="hero-console" aria-label="Personal site status">
        <div className="console-card hero-panel">
          <div className="console-title">
            <TerminalSquare size={18} />
            <span>NOW / DOING</span>
          </div>
          <div className="panel-row">
            <span>记录方向</span>
            <strong>规则 / 节奏 / 反馈</strong>
          </div>
          <div className="panel-row">
            <span>设计条目</span>
            <strong>{workCount}</strong>
          </div>
          <div className="panel-row">
            <span>可下载入口</span>
            <strong>{downloadableCount}</strong>
          </div>
          <div className="panel-row">
            <span>长期命题</span>
            <strong>原型验证 / 系统拆解 / 玩家选择</strong>
          </div>
          <div className="hero-panel-links">
            <a href="#notes">
              查看近期原型
              <ArrowDown size={14} />
            </a>
            <a href="https://github.com/MhWangZi/game-portfolio-site" target="_blank" rel="noreferrer">
              GitHub
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        <div className="console-card hero-feature-mini">
          <div className="console-card-top">
            <p className="eyebrow">RECENT PROJECT</p>
            <span className="status-chip">
              <i />
              {featuredWork.kind}
            </span>
          </div>
          <img src={featuredWork.media[0]?.src} alt={`${featuredWork.title} cover`} />
          <div>
            <h2>{featuredWork.title}</h2>
            <p>{featuredWork.oneLine ?? featuredWork.summary}</p>
          </div>
          <div className="mini-spec-grid">
            <span>
              <Database size={14} />
              {featuredWork.engine}
            </span>
            <span>
              <Download size={14} />
              {featuredWork.download ? miniDownloadLabel : '观察记录'}
            </span>
          </div>
        </div>
      </aside>
    </section>
  )
}

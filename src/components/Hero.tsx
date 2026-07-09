import { ArrowDown, Code, Database, Download, ExternalLink, Play, TerminalSquare } from 'lucide-react'
import type { WorkItem } from '../types'

type HeroProps = {
  workCount: number
  downloadableCount: number
  featuredWork: WorkItem
  onPrimaryAction: () => void
}

const posterLinks = [
  { index: '01', label: 'FOCUS', caption: '当前关注', href: '#about' },
  { index: '02', label: 'ARCHIVE', caption: '设计档案', href: '#featured' },
  { index: '03', label: 'LOGS', caption: '近期迭代', href: '#projects' },
  { index: '04', label: 'NOTES', caption: '设计笔记', href: '#notes' },
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
        <p className="hero-subtitle">围绕机制、节奏与反馈展开的长期设计条目。</p>
        <p className="hero-summary">收录可玩版本、系统分析、设计笔记与近期迭代。</p>

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
            进入档案
          </button>
          <a className="secondary-action strong" href="#projects">
            <ArrowDown size={18} />
            查看近期版本
          </a>
          <a className="secondary-action" href="#notes">
            <Code size={18} />
            阅读笔记
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
            <span>方向</span>
            <strong>机制 / 节奏 / 反馈</strong>
          </div>
          <div className="panel-row">
            <span>条目</span>
            <strong>{workCount}</strong>
          </div>
          <div className="panel-row">
            <span>下载</span>
            <strong>{downloadableCount}</strong>
          </div>
          <div className="panel-row">
            <span>命题</span>
            <strong>原型 / 系统 / 行为</strong>
          </div>
          <div className="hero-panel-links">
            <a href="#notes">
              近期版本
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
              {featuredWork.download ? miniDownloadLabel : '观察'}
            </span>
          </div>
        </div>
      </aside>
    </section>
  )
}

import { ArrowDown, Code, Database, Download, ExternalLink, Play, TerminalSquare } from 'lucide-react'
import type { WorkItem } from '../types'

type HeroProps = {
  workCount: number
  downloadableCount: number
  featuredWork: WorkItem
  onPrimaryAction: () => void
}

const posterLinks = [
  { index: '01', label: 'ABOUT', caption: '关于我', href: '#about' },
  { index: '02', label: 'PROJECTS', caption: '近期项目', href: '#projects' },
  { index: '03', label: 'NOTES', caption: '设计笔记', href: '#notes' },
  { index: '04', label: 'PROCESS', caption: '设计方法', href: '#process' },
  { index: '05', label: 'CONTACT', caption: '保持联系', href: '#contact' },
]

export function Hero({ workCount, downloadableCount, featuredWork, onPrimaryAction }: HeroProps) {
  const heroDownload = featuredWork.download?.url ?? './downloads/static-signal-web-package.zip'

  return (
    <section className="hero-section module-screen personal-hero" id="top">
      <div className="hero-copy" data-hero-block>
        <p className="hero-kicker">YANG YUQI / GAME DESIGNER</p>
        <h1>游戏设计与原型记录</h1>
        <p className="hero-subtitle">关于规则、系统与玩家体验的个人笔记</p>
        <p className="hero-summary">
          我关注玩法规则、系统结构与玩家行为，也会把自己的设计想法做成可运行的小原型。
          这里记录近期项目、拆解观察和一些还在迭代中的设计想法。
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
            看近期项目
          </button>
          <a className="secondary-action strong" href={heroDownload} download>
            <Download size={18} />
            下载可玩原型
          </a>
          <a
            className="secondary-action"
            href="https://github.com/MhWangZi/game-portfolio-site"
            target="_blank"
            rel="noreferrer"
          >
            <Code size={18} />
            GitHub
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
            <strong>游戏设计 / 原型 / 拆解</strong>
          </div>
          <div className="panel-row">
            <span>近期项目</span>
            <strong>{workCount}</strong>
          </div>
          <div className="panel-row">
            <span>可下载原型</span>
            <strong>{downloadableCount}</strong>
          </div>
          <div className="panel-row">
            <span>最近在看</span>
            <strong>战斗节奏 / 经济循环 / 叙事规则</strong>
          </div>
          <div className="hero-panel-links">
            <a href="#notes">
              设计笔记
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
            <p className="eyebrow">RECENT PROTOTYPE</p>
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
              {featuredWork.download ? '可下载' : '观察记录'}
            </span>
          </div>
        </div>
      </aside>
    </section>
  )
}

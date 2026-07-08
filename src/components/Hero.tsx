import { ArrowDown, Code, Database, Download, ExternalLink, Play, TerminalSquare } from 'lucide-react'
import type { WorkItem } from '../types'

type HeroProps = {
  workCount: number
  downloadableCount: number
  featuredWork: WorkItem
  onPrimaryAction: () => void
}

const posterLinks = [
  { index: '01', label: 'PLAYABLE', caption: '可玩原型', href: '#works' },
  { index: '02', label: 'SYSTEM', caption: '系统拆解', href: '#works' },
  { index: '03', label: 'EVIDENCE', caption: '能力证据', href: '#abilities' },
  { index: '04', label: 'BUILDS', caption: '下载包', href: '#work-detail' },
]

export function Hero({ workCount, downloadableCount, featuredWork, onPrimaryAction }: HeroProps) {
  const heroDownload = featuredWork.download?.url ?? './downloads/static-signal-web-package.zip'

  return (
    <section className="hero-section" id="top">
      <div className="hero-copy" data-hero-block>
        <p className="eyebrow">BOOT_SEQUENCE / GAME_DESIGN_ARCHIVE</p>
        <h1>杨毓琦｜游戏策划实习作品集</h1>
        <p className="hero-subtitle">把玩法规则拆成可验证原型，把系统分析整理成清晰判断。</p>
        <p className="hero-summary">
          这里集中展示我能落地的可玩原型、能复查的系统拆解、竞品分析和长期玩家经验。重点不是堆截图，
          而是让招聘方快速看到：我做了什么，为什么这样做，证据在哪里。
        </p>

        <div className="poster-nav" aria-label="Archive quick navigation">
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
            查看作品档案
          </button>
          <a className="secondary-action strong" href={heroDownload} download>
            <Download size={18} />
            下载代表原型
          </a>
          <a
            className="secondary-action"
            href="https://github.com/MhWangZi/game-portfolio-site"
            target="_blank"
            rel="noreferrer"
          >
            <Code size={18} />
            GitHub 仓库
          </a>
        </div>

        <div className="boot-lines" aria-label="Archive boot status">
          <span>[01] 可运行原型已索引</span>
          <span>[02] 系统拆解报告已归档</span>
          <span>[03] 下载与外部证据入口在线</span>
        </div>
      </div>

      <aside className="hero-console" aria-label="Portfolio status">
        <div className="console-card hero-panel">
          <div className="console-title">
            <TerminalSquare size={18} />
            <span>STATUS PANEL</span>
          </div>
          <div className="panel-row">
            <span>作品数量</span>
            <strong>{workCount}</strong>
          </div>
          <div className="panel-row">
            <span>求职方向</span>
            <strong>游戏策划实习</strong>
          </div>
          <div className="panel-row">
            <span>核心能力</span>
            <strong>原型验证 / 系统拆解</strong>
          </div>
          <div className="panel-row">
            <span>代表原型</span>
            <strong>{featuredWork.title}</strong>
          </div>
          <div className="panel-row">
            <span>展示技术</span>
            <strong>React / Three.js / GSAP</strong>
          </div>
          <div className="panel-row">
            <span>可下载项目</span>
            <strong>{downloadableCount}</strong>
          </div>
          <div className="hero-panel-links">
            <a href="#abilities">
              能力矩阵
              <ArrowDown size={14} />
            </a>
            <a href="https://github.com/MhWangZi/game-portfolio-site" target="_blank" rel="noreferrer">
              仓库记录
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        <div className="console-card hero-feature-mini">
          <div className="console-card-top">
            <p className="eyebrow">FILE_01 / FEATURED BUILD</p>
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
              {featuredWork.download ? 'Windows Build' : 'Evidence Only'}
            </span>
          </div>
        </div>
      </aside>
    </section>
  )
}

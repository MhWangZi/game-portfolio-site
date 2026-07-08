import { ArrowDown, Code, Download, ExternalLink, Play } from 'lucide-react'
import type { WorkItem } from '../types'

type HeroProps = {
  workCount: number
  downloadableCount: number
  featuredWork: WorkItem
  onPrimaryAction: () => void
}

export function Hero({ workCount, downloadableCount, featuredWork, onPrimaryAction }: HeroProps) {
  const heroDownload = featuredWork.download?.url ?? './downloads/static-signal-web-package.zip'

  return (
    <section className="hero-section" id="top">
      <div className="hero-copy" data-hero-block>
        <p className="eyebrow">BOOT_SEQUENCE / GAME_DESIGN_ARCHIVE</p>
        <h1>杨毓琦｜游戏策划实习作品集</h1>
        <p className="hero-subtitle">可运行原型、机制拆解、构建包和设计判断放在同一套档案里。</p>
        <p className="hero-summary">
          我把每个作品拆成四件事：规则、玩家选择、机制取舍、可查看文件。先看能运行的版本，再看系统拆解，不用空泛形容词代替作品本身。
        </p>

        <div className="hero-pill-row" aria-label="Core position">
          <span>ROLE: 游戏策划实习</span>
          <span>FOCUS: 原型验证 / 系统拆解 / 战斗机制</span>
          <span>TOOLS: Godot / Web / JSON / 表格</span>
        </div>

        <div className="boot-lines" aria-label="Archive boot status">
          <span>[01] PLAYABLE BUILDS LOADED</span>
          <span>[02] SYSTEM REPORTS INDEXED</span>
          <span>[03] DOWNLOAD LINKS ONLINE</span>
        </div>

        <div className="hero-actions">
          <button className="primary-action" type="button" onClick={onPrimaryAction}>
            <Play size={18} />
            查看作品墙
          </button>
          <a className="secondary-action strong" href={heroDownload} download>
            <Download size={18} />
            下载试玩包
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
      </div>

      <aside className="hero-console" aria-label="Portfolio status">
        <div className="console-card hero-feature-mini">
          <div className="console-card-top">
            <p className="eyebrow">FILE_01 / FEATURED</p>
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
        </div>

        <div className="console-card hero-panel">
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
            <span>技术栈</span>
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
              项目仓库
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </aside>
    </section>
  )
}

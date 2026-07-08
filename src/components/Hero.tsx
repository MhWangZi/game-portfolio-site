import { ArrowDown, Download, ExternalLink, Play } from 'lucide-react'

type HeroProps = {
  workCount: number
  onPrimaryAction: () => void
}

export function Hero({ workCount, onPrimaryAction }: HeroProps) {
  return (
    <section className="hero-section" id="top">
      <div className="hero-copy">
        <p className="eyebrow">Yang Yuqi / Game system design portfolio</p>
        <h1>杨毓琦｜游戏策划实习作品集</h1>
        <p className="hero-summary">
          面向游戏策划实习投递：这里集中展示可玩原型、系统拆解、竞品分析和长期玩家经验。重点不是堆截图，而是让招聘方快速看到我如何把玩法规则拆成可验证原型，并把复杂系统拆成清晰的设计判断。
        </p>
        <div className="hero-actions">
          <button className="primary-action" type="button" onClick={onPrimaryAction}>
            <Play size={18} />
            查看作品墙
          </button>
          <a className="secondary-action" href="./downloads/static-signal-web-package.zip" download>
            <Download size={18} />
            下载静默信号网页包
          </a>
        </div>
      </div>

      <aside className="hero-panel" aria-label="Portfolio status">
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
          <strong>系统拆解 / 原型验证</strong>
        </div>
        <div className="panel-row">
          <span>代表原型</span>
          <strong>Anchored Gaze</strong>
        </div>
        <div className="panel-row">
          <span>展示技术</span>
          <strong>React / Three.js / GSAP</strong>
        </div>
        <div className="hero-panel-links">
          <a href="#abilities">
            能力矩阵
            <ArrowDown size={14} />
          </a>
          <a href="https://github.com/MhWangZi/game-portfolio-site" target="_blank" rel="noreferrer">
            GitHub 仓库
            <ExternalLink size={14} />
          </a>
        </div>
      </aside>
    </section>
  )
}

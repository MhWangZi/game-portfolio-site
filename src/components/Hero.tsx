import { ArrowDown, Download, ExternalLink, Play } from 'lucide-react'

type HeroProps = {
  workCount: number
  onPrimaryAction: () => void
}

export function Hero({ workCount, onPrimaryAction }: HeroProps) {
  return (
    <section className="hero-section" id="top">
      <div className="hero-copy">
        <p className="eyebrow">Game portfolio / playable evidence</p>
        <h1>把游戏作品、策划能力和可下载试玩包放在一个可公开访问的网站里。</h1>
        <p className="hero-summary">
          面向招聘与实习场景：作品不是简单堆图，而是把职责、设计判断、系统拆解、交互演示和 Windows 试玩包放在同一条浏览路径中。
        </p>
        <div className="hero-actions">
          <button className="primary-action" type="button" onClick={onPrimaryAction}>
            <Play size={18} />
            查看全部作品
          </button>
          <a className="secondary-action" href="./downloads/windows-demo-placeholder.zip" download>
            <Download size={18} />
            Windows 试玩包模板
          </a>
        </div>
      </div>

      <aside className="hero-panel" aria-label="Portfolio status">
        <div className="panel-row">
          <span>作品数量</span>
          <strong>{workCount}</strong>
        </div>
        <div className="panel-row">
          <span>试玩方式</span>
          <strong>视频 + EXE 下载</strong>
        </div>
        <div className="panel-row">
          <span>网页试玩</span>
          <strong>Web 导出后接入</strong>
        </div>
        <div className="panel-row">
          <span>展示层</span>
          <strong>Three.js / GSAP</strong>
        </div>
        <div className="hero-panel-links">
          <a href="#abilities">
            能力矩阵
            <ArrowDown size={14} />
          </a>
          <a href="https://github.com/" target="_blank" rel="noreferrer">
            替换 GitHub
            <ExternalLink size={14} />
          </a>
        </div>
      </aside>
    </section>
  )
}

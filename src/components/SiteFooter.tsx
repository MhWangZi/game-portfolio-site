import { Code, ExternalLink, Mail, MapPin, Video } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contact">
      <div>
        <p className="eyebrow">Contact / Game Design Internship</p>
        <h2>杨毓琦｜游戏策划实习</h2>
        <p>可提供可玩原型、系统拆解报告、竞品分析与下载包。欢迎通过邮箱联系查看更多文档或安排面试沟通。</p>
      </div>
      <div className="footer-actions">
        <a href="mailto:3159591298@qq.com">
          <Mail size={16} />
          3159591298@qq.com
        </a>
        <a href="https://github.com/MhWangZi/game-portfolio-site" target="_blank" rel="noreferrer">
          <Code size={16} />
          GitHub
          <ExternalLink size={13} />
        </a>
        <a href="https://www.bilibili.com/video/BV1maTC6REzh/" target="_blank" rel="noreferrer">
          <Video size={16} />
          演示视频
          <ExternalLink size={13} />
        </a>
        <a href="#top">
          <MapPin size={16} />
          回到顶部
        </a>
      </div>
    </footer>
  )
}

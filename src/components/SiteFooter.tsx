import { Code, ExternalLink, Mail, Radio, Video } from 'lucide-react'

const contactItems = [
  {
    icon: Mail,
    label: '邮箱',
    value: '3159591298@qq.com',
    href: 'mailto:3159591298@qq.com',
    external: false,
  },
  {
    icon: Code,
    label: 'GitHub',
    value: '项目代码与页面记录',
    href: 'https://github.com/MhWangZi/game-portfolio-site',
    external: true,
  },
  {
    icon: Video,
    label: 'Bilibili',
    value: '教程视频与更新',
    href: 'https://space.bilibili.com/94407611',
    external: true,
  },
  {
    icon: Radio,
    label: '抖音',
    value: '短视频与过程记录',
    href: 'https://v.douyin.com/KtkwFjtQ7G8/',
    external: true,
  },
]

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contact">
      <div className="footer-copy">
        <p className="eyebrow">CONTACT / SAY HELLO</p>
        <h2>保持联系</h2>
        <p>关于游戏设计、原型制作、像素风项目或实习机会，可以通过以下方式联系。</p>
      </div>
      <div className="contact-card-grid" aria-label="Contact links">
        {contactItems.map((item) => {
          const Icon = item.icon
          return (
            <a href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noreferrer' : undefined} key={item.label}>
              <Icon size={18} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              {item.external ? <ExternalLink size={13} /> : null}
            </a>
          )
        })}
      </div>
    </footer>
  )
}

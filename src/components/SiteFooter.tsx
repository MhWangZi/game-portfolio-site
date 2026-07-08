import { Code, ExternalLink, Mail, MapPin, Video } from 'lucide-react'

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
    value: '项目与网页源码',
    href: 'https://github.com/MhWangZi/game-portfolio-site',
    external: true,
  },
  {
    icon: Video,
    label: '演示视频',
    value: '查看原型演示',
    href: 'https://www.bilibili.com/video/BV1maTC6REzh/',
    external: true,
  },
  {
    icon: Video,
    label: 'Bilibili',
    value: '教程视频与个人空间',
    href: 'https://space.bilibili.com/94407611',
    external: true,
  },
  {
    icon: Video,
    label: '抖音',
    value: '短视频与更新记录',
    href: 'https://v.douyin.com/KtkwFjtQ7G8/',
    external: true,
  },
  {
    icon: MapPin,
    label: '回到顶部',
    value: '重新浏览',
    href: '#top',
    external: false,
  },
]

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contact">
      <div className="footer-copy">
        <p className="eyebrow">CONTACT / SAY HELLO</p>
        <h2>保持联系</h2>
        <p>
          如果你想聊游戏设计、原型制作、像素风项目或实习机会，可以通过下面的方式找到我。
          我也会继续把新的原型、拆解和设计笔记放到这里。
        </p>
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

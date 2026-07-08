import { Mail, MapPin } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contact">
      <div>
        <p className="eyebrow">Contact</p>
        <h2>杨毓琦｜游戏策划实习</h2>
      </div>
      <div className="footer-actions">
        <a href="mailto:3159591298@qq.com">
          <Mail size={16} />
          3159591298@qq.com
        </a>
        <a href="#top">
          <MapPin size={16} />
          回到顶部
        </a>
      </div>
    </footer>
  )
}

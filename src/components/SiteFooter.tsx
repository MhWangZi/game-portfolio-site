import { Mail, MapPin } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contact">
      <div>
        <p className="eyebrow">Contact</p>
        <h2>把这里替换为你的姓名、邮箱和投递链接。</h2>
      </div>
      <div className="footer-actions">
        <a href="mailto:replace-with-your-email@example.com">
          <Mail size={16} />
          邮箱
        </a>
        <a href="#top">
          <MapPin size={16} />
          回到顶部
        </a>
      </div>
    </footer>
  )
}

import { BookOpen, Compass, Gamepad2, Hammer, Telescope } from 'lucide-react'

const nowItems = [
  { icon: Gamepad2, title: '原型验证', body: '测试一个机制能否成立。', tags: ['Prototype', 'Loop'] },
  { icon: BookOpen, title: '系统结构', body: '梳理循环、资源与反馈关系。', tags: ['System', 'Flow'] },
  { icon: Telescope, title: '行为观察', body: '记录选择、误判与调整路径。', tags: ['Player', 'UX'] },
  {
    icon: Hammer,
    title: '工具链整理',
    body: '压缩重复流程，提高迭代效率。',
    tags: ['Tooling', 'Pipeline'],
  },
]

export function AboutSection() {
  return (
    <section className="personal-section about-section" id="about">
      <div className="section-heading compact">
        <p className="eyebrow">ABOUT / DESIGN FOCUS</p>
        <div className="section-heading-title">
          <span className="section-heading-icon">
            <Compass size={20} />
          </span>
          <h2>近期设计命题</h2>
        </div>
        <p>四个常用入口：机制、结构、行为与工具流。</p>
      </div>
      <div className="about-grid">
        {nowItems.map((item) => {
          const Icon = item.icon
          return (
            <article className="about-card" key={item.title}>
              <span className="focus-icon">
                <Icon size={18} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <div className="focus-tags" aria-label={`${item.title} tags`}>
                {item.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

import { BookOpen, Gamepad2, Hammer, Telescope } from 'lucide-react'

const nowItems = [
  { icon: Gamepad2, title: '原型验证', body: '用可运行版本测试规则是否成立。' },
  { icon: BookOpen, title: '系统拆解', body: '把数值、循环和反馈关系整理成清晰结构。' },
  { icon: Telescope, title: '玩家行为观察', body: '记录玩家如何理解目标、做出选择并修正策略。' },
  {
    icon: Hammer,
    title: '工具链整理',
    body: '优化配置、表格和编辑流程，降低重复成本。',
  },
]

export function AboutSection() {
  return (
    <section className="personal-section about-section" id="about">
      <div className="section-heading compact">
        <p className="eyebrow">ABOUT / DESIGN FOCUS</p>
        <h2>近期设计命题</h2>
        <p>
          规则、节奏、反馈与选择，是整理原型时最常回到的几个入口。每个项目都会从这里开始，
          被拆开、验证，再重新组合。
        </p>
      </div>
      <div className="about-grid">
        {nowItems.map((item) => {
          const Icon = item.icon
          return (
            <article className="about-card" key={item.title}>
              <Icon size={18} />
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

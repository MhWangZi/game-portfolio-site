import { BookOpen, Gamepad2, Hammer, Telescope } from 'lucide-react'

const nowItems = [
  { icon: Gamepad2, title: '做小原型', body: '用 Godot 和网页原型验证一个规则是否真的能玩。' },
  { icon: BookOpen, title: '写设计笔记', body: '把玩到的系统、数值、循环和体验问题整理成短文。' },
  { icon: Telescope, title: '观察玩家行为', body: '关心玩家为什么做选择，以及系统如何改变选择。' },
  { icon: Hammer, title: '整理工具流', body: '尝试用配置、表格和编辑器降低内容扩展成本。' },
]

export function AboutSection() {
  return (
    <section className="personal-section about-section" id="about">
      <div className="section-heading compact">
        <p className="eyebrow">ABOUT / CURRENTLY</p>
        <h2>关于我最近在想的事</h2>
        <p>
          我是杨毓琦，喜欢从规则、系统和玩家行为之间找问题。这个站点会持续放一些可运行的小原型、
          系统拆解和设计笔记，也记录我把想法做成东西的过程。
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

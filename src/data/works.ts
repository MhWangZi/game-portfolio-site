import type { AbilityGroup, WorkItem } from '../types'

const placeholderDownload = {
  url: './downloads/windows-demo-placeholder.zip',
  version: 'v0.1 content-template',
  size: 'placeholder zip',
}

export const works: WorkItem[] = [
  {
    id: 'action-level-prototype',
    title: '动作关卡原型',
    role: '玩法 / 关卡 / 交互节奏',
    engine: 'Godot / Unity / custom',
    period: '替换为真实时间',
    summary:
      '用于承载横版或俯视角战斗节奏的作品位。这里应该替换为真实项目名称、玩法核心和最能说明能力的一句话。',
    contribution: [
      '拆解核心循环，明确进入关卡、遭遇、反馈、失败和复盘的节奏。',
      '以节点或 prefab 方式组织可复用机关、敌人、触发器和 UI 反馈。',
      '沉淀可调参数，方便后续在编辑器中改数值而不是改代码。',
    ],
    skills: ['核心循环', '关卡节奏', '交互反馈', '可调参数', '试玩包'],
    visualTheme: 'voxel',
    media: [
      {
        type: 'image',
        src: './media/work-action-prototype.svg',
        caption: '替换为真实截图或 15-30 秒演示视频',
      },
    ],
    download: placeholderDownload,
    links: [{ label: '作品说明模板', url: '#work-detail' }],
  },
  {
    id: 'systems-design-prototype',
    title: '系统设计原型',
    role: '系统策划 / 数值 / UI 流程',
    engine: 'Prototype',
    period: '替换为真实时间',
    summary:
      '用于展示成长、资源、卡牌、装备、商店或局外循环的作品位。重点写清楚系统目标、玩家决策和验证方式。',
    contribution: [
      '把玩法目标拆成资源流、消耗点、奖励节奏和风险控制。',
      '用表格或配置数据表达系统规则，减少逻辑与具体对象的耦合。',
      '用低成本 UI 原型验证流程是否清楚、是否能支持招聘方快速理解。',
    ],
    skills: ['系统拆解', '数值结构', 'UI 流程', '配置驱动', '可验证设计'],
    visualTheme: 'ui-panels',
    media: [
      {
        type: 'image',
        src: './media/work-system-prototype.svg',
        caption: '替换为系统界面、表格或流程演示',
      },
    ],
    download: placeholderDownload,
  },
  {
    id: 'world-mood-study',
    title: '世界观与美术调性练习',
    role: '主题提案 / 氛围 / 参考整合',
    engine: 'Design doc',
    period: '替换为真实时间',
    summary:
      '用于展示你对题材、基调、参考作品和可执行美术方向的判断。适合放主题脑暴、场景拼图和关键视觉说明。',
    contribution: [
      '从参考作品中抽取可落地的关键词，而不是停留在抽象风格描述。',
      '把主题拆成场景、角色、UI、音效和任务包装几个可执行方向。',
      '为后续原型列出最小可做范围，避免世界观先行导致制作失控。',
    ],
    skills: ['世界观', '主题提案', '参考拆解', '美术方向', '范围控制'],
    visualTheme: 'terrain',
    media: [
      {
        type: 'image',
        src: './media/work-world-mood.svg',
        caption: '替换为 moodboard、场景图或设计文档截图',
      },
    ],
  },
  {
    id: 'toolchain-and-assets',
    title: '工具链与资源整理流程',
    role: '资源管线 / 可导入素材 / 项目整理',
    engine: 'Windows / Godot / Aseprite',
    period: '替换为真实时间',
    summary:
      '用于展示你如何把素材、音频、截图、试玩包和说明文档整理成别人能直接查看的交付结构。',
    contribution: [
      '区分原始资源、工作副本和可发布文件，避免破坏源工程。',
      '整理截图、视频、README 和下载包，降低招聘方查看成本。',
      '记录版本、大小和运行说明，让作品集链接更可信。',
    ],
    skills: ['资源整理', '交付结构', '版本说明', '下载包', '低门槛查看'],
    visualTheme: 'artifact',
    media: [
      {
        type: 'image',
        src: './media/work-toolchain.svg',
        caption: '替换为真实资源目录、工具截图或演示录屏',
      },
    ],
    download: placeholderDownload,
  },
]

export const abilityGroups: AbilityGroup[] = [
  {
    title: '玩法与系统',
    summary: '把玩法目标拆成玩家行为、反馈、资源循环和可调参数。',
    items: ['核心循环', '关卡节奏', '系统拆解', '数值意识'],
  },
  {
    title: '工程协作',
    summary: '优先使用数据和接口表达规则，减少硬编码和具体对象绑定。',
    items: ['配置驱动', '组件边界', '节点编辑优先', '可复用结构'],
  },
  {
    title: '展示与交付',
    summary: '用视频、截图、说明和下载包让作品可以被快速判断。',
    items: ['演示录制', 'README', '版本管理', '招聘向表达'],
  },
]

export const allSkillTags = Array.from(new Set(works.flatMap((work) => work.skills)))

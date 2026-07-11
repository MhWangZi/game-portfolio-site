import type { ChapterId } from '../types'

export type ChapterItem = {
  id: ChapterId
  index: string
  label: string
  shortLabel: string
}

export type FocusItem = {
  id: 'prototype' | 'systems' | 'behavior' | 'tooling'
  index: string
  label: string
  title: string
  summary: string
  keywords: string[]
  evidenceIds: string[]
}

export type FieldNote = {
  id: string
  code: string
  category: string
  question: string
  observation: string
  adjustment: string
  result: string
}

export const chapters: ChapterItem[] = [
  { id: 'current', index: '01', label: 'CURRENT BUILDS', shortLabel: '当前构建' },
  { id: 'radar', index: '02', label: 'DESIGN RADAR', shortLabel: '设计命题' },
  { id: 'cases', index: '03', label: 'CASE FILES', shortLabel: '核心档案' },
  { id: 'projects', index: '04', label: 'PROJECT INDEX', shortLabel: '项目索引' },
  { id: 'notes', index: '05', label: 'FIELD NOTES', shortLabel: '设计笔记' },
  { id: 'contact', index: '06', label: 'SIGNAL OUT', shortLabel: '保持联系' },
]

export const focusItems: FocusItem[] = [
  {
    id: 'prototype',
    index: 'A1',
    label: 'PLAYABLE TEST',
    title: '原型验证',
    summary: '用最小可运行版本判断机制能否成立。',
    keywords: ['短循环', '输入反馈', '版本边界'],
    evidenceIds: ['parry-arena', 'anchored-gaze', 'static-signal'],
  },
  {
    id: 'systems',
    index: 'B2',
    label: 'SYSTEM MAP',
    title: '系统结构',
    summary: '梳理资源、循环与长期选择之间的关系。',
    keywords: ['资源流', '成长曲线', '长期动机'],
    evidenceIds: ['delta-economy', 'wuthering-values', 'roguelite-systems'],
  },
  {
    id: 'behavior',
    index: 'C3',
    label: 'PLAYER TRACE',
    title: '行为观察',
    summary: '定位选择、误判、失败与策略修正路径。',
    keywords: ['风险判断', '读招', '路径压力'],
    evidenceIds: ['parry-arena', 'anchored-gaze', 'static-signal'],
  },
  {
    id: 'tooling',
    index: 'D4',
    label: 'TOOL PIPELINE',
    title: '工具链整理',
    summary: '压缩重复操作，让迭代路径保持连续。',
    keywords: ['EditorPlugin', '数据配置', '场景流程'],
    evidenceIds: ['hd2d-kit', 'godot-prototype-suite', 'static-signal'],
  },
]

export const fieldNotes: FieldNote[] = [
  {
    id: 'parry-memory',
    code: 'LOG-01',
    category: 'COMBAT',
    question: '弹反的记忆点落在哪里？',
    observation: '防御、读招与反击收益集中在同一瞬间。',
    adjustment: '强化攻击预兆，保留体力消耗和失败硬直。',
    result: '成功时机更清楚，冒险与保守形成可见差异。',
  },
  {
    id: 'extraction-risk',
    code: 'LOG-02',
    category: 'ECONOMY',
    question: '搜打撤的风险如何持续存在？',
    observation: '入局成本、撤离收益和仓储压力需要共同生效。',
    adjustment: '将来源、消耗、流通与回收放入同一张路径图。',
    result: '风险判断从单次掉落扩展到完整资源循环。',
  },
  {
    id: 'text-pressure',
    code: 'LOG-03',
    category: 'NARRATIVE',
    question: '静态文字如何制造行动压力？',
    observation: '连续阅读缺少代价时，选择容易失去重量。',
    adjustment: '加入行动点、风险值与身份差异文本。',
    result: '同一线索在不同角色与状态下产生不同权重。',
  },
  {
    id: 'tool-friction',
    code: 'LOG-04',
    category: 'TOOLING',
    question: '新手搭建场景时最容易在哪中断？',
    observation: '遮挡、碰撞和 NPC 配置会频繁打断制作节奏。',
    adjustment: '把高频节点操作收进按钮、表单和场景检查项。',
    result: '流程更连续，错误更早暴露，下一轮修改更短。',
  },
]

export const processSteps = [
  { index: '01', title: '观察', body: '路径、误判、失败点' },
  { index: '02', title: '拆解', body: '资源、成本、奖励' },
  { index: '03', title: '假设', body: '一个问题、一轮边界' },
  { index: '04', title: '原型', body: '最小可运行版本' },
  { index: '05', title: '复盘', body: '截图、表格、下一版' },
]

export const statusSignals = [
  'BUILD / HD2DKIT V1.76',
  'PLAYTEST / PARRY TIMING',
  'SYSTEM MAP / RESOURCE LOOP',
  'NOTES / PLAYER TRACE',
]

export const contactItems = [
  { kind: 'mail', label: '邮箱', value: '3159591298@qq.com', href: 'mailto:3159591298@qq.com', external: false },
  {
    kind: 'code',
    label: 'GitHub',
    value: '代码与页面',
    href: 'https://github.com/MhWangZi/game-portfolio-site',
    external: true,
  },
  {
    kind: 'video',
    label: 'Bilibili',
    value: '教程与原型演示',
    href: 'https://space.bilibili.com/94407611',
    external: true,
  },
  {
    kind: 'radio',
    label: '抖音',
    value: '短视频与过程',
    href: 'https://v.douyin.com/KtkwFjtQ7G8/',
    external: true,
  },
] as const

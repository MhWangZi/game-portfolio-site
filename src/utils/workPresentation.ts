import type { WorkItem, WorkKind } from '../types'

export function getWorkKind(work: WorkItem): WorkKind {
  return work.kind ?? (work.skills.includes('可玩原型') ? 'Playable Prototype' : 'System Analysis')
}

export function getArchiveCode(work: WorkItem, index: number) {
  const kind = getWorkKind(work)
  const prefix = kind === 'Playable Prototype' ? 'P' : kind === 'Tooling Project' ? 'T' : 'S'
  return `${prefix}-${String(index + 1).padStart(2, '0')}`
}

export function getKindLabel(work: WorkItem) {
  const kind = getWorkKind(work)
  if (kind === 'Playable Prototype') return 'PLAYABLE PROTOTYPE'
  if (kind === 'Tooling Project') return 'TOOLING PROJECT'
  return 'SYSTEM ANALYSIS'
}

export function getKindShortLabel(work: WorkItem) {
  const kind = getWorkKind(work)
  if (kind === 'Playable Prototype') return 'PLAYABLE'
  if (kind === 'Tooling Project') return 'TOOLING'
  return 'ANALYSIS'
}

export function getDownloadLabel(work: WorkItem) {
  const kind = getWorkKind(work)
  if (kind === 'Playable Prototype') return '下载构建包'
  if (kind === 'Tooling Project') return '下载插件包'
  return '下载 Word 文档'
}

export function getWorkImageSources(work: WorkItem, preferredIndex = 0) {
  const preferred = work.media[preferredIndex]
  const remaining = work.media.filter((_, index) => index !== preferredIndex)
  return [preferred?.poster ?? preferred?.src, ...remaining.map((item) => item.poster ?? item.src)]
}

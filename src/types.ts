export type VisualTheme = 'particles' | 'voxel' | 'terrain' | 'ui-panels' | 'artifact'
export type WorkKind = 'Playable Prototype' | 'System Analysis' | 'Tooling Project'
export type ChapterId = 'current' | 'radar' | 'cases' | 'projects' | 'notes' | 'contact'
export type ScenePreset =
  | 'tool-grid'
  | 'timing-gate'
  | 'anchor-field'
  | 'signal-branch'
  | 'terrain-map'
  | 'economy-orbit'
  | 'value-lattice'
  | 'artifact-rings'
  | 'combat-cross'
  | 'run-cycle'
  | 'neutral'

export type SceneState = {
  activeChapter: ChapterId | 'admin'
  activeProjectId?: string
  preset: ScenePreset
}

export type WorkMedia = {
  type: 'image' | 'video'
  src: string
  poster?: string
  caption?: string
}

export type WorkLink = {
  label: string
  url: string
}

export type WorkDownload = {
  url: string
  version: string
  size?: string
  sha256?: string
}

export type WorkProof = {
  label: string
  value: string
}

export type WorkHighlight = {
  title: string
  body: string
}

export type WorkItem = {
  id: string
  title: string
  kind?: WorkKind
  role: string
  engine?: string
  period?: string
  summary: string
  oneLine?: string
  shortTitle?: string
  designQuestion?: string
  archiveSummary?: string
  heroOrder?: number
  caseOrder?: number
  scenePreset?: ScenePreset
  contribution: string[]
  skills: string[]
  visualTheme?: VisualTheme
  media: WorkMedia[]
  proof?: WorkProof[]
  designHighlights?: WorkHighlight[]
  flow?: string[]
  featured?: boolean
  download?: WorkDownload
  links?: WorkLink[]
}

export type AbilityGroup = {
  title: string
  summary: string
  items: string[]
  evidence?: string[]
}

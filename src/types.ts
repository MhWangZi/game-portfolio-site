export type VisualTheme = 'particles' | 'voxel' | 'terrain' | 'ui-panels' | 'artifact'

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

export type WorkItem = {
  id: string
  title: string
  role: string
  engine?: string
  period?: string
  summary: string
  contribution: string[]
  skills: string[]
  visualTheme?: VisualTheme
  media: WorkMedia[]
  download?: WorkDownload
  links?: WorkLink[]
}

export type AbilityGroup = {
  title: string
  summary: string
  items: string[]
}

interface Window {
  __portfolioSceneState?: {
    mode: 'full' | 'compact'
    motion: 'normal' | 'reduced'
    theme: string
    chapter: string
    project?: string
  }
}

interface ImportMetaEnv {
  readonly VITE_PSEUDO_ADMIN_HASH?: string
  readonly VITE_VISIT_COUNTER_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

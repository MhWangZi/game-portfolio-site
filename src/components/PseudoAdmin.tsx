import { Activity, ArrowLeft, Eye, LockKeyhole, RefreshCw, ShieldAlert, Terminal } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

type VisitStats = {
  totalViews: number
  uniqueVisitors: number
  todayViews: number
  todayUniqueVisitors: number
  date: string
  updatedAt: string
}

const ADMIN_SESSION_KEY = 'gdn_pseudo_admin_unlocked'

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function normalizeHash(value?: string) {
  return value?.trim().toLowerCase() ?? ''
}

function formatNumber(value?: number) {
  return typeof value === 'number' ? value.toLocaleString('zh-CN') : '--'
}

function formatTime(value?: string) {
  if (!value) return 'WAITING'
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}

export function PseudoAdmin() {
  const expectedHash = normalizeHash(import.meta.env.VITE_PSEUDO_ADMIN_HASH)
  const counterUrl = import.meta.env.VITE_VISIT_COUNTER_URL?.replace(/\/$/, '') ?? ''
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [unlocked, setUnlocked] = useState(() => window.sessionStorage.getItem(ADMIN_SESSION_KEY) === '1')
  const [stats, setStats] = useState<VisitStats | null>(null)
  const [statsError, setStatsError] = useState('')
  const [loadingStats, setLoadingStats] = useState(false)
  const hashConfigured = expectedHash.length === 64

  const terminalLines = useMemo(
    () => [
      '[01] ACCESS TERMINAL READY',
      `[02] HASH GATE ${hashConfigured ? 'ARMED' : 'MISSING'}`,
      `[03] VISIT COUNTER ${counterUrl ? 'LINKED' : 'OFFLINE'}`,
      `[04] MODE ${unlocked ? 'INTRUSION CONSOLE' : 'LOCKED'}`,
    ],
    [counterUrl, hashConfigured, unlocked],
  )

  const loadStats = useCallback(async () => {
    if (!counterUrl) {
      setStatsError('VITE_VISIT_COUNTER_URL 未配置。')
      return
    }

    setLoadingStats(true)
    setStatsError('')
    try {
      const response = await fetch(`${counterUrl}/api/stats`, { method: 'GET' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      setStats((await response.json()) as VisitStats)
    } catch {
      setStatsError('无法连接访问统计 Worker。')
    } finally {
      setLoadingStats(false)
    }
  }, [counterUrl])

  useEffect(() => {
    if (unlocked) void loadStats()
  }, [loadStats, unlocked])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!hashConfigured) {
      setError('ACCESS HASH 未配置。')
      return
    }

    const inputHash = await sha256Hex(password)
    if (inputHash !== expectedHash) {
      setError('ACCESS DENIED')
      setPassword('')
      return
    }

    window.sessionStorage.setItem(ADMIN_SESSION_KEY, '1')
    setUnlocked(true)
  }

  const lock = () => {
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY)
    setUnlocked(false)
    setPassword('')
    setStats(null)
  }

  return (
    <main className="pseudo-admin-shell">
      <div className="pseudo-admin-grid" aria-live="polite">
        <section className="pseudo-terminal-panel">
          <div className="pseudo-panel-topline">
            <span>INTRUSION MODE</span>
            <strong>{unlocked ? 'SESSION OPEN' : 'ACCESS LOCKED'}</strong>
          </div>
          <div className="pseudo-terminal-mark" aria-hidden="true">
            <Terminal size={34} />
          </div>
          <p className="eyebrow">HIDDEN / PSEUDO BACKEND</p>
          <h1>{unlocked ? 'VISIT CONTROL ROOM' : 'ACCESS TERMINAL'}</h1>
          <p>
            静态隐藏页。只显示非敏感统计；密码门禁用于避开普通访客，不作为真正安全后台。
          </p>

          <div className="pseudo-terminal-lines" aria-label="terminal status">
            {terminalLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>

          <div className="pseudo-admin-actions">
            <a href="./">
              <ArrowLeft size={16} />
              BACK TO SITE
            </a>
            {unlocked ? (
              <button type="button" onClick={lock}>
                <LockKeyhole size={16} />
                LOCK
              </button>
            ) : null}
          </div>
        </section>

        {!unlocked ? (
          <section className="pseudo-login-card">
            <div className="pseudo-scan-header">
              <ShieldAlert size={18} />
              <span>PRIVATE GATE</span>
            </div>
            <form onSubmit={handleSubmit}>
              <label>
                <span>ACCESS KEY</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  disabled={!hashConfigured}
                  placeholder={hashConfigured ? '输入后台密码' : '等待配置 PSEUDO_ADMIN_HASH'}
                />
              </label>
              {error ? <p className="pseudo-error">{error}</p> : null}
              {!hashConfigured ? (
                <p className="pseudo-hint">需要在 GitHub Secrets 配置 PSEUDO_ADMIN_HASH 后重新部署。</p>
              ) : null}
              <button type="submit" disabled={!hashConfigured}>
                [UNLOCK PANEL]
              </button>
            </form>
          </section>
        ) : (
          <section className="pseudo-dashboard">
            <div className="pseudo-dashboard-header">
              <div>
                <p className="eyebrow">VISIT COUNTER / LIVE</p>
                <h2>访问统计</h2>
                <span>LAST SYNC: {formatTime(stats?.updatedAt)}</span>
              </div>
              <button type="button" onClick={() => void loadStats()} disabled={loadingStats}>
                <RefreshCw size={16} />
                {loadingStats ? 'SYNCING' : 'REFRESH'}
              </button>
            </div>

            <div className="pseudo-stat-grid">
              <article>
                <Eye size={18} />
                <span>Total Views</span>
                <strong>{formatNumber(stats?.totalViews)}</strong>
              </article>
              <article>
                <Activity size={18} />
                <span>Unique Visitors</span>
                <strong>{formatNumber(stats?.uniqueVisitors)}</strong>
              </article>
              <article>
                <Eye size={18} />
                <span>Today Views</span>
                <strong>{formatNumber(stats?.todayViews)}</strong>
              </article>
              <article>
                <Activity size={18} />
                <span>Today Unique</span>
                <strong>{formatNumber(stats?.todayUniqueVisitors)}</strong>
              </article>
            </div>

            <div className="pseudo-status-console">
              <span>COUNTER DATE: {stats?.date ?? '--'}</span>
              <span>WORKER: {counterUrl || 'NOT CONFIGURED'}</span>
              <span>ADMIN ROUTE: #/admin</span>
              <span>DATA: anonymous local visitor id only</span>
            </div>
            {statsError ? <p className="pseudo-error">{statsError}</p> : null}
          </section>
        )}
      </div>
    </main>
  )
}

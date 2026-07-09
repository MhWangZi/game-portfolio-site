import { useEffect } from 'react'

const VISITOR_KEY = 'gdn_visitor_id'
const SESSION_VISIT_KEY = 'gdn_visit_counted'

function isAdminHash(hash: string) {
  return hash.replace(/^#/, '') === '/admin'
}

function getVisitorId() {
  const existing = window.localStorage.getItem(VISITOR_KEY)
  if (existing) return existing

  const id = crypto.randomUUID()
  window.localStorage.setItem(VISITOR_KEY, id)
  return id
}

export function useVisitCounter(isAdminRoute: boolean) {
  useEffect(() => {
    const counterUrl = import.meta.env.VITE_VISIT_COUNTER_URL?.replace(/\/$/, '')
    if (!counterUrl || isAdminRoute || isAdminHash(window.location.hash)) return
    if (window.sessionStorage.getItem(SESSION_VISIT_KEY) === '1') return

    window.sessionStorage.setItem(SESSION_VISIT_KEY, '1')
    const visitorId = getVisitorId()

    fetch(`${counterUrl}/api/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId }),
      keepalive: true,
    }).catch(() => {
      window.sessionStorage.removeItem(SESSION_VISIT_KEY)
    })
  }, [isAdminRoute])
}

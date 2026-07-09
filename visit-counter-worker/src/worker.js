const ALLOWED_ORIGINS = new Set([
  'https://mhwangzi.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
])

const TOTAL_VIEWS_KEY = 'totalViews'
const UNIQUE_VISITORS_KEY = 'uniqueVisitors'
const VISITOR_TTL_SECONDS = 60 * 60 * 24 * 400
const DAILY_TTL_SECONDS = 60 * 60 * 24 * 45

function corsHeaders(request) {
  const origin = request.headers.get('Origin')
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return {
      'Access-Control-Allow-Origin': 'https://mhwangzi.github.io',
      Vary: 'Origin',
    }
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}

function jsonResponse(request, payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

function chinaDateKey(now = Date.now()) {
  return new Date(now + 8 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function isValidVisitorId(visitorId) {
  return typeof visitorId === 'string' && /^[a-zA-Z0-9_-]{12,128}$/.test(visitorId)
}

async function readNumber(kv, key) {
  const value = await kv.get(key)
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

async function increment(kv, key, options) {
  const value = (await readNumber(kv, key)) + 1
  await kv.put(key, String(value), options)
  return value
}

async function readStats(kv) {
  const date = chinaDateKey()
  const [totalViews, uniqueVisitors, todayViews, todayUniqueVisitors] = await Promise.all([
    readNumber(kv, TOTAL_VIEWS_KEY),
    readNumber(kv, UNIQUE_VISITORS_KEY),
    readNumber(kv, `day:${date}:views`),
    readNumber(kv, `day:${date}:unique`),
  ])

  return {
    totalViews,
    uniqueVisitors,
    todayViews,
    todayUniqueVisitors,
    date,
    updatedAt: new Date().toISOString(),
  }
}

async function recordVisit(kv, visitorId) {
  const date = chinaDateKey()
  const visitorKey = `visitor:${visitorId}`
  const todayVisitorKey = `day:${date}:visitor:${visitorId}`

  const [knownVisitor, knownTodayVisitor] = await Promise.all([
    kv.get(visitorKey),
    kv.get(todayVisitorKey),
  ])

  const writes = [
    increment(kv, TOTAL_VIEWS_KEY),
    increment(kv, `day:${date}:views`, { expirationTtl: DAILY_TTL_SECONDS }),
    kv.put(visitorKey, '1', { expirationTtl: VISITOR_TTL_SECONDS }),
    kv.put(todayVisitorKey, '1', { expirationTtl: DAILY_TTL_SECONDS }),
  ]

  if (!knownVisitor) writes.push(increment(kv, UNIQUE_VISITORS_KEY))
  if (!knownTodayVisitor) writes.push(increment(kv, `day:${date}:unique`, { expirationTtl: DAILY_TTL_SECONDS }))

  await Promise.all(writes)
  return readStats(kv)
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) })
    }

    const url = new URL(request.url)
    const kv = env.VISIT_COUNTER_KV
    if (!kv) {
      return jsonResponse(request, { error: 'KV namespace is not configured.' }, 503)
    }

    if (url.pathname === '/api/stats' && request.method === 'GET') {
      return jsonResponse(request, await readStats(kv))
    }

    if (url.pathname === '/api/visit' && request.method === 'POST') {
      let body
      try {
        body = await request.json()
      } catch {
        return jsonResponse(request, { error: 'Invalid request.' }, 400)
      }

      if (!isValidVisitorId(body?.visitorId)) {
        return jsonResponse(request, { error: 'Invalid request.' }, 400)
      }

      return jsonResponse(request, await recordVisit(kv, body.visitorId))
    }

    return jsonResponse(request, { error: 'Not found.' }, 404)
  },
}

import { argon2id } from 'hash-wasm'

const SESSION_COOKIE = 'design_archive_session'
const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 2
const FAILURE_WINDOW_MS = 10 * 60 * 1000
const LOCK_MS = 2 * 60 * 1000
const MAX_FAILURES = 5
const failureBuckets = new Map()

const DEFAULT_STATE = {
  prototypeLog: {
    project: 'Parry Arena',
    version: 'v0.2',
    goal: '验证防反窗口、敌人攻击预兆和体力消耗之间的节奏。',
    issues: '高压状态下，普通格挡和完美弹反的反馈差异还需要更清楚。',
    next: '继续调整攻击前摇、命中停顿、音效层级和 Boss 冲撞处理。',
  },
  designNote: {
    title: '弹反收益边界',
    tags: 'Combat, Timing, Feedback',
    body: '弹反的成功反馈需要足够明确，失败代价需要可预期。下一轮重点观察玩家是否能稳定识别攻击预兆。',
    public: false,
  },
  settings: {
    intro: '从规则、节奏到反馈，记录一个设计想法被验证、修正、成形的过程。',
    focus: '原型验证 / 系统拆解 / 玩家选择',
    showEmail: true,
    showGithub: true,
  },
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (!url.pathname.startsWith('/admin')) {
      return new Response('Not found', { status: 404 })
    }

    if (url.pathname === '/admin/login' && request.method === 'POST') {
      return handleLogin(request, env)
    }

    if (url.pathname === '/admin/logout' && request.method === 'POST') {
      return handleLogout()
    }

    if (url.pathname.startsWith('/admin/api/')) {
      const session = await requireSession(request, env)
      if (!session.ok) return session.response
      return handleApi(request, env, url)
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 })
    }

    const session = await verifySession(request, env)
    if (!session.ok) return htmlResponse(loginPage(url.searchParams.get('error') === '1'), 200)

    const state = await readState(env)
    return htmlResponse(consolePage(state), 200)
  },
}

async function handleLogin(request, env) {
  const clientKey = getClientKey(request)
  const limited = getLimitState(clientKey)
  if (limited.locked) {
    return redirect('/admin?error=1')
  }

  const form = await request.formData()
  const password = String(form.get('password') ?? '')
  const ok = await verifyPassword(password, env)

  if (!ok) {
    registerFailure(clientKey)
    return redirect('/admin?error=1')
  }

  clearFailures(clientKey)
  const ttl = Number(env.SESSION_TTL_SECONDS ?? DEFAULT_SESSION_TTL_SECONDS)
  const session = await createSession(env, ttl)
  return new Response(null, {
    status: 303,
    headers: {
      Location: '/admin',
      'Set-Cookie': `${SESSION_COOKIE}=${session}; HttpOnly; Secure; SameSite=Lax; Path=/admin; Max-Age=${ttl}`,
    },
  })
}

function handleLogout() {
  return new Response(null, {
    status: 303,
    headers: {
      Location: '/admin',
      'Set-Cookie': `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/admin; Max-Age=0`,
    },
  })
}

async function handleApi(request, env, url) {
  if (request.method === 'GET' && url.pathname === '/admin/api/state') {
    return jsonResponse(await readState(env))
  }

  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, message: 'Unsupported method.' }, 405)
  }

  const state = await readState(env)
  const form = await request.formData()

  if (url.pathname === '/admin/api/prototype-log') {
    state.prototypeLog = {
      project: String(form.get('project') ?? ''),
      version: String(form.get('version') ?? ''),
      goal: String(form.get('goal') ?? ''),
      issues: String(form.get('issues') ?? ''),
      next: String(form.get('next') ?? ''),
    }
  } else if (url.pathname === '/admin/api/design-note') {
    state.designNote = {
      title: String(form.get('title') ?? ''),
      tags: String(form.get('tags') ?? ''),
      body: String(form.get('body') ?? ''),
      public: form.get('public') === 'on',
    }
  } else if (url.pathname === '/admin/api/site-settings') {
    state.settings = {
      intro: String(form.get('intro') ?? ''),
      focus: String(form.get('focus') ?? ''),
      showEmail: form.get('showEmail') === 'on',
      showGithub: form.get('showGithub') === 'on',
    }
  } else {
    return jsonResponse({ ok: false, message: 'Unknown endpoint.' }, 404)
  }

  await writeState(env, state)
  return jsonResponse({ ok: true, state })
}

async function verifyPassword(password, env) {
  if (!env.ADMIN_PASSWORD_HASH || !env.ADMIN_PEPPER) return false

  try {
    const parsed = parseArgon2id(env.ADMIN_PASSWORD_HASH)
    const encoded = await argon2id({
      password: `${password}${env.ADMIN_PEPPER}`,
      salt: parsed.salt,
      parallelism: parsed.parallelism,
      iterations: parsed.iterations,
      memorySize: parsed.memorySize,
      hashLength: parsed.hashLength,
      outputType: 'encoded',
    })
    return constantTimeEqual(encoded, env.ADMIN_PASSWORD_HASH)
  } catch {
    return false
  }
}

function parseArgon2id(encoded) {
  const parts = encoded.split('$')
  if (parts.length !== 6 || parts[1] !== 'argon2id') throw new Error('Invalid Argon2id hash.')

  const params = Object.fromEntries(parts[3].split(',').map((chunk) => chunk.split('=')))
  const salt = base64Decode(parts[4])
  const hash = base64Decode(parts[5])

  return {
    memorySize: Number(params.m),
    iterations: Number(params.t),
    parallelism: Number(params.p),
    salt,
    hashLength: hash.length,
  }
}

async function createSession(env, ttlSeconds) {
  const now = Math.floor(Date.now() / 1000)
  const payload = base64UrlEncode(
    JSON.stringify({
      iat: now,
      exp: now + ttlSeconds,
      nonce: crypto.randomUUID(),
    }),
  )
  const signature = await hmac(payload, env.SESSION_SECRET)
  return `${payload}.${signature}`
}

async function verifySession(request, env) {
  const cookie = parseCookies(request.headers.get('Cookie') ?? '')[SESSION_COOKIE]
  if (!cookie || !env.SESSION_SECRET) return { ok: false }

  const [payload, signature] = cookie.split('.')
  if (!payload || !signature) return { ok: false }

  const expected = await hmac(payload, env.SESSION_SECRET)
  if (!constantTimeEqual(signature, expected)) return { ok: false }

  try {
    const data = JSON.parse(base64UrlDecode(payload))
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return { ok: false }
    return { ok: true, data }
  } catch {
    return { ok: false }
  }
}

async function requireSession(request, env) {
  const session = await verifySession(request, env)
  if (session.ok) return { ok: true, session }
  return {
    ok: false,
    response: jsonResponse({ ok: false, message: 'Unauthorized.' }, 401),
  }
}

async function readState(env) {
  if (!env.DESIGN_ARCHIVE_KV) return structuredClone(DEFAULT_STATE)
  const raw = await env.DESIGN_ARCHIVE_KV.get('admin-state', 'json')
  return raw ?? structuredClone(DEFAULT_STATE)
}

async function writeState(env, state) {
  if (!env.DESIGN_ARCHIVE_KV) return
  await env.DESIGN_ARCHIVE_KV.put('admin-state', JSON.stringify(state))
}

function getLimitState(key) {
  const now = Date.now()
  const record = failureBuckets.get(key)
  if (!record) return { locked: false }

  if (record.lockUntil && record.lockUntil > now) return { locked: true }
  if (record.resetAt < now) {
    failureBuckets.delete(key)
    return { locked: false }
  }

  return { locked: false }
}

function registerFailure(key) {
  const now = Date.now()
  const current = failureBuckets.get(key)
  const record = current && current.resetAt > now ? current : { count: 0, resetAt: now + FAILURE_WINDOW_MS, lockUntil: 0 }
  record.count += 1
  if (record.count >= MAX_FAILURES) record.lockUntil = now + LOCK_MS
  failureBuckets.set(key, record)
}

function clearFailures(key) {
  failureBuckets.delete(key)
}

function getClientKey(request) {
  return (
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'local'
  )
}

async function hmac(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  return base64UrlEncode(new Uint8Array(signature))
}

function parseCookies(header) {
  return Object.fromEntries(
    header
      .split(';')
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const index = cookie.indexOf('=')
        return index >= 0 ? [cookie.slice(0, index), cookie.slice(index + 1)] : [cookie, '']
      }),
  )
}

function redirect(location) {
  return new Response(null, { status: 303, headers: { Location: location } })
}

function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
    },
  })
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

function base64Decode(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))
}

function base64UrlEncode(value) {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlDecode(value) {
  const bytes = base64Decode(value)
  return new TextDecoder().decode(bytes)
}

function constantTimeEqual(a, b) {
  const left = new TextEncoder().encode(a)
  const right = new TextEncoder().encode(b)
  const length = Math.max(left.length, right.length)
  let diff = left.length ^ right.length
  for (let index = 0; index < length; index += 1) {
    diff |= (left[index] ?? 0) ^ (right[index] ?? 0)
  }
  return diff === 0
}

function loginPage(hasError) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>DESIGN ARCHIVE ACCESS</title>
  <style>${baseStyles()}${loginStyles()}</style>
</head>
<body class="login-shell">
  <main class="access-panel">
    <p class="eyebrow">DESIGN ARCHIVE ACCESS</p>
    <h1>设计档案入口</h1>
    <p class="subtitle">Private console for prototype notes, project logs and site fragments.</p>
    <form method="post" action="/admin/login" class="login-form">
      <label>
        <span>ACCESS KEY</span>
        <input name="password" type="password" autocomplete="current-password" required autofocus />
      </label>
      ${hasError ? '<p class="error">无法验证访问权限，请稍后重试。</p>' : ''}
      <button type="submit">[UNLOCK ARCHIVE]</button>
    </form>
  </main>
  <section class="boot-sequence" aria-hidden="true">
    <div class="wire-cube"><i></i><i></i><i></i></div>
    <div class="boot-lines">
      <span>CHECKING SESSION</span>
      <span>DECRYPTING ARCHIVE INDEX</span>
      <span>LOADING DESIGN NOTES</span>
      <span>SYNCING PROTOTYPE LOGS</span>
    </div>
    <div class="boot-bar"><i></i></div>
  </section>
  <script>
    const form = document.querySelector('.login-form');
    form?.addEventListener('submit', (event) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      event.preventDefault();
      document.body.classList.add('is-booting');
      window.setTimeout(() => form.submit(), 1450);
    });
  </script>
</body>
</html>`
}

function consolePage(state) {
  const log = state.prototypeLog
  const note = state.designNote
  const settings = state.settings

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>PRIVATE DESIGN CONSOLE</title>
  <style>${baseStyles()}${consoleStyles()}</style>
</head>
<body class="console-shell">
  <header class="status-bar">
    <strong>PRIVATE DESIGN CONSOLE</strong>
    <span id="clock"></span>
    <span>SESSION ACTIVE</span>
    <a href="/">BACK TO SITE</a>
    <form method="post" action="/admin/logout"><button type="submit">LOG OUT</button></form>
  </header>
  <main class="console-layout">
    <nav class="side-nav" aria-label="Admin navigation">
      <a href="#overview">Overview</a>
      <a href="#prototype">Prototype Logs</a>
      <a href="#notes">Design Notes</a>
      <a href="#cards">Project Cards</a>
      <a href="#settings">Site Settings</a>
    </nav>
    <section class="console-panels">
      <section class="panel overview" id="overview">
        <p class="eyebrow">OVERVIEW</p>
        <h1>Private Design Console</h1>
        <div class="overview-grid">
          <article><span>当前原型</span><strong>${escapeHtml(log.project)}</strong><em>${escapeHtml(log.version)}</em></article>
          <article><span>最近笔记</span><strong>${escapeHtml(note.title)}</strong><em>${escapeHtml(note.tags)}</em></article>
          <article><span>待整理项目</span><strong>Project Cards</strong><em>素材、文案、下载入口</em></article>
        </div>
        <div class="quick-actions">
          <a href="#prototype">Edit Prototype Log</a>
          <a href="#notes">Write Design Note</a>
          <a href="#settings">Update Site Fragment</a>
        </div>
      </section>

      <section class="panel" id="prototype">
        <p class="eyebrow">PROTOTYPE LOGS</p>
        <h2>近期原型记录</h2>
        <form class="archive-form" data-endpoint="/admin/api/prototype-log">
          ${input('项目名称', 'project', log.project)}
          ${input('当前版本', 'version', log.version)}
          ${textarea('本轮验证目标', 'goal', log.goal)}
          ${textarea('已发现问题', 'issues', log.issues)}
          ${textarea('下一步调整', 'next', log.next)}
          <button type="submit">保存草稿</button>
          <output></output>
        </form>
      </section>

      <section class="panel" id="notes">
        <p class="eyebrow">DESIGN NOTES</p>
        <h2>设计笔记</h2>
        <form class="archive-form" data-endpoint="/admin/api/design-note">
          ${input('标题', 'title', note.title)}
          ${input('标签', 'tags', note.tags)}
          ${textarea('正文', 'body', note.body)}
          <label class="check-row"><input type="checkbox" name="public" ${note.public ? 'checked' : ''} /> 是否公开显示</label>
          <button type="submit">保存</button>
          <output></output>
        </form>
      </section>

      <section class="panel" id="cards">
        <p class="eyebrow">PROJECT CARDS</p>
        <h2>项目卡片</h2>
        <div class="placeholder-grid">
          <article>素材状态</article>
          <article>封面图</article>
          <article>下载入口</article>
          <article>外部链接</article>
        </div>
      </section>

      <section class="panel" id="settings">
        <p class="eyebrow">SITE SETTINGS</p>
        <h2>站点片段</h2>
        <form class="archive-form" data-endpoint="/admin/api/site-settings">
          ${textarea('首页一句话介绍', 'intro', settings.intro)}
          ${input('当前关注方向', 'focus', settings.focus)}
          <label class="check-row"><input type="checkbox" name="showEmail" ${settings.showEmail ? 'checked' : ''} /> 联系邮箱显示开关</label>
          <label class="check-row"><input type="checkbox" name="showGithub" ${settings.showGithub ? 'checked' : ''} /> 是否显示 GitHub 链接</label>
          <button type="submit">保存</button>
          <output></output>
        </form>
      </section>
    </section>
  </main>
  <script>
    const clock = document.querySelector('#clock');
    const tick = () => { if (clock) clock.textContent = new Date().toLocaleString('zh-CN', { hour12: false }); };
    tick();
    setInterval(tick, 1000);

    document.querySelectorAll('.archive-form').forEach((form) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const output = form.querySelector('output');
        output.textContent = 'SAVING...';
        const response = await fetch(form.dataset.endpoint, { method: 'POST', body: new FormData(form) });
        output.textContent = response.ok ? 'SAVED' : 'SAVE FAILED';
      });
    });
  </script>
</body>
</html>`
}

function input(label, name, value) {
  return `<label><span>${escapeHtml(label)}</span><input name="${escapeHtml(name)}" value="${escapeHtml(value ?? '')}" /></label>`
}

function textarea(label, name, value) {
  return `<label><span>${escapeHtml(label)}</span><textarea name="${escapeHtml(name)}">${escapeHtml(value ?? '')}</textarea></label>`
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function baseStyles() {
  return `
    :root {
      color-scheme: dark;
      --bg: #080a0f;
      --panel: rgba(18, 22, 33, 0.78);
      --line: rgba(255, 255, 255, 0.12);
      --line-strong: rgba(242, 184, 96, 0.48);
      --text: #f5f2e8;
      --muted: #a8b0c1;
      --accent: #f2b860;
    }
    * { box-sizing: border-box; }
    body {
      min-height: 100vh;
      margin: 0;
      color: var(--text);
      font-family: Inter, "Microsoft YaHei", system-ui, sans-serif;
      background:
        radial-gradient(circle at 18% 18%, rgba(242, 184, 96, 0.12), transparent 32%),
        linear-gradient(120deg, rgba(255,255,255,0.035) 1px, transparent 1px),
        var(--bg);
      background-size: auto, 48px 48px, auto;
    }
    body::before {
      position: fixed;
      inset: 0;
      pointer-events: none;
      content: "";
      opacity: .22;
      background:
        linear-gradient(transparent 50%, rgba(255,255,255,.03) 51%),
        radial-gradient(circle, rgba(242,184,96,.3) 1px, transparent 2px);
      background-size: 100% 4px, 120px 120px;
    }
    .eyebrow {
      color: var(--accent);
      font: 700 .76rem/1 "Cascadia Code", monospace;
      letter-spacing: .08em;
    }
    button, a {
      color: inherit;
      font: inherit;
    }
  `
}

function loginStyles() {
  return `
    .login-shell {
      display: grid;
      place-items: center;
      padding: 24px;
      overflow: hidden;
    }
    .access-panel {
      width: min(520px, 100%);
      padding: 34px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: var(--panel);
      box-shadow: 0 34px 100px rgba(0,0,0,.42);
      backdrop-filter: blur(22px);
      transition: opacity .4s ease, transform .4s ease;
    }
    h1 {
      margin: 10px 0;
      font-size: clamp(2.1rem, 6vw, 4.8rem);
      line-height: .92;
    }
    .subtitle {
      color: var(--muted);
      line-height: 1.65;
    }
    .login-form {
      display: grid;
      gap: 18px;
      margin-top: 30px;
    }
    label span {
      display: block;
      margin-bottom: 8px;
      color: var(--accent);
      font: 700 .78rem/1 "Cascadia Code", monospace;
    }
    input {
      width: 100%;
      min-height: 48px;
      padding: 0 14px;
      color: var(--text);
      border: 1px solid var(--line-strong);
      border-radius: 8px;
      outline: none;
      background:
        linear-gradient(transparent 50%, rgba(255,255,255,.035) 51%),
        rgba(255,255,255,.045);
      background-size: 100% 4px, auto;
    }
    input:focus {
      box-shadow: 0 0 0 1px rgba(242,184,96,.28), 0 0 34px rgba(242,184,96,.12);
    }
    button {
      min-height: 48px;
      cursor: pointer;
      color: #1b1206;
      border: 0;
      border-radius: 8px;
      background: var(--accent);
      font-weight: 800;
    }
    .error {
      color: #ffb4a8;
      margin: 0;
    }
    .boot-sequence {
      position: fixed;
      inset: 0;
      display: grid;
      place-items: center;
      gap: 18px;
      opacity: 0;
      pointer-events: none;
      background: #06070b;
      transition: opacity .2s ease;
    }
    .is-booting .access-panel {
      opacity: 0;
      transform: translateY(10px) scale(.98);
    }
    .is-booting .boot-sequence {
      opacity: 1;
    }
    .wire-cube {
      position: relative;
      width: 82px;
      height: 82px;
      border: 1px solid var(--accent);
      transform: rotate(12deg);
      animation: cubeDraw 1.2s ease both;
    }
    .wire-cube i {
      position: absolute;
      inset: 15px;
      border: 1px solid rgba(242,184,96,.6);
    }
    .wire-cube i:nth-child(2) { transform: translate(14px, -12px); }
    .wire-cube i:nth-child(3) { transform: translate(-12px, 14px); }
    .boot-lines {
      display: grid;
      gap: 7px;
      color: var(--accent);
      font: 700 .8rem/1.3 "Cascadia Code", monospace;
    }
    .boot-lines span {
      animation: flicker 1.2s steps(2, end) infinite;
    }
    .boot-bar {
      width: min(360px, 72vw);
      height: 3px;
      background: rgba(242,184,96,.16);
    }
    .boot-bar i {
      display: block;
      height: 100%;
      background: var(--accent);
      animation: bootBar 1.4s ease forwards;
    }
    @keyframes cubeDraw {
      from { clip-path: inset(0 100% 100% 0); }
      to { clip-path: inset(0); }
    }
    @keyframes bootBar {
      from { width: 0; }
      to { width: 100%; }
    }
    @keyframes flicker {
      50% { opacity: .42; }
    }
    @media (prefers-reduced-motion: reduce) {
      .boot-sequence, .access-panel, .wire-cube, .boot-lines span, .boot-bar i {
        animation: none;
        transition: none;
      }
    }
  `
}

function consoleStyles() {
  return `
    .console-shell {
      padding: 20px;
    }
    .status-bar {
      position: sticky;
      top: 16px;
      z-index: 5;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      width: min(1280px, 100%);
      margin: 0 auto 20px;
      padding: 12px;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: rgba(9, 12, 18, .88);
      backdrop-filter: blur(18px);
    }
    .status-bar strong {
      margin-right: auto;
      color: var(--accent);
      font-family: "Cascadia Code", monospace;
    }
    .status-bar a,
    .status-bar button,
    .quick-actions a,
    .archive-form button {
      min-height: 34px;
      padding: 0 12px;
      text-decoration: none;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: rgba(255,255,255,.04);
    }
    .status-bar button,
    .archive-form button {
      cursor: pointer;
    }
    .console-layout {
      display: grid;
      grid-template-columns: 220px minmax(0, 1fr);
      gap: 18px;
      width: min(1280px, 100%);
      margin: 0 auto;
    }
    .side-nav {
      position: sticky;
      top: 92px;
      display: grid;
      align-content: start;
      gap: 8px;
      height: max-content;
      padding: 14px;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: var(--panel);
    }
    .side-nav a {
      padding: 10px;
      color: var(--muted);
      text-decoration: none;
      border-radius: 7px;
    }
    .side-nav a:hover {
      color: var(--text);
      background: rgba(242,184,96,.09);
    }
    .console-panels {
      display: grid;
      gap: 16px;
      animation: panelIn .46s ease both;
    }
    .panel {
      position: relative;
      padding: 22px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: var(--panel);
      box-shadow: 0 24px 80px rgba(0,0,0,.28);
      backdrop-filter: blur(18px);
    }
    .panel::after {
      position: absolute;
      right: 12px;
      top: 12px;
      width: 22px;
      height: 22px;
      pointer-events: none;
      content: "";
      opacity: 0;
      border-top: 1px solid var(--accent);
      border-right: 1px solid var(--accent);
      transition: opacity .16s ease;
    }
    .panel:hover::after {
      opacity: 1;
    }
    h1, h2 {
      margin: 8px 0 16px;
      line-height: 1;
    }
    h1 {
      font-size: clamp(2.4rem, 6vw, 5rem);
    }
    h2 {
      font-size: clamp(1.8rem, 4vw, 3.2rem);
    }
    .overview-grid,
    .placeholder-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
    }
    .overview-grid article,
    .placeholder-grid article {
      display: grid;
      gap: 8px;
      min-height: 110px;
      padding: 14px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(255,255,255,.035);
    }
    .overview-grid span,
    .overview-grid em {
      color: var(--muted);
      font-style: normal;
    }
    .quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 16px;
    }
    .archive-form {
      display: grid;
      gap: 13px;
    }
    .archive-form label {
      display: grid;
      gap: 7px;
      color: var(--muted);
    }
    .archive-form input,
    .archive-form textarea {
      width: 100%;
      min-height: 42px;
      padding: 10px 12px;
      color: var(--text);
      border: 1px solid var(--line);
      border-radius: 8px;
      outline: none;
      background: rgba(255,255,255,.045);
    }
    .archive-form textarea {
      min-height: 110px;
      resize: vertical;
    }
    .archive-form input:focus,
    .archive-form textarea:focus {
      border-color: var(--line-strong);
      box-shadow: 0 0 0 1px rgba(242,184,96,.14);
    }
    .check-row {
      display: flex !important;
      grid-template-columns: auto 1fr;
      align-items: center;
    }
    .check-row input {
      width: auto;
      min-height: auto;
    }
    output {
      min-height: 20px;
      color: var(--accent);
      font-family: "Cascadia Code", monospace;
    }
    @keyframes panelIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: none; }
    }
    @media (max-width: 820px) {
      .console-layout {
        grid-template-columns: 1fr;
      }
      .side-nav {
        position: static;
      }
      .overview-grid,
      .placeholder-grid {
        grid-template-columns: 1fr;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .console-panels {
        animation: none;
      }
    }
  `
}

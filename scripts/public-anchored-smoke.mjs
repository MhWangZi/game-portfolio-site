import { chromium } from 'playwright'

const url = process.env.PUBLIC_GAME_URL || 'https://mhwangzi.github.io/game-portfolio-site/'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  page.setDefaultTimeout(60_000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('requestfailed', request => errors.push(`${request.url()} ${request.failure()?.errorText}`))
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  await page.getByRole('button', { name: '推门去游戏房' }).click()
  await page.getByRole('button', { name: '坐在沙发上' }).click()
  await page.getByRole('button', { name: '拿起手柄' }).click()
  await page.getByRole('button', { name: '放入万众瞩目光盘' }).click()
  const player = page.frameLocator('iframe[src*="anchored-gaze"]')
  await player.getByRole('button', { name: '点击开始' }).click()
  const started = Date.now()
  const progress = setInterval(async () => {
    const status = await page.locator('.avg-site').getAttribute('data-game-status').catch(() => '?')
    const text = await player.locator('#status').textContent().catch(() => '?')
    console.log(`${Math.round((Date.now() - started) / 1000)}s ${status} ${text}`)
  }, 20_000)
  try {
    await page.locator('.avg-site[data-game-status="ready"]').waitFor({ timeout: 240_000 })
    console.log(`anchored-gaze=ready elapsed=${Math.round((Date.now() - started) / 1000)}s`)
  } catch (error) {
    console.log('diagnostic', JSON.stringify({ host: await page.locator('.avg-site').getAttribute('data-game-status'), player: await player.locator('#status').textContent(), errors }))
    throw error
  } finally {
    clearInterval(progress)
  }
} finally {
  await browser.close()
}

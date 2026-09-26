import { chromium } from 'playwright'

const url = process.env.PUBLIC_GAME_URL || 'https://mhwangzi.github.io/game-portfolio-site/'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  page.setDefaultTimeout(60_000)
  const errors = []
  const failed = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('requestfailed', request => failed.push(`${request.url()} ${request.failure()?.errorText}`))
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  if (response?.status() !== 200) throw Error(`Page status: ${response?.status()}`)
  await page.getByRole('button', { name: '推门去游戏房' }).click()
  await page.getByRole('button', { name: '轻轻摸摸熟睡的猫' }).click()
  await page.locator('[data-event="cat-seat"]').waitFor()
  const width = await page.locator('.companion-bubble').evaluate(element => element.getBoundingClientRect().width)
  if (width > 276) throw Error(`Cat bubble expanded: ${width}px`)
  await page.locator('[data-event="cat-seat"]').getByRole('button', { name: '收回手，让猫继续睡' }).click()
  await page.getByRole('button', { name: '折好书柜下层的包装盒' }).click()
  await page.locator('[data-scene-diff="box-outline"]').waitFor()
  await page.locator('[data-event="box-outline"]').waitFor()
  if (process.env.PUBLIC_GAME_DEEP === '1') {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 })
    await page.getByRole('button', { name: '推门去游戏房' }).click()
    await page.getByRole('button', { name: '坐在沙发上' }).click()
    await page.getByRole('button', { name: '拿起手柄' }).click()
    await page.getByRole('button', { name: '放入CLICKDOWN光盘' }).click()
    await page.frameLocator('iframe[src*="clickdown"]').getByRole('button', { name: '点击开始' }).click()
    const firstStarted = Date.now()
    const firstProgress = setInterval(async () => console.log(`clickdown ${Math.round((Date.now() - firstStarted) / 1000)}s ${await page.frameLocator('iframe[src*="clickdown"]').locator('#status').textContent().catch(() => '?')}`), 30_000)
    try {
      await page.locator('.avg-site[data-game-status="ready"]').waitFor({ timeout: 240_000 })
    } catch (error) {
      console.log('gameDiagnostic', JSON.stringify({ status: await page.locator('.avg-site').getAttribute('data-game-status'), playerText: await page.frameLocator('iframe[src*="clickdown"]').locator('#status').textContent(), errors, failed }))
      throw error
    } finally {
      clearInterval(firstProgress)
    }
    console.log('clickdown=ready')
    await page.getByRole('button', { name: '更换光盘 ◉' }).click()
    await page.getByRole('button', { name: '放入万众瞩目光盘' }).click()
    await page.getByRole('button', { name: '确认换盘' }).click()
    await page.frameLocator('iframe[src*="anchored-gaze"]').getByRole('button', { name: '点击开始' }).click()
    const secondStarted = Date.now()
    const secondProgress = setInterval(async () => console.log(`anchored-gaze ${Math.round((Date.now() - secondStarted) / 1000)}s ${await page.frameLocator('iframe[src*="anchored-gaze"]').locator('#status').textContent().catch(() => '?')}`), 30_000)
    try {
      await page.locator('.avg-site[data-game-status="ready"]').waitFor({ timeout: 240_000 })
    } catch (error) {
      console.log('gameDiagnostic', JSON.stringify({ status: await page.locator('.avg-site').getAttribute('data-game-status'), playerText: await page.frameLocator('iframe[src*="anchored-gaze"]').locator('#status').textContent(), errors, failed }))
      throw error
    } finally {
      clearInterval(secondProgress)
    }
    await page.getByRole('button', { name: '返回房间' }).click()
    await page.locator('.avg-site[data-stage="room"]').waitFor()
    console.log('embeddedGames=2 ready return=room')
  }
  if (errors.length) throw Error(errors.join('\n'))
  console.log(`public=200 catBubble=${width}px boxTrace=visible pageErrors=0`)
} finally {
  await browser.close()
}

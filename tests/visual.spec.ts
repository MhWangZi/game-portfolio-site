import { expect, test, type Page } from '@playwright/test'

const INDEX_ZERO_STORAGE_KEY = 'gdn:index0:puzzle:v1'
const INDEX_ZERO_RECOVERY_PHRASE = '被删除的记录仍在继续编写'

async function canvasSignature(page: Page) {
  return page.locator('[data-testid="portfolio-three-canvas"]').evaluate((canvas) => {
    const source = canvas as HTMLCanvasElement
    const probe = document.createElement('canvas')
    probe.width = Math.min(source.width, 240)
    probe.height = Math.min(source.height, 160)
    const context = probe.getContext('2d')
    if (!context) return { colored: 0, signature: '' }
    context.drawImage(source, 0, 0, probe.width, probe.height)
    const data = context.getImageData(0, 0, probe.width, probe.height).data
    let colored = 0
    let signature = 0
    for (let index = 0; index < data.length; index += 16) {
      const alpha = data[index + 3]
      const value = data[index] + data[index + 1] + data[index + 2]
      if (alpha > 8 && value > 12) colored += 1
      signature = (signature + value * (index + 1)) % 1000000007
    }
    return { colored, signature: String(signature) }
  })
}

test('desktop scene is visible and reacts to pointer movement', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop scene assertion only runs in the desktop project.')
  await page.goto('/')
  const heroHeading = page.locator('#current h1')
  await expect(heroHeading).toHaveText('HD2DKit')
  const canvas = page.locator('[data-testid="portfolio-three-canvas"]')
  await expect(canvas).toHaveAttribute('data-scene-mode', 'full')
  await page.waitForTimeout(350)
  const before = await canvasSignature(page)
  expect(before.colored).toBeGreaterThan(60)
  await page.mouse.move(1160, 180)
  await page.waitForTimeout(450)
  const after = await canvasSignature(page)
  expect(after.signature).not.toBe(before.signature)

  await page.getByRole('button', { name: '下一个项目', exact: true }).click()
  await expect(heroHeading).toHaveText('Parry Arena')
  await expect(canvas).toHaveAttribute('data-theme', 'timing-gate')
})

test('mobile layout does not overflow and uses compact scene mode', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile layout assertion only runs in the mobile project.')
  await page.goto('/')
  const canvas = page.locator('[data-testid="portfolio-three-canvas"]')
  await expect(canvas).toHaveAttribute('data-scene-mode', 'compact')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
  await expect(page.locator('#current h1')).toBeVisible()
  await expect(page.getByRole('button', { name: '03 Anchored Gaze', exact: true })).toBeVisible()
})

test('reduced motion keeps content readable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'reduced-motion', 'Reduced motion assertion only runs in the reduced-motion project.')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#static-signal')
  const canvas = page.locator('[data-testid="portfolio-three-canvas"]')
  await expect(canvas).toHaveAttribute('data-motion', 'reduced')
  await expect(page.getByRole('heading', { name: 'STATIC SIGNAL 静默信号' })).toBeVisible()
  await page.getByRole('tab', { name: 'BUILD', exact: true }).click()
  await expect(page.getByRole('link', { name: '下载文件', exact: true })).toHaveAttribute('href', /static-signal-web-package\.zip/)
})

test('project dossier supports direct links and restores the project index', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Dossier route assertion only runs in the desktop project.')
  await page.goto('/#parry-arena')
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading', { name: 'Parry Arena 弹反竞技场' })).toBeVisible()
  await page.getByRole('button', { name: '关闭项目档案', exact: true }).click()
  await expect(page).toHaveURL(/#projects$/)
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('hidden pseudo admin route renders locked access terminal', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Admin route smoke test only runs in the desktop project.')
  await page.goto('/#/admin')
  await expect(page.getByRole('heading', { name: 'ACCESS TERMINAL' })).toBeVisible()
  await expect(page.getByText('PRIVATE GATE')).toBeVisible()
  await expect(page.getByRole('button', { name: /\[UNLOCK PANEL\]/ })).toBeDisabled()
})

test('INDEX-0 fragments unlock the recovery route and CASE-00', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Full INDEX-0 flow runs in the desktop project.')
  await page.addInitScript((storageKey) => window.localStorage.removeItem(storageKey), INDEX_ZERO_STORAGE_KEY)
  await page.goto('/')

  const firstFragment = page.getByTestId('index-zero-fragment-01')
  await expect(firstFragment).toBeVisible()
  await firstFragment.focus()
  await expect(firstFragment).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(firstFragment).toHaveAttribute('aria-label', /已恢复：被删除/)

  const fragmentLocations = [
    ['04', '#current'],
    ['02', '#radar'],
    ['03', '#cases'],
    ['05', '#notes'],
  ] as const

  for (const [index, section] of fragmentLocations) {
    await page.locator(section).scrollIntoViewIfNeeded()
    const fragment = page.getByTestId(`index-zero-fragment-${index}`)
    await expect(fragment).toBeVisible()
    await fragment.click()
  }

  const integrity = page.getByTestId('archive-integrity')
  await expect(integrity).toContainText('5 FRAGMENTS RECOVERED')
  await expect(integrity).toContainText('UNREGISTERED ENTRY FOUND')

  const storedState = await page.evaluate((storageKey) => (
    JSON.parse(window.localStorage.getItem(storageKey) ?? '{}')
  ), INDEX_ZERO_STORAGE_KEY)
  expect(storedState.recoveredFragmentIds).toHaveLength(5)
  expect(storedState.phraseVerified).toBe(false)

  const recoveryLink = page.getByRole('link', { name: /OPEN RECOVERY INTERFACE/ })
  await expect(recoveryLink).toBeVisible()
  await recoveryLink.click()
  await expect(page).toHaveURL(/#\/recovery$/)
  await expect(page.getByRole('heading', { name: 'RECOVERY INTERFACE' })).toBeVisible()

  const phraseInput = page.getByTestId('recovery-phrase')
  await phraseInput.fill('顺序错误的文本')
  await page.getByRole('button', { name: 'VERIFY RECORD' }).click()
  await expect(page.locator('#recovery-response')).not.toContainText('口令匹配')

  await phraseInput.fill(INDEX_ZERO_RECOVERY_PHRASE)
  await page.getByRole('button', { name: 'VERIFY RECORD' }).click()
  await expect(page.getByText('口令匹配。')).toBeVisible()
  await expect(page).toHaveURL(/#\/case-00$/, { timeout: 6_000 })
  await expect(page.getByRole('heading', { name: /CASE-00 \/ THE UNWRITTEN RECORD/ })).toBeVisible()
  await expect(page.getByText('第零号档案 / 未被编写的记录')).toBeVisible()

  await page.getByRole('button', { name: /RETURN TO PUBLIC INDEX/ }).click()
  await expect(page).toHaveURL(/#current$/)
  await expect(page.getByTestId('current-build-status')).toHaveText('OBSERVATION COMPLETE')
  await page.locator('#contact').scrollIntoViewIfNeeded()
  await expect(page.getByText('当前页面已记住本次阅读。')).toBeVisible()
})

test('CASE-00 redirects to recovery before phrase verification', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Route guard smoke test runs in the desktop project.')
  await page.addInitScript((storageKey) => window.localStorage.removeItem(storageKey), INDEX_ZERO_STORAGE_KEY)
  await page.goto('/#/case-00')
  await expect(page).toHaveURL(/#\/recovery$/)
  await expect(page.getByRole('heading', { name: 'RECOVERY INTERFACE' })).toBeVisible()
})

test('mobile visitors can recover all five fragments without overflow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile puzzle flow only runs in the mobile project.')
  await page.addInitScript((storageKey) => window.localStorage.removeItem(storageKey), INDEX_ZERO_STORAGE_KEY)
  await page.goto('/')

  for (const index of ['01', '02', '03', '04', '05']) {
    await page.getByTestId(`index-zero-fragment-${index}`).click()
  }

  await expect(page.getByTestId('archive-integrity')).toContainText('5 FRAGMENTS RECOVERED')
  await expect(page.getByRole('link', { name: /OPEN RECOVERY INTERFACE/ })).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})

test('reduced motion renders the restored CASE-00 document immediately', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'reduced-motion', 'Reduced CASE-00 flow only runs in the reduced-motion project.')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(({ storageKey }) => {
    window.localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      recoveredFragmentIds: [
        'fragment-01',
        'fragment-02',
        'fragment-03',
        'fragment-04',
        'fragment-05',
      ],
      phraseVerified: true,
    }))
  }, { storageKey: INDEX_ZERO_STORAGE_KEY })

  await page.goto('/#/case-00')
  await expect(page.getByRole('heading', { name: /CASE-00 \/ THE UNWRITTEN RECORD/ })).toBeVisible()
  const finalMessage = page.locator('[data-final-observer-text]')
  await expect(finalMessage).toContainText('你没有进入后台。')
  await expect(finalMessage).toContainText('你只是完成了它缺少的那一段。')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})

import { expect, test, type Page } from '@playwright/test'

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

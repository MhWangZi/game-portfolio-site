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
  await expect(page.getByRole('heading', { name: /把游戏作品/ })).toBeVisible()
  const canvas = page.locator('[data-testid="portfolio-three-canvas"]')
  await expect(canvas).toHaveAttribute('data-scene-mode', 'full')
  await page.waitForTimeout(350)
  const before = await canvasSignature(page)
  expect(before.colored).toBeGreaterThan(60)
  await page.mouse.move(1160, 180)
  await page.waitForTimeout(450)
  const after = await canvasSignature(page)
  expect(after.signature).not.toBe(before.signature)
})

test('mobile layout does not overflow and uses compact scene mode', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile layout assertion only runs in the mobile project.')
  await page.goto('/')
  const canvas = page.locator('[data-testid="portfolio-three-canvas"]')
  await expect(canvas).toHaveAttribute('data-scene-mode', 'compact')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
  await expect(page.getByRole('button', { name: /动作关卡原型/ })).toBeVisible()
})

test('reduced motion keeps content readable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'reduced-motion', 'Reduced motion assertion only runs in the reduced-motion project.')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#systems-design-prototype')
  const canvas = page.locator('[data-testid="portfolio-three-canvas"]')
  await expect(canvas).toHaveAttribute('data-motion', 'reduced')
  await expect(page.getByRole('heading', { name: '系统设计原型' })).toBeVisible()
  await expect(page.getByRole('link', { name: /下载 EXE zip/ }).first()).toHaveAttribute(
    'href',
    /windows-demo-placeholder\.zip/,
  )
})

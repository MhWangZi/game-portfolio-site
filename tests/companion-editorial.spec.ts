import { expect, test } from '@playwright/test'

test('registration choice responds with authored text and remembers a revisit', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('button', { name: '翻开灯下的访客登记簿' }).click()
  const dialogue = page.locator('[data-event="visitor-register"]')
  await expect(dialogue).toBeVisible()
  await expect(page.locator('.companion-bubble')).toContainText('写什么都可以')
  await dialogue.getByRole('button', { name: /就叫我访客吧/ }).click()
  await expect(page.locator('[data-event-node="visitor"]')).toBeVisible()
  await page.locator('[data-event-node="visitor"]').getByRole('button', { name: /把笔搁下/ }).click()
  await expect(page.locator('.companion-bubble')).toContainText('字写得挺利落')
  await expect(page.locator('.companion-bubble')).not.toContainText('{wave}')

  await page.getByRole('button', { name: '翻开灯下的访客登记簿' }).click()
  await expect(page.locator('[data-event-node="revisit"]')).toBeVisible()
  await expect(page.locator('.companion-bubble')).toContainText('名字搁在那儿晒着呢')
})

test('ambient observation offers an optional, reachable inquiry', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('button', { name: '看看停下来的时钟' }).click()
  const dialogue = page.locator('[data-event="stopped-clock"]')
  await expect(dialogue).toBeVisible()
  await expect(dialogue.getByRole('button', { name: '钥匙去哪了？' })).toHaveCount(0)
  await dialogue.getByRole('button', { name: '继续询问助手' }).click()
  await dialogue.getByRole('button', { name: /钥匙去哪了/ }).click()
  await expect(page.locator('[data-event-node="editorial-question"]')).toBeVisible()
  await expect(page.locator('.companion-bubble')).toContainText('早不知道塞哪个抽屉格里了')
})

test('high tension changes the revisit line without dropping saved state', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    localStorage.setItem('mhwangzi-visitors-v2', JSON.stringify({ keys: ['visitor', 'clickdown', 'echo'], loops: 0, playlistRead: false, unlocked: false }))
    localStorage.setItem('mw-narrative-events-v1', JSON.stringify({ flags: ['calls_visitor'], visits: { 'visitor-register': 1 }, choices: { 'visitor-register': ['start/visitor'] } }))
  })
  await page.goto('/')
  await page.getByRole('button', { name: '翻开灯下的访客登记簿' }).click()
  await expect(page.locator('[data-event-node="revisit"]')).toBeVisible()
  await expect(page.locator('.companion-bubble')).toContainText('纸质磨薄了')
  await expect(page.locator('.companion-bubble')).not.toContainText('{whisper}')
})

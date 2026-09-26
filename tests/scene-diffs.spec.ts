import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
const scenes=JSON.parse(readFileSync(new URL('../src/avg/exploration/cinematic-scenes.json',import.meta.url),'utf8')) as {id:string;objects:{id:string;transition:{trace?:string;action?:{type:string}}}[]}[];
const diffs=JSON.parse(readFileSync(new URL('../src/avg/exploration/sceneDiffs.json',import.meta.url),'utf8')) as {id:string;room:string}[];

test('every repair trace has a reachable hotspot and keeps the existing room inventory', async ({page}) => {
  for (const diff of diffs) {
    const room=scenes.find(scene=>scene.id===diff.room);
    expect(room, `${diff.id} room`).toBeTruthy();
    expect(room!.objects.some(object=>object.transition.trace===diff.id&&object.transition.action?.type==='event'), `${diff.id} hotspot`).toBe(true);
    const asset=`/media/exploration/diffs/${diff.id}.svg`;
    expect((await page.request.get(asset)).ok(),`${diff.id} artwork`).toBe(true);
  }
  expect(scenes.find(room=>room.id==='lounge')!.objects.some(object=>object.id==='cat')).toBe(true);
  expect(scenes.find(room=>room.id==='lab')!.objects.some(object=>object.id==='recorder')).toBe(true);
});

test('cat bubble never shows a wide version of the same line during normal motion',async ({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'推门去游戏房'}).click();
  await page.getByRole('button',{name:'轻轻摸摸熟睡的猫'}).click();
  await expect(page.locator('[data-event="cat-seat"]')).toBeVisible();
  const widths=await page.evaluate(async()=>{
    const samples:number[]=[];
    const end=performance.now()+550;
    while(performance.now()<end){
      const bubble=document.querySelector<HTMLElement>('.companion-bubble');
      if(bubble&&getComputedStyle(bubble).visibility!=='hidden')samples.push(bubble.getBoundingClientRect().width);
      await new Promise(requestAnimationFrame);
    }
    return samples;
  });
  expect(widths.length).toBeGreaterThan(5);
  expect(Math.max(...widths)-Math.min(...widths)).toBeLessThan(2);
});

test('cat dialogue has one stable bubble layout from the first visible frame', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await page.getByRole('button',{name:'推门去游戏房'}).click();
  const cat=page.getByRole('button',{name:'轻轻摸摸熟睡的猫'});
  await expect(cat).toBeVisible();
  await cat.click();
  await expect(page.locator('.companion-bubble')).toHaveCount(0);
  await expect(page.locator('[data-event="cat-seat"]')).toBeVisible();
  const assistant=page.locator('.companion');
  await expect(assistant).toHaveAttribute('data-whispering','true');
  await expect(page.locator('.companion-bubble')).toBeVisible();
  const width=await page.locator('.companion-bubble').evaluate(element=>element.getBoundingClientRect().width);
  expect(width).toBeLessThanOrEqual(276);
  await page.waitForTimeout(500);
  const later=await page.locator('.companion-bubble').evaluate(element=>element.getBoundingClientRect().width);
  expect(Math.abs(later-width)).toBeLessThan(2);
});

test('a repaired room retains its local image trace after leaving and returning', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await page.getByRole('button',{name:'推门去雨声走廊'}).click();
  const wet=page.getByRole('button',{name:'看看门口未干的水迹'});
  await expect(wet).toBeVisible();
  await wet.click();
  await expect(page.locator('[data-scene-diff="wet-step"]')).toBeVisible();
  await expect(page.locator('[data-event="wet-step"]')).toBeVisible();
  await page.locator('[data-event="wet-step"]').getByRole('button',{name:/移开目光|结束这段观察/}).click();
  await page.getByRole('button',{name:'推门回值班室'}).click();
  await page.getByRole('button',{name:'推门去雨声走廊'}).click();
  await expect(page.locator('[data-scene-diff="wet-step"]')).toBeVisible();
  await page.reload();
  await page.getByRole('button',{name:'推门去雨声走廊'}).click();
  await expect(page.locator('[data-scene-diff="wet-step"]')).toBeVisible();
});

test('new box and paper hotspots are distinct from the existing cat and recorder', async ({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await page.getByRole('button',{name:'推门去游戏房'}).click();
  await page.getByRole('button',{name:'折好书柜下层的包装盒'}).click();
  await expect(page.locator('[data-event="box-outline"]')).toBeVisible();
  await expect(page.locator('[data-scene-diff="box-outline"]')).toBeVisible();
  await expect(page.getByRole('button',{name:'轻轻摸摸熟睡的猫'})).toBeVisible();
  await page.locator('[data-event="box-outline"]').getByRole('button',{name:/移开目光|结束这段观察/}).click();
  await page.getByRole('button',{name:'推门回值班室'}).click();
  await page.getByRole('button',{name:'推门去雨声走廊'}).click();
  await page.getByRole('button',{name:'推门去实验间'}).click();
  await page.getByRole('button',{name:'翻看桌上的测试纸'}).click();
  await expect(page.locator('[data-event="test-paper"]')).toBeVisible();
  await expect(page.locator('[data-scene-diff="test-paper"]')).toBeVisible();
  await expect(page.getByRole('button',{name:'按下那台废弃录音机'})).toBeVisible();
});

(() => {
  'use strict';
  const config = window.PLAYER_CONFIG;
  const status = document.querySelector('#status');
  const progress = document.querySelector('progress');
  const start = document.querySelector('#start');
  const canvas = document.querySelector('canvas');
  const nativeFetch = window.fetch.bind(window);
  const cacheName = `game-${config.slug}-${config.version}`;
  const fetched = new Map();
  let cache;
  const cacheReady = (async () => {
    try { cache = await caches.open(cacheName); } catch (_) { /* Storage can be blocked in embeds. */ }
  })();
  async function download(url) {
    await cacheReady;
    try { const hit = await cache?.match(url); if (hit) return hit; } catch (_) {}
    let error;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await nativeFetch(url, {signal: AbortSignal.timeout(180000)});
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const reader = response.body.getReader();
        const chunks = [];
        let bytes = 0;
        while (true) {
          const {done, value} = await reader.read();
          if (done) break;
          chunks.push(value); bytes += value.length; fetched.set(url, bytes);
          const total = [...fetched.values()].reduce((a,b) => a+b, 0);
          progress.value = Math.min(total / config.downloadBytes, 1);
          status.textContent = `正在加载 ${(total/1048576).toFixed(1)} / ${(config.downloadBytes/1048576).toFixed(1)}MB`;
        }
        const result = new Response(new Blob(chunks), {status: 200});
        try { await cache?.put(url, result.clone()); } catch (_) {}
        return result;
      } catch (err) {
        error = err;
        status.textContent = `连接中断，正在重试（${attempt + 1}/3）…`;
        await new Promise(resolve => setTimeout(resolve, 700 * (attempt + 1)));
      }
    }
    throw error;
  }
  window.fetch = async (input, options) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href);
    const name = url.pathname.split('/').pop();
    const asset = config.assets[name];
    if (asset && url.origin === location.origin && 'DecompressionStream' in window) {
      const zipped = await download(new URL(asset.gzip, location.href).href);
      // Some hosts apply Content-Encoding automatically; accept either representation.
      const data = new Uint8Array(await zipped.arrayBuffer());
      const body = data[0] === 31 && data[1] === 139
        ? new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'))
        : new Blob([data]).stream();
      return new Response(body, {headers: {'Content-Type': name.endsWith('.wasm') ? 'application/wasm' : 'application/octet-stream'}});
    }
    return nativeFetch(input, options);
  };
  document.querySelector('#fullscreen').onclick = () => document.documentElement.requestFullscreen?.().catch(() => {});
  document.querySelector('#reload').onclick = () => location.reload();
  canvas.addEventListener('contextmenu', event => event.preventDefault());
  canvas.addEventListener('wheel', event => event.preventDefault(), {passive:false});
  start.onclick = async () => {
    start.hidden = true;
    progress.hidden = false;
    status.textContent = '正在准备游戏…';
    try {
      const missing = Engine.getMissingFeatures({threads:false});
      if (missing.length) throw new Error('浏览器缺少：' + missing.join(', '));
      const engine = new Engine(config.godot);
      await engine.startGame({canvas, onExit: () => {
        document.querySelector('#cover').hidden = false;
        status.textContent = '游戏已退出，点击重新载入即可再次游玩。';
      }});
      document.querySelector('#cover').hidden = true;
      canvas.focus();
    } catch (err) {
      status.textContent = '加载失败，请检查连接后重新载入。' + String(err.message || err);
      progress.hidden = true;
      console.error(err);
    }
  };
})();

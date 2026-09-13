(() => {
  "use strict";
  const config = window.PLAYER_CONFIG;
  const status = document.querySelector("#status");
  const progress = document.querySelector("progress");
  const start = document.querySelector("#start");
  const canvas = document.querySelector("canvas");
  const nativeFetch = window.fetch.bind(window);
  const emit = (detail) =>
    window.dispatchEvent(new CustomEvent("avg-player-event", { detail }));
  const cacheName = `game-${config.slug}-${config.version}`;
  const fetched = new Map();
  const expected = new Map(
    Object.values(config.assets).map((asset) => [
      new URL(asset.gzip, location.href).href,
      asset.bytes,
    ]),
  );
  const report = () => {
    const loaded = [...fetched.values()].reduce((a, b) => a + b, 0);
    const total = [...expected.values()].reduce((a, b) => a + b, 0);
    progress.value = Math.min(loaded / total, 1);
    status.textContent = `正在读取资源 ${(loaded / 1048576).toFixed(1)} / ${(total / 1048576).toFixed(1)}MB`;
    emit({ type: "progress", loaded, total });
  };
  let cache;
  const cacheReady = (async () => {
    try {
      cache = await caches.open(cacheName);
    } catch (_) {
      /* Storage can be blocked in embeds. */
    }
  })();
  async function download(url) {
    await cacheReady;
    try {
      const hit = await cache?.match(url);
      if (hit) {
        const size =
          Number(hit.headers.get("Content-Length")) || expected.get(url);
        fetched.set(url, size);
        expected.set(url, size);
        report();
        return hit;
      }
    } catch (_) {}
    let error;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await nativeFetch(url, {
          signal: AbortSignal.timeout(180000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const asset = Object.values(config.assets).find(
          (a) => new URL(a.gzip, location.href).href === url,
        );
        // Fetch exposes decoded bytes when a host adds Content-Encoding:gzip.
        expected.set(
          url,
          response.headers.get("Content-Encoding")?.includes("gzip")
            ? asset.rawBytes
            : Number(response.headers.get("Content-Length")) || asset.bytes,
        );
        const reader = response.body.getReader();
        const chunks = [];
        let bytes = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          bytes += value.length;
          fetched.set(url, bytes);
          report();
        }
        expected.set(url, bytes);
        report();
        const result = new Response(new Blob(chunks), {
          status: 200,
          headers: { "Content-Length": String(bytes) },
        });
        try {
          await cache?.put(url, result.clone());
        } catch (_) {}
        return result;
      } catch (err) {
        error = err;
        status.textContent = `连接中断，正在重试（${attempt + 1}/3）…`;
        await new Promise((resolve) =>
          setTimeout(resolve, 700 * (attempt + 1)),
        );
      }
    }
    throw error;
  }
  window.fetch = async (input, options) => {
    const url = new URL(
      typeof input === "string" ? input : input.url,
      location.href,
    );
    const name = url.pathname.split("/").pop();
    const asset = config.assets[name];
    if (
      asset &&
      url.origin === location.origin &&
      "DecompressionStream" in window
    ) {
      const zipped = await download(new URL(asset.gzip, location.href).href);
      // Some hosts apply Content-Encoding automatically; accept either representation.
      const data = new Uint8Array(await zipped.arrayBuffer());
      const body =
        data[0] === 31 && data[1] === 139
          ? new Blob([data])
              .stream()
              .pipeThrough(new DecompressionStream("gzip"))
          : new Blob([data]).stream();
      return new Response(body, {
        headers: {
          "Content-Type": name.endsWith(".wasm")
            ? "application/wasm"
            : "application/octet-stream",
        },
      });
    }
    return nativeFetch(input, options);
  };
  document.querySelector("#fullscreen").onclick = () =>
    document.documentElement.requestFullscreen?.().catch(() => {});
  document.querySelector("#reload").onclick = () => location.reload();
  window.addEventListener("avg-game-event", (event) => {
    if (event.detail?.type !== "exit") return;
    document.querySelector("#cover").hidden = false;
    progress.hidden = true;
    status.textContent = "游戏已退出。";
    start.hidden = false;
    start.textContent = "重新载入";
    start.onclick = () => location.reload();
  });
  canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  canvas.addEventListener("wheel", (event) => event.preventDefault(), {
    passive: false,
  });
  start.onclick = async () => {
    emit({ type: "loading" });
    start.hidden = true;
    progress.hidden = false;
    status.textContent = "正在准备游戏…";
    try {
      const missing = Engine.getMissingFeatures({ threads: false });
      if (missing.length) throw new Error("浏览器缺少：" + missing.join(", "));
      const engine = new Engine(config.godot);
      await engine.startGame({
        canvas,
        onExit: () => {
          emit({ type: "exit" });
          document.querySelector("#cover").hidden = false;
          status.textContent = "游戏已退出，点击重新载入即可再次游玩。";
        },
      });
      document.querySelector("#cover").hidden = true;
      emit({ type: "ready" });
      canvas.focus();
    } catch (err) {
      emit({ type: "error", message: String(err.message || err) });
      status.textContent =
        "加载失败，请检查连接后重新载入。" + String(err.message || err);
      progress.hidden = true;
      console.error(err);
    }
  };
})();

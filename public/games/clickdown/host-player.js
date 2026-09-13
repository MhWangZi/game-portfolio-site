(() => {
  const embedded =
    window.parent !== window &&
    new URLSearchParams(location.search).get("embed") === "1";
  if (!embedded) return;
  const channel = "mhwangzi-avg-v1";
  const send = (detail) =>
    parent.postMessage({ channel, ...detail }, location.origin);
  const style = document.createElement("style");
  style.textContent =
    "@font-face{font-family:MWPixel;src:url('../../fonts/uranus-pixel.woff2')}body,button,p,h1{font-family:MWPixel,monospace!important}nav{display:none!important}#cover{background:#101915!important;padding:clamp(8px,3vw,24px);gap:clamp(7px,2vw,18px)}#cover h1{font-size:clamp(16px,4vw,32px)}#cover p{font-size:clamp(9px,1.5vw,13px);line-height:1.5}#cover button{padding:8px 14px;font-size:clamp(10px,2vw,15px)}#cover small{display:none}";
  document.head.append(style);
  window.addEventListener("message", (event) => {
    if (
      event.source !== parent ||
      event.origin !== location.origin ||
      event.data?.channel !== channel
    )
      return;
    const { action, requestId } = event.data;
    if (!["pause", "resume", "inspect"].includes(action)) return;
    if (typeof window.avgGameCommand === "function")
      window.avgGameCommand(JSON.stringify({ action, requestId }));
    else send({ type: "unavailable", requestId });
  });
  window.addEventListener("avg-game-event", (event) => send(event.detail));
  window.addEventListener("avg-player-event", (event) => send(event.detail));
  window.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        send({ type: "return-request" });
      }
    },
    true,
  );
  send({ type: "shell-ready" });
})();

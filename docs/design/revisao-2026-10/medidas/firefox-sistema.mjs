// O Firefox do sistema (o do Gabriel, 157 no Fedora), nao o do Playwright:
// dirigido por WebDriver BiDi com o WebSocket do Node, perfil temporario,
// headless. Mede a curva (curva.js) e captura inicio/meio/fim do "Sobre".
// Uso: node firefox-sistema.mjs <pasta-temporaria> <pasta-capturas>  (com o out/ servido em :4173)
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
const [S, shots] = process.argv.slice(2);
mkdirSync(`${S}/ffprof2`, { recursive: true });
const ff = spawn("/usr/bin/firefox", ["--headless", "--no-remote", "-profile", `${S}/ffprof2`, "--remote-debugging-port", "9333", "--width", "1440", "--height", "900", "about:blank"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 4000));
const ws = new WebSocket("ws://127.0.0.1:9333/session");
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
const send = (method, params) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const out = {};
try {
  console.log("session", (await send("session.new", { capabilities: {} })).result?.capabilities?.browserVersion);
  const ctx = (await send("browsingContext.getTree", {})).result.contexts[0].context;
  await send("browsingContext.setViewport", { context: ctx, viewport: { width: 1440, height: 900 } });
  await send("browsingContext.navigate", { context: ctx, url: "http://127.0.0.1:4173/", wait: "complete" });
  await send("script.evaluate", { target: { context: ctx }, expression: "sessionStorage.setItem('gsys:booted','1')", awaitPromise: false });
  await send("browsingContext.reload", { context: ctx, wait: "complete" });
  await new Promise((r) => setTimeout(r, 800));
  const body = readFileSync(new URL("./curva.js", import.meta.url), "utf8");
  const res = await send("script.evaluate", { target: { context: ctx }, expression: `(async () => JSON.stringify({ ua: navigator.userAgent.match(/Firefox\\/\\S+/)[0], supports: CSS.supports("animation-timeline: view()"), reduce: matchMedia("(prefers-reduced-motion: reduce)").matches, ...(await (async () => {${body}})()) }))()`, awaitPromise: true });
  console.log(res.result?.result?.value ?? JSON.stringify(res));
  // capturas inicio/meio/fim
  const stops = `const documentTop = (el) => { let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop; return y; }; const lines = [...document.querySelectorAll(".bench-about-lines p")]; const first = documentTop(lines[0]); const last = lines.at(-1); const s = [first - innerHeight * 0.92, first - innerHeight * 0.55, documentTop(last) + last.offsetHeight - innerHeight * 0.45];`;
  for (const [i, name] of ["1-inicio", "2-meio", "3-fim"].entries()) {
    const r = await send("script.evaluate", { target: { context: ctx }, expression: `(async () => { ${stops} scrollTo({ top: s[${i}], behavior: "instant" }); await new Promise((r) => setTimeout(r, 300)); return JSON.stringify([...document.querySelectorAll(".bench-about-lines p")].map((p) => +(+getComputedStyle(p).opacity).toFixed(2))); })()`, awaitPromise: true });
    const shot = await send("browsingContext.captureScreenshot", { context: ctx, format: { type: "image/jpeg", quality: 0.78 } });
    writeFileSync(`${shots}/firefox157-${name}.jpg`, Buffer.from(shot.result.data, "base64"));
    out[name] = JSON.parse(r.result.result.value);
  }
  console.log(JSON.stringify(out));
} finally { ws.close(); ff.kill(); }

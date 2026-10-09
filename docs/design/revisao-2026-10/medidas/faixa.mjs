// A faixa nova do "Sobre" (2026-10-09, segunda rodada) nos navegadores do
// sistema, com interface: o Firefox 157 do Fedora por WebDriver BiDi (perfil
// temporario) e o Chromium do Fedora pelo Playwright. Duas paradas: a ultima
// frase entrando na faixa (de baixo apagada, de cima acesas) e mais adiante
// (todas acesas); e uma terceira com ?debug=reveal, para mostrar o painel.
// Uso: node faixa.mjs <firefox|chromium> <base-url> <pasta-capturas> <pasta-temporaria>
import { spawn } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { chromium } from "./lib.mjs";

const [engine, base, shots, tmp] = process.argv.slice(2);
mkdirSync(shots, { recursive: true });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Poe o topo da primeira frase a `fraction` da tela; devolve onde cada frase
// ficou e a opacidade dela.
const place = (fraction) => `(async () => {
  const lines = [...document.querySelectorAll(".bench-about-lines p")];
  let top = 0;
  for (let node = lines[0]; node; node = node.offsetParent) top += node.offsetTop;
  scrollTo({ top: top - innerHeight * ${fraction}, behavior: "instant" });
  await new Promise((resolve) => setTimeout(resolve, 400));
  return JSON.stringify(lines.map((line) => [+(line.getBoundingClientRect().top / innerHeight).toFixed(2), +(+getComputedStyle(line).opacity).toFixed(2)]));
})()`;
const stops = [["1-entrando", 0.56], ["2-adiante", 0.12]];

if (engine === "firefox") {
  const profile = `${tmp}/faixa-firefox`;
  rmSync(profile, { recursive: true, force: true });
  mkdirSync(profile, { recursive: true });
  const port = 9600 + Math.floor(Math.random() * 300);
  const ff = spawn("/usr/bin/firefox", ["--no-remote", "-profile", profile, "--remote-debugging-port", String(port), "--width", "1440", "--height", "900", "about:blank"], { stdio: "ignore" });
  let ws;
  for (let tries = 0; ; tries++) {
    await sleep(1000);
    try {
      ws = new WebSocket(`ws://127.0.0.1:${port}/session`);
      await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
      break;
    } catch { if (tries > 30) throw new Error("o Firefox nao abriu o BiDi"); }
  }
  let id = 0;
  const pending = new Map();
  ws.onmessage = (message) => { const data = JSON.parse(message.data); if (data.id && pending.has(data.id)) { pending.get(data.id)(data); pending.delete(data.id); } };
  const send = (method, params) => new Promise((resolve) => { const i = ++id; pending.set(i, resolve); ws.send(JSON.stringify({ id: i, method, params })); });
  const evaluate = async (context, expression) => (await send("script.evaluate", { target: { context }, expression, awaitPromise: true })).result.result.value;
  try {
    const version = (await send("session.new", { capabilities: {} })).result.capabilities.browserVersion;
    const context = (await send("browsingContext.getTree", {})).result.contexts[0].context;
    await send("browsingContext.setViewport", { context, viewport: { width: 1440, height: 900 } });
    for (const [suffix, debug] of [["", false], ["-debug", true]]) {
      await send("browsingContext.navigate", { context, url: `${base}/${debug ? "?debug=reveal" : ""}`, wait: "complete" });
      await evaluate(context, "sessionStorage.setItem('gsys:booted', '1')");
      await send("browsingContext.reload", { context, wait: "complete" });
      await sleep(1200);
      for (const [name, fraction] of debug ? stops.slice(0, 1) : stops) {
        const lines = await evaluate(context, place(fraction));
        const shot = await send("browsingContext.captureScreenshot", { context, format: { type: "image/jpeg", quality: 0.8 } });
        writeFileSync(`${shots}/firefox${version.split(".")[0]}-${name}${suffix}.jpg`, Buffer.from(shot.result.data, "base64"));
        console.log(`firefox ${version} ${name}${suffix}`, lines);
      }
    }
  } finally { ws.close(); ff.kill(); }
} else {
  const browser = await chromium.launch({ executablePath: "/usr/bin/chromium-browser", headless: false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => sessionStorage.setItem("gsys:booted", "1"));
  for (const [suffix, debug] of [["", false], ["-debug", true]]) {
    await page.goto(`${base}/${debug ? "?debug=reveal" : ""}`);
    await page.waitForTimeout(1200);
    for (const [name, fraction] of debug ? stops.slice(0, 1) : stops) {
      const lines = await page.evaluate(place(fraction));
      await page.screenshot({ path: `${shots}/chromium-${name}${suffix}.jpg`, type: "jpeg", quality: 80 });
      console.log(`chromium ${browser.version()} ${name}${suffix}`, lines);
    }
  }
  await browser.close();
}

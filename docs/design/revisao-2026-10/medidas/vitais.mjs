// Web vitals de laboratorio com a CPU 4x mais lenta (CDP), mediana de 3:
// FCP, LCP (e o elemento), CLS, TBT (soma de long tasks - 50 ms ate 5 s depois
// do load), maior long task, INP aproximado (maior duracao de interacao em
// abrir a busca, digitar, fechar, ligar o som e rolar), e bytes por tipo.
// Depois, fluidez: intervalos de quadro (rAF) rolando 4000 px.
// Uso: node vitais.mjs <base-url> <saida.json> [rotas separadas por virgula]
import fs from "node:fs";
import { context, launch, routes } from "./lib.mjs";

const [base, outFile, only] = process.argv.slice(2);
const pick = only ? routes.filter(([n]) => only.split(",").includes(n)) : routes.filter(([n]) => ["home", "arquivo", "caso-telegram", "sobre"].includes(n));
const runs = Number(process.env.RUNS ?? 3);
const browser = await launch();
const result = {};

const observe = () => {
  window.__v = { lcp: 0, lcpEl: "", cls: 0, long: [], events: [], fcp: 0 };
  new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__v.lcp = e.startTime; window.__v.lcpEl = e.element ? `${e.element.tagName.toLowerCase()}.${e.element.className}`.slice(0, 60) : e.url?.slice(-40) ?? ""; } }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__v.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__v.long.push([e.startTime, e.duration]); }).observe({ type: "longtask", buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.interactionId) window.__v.events.push([e.name, e.duration]); }).observe({ type: "event", buffered: true, durationThreshold: 16 });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === "first-contentful-paint") window.__v.fcp = e.startTime; }).observe({ type: "paint", buffered: true });
};

const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

for (const width of [1440, 390]) {
  for (const [name, route] of pick) {
    const samples = [];
    for (let run = 0; run < runs; run++) {
      const { ctx, mobile, size } = await context(browser, width);
      await ctx.addInitScript(observe);
      const page = await ctx.newPage();
      const cdp = await ctx.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      const bytes = { html: 0, js: 0, css: 0, font: 0, image: 0, other: 0 };
      page.on("response", async (response) => {
        const url = response.url();
        if (!url.startsWith(base)) return;
        const body = await response.body().catch(() => null);
        const size = Number(response.headers()["content-length"] ?? body?.length ?? 0);
        const p = new URL(url).pathname;
        const kind = /\.m?js$/.test(p) ? "js" : /\.css$/.test(p) ? "css" : /\.woff2?$/.test(p) ? "font" : /\.(avif|webp|png|jpe?g|svg|gif|ico)$/.test(p) ? "image" : /(\/|\.html)$/.test(p) ? "html" : "other";
        bytes[kind] += size;
      });
      await page.goto(base + route, { waitUntil: "load" });
      await page.waitForTimeout(5000);
      // Interacoes (INP aproximado): busca, digitar, fechar, som.
      if (!mobile) {
        await page.keyboard.press("Control+k");
        await page.waitForTimeout(500);
        await page.keyboard.type("py", { delay: 80 });
        await page.waitForTimeout(500);
        await page.keyboard.press("Escape");
        await page.waitForTimeout(300);
      }
      const sound = page.locator(".sound-toggle").first();
      if (await sound.isVisible().catch(() => false)) { await sound.click(); await page.waitForTimeout(300); await sound.click(); await page.waitForTimeout(300); }
      // Fluidez: rAF durante a rolagem.
      await page.evaluate(() => { window.__f = []; const loop = (t) => { window.__f.push(t); window.__raf = requestAnimationFrame(loop); }; window.__raf = requestAnimationFrame(loop); });
      const longBefore = await page.evaluate(() => window.__v.long.length);
      if (mobile) await cdp.send("Input.synthesizeScrollGesture", { x: size.width / 2, y: size.height * 0.7, yDistance: -4000, speed: 1200, gestureSourceType: "touch" });
      else { await page.mouse.move(size.width / 2, size.height / 2); for (let i = 0; i < 40; i++) { await page.mouse.wheel(0, 100); await page.waitForTimeout(16); } }
      await page.waitForTimeout(1000);
      const v = await page.evaluate(() => { cancelAnimationFrame(window.__raf); return { ...window.__v, frames: window.__f }; });
      const tbt = v.long.filter(([s]) => s >= v.fcp).reduce((a, [, d]) => a + Math.max(0, d - 50), 0);
      const iv = v.frames.slice(1).map((t, i) => t - v.frames[i]);
      const sorted = [...iv].sort((a, b) => a - b);
      samples.push({
        fcp: v.fcp, lcp: v.lcp, lcpEl: v.lcpEl, cls: v.cls, tbt,
        maxLong: Math.max(0, ...v.long.map(([, d]) => d)),
        inp: Math.max(0, ...v.events.map(([, d]) => d)),
        p95frame: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
        over34: iv.filter((x) => x > 34).length,
        scrollLong: v.long.length - longBefore,
        bytes,
      });
      await ctx.close();
    }
    const m = (k) => +median(samples.map((s) => s[k])).toFixed(k === "cls" ? 3 : 0);
    result[`${width} ${name}`] = {
      fcp: m("fcp"), lcp: m("lcp"), lcpEl: samples[0].lcpEl, cls: m("cls"), tbt: m("tbt"), maxLong: m("maxLong"), inp: m("inp"),
      p95frame: m("p95frame"), over34: m("over34"), scrollLong: m("scrollLong"),
      kb: Object.fromEntries(Object.entries(samples[0].bytes).map(([k, b]) => [k, +(b / 1024).toFixed(1)])),
    };
    console.log(`${width} ${name}`, JSON.stringify(result[`${width} ${name}`]));
  }
}
fs.writeFileSync(outFile, JSON.stringify(result, null, 1));
await browser.close();

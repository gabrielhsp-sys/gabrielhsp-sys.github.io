// O "Sobre" ligado a rolagem (2026-10-09): capturas do inicio, meio e fim da
// secao em Chromium e Firefox, e quadros com a CPU 4x mais lenta no Chromium,
// tanto no caminho CSS (animation-timeline) quanto com o fallback JS forcado
// (CSS.supports mentindo que nao ha animation-timeline, como no Firefox).
// O WebKit fica com webkitgtk.py. Uso: node rolagem.mjs <base-url> <pasta-capturas> <saida.json>
import fs from "node:fs";
import path from "node:path";
import { chromium, firefox } from "./lib.mjs";

const [base, shots, outFile] = process.argv.slice(2);
fs.mkdirSync(shots, { recursive: true });
const report = {};

// Onde parar: a primeira frase entrando pela base (apagadas), a primeira a 55%
// da tela (acendendo, em degrade) e a ultima ja no meio de cima (acesas).
const stops = () => {
  const documentTop = (el) => { let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop; return y; };
  const lines = [...document.querySelectorAll(".bench-about-lines p")];
  const first = documentTop(lines[0]);
  const last = lines.at(-1);
  return [["1-inicio", first - innerHeight * 0.92], ["2-meio", first - innerHeight * 0.55], ["3-fim", documentTop(last) + last.offsetHeight - innerHeight * 0.45]];
};
const opacities = () => [...document.querySelectorAll(".bench-about-lines p")].map((p) => +(+getComputedStyle(p).opacity).toFixed(2));

for (const [name, engine] of Object.entries({ chromium, firefox })) {
  const browser = await engine.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => sessionStorage.setItem("gsys:booted", "1"));
  await page.goto(base + "/", { waitUntil: "load" });
  await page.waitForTimeout(600);
  report[name] = { version: browser.version(), fallback: await page.evaluate(() => document.querySelector(".bench").hasAttribute("data-scroll-fallback")), stops: {} };
  for (const [stop, y] of await page.evaluate(stops)) {
    await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), y);
    await page.waitForTimeout(300);
    report[name].stops[stop] = await page.evaluate(opacities);
    await page.screenshot({ path: path.join(shots, `${name}-${stop}.jpg`), type: "jpeg", quality: 78 });
  }
  await browser.close();
}

// Quadros: rola a bancada inteira com a roda (100 px a cada 16 ms) com a CPU 4x
// mais lenta; le do trace as tarefas da main thread do renderer e, da pagina,
// os intervalos de requestAnimationFrame.
const forceFallback = () => {
  const native = CSS.supports.bind(CSS);
  CSS.supports = (...args) => (/animation-timeline/.test(args.join(":")) ? false : native(...args));
};
for (const mode of ["css", "fallback-js"]) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => sessionStorage.setItem("gsys:booted", "1"));
  if (mode === "fallback-js") await page.addInitScript(forceFallback);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto(base + "/", { waitUntil: "load" });
  await page.waitForTimeout(3000);
  const range = await page.evaluate(() => {
    const bench = document.querySelector(".bench");
    const about = document.querySelector(".bench-about");
    const top = (el) => el.getBoundingClientRect().top + scrollY;
    return { from: top(about) - innerHeight, to: top(bench) + bench.offsetHeight, fallback: bench.hasAttribute("data-scroll-fallback") };
  });
  await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), range.from);
  await page.waitForTimeout(500);
  await page.mouse.move(720, 450);
  await browser.startTracing(page, { categories: ["toplevel", "devtools.timeline", "disabled-by-default-devtools.timeline.frame"] });
  await page.evaluate(() => { window.__f = []; const loop = (t) => { window.__f.push(t); window.__raf = requestAnimationFrame(loop); }; window.__raf = requestAnimationFrame(loop); });
  const wheels = Math.ceil((range.to - range.from) / 100);
  for (let i = 0; i < wheels; i++) { await page.mouse.wheel(0, 100); await page.waitForTimeout(16); }
  await page.waitForTimeout(800);
  const frames = await page.evaluate(() => { cancelAnimationFrame(window.__raf); return window.__f; });
  const trace = JSON.parse((await browser.stopTracing()).toString());
  const threads = Object.fromEntries(trace.traceEvents.filter((e) => e.name === "thread_name").map((e) => [`${e.pid}:${e.tid}`, e.args.name]));
  const tasks = trace.traceEvents
    .filter((e) => e.ph === "X" && (e.name === "RunTask" || e.name === "ThreadControllerImpl::RunTask") && threads[`${e.pid}:${e.tid}`] === "CrRendererMain")
    .map((e) => e.dur / 1000);
  const intervals = frames.slice(1).map((t, i) => t - frames[i]);
  const sorted = (xs) => [...xs].sort((a, b) => a - b);
  const pct = (xs, p) => +(sorted(xs)[Math.floor(xs.length * p)] ?? 0).toFixed(1);
  report[`quadros-4x-${mode}`] = {
    fallbackActive: range.fallback,
    scrolledPx: Math.round(range.to - range.from),
    rafFrames: frames.length,
    rafP50: pct(intervals, 0.5), rafP95: pct(intervals, 0.95), rafMax: +Math.max(...intervals).toFixed(1),
    rafOver20ms: intervals.filter((x) => x > 20).length,
    mainTasks: tasks.length, mainTaskP95: pct(tasks, 0.95), mainTaskMax: +Math.max(0, ...tasks).toFixed(1),
    mainTasksOver16ms: tasks.filter((x) => x > 16).length,
  };
  await browser.close();
}

fs.writeFileSync(outFile, JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));

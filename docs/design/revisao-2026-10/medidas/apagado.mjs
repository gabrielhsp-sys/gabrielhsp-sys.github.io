import { createRequire } from "node:module";
const require = createRequire(process.cwd() + "/package.json");
const { chromium } = require("@playwright/test"); const sharp = require("sharp");
const lum = (c) => { const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const paper = [0xe9, 0xe0, 0xca];
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.addInitScript(() => sessionStorage.setItem("gsys:booted", "1"));
await p.goto("http://127.0.0.1:4173/");
for (const idx of [0, 1, 2, 3]) {
  const box = await p.evaluate(async (idx) => { const el = document.querySelectorAll(".bench-about-lines p")[idx]; let top = 0; for (let n = el; n; n = n.offsetParent) top += n.offsetTop; scrollTo({ top: top - innerHeight * 0.85, behavior: "instant" }); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); document.querySelectorAll(".bench-about-lines p").forEach((q) => q.style.visibility = "hidden"); const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, width: Math.min(r.width, 500), height: r.height }; }, idx);
  const png = await p.screenshot({ clip: box });
  await p.evaluate(() => document.querySelectorAll(".bench-about-lines p").forEach((q) => q.style.visibility = ""));
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const px = []; for (let i = 0; i < data.length; i += info.channels) px.push([data[i], data[i + 1], data[i + 2]]);
  px.sort((m, n) => lum(m) - lum(n)); const bg = px[Math.floor(px.length * 0.98)]; const med = px[Math.floor(px.length / 2)];
  const row = [0.16, 0.2, 0.25, 1].map((a) => { const t = paper.map((v, i) => a * v + (1 - a) * med[i]); return `${a}: ${ratio(t, med).toFixed(2)}/${ratio(t, bg).toFixed(2)}`; });
  console.log(`frase ${idx + 1} (mediana ${med} · p98 ${bg})`, row.join("  "));
}
await b.close();

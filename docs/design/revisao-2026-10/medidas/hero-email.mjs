// P1 e P2 (2026-10-09): o hero com o e-mail em 1440 e 390 e, no celular, sem
// o indice de estudos de caso. Uso: node hero-email.mjs <base-url> <pasta-capturas>
import fs from "node:fs";
import path from "node:path";
import { chromium } from "./lib.mjs";

const [base, shots] = process.argv.slice(2);
fs.mkdirSync(shots, { recursive: true });
const browser = await chromium.launch();
for (const [name, viewport, mobile] of [["1440", { width: 1440, height: 900 }, false], ["390", { width: 390, height: 844 }, true]]) {
  const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
  await ctx.addInitScript(() => sessionStorage.setItem("gsys:booted", "1"));
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "load" });
  await page.waitForTimeout(800);
  const facts = await page.evaluate(() => {
    const box = (s) => { const el = document.querySelector(s); if (!el || !el.getClientRects().length) return null; const r = el.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right) }; };
    return { viewport: [innerWidth, innerHeight], overflowX: document.documentElement.scrollWidth - innerWidth, falarComigo: box(".hero-actions .button-solid"), email: box(".hero-email"), painel: box(".hero-panel") };
  });
  console.log(name, JSON.stringify(facts));
  await page.screenshot({ path: path.join(shots, `hero-${name}.jpg`), type: "jpeg", quality: 80 });
  if (mobile) await page.screenshot({ path: path.join(shots, `hero-${name}-pagina.jpg`), type: "jpeg", quality: 70, clip: { x: 0, y: 0, width: 390, height: 2200 }, fullPage: true });
  await ctx.close();
}
await browser.close();

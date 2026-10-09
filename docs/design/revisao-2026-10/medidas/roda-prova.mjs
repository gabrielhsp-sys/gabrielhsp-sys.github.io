// Prova do corte: rola a home com a roda ate "Projetos em destaque" passar pela
// altura da barra e fotografa; depois um entalhe para cima (a barra volta).
// Uso: node roda-prova.mjs <base-url> <pasta> [largura]
import fs from "node:fs";
import path from "node:path";
import { context, launch } from "./lib.mjs";

const [base, out, w = "1366"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await launch();
const { ctx, size } = await context(browser, Number(w));
const page = await ctx.newPage();
await page.goto(base + "/", { waitUntil: "load" });
await page.waitForTimeout(800);
await page.mouse.move(size.width / 2, size.height / 2);
for (let i = 0; i < 200; i++) {
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(260);
  const top = await page.evaluate(() => document.querySelector("#featured-heading").getBoundingClientRect().top);
  if (top < 60) break;
}
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(out, `roda-${w}-descendo.jpg`), type: "jpeg", quality: 75 });
await page.mouse.wheel(0, -100);
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(out, `roda-${w}-subindo.jpg`), type: "jpeg", quality: 75 });
await browser.close();

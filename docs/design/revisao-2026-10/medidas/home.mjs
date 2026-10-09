// Capturas da home com a imagem em pontos fixos: hero, bancada sozinha, meio e
// fim do "Sobre", e a entrada dos projetos.
// Uso: node home.mjs <base-url> <pasta-saida> [larguras...]   (REDUCED=1 para movimento reduzido)
import fs from "node:fs";
import path from "node:path";
import { context, launch } from "./lib.mjs";

const [base, out, ...widthsArg] = process.argv.slice(2);
const widths = (widthsArg.length ? widthsArg : ["1440", "1920", "1366", "390"]).map(Number);
fs.mkdirSync(out, { recursive: true });
const browser = await launch();
for (const width of widths) {
  const { ctx } = await context(browser, width, { reduced: process.env.REDUCED === "1" });
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "load" });
  await page.waitForTimeout(1200);
  const points = await page.evaluate(() => {
    const top = (sel) => document.querySelector(sel).getBoundingClientRect().top + scrollY;
    const about = top("#sobre"), frame = top(".bench-about-frame"), cases = top("#projetos");
    return [["1-hero", 0], ["2-bancada", about - innerHeight * 0.1], ["3-sobre", frame - innerHeight * 0.45], ["4-sobre-fim", frame - innerHeight * 0.12], ["5-saida", cases - innerHeight * 0.55], ["6-projetos", cases - 72]];
  });
  for (const [name, y] of points) {
    await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), Math.max(0, Math.round(y)));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(out, `${width}-${name}.jpg`), type: "jpeg", quality: 75 });
  }
  await ctx.close();
}
await browser.close();

// Home sem o "Sobre" (decisao do Gabriel, 2026-10-09): o hero, a passagem do
// hero para "Projetos em destaque" e a mesma rolagem na main, lado a lado, em
// 1440x900 e 390x844. Mede tambem o espaco entre o fim do hero e o titulo de
// "Projetos em destaque", erros de console e imagens de fundo depois do hero.
// Uso: node transicao.mjs <url-desta-branch> <url-da-main> <pasta-capturas>
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { chromium } from "./lib.mjs";

const sharp = createRequire(import.meta.url)("sharp");
const [branch, main, shots] = process.argv.slice(2);
fs.mkdirSync(shots, { recursive: true });

const measure = () => {
  const hero = document.querySelector(".hero");
  const featured = document.querySelector("#projetos");
  const box = hero.getBoundingClientRect();
  const heading = featured.querySelector("h2").getBoundingClientRect();
  const lastText = [...hero.querySelectorAll(".hero-copy > *, .hero-panel")].filter((el) => el.getClientRects().length && getComputedStyle(el).display !== "none").map((el) => el.getBoundingClientRect().bottom);
  const below = [...document.querySelectorAll("body *")].filter((el) => hero.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING && !hero.contains(el));
  return {
    heroHeight: Math.round(box.height),
    heroBottomToHeading: Math.round(heading.top - box.bottom),
    lastHeroContentToHeading: Math.round(heading.top - Math.max(...lastText)),
    imagesBelowHero: below.filter((el) => getComputedStyle(el).backgroundImage.includes("url(") || el.matches("img, picture, video")).length,
  };
};

const browser = await chromium.launch();
const report = {};
for (const [name, viewport, mobile] of [["1440", { width: 1440, height: 900 }, false], ["390", { width: 390, height: 844 }, true]]) {
  const files = {};
  for (const [label, base] of [["branch", branch], ["main", main]]) {
    const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => sessionStorage.setItem("gsys:booted", "1"));
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(base + "/", { waitUntil: "load" });
    await page.waitForTimeout(900);
    report[`${name} ${label}`] = { ...(await page.evaluate(measure)), consoleErrors: errors };
    // Parada 1: o hero. Parada 2: a base do hero no meio da tela.
    for (const [stop, y] of [["1-hero", 0], ["2-transicao", await page.evaluate(() => document.querySelector(".hero").getBoundingClientRect().bottom + scrollY - innerHeight * 0.5)]]) {
      await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), Math.max(0, Math.round(y)));
      await page.waitForTimeout(400);
      files[`${stop} ${label}`] = await page.screenshot({ type: "png" });
    }
    await ctx.close();
  }
  // Lado a lado: main a esquerda, esta branch a direita.
  for (const stop of ["1-hero", "2-transicao"]) {
    const { width, height } = viewport;
    const gap = 16, bar = 32;
    const label = (text, x) => ({ input: Buffer.from(`<svg width="${width}" height="${bar}"><text x="10" y="22" font-family="monospace" font-size="16" fill="#e9e0ca">${text}</text></svg>`), left: x, top: 0 });
    await sharp({ create: { width: width * 2 + gap, height: height + bar, channels: 3, background: "#0c0b0a" } })
      .composite([label("main (site publicado)", 0), label("home-imagem-2026-10", width + gap), { input: files[`${stop} main`], left: 0, top: bar }, { input: files[`${stop} branch`], left: width + gap, top: bar }])
      .jpeg({ quality: 80 })
      .toFile(path.join(shots, `${name}-${stop}.jpg`));
  }
}
await browser.close();
console.log(JSON.stringify(report, null, 1));

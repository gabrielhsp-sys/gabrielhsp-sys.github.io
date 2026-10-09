// Contraste real do texto da home sobre a imagem: esconde o texto, fotografa
// o fundo atras de cada elemento e compara a cor do texto com o pixel mais
// claro (percentil 98) daquela caixa. WCAG AA: 4,5:1; texto grande, 3:1.
// Uso: node contraste.mjs <base-url> <saida.txt> [larguras...]
import fs from "node:fs";
import { createRequire } from "node:module";
import { context, launch } from "./lib.mjs";

// sharp do proprio repositorio (vem com o Next).
const sharp = createRequire(import.meta.url)("sharp");
const [base, outFile, ...widthsArg] = process.argv.slice(2);
const widths = (widthsArg.length ? widthsArg : ["1440", "1920", "1366", "390"]).map(Number);
const lum = ([r, g, b]) => {
  const c = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const browser = await launch();
const lines = [];
let worst = Infinity;
for (const width of widths) {
  const { ctx } = await context(browser, width);
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "load" });
  await page.waitForTimeout(1200);
  // Pontos de rolagem onde o texto esta sobre a imagem.
  const stops = await page.evaluate(() => {
    const top = (s) => document.querySelector(s).getBoundingClientRect().top + scrollY;
    return [["hero", 0], ["sobre", top(".bench-about-frame") - innerHeight * 0.3], ["sobre-fim", top(".bench-about-frame") - innerHeight * 0.05]];
  });
  for (const [stop, y] of stops) {
    await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), Math.max(0, Math.round(y)));
    await page.waitForTimeout(600);
    // Elementos de texto visiveis inteiros na tela, dentro da bancada.
    const items = await page.evaluate(() => {
      const sel = ".hero-kicker span, .hero-name strong, .hero h1, .hero-lede, .button-ghost, .hero-hint span, .bench-about h2, .bench-about-lines p, .bench-about-more";
      return [...document.querySelectorAll(sel)].map((el, i) => {
        el.dataset.cid = String(i);
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        const px = parseFloat(s.fontSize), bold = Number(s.fontWeight) >= 700;
        return { i, name: `${el.tagName.toLowerCase()}${el.className ? "." + el.className.split(" ")[0] : ""} "${el.textContent.trim().slice(0, 24)}"`, color: s.color, opacity: s.opacity, large: px >= 24 || (bold && px >= 18.66), x: r.left, y: r.top, w: r.width, h: r.height };
      }).filter((it) => it.w > 0 && it.y >= 0 && it.y + it.h <= innerHeight && Number(it.opacity) > 0.95);
    });
    // Esconde o texto (cor transparente) mantendo caixas e fundos.
    await page.addStyleTag({ content: "[data-cid], [data-cid] * { color: transparent !important; text-shadow: none !important; } [data-cid] svg { visibility: hidden; }" });
    await page.waitForTimeout(150);
    for (const it of items) {
      // Botao com contorno: a borda nao e fundo do texto, entao entra 3px.
      const inset = it.name.startsWith("a.button") ? 3 : 0;
      const clip = { x: Math.max(0, it.x) + inset, y: it.y + inset, width: Math.max(1, Math.min(it.w, width - it.x) - inset * 2), height: Math.max(1, it.h - inset * 2) };
      const png = await page.screenshot({ clip });
      const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const ls = [];
      for (let i = 0; i < data.length; i += info.channels) ls.push([data[i], data[i + 1], data[i + 2]]);
      ls.sort((a, b) => lum(a) - lum(b));
      const bright = ls[Math.floor(ls.length * 0.98)];
      const fg = it.color.match(/\d+/g).slice(0, 3).map(Number);
      const r = ratio(fg, bright);
      const need = it.large ? 3 : 4.5;
      worst = Math.min(worst, r / need);
      lines.push(`${width} ${stop.padEnd(9)} ${r.toFixed(2).padStart(5)}:1 ${r >= need ? "ok " : "FALHA"} (min ${need}) ${it.name} fundo p98 rgb(${bright.join(",")})`);
    }
    await page.evaluate(() => document.querySelectorAll("style").forEach((s) => s.textContent.includes("data-cid") && s.remove()));
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(outFile, lines.join("\n") + `\n\nmenor folga: ${worst.toFixed(2)}x o minimo\n`);
console.log(lines.filter((l) => l.includes("FALHA")).join("\n") || "nenhuma falha");
console.log(`menor folga: ${worst.toFixed(2)}x o minimo`);

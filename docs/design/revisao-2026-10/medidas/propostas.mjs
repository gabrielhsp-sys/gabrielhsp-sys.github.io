// Mockups das propostas: a pagina atual (antes) e a mesma pagina com a
// mudanca injetada so na captura (depois). Nada muda no codigo do site.
// Uso: node propostas.mjs <base-url> <pasta>
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { context, launch } from "./lib.mjs";

const sharp = createRequire(import.meta.url)("sharp");
const [base, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await launch();

const shot = async (width, route, change, scrollSel) => {
  const { ctx } = await context(browser, width);
  const page = await ctx.newPage();
  await page.goto(base + route, { waitUntil: "load" });
  await page.waitForTimeout(800);
  if (change) await page.evaluate(change);
  if (scrollSel) await page.evaluate((s) => scrollTo({ top: document.querySelector(s).getBoundingClientRect().top + scrollY - 90, behavior: "instant" }), scrollSel);
  await page.waitForTimeout(400);
  const buf = await page.screenshot({ type: "png" });
  await ctx.close();
  return buf;
};
const pair = async (name, width, route, change, scrollSel) => {
  const a = await shot(width, route, null, scrollSel);
  const b = await shot(width, route, change, scrollSel);
  const meta = await sharp(a).metadata();
  const w = Math.round(meta.width / (width < 821 ? 2 : 1.6));
  const [ra, rb] = await Promise.all([a, b].map((x) => sharp(x).resize({ width: w }).toBuffer()));
  const h = (await sharp(ra).metadata()).height;
  const label = (t) => Buffer.from(`<svg width="${w}" height="40"><rect width="100%" height="100%" fill="#e9e0ca"/><text x="14" y="27" font-family="monospace" font-size="18" fill="#0c0b0a">${t}</text></svg>`);
  await sharp({ create: { width: w * 2 + 16, height: h + 40, channels: 3, background: "#e9e0ca" } })
    .composite([{ input: label("antes"), left: 0, top: 0 }, { input: label("depois (mockup)"), left: w + 16, top: 0 }, { input: ra, left: 0, top: 40 }, { input: rb, left: w + 16, top: 40 }])
    .jpeg({ quality: 80 }).toFile(path.join(out, `${name}.jpg`));
  console.log(name);
};

// P1: e-mail a vista no hero, copiavel, ao lado do botao.
const emailHero = () => {
  const actions = document.querySelector(".hero-actions");
  const p = document.createElement("p");
  p.style.cssText = "margin:18px 0 0;display:flex;flex-wrap:wrap;align-items:center;gap:10px;color:var(--paper-dim);font-family:var(--mono);font-size:13px";
  p.innerHTML = '<span>ou escreva direto:</span> <a href="#" style="color:var(--paper);text-decoration:underline;text-decoration-color:var(--amber-deep)">gabrielhspereira36@gmail.com</a> <button type="button" style="min-height:32px;padding:0 10px;border:1px solid var(--line);border-radius:4px;background:transparent;color:var(--paper-dim);font:inherit;font-size:11px">copiar</button>';
  actions.after(p);
};
await pair("p1-email-no-hero-1440", 1440, "/", emailHero);
await pair("p1-email-no-hero-390", 390, "/", emailHero);
// P2: no celular, sem o cartao do hero (ele repete os cards de "Projetos em destaque").
await pair("p2-celular-sem-cartao-do-hero", 390, "/", () => { document.querySelector(".hero-panel").remove(); document.querySelector(".hero").style.minHeight = "auto"; }, ".hero-actions");
// P3: escala de texto consolidada (corpo em 4 degraus: .92, 1, 1.08 e 1.2rem).
const scale = () => {
  const st = document.createElement("style");
  st.textContent = `.case-head > p, .craft-block > p:not(.craft-line), .archive-line-title small, .excerpt-body p, .flow li span, .flow figcaption, .case-video figcaption, .search-result small { font-size: .92rem !important; }
  .prose, .about-copy > p:not(.big-copy), .craft-line, .hero-lede { font-size: 1.08rem !important; }
  .case-card[data-lead] .case-head > p, .page-intro > p, .article-header > p { font-size: 1.2rem !important; }`;
  document.head.append(st);
};
await pair("p3-escala-de-texto", 1440, "/", scale, "#projetos");
await browser.close();

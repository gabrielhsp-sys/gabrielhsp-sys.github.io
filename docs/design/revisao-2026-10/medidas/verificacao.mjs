// Verificacao funcional da camada de personalidade e do movimento reduzido no
// export servido: animacao de entrada, Ctrl+K, terminal (crase), snake, Konami
// (modo retro), som (botao e estado), reduced-motion e console limpo.
// Uso: node verificacao.mjs <base-url> <saida.json>
import fs from "node:fs";
import { context, launch, listen } from "./lib.mjs";

const [base, outFile] = process.argv.slice(2);
const browser = await launch();
const r = {};

// 1. Animacao de entrada: roda na primeira visita da sessao e some sozinha.
{
  const { ctx } = await context(browser, 1440, { boot: true });
  const page = await ctx.newPage();
  const msgs = listen(page);
  await page.goto(base + "/", { waitUntil: "load" });
  await page.waitForTimeout(300);
  const during = await page.locator(".boot-screen").count();
  await page.waitForTimeout(3500);
  const after = await page.locator(".boot-screen").count();
  r.boot = { aparece: during > 0, someSozinha: after === 0, console: msgs };
  // Pulavel por tecla.
  const p2 = await (await context(browser, 1440, { boot: true })).ctx.newPage();
  await p2.goto(base + "/", { waitUntil: "load" });
  await p2.waitForTimeout(250);
  await p2.keyboard.press("Space");
  await p2.waitForTimeout(700);
  r.boot.pulaComTecla = (await p2.locator(".boot-screen").count()) === 0;
  await ctx.close();
}
// 2. Reduced motion: sem animacao de entrada; frases do Sobre e imagem paradas.
{
  const { ctx } = await context(browser, 1440, { reduced: true, boot: true });
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "load" });
  await page.waitForTimeout(400);
  r.reduced = await page.evaluate(() => ({
    semBoot: !document.querySelector(".boot-screen"),
    frasesSemAnimacao: [...document.querySelectorAll(".bench-about-lines p")].every((p) => getComputedStyle(p).animationName === "none" && getComputedStyle(p).opacity === "1"),
    imagemSemAnimacao: getComputedStyle(document.querySelector(".bench-stage")).animationName === "none",
    barraSemTransicao: parseFloat(getComputedStyle(document.querySelector(".topbar")).transitionDuration) < 0.01,
  }));
  await ctx.close();
}
// 3. Busca, terminal, snake, Konami e som.
{
  const { ctx } = await context(browser, 1440);
  const page = await ctx.newPage();
  const msgs = listen(page);
  await page.goto(base + "/", { waitUntil: "load" });
  await page.waitForTimeout(800);
  await page.keyboard.press("Control+k");
  await page.waitForTimeout(400);
  const searchOpen = await page.locator(".search-layer").isVisible();
  await page.keyboard.type("telegram");
  await page.waitForTimeout(500);
  const results = await page.locator(".search-result").count();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  const searchClosed = !(await page.locator(".search-layer").count());
  await page.keyboard.press("`");
  await page.waitForTimeout(500);
  const terminalOpen = await page.locator(".terminal-wrap").isVisible();
  await page.keyboard.type("help");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
  const helpLines = await page.locator(".terminal-log p").count();
  await page.keyboard.type("snake");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(600);
  const snake = await page.locator(".terminal-game pre").count();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  for (const k of ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]) await page.keyboard.press(k);
  await page.waitForTimeout(1200);
  const retro = await page.evaluate(() => document.documentElement.dataset.retro);
  const crt = await page.locator(".crt-overlay").count();
  const sound = page.locator(".sound-toggle").first();
  const before = await sound.getAttribute("aria-pressed") ?? await sound.getAttribute("aria-label");
  await sound.click();
  await page.waitForTimeout(200);
  const after = await sound.getAttribute("aria-pressed") ?? await sound.getAttribute("aria-label");
  const audio = await page.evaluate(() => typeof AudioContext !== "undefined");
  r.personalidade = { buscaAbre: searchOpen, resultados: results, buscaFecha: searchClosed, terminalAbre: terminalOpen, linhasHelp: helpLines, snake: snake > 0, konamiRetro: retro, crt: crt > 0, somAntes: before, somDepois: after, webAudio: audio, console: msgs };
  await ctx.close();
}
// 4. Console em todas as rotas principais, sem JS: o conteudo continua la.
{
  const { ctx } = await context(browser, 1440, { js: false });
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "load" });
  r.semJS = await page.evaluate(() => ({ h1: !!document.querySelector("main h1"), frases: document.querySelectorAll(".bench-about-lines p").length, imagem: !!document.querySelector(".bench-stage img"), projetos: document.querySelectorAll(".case-card").length }));
  await ctx.close();
}
fs.writeFileSync(outFile, JSON.stringify(r, null, 1));
console.log(JSON.stringify(r, null, 1));
await browser.close();

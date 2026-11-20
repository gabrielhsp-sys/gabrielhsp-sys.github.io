// Capturas antes/depois da rodada visual (docs/design/visual-2026-11/previa/).
// Pré-requisito: o out/ servido (node scripts/serve-out.mjs out 4180).
// Uso: node scripts/previa-visual.mjs <pasta> [base] [temas]
//      temas: "claro,escuro" (padrão) ou "escuro" para o estado antigo, que só tinha o escuro.
// PW_CHROMIUM: um Chromium já presente na máquina (opcional; nada é baixado).
import fs from "node:fs";
import { chromium } from "@playwright/test";

const [, , dir, base = "http://127.0.0.1:4180", temasArg = "claro,escuro"] = process.argv;
if (!dir) { console.error("uso: node scripts/previa-visual.mjs <pasta> [base] [temas]"); process.exit(1); }
fs.mkdirSync(dir, { recursive: true });
const temas = { claro: "light", escuro: "dark" };
const rotas = [["inicio", "/"], ["servicos", "/servicos/"], ["exemplos", "/exemplos/"], ["como-funciona", "/como-funciona/"]];
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const relatorio = [];
for (const tema of temasArg.split(",")) {
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript((valor) => { try { localStorage.setItem("gsys:tema", valor); } catch { /* sem storage */ } }, temas[tema]);
    const p = await ctx.newPage();
    for (const [nome, rota] of rotas) {
      await p.goto(base + rota, { waitUntil: "networkidle" });
      await p.screenshot({ path: `${dir}/${nome}-${tema}-${w}x${h}.jpg`, type: "jpeg", quality: 78 });
      await p.screenshot({ path: `${dir}/${nome}-${tema}-${w}x${h}-inteira.jpg`, type: "jpeg", quality: 62, fullPage: true });
    }
    await ctx.close();
  }
  // Cabeçalho do celular nas cinco larguras do pedido: só a faixa de cima.
  for (const w of [320, 360, 375, 390, 414]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 740 } });
    await ctx.addInitScript((valor) => { try { localStorage.setItem("gsys:tema", valor); } catch { /* sem storage */ } }, temas[tema]);
    const p = await ctx.newPage();
    await p.goto(base + "/", { waitUntil: "networkidle" });
    const header = await p.locator(".c-header").boundingBox();
    const linha = await p.evaluate(() => {
      const top = (sel) => document.querySelector(sel)?.getBoundingClientRect().top ?? null;
      return { marca: top(".c-brand"), orcamento: top(".c-cta"), menu: top(".c-menu-button") };
    });
    relatorio.push(`${tema} ${w}px: cabeçalho ${Math.round(header.height)} px; topo marca ${Math.round(linha.marca)}, Orçamento ${Math.round(linha.orcamento)}, Menu ${Math.round(linha.menu)}`);
    await p.screenshot({ path: `${dir}/cabecalho-${tema}-${w}px.png`, clip: { x: 0, y: 0, width: w, height: Math.min(200, Math.ceil(header.height) + 40) } });
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(`${dir}/cabecalho-medidas.txt`, relatorio.join("\n") + "\n");
console.log(relatorio.join("\n"));
console.log(`capturas em ${dir}`);

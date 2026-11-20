// Capturas da prévia (390x844 e 1440x900) para docs/design/unificacao-2026-11/previa/.
// Pré-requisitos: `npm run previa` rodando em :8788 e um Chromium (PW_CHROMIUM, opcional).
// Uso: node scripts/previa-capturas.mjs <pasta> "<link do /material/ gerado por material:link>"
import { chromium } from "@playwright/test";

const [, , dir, linkMaterial] = process.argv;
const base = "http://127.0.0.1:8788";
const rotas = [
  ["inicio", "/"], ["servicos", "/servicos/"], ["servico-sites", "/servicos/sites/"], ["exemplos", "/exemplos/"],
  ["exemplos-sites", "/exemplos/sites/"], ["exemplo-aplicativos", "/exemplos/aplicativos/"], ["exemplo-bots", "/exemplos/bots/"],
  ["exemplo-automacoes", "/exemplos/automacoes/"], ["exemplo-sistemas", "/exemplos/sistemas/"], ["como-funciona", "/como-funciona/"],
  ["orcamento", "/orcamento/?origem=instagram"], ["demo-alimentacao", "/exemplos/sites/alimentacao/"], ["para-cafe-do-coreto", "/para/cafe-do-coreto/"],
  ["sobre", "/sobre/"], ["projetos", "/projetos/"], ["404", "/nao-existe/"],
];
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
for (const [w, h] of [[390, 844], [1440, 900]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => { sessionStorage.setItem("gsys:booted", "1"); localStorage.removeItem("gsys:orcamento"); });
  const p = await ctx.newPage();
  for (const [nome, rota] of rotas) {
    await p.goto(base + rota, { waitUntil: "networkidle" });
    await p.screenshot({ path: `${dir}/${nome}-${w}x${h}.jpg`, type: "jpeg", quality: 80 });
  }
  await p.goto(base + "/", { waitUntil: "networkidle" });
  await p.screenshot({ path: `${dir}/inicio-pagina-inteira-${w}x${h}.jpg`, type: "jpeg", quality: 75, fullPage: true });
  await p.goto(base + "/orcamento/?origem=instagram", { waitUntil: "networkidle" });
  await p.getByRole("radio", { name: /Um site/ }).check();
  await p.getByRole("button", { name: "Continuar" }).click();
  await p.getByLabel("Seu nome").fill("Maria");
  await p.getByLabel(/Nome do negócio/).fill("Lanchonete da Maria");
  await p.getByRole("radio", { name: "Alimentação" }).check();
  await p.getByRole("button", { name: "Continuar" }).click();
  await p.getByRole("checkbox", { name: "Chamar no WhatsApp" }).check();
  await p.getByRole("radio", { name: "Uma página só" }).check();
  await p.getByRole("button", { name: "Continuar" }).click();
  await p.getByRole("button", { name: "Continuar" }).click();
  await p.getByRole("heading", { name: "Confira e envie" }).scrollIntoViewIfNeeded();
  await p.screenshot({ path: `${dir}/orcamento-confira-${w}x${h}.jpg`, type: "jpeg", quality: 80 });
  if (linkMaterial) {
    // A Function mantém conexão aberta no runtime local: espera o formulário, não "networkidle".
    await p.goto(linkMaterial, { waitUntil: "load" });
    await p.getByRole("group", { name: "Sobre o negócio" }).waitFor({ timeout: 30000 });
    await p.screenshot({ path: `${dir}/material-${w}x${h}.jpg`, type: "jpeg", quality: 80 });
  }
  await ctx.close();
}
await browser.close();
console.log(`capturas em ${dir}`);

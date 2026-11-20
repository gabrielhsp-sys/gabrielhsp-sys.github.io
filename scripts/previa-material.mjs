// Capturas dos estados do /material/ nos dois temas, em 390x844 e 1440x900, contra a Function
// real (`wrangler pages dev` em :8788, R2 simulado). Uso:
//   node scripts/previa-material.mjs <pasta> <código válido> <link longo válido>
// O código e o link vêm de `npm run material:codigo` / `material:link` com o segredo LOCAL.
// Só o estado "envio" segura a requisição no navegador, para a tela de progresso aparecer.
import { chromium } from "@playwright/test";

const [, , dir, codigo, link] = process.argv;
const base = "http://127.0.0.1:8788";
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(2040)]);

async function preencher(p) {
  await p.getByLabel("Nome do negócio").fill("Lanchonete da Ana");
  await p.getByLabel("Seu nome").fill("Ana");
  await p.getByRole("radio", { name: "Loja" }).check();
  await p.getByLabel(/WhatsApp que vai aparecer no site/).fill("35 90000-0000");
  await p.locator("#m-logo").setInputFiles({ name: "logo.png", mimeType: "image/png", buffer: PNG });
  await p.getByLabel(/Autorizo o uso/).check();
  await p.getByLabel(/Confirmo que tenho direito/).check();
}
const entrar = async (p, texto) => {
  await p.getByLabel("Código de acesso").fill(texto);
  await p.getByRole("button", { name: "Entrar" }).click();
};

const estados = {
  "1-sem-codigo": async (p) => { await p.goto(`${base}/material/`); await p.getByLabel("Código de acesso").waitFor(); },
  "2-erro": async (p) => { await p.goto(`${base}/material/`); await entrar(p, codigo.slice(0, -1) + "z"); await p.getByText("Código inválido ou vencido.").waitFor(); },
  "3-formulario": async (p) => { await p.goto(`${base}/material/`); await entrar(p, codigo); await p.getByLabel("Nome do negócio").waitFor(); },
  "4-envio": async (p) => {
    await p.route("**/api/material/enviar", async (r) => { await new Promise((ok) => setTimeout(ok, 4000)); await r.continue(); });
    await p.goto(`${base}/material/`); await entrar(p, codigo); await preencher(p);
    await p.getByRole("button", { name: "Enviar o material" }).click();
    await p.getByText(/Enviando/).waitFor();
    await p.getByRole("button", { name: "Enviar o material" }).scrollIntoViewIfNeeded();
  },
  "5-sucesso": async (p) => { await p.goto(`${base}/material/`); await entrar(p, codigo); await preencher(p); await p.getByRole("button", { name: "Enviar o material" }).click(); await p.getByRole("heading", { name: "Recebi tudo!" }).waitFor(); },
  "6-link-longo": async (p) => { await p.goto(link); await p.getByLabel("Nome do negócio").waitFor(); },
  "7-link-vencido": async (p) => { await p.goto(link.replace(/t=[^&]+/, "t=" + "A".repeat(43))); await p.getByRole("heading", { name: "Este link não vale mais" }).waitFor(); },
};

const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
for (const tema of ["claro", "escuro"]) for (const [w, h] of [[390, 844], [1440, 900]]) for (const [nome, chegar] of Object.entries(estados)) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript((t) => { try { localStorage.setItem("gsys:tema", t); } catch { /* sem storage */ } }, tema === "claro" ? "light" : "dark");
  const p = await ctx.newPage();
  await chegar(p);
  await p.mouse.move(0, 0);
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${dir}/material-${nome}-${tema}-${w}x${h}.jpg`, type: "jpeg", quality: 78 });
  await ctx.close();
}
await browser.close();

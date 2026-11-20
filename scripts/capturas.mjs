// Prints do próprio trabalho do Gabriel para as páginas de cliente (rodada visual
// 2026-11-20). Só capturas do que este repositório publica: os 7 demos de site,
// as demonstrações de automação e de sistema e a conversa simulada do bot. Nada
// de banco de imagem nem de mockup de terceiro; as molduras são CSS
// (components/molduras.tsx). As fotos DENTRO dos demos são do Unsplash, com
// crédito em exemplos-sites/CREDITOS.md; o print mostra o demo rotulado
// "Demonstração", não finge trabalho para cliente.
//
// Uso: npm run build && node scripts/capturas.mjs && npm run imagens
//   - sobe o out/ numa porta local, captura em assets-src/capturas/<nome>.png e
//     grava a origem de cada print em assets-src/capturas/origem.json;
//   - `npm run imagens` gera public/capturas/*.avif|webp e lib/capturas.json.
// PW_CHROMIUM_PATH: um Chromium já presente na máquina (nada é baixado).
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const PORTA = 4182; // nao 4190: o fetch do Node recusa essa porta ("bad port")
const BASE = `http://127.0.0.1:${PORTA}`;
const DIR = "assets-src/capturas";
// Texto alternativo de cada print: descreve o que a pessoa veria, sem repetir
// "imagem de". Vai para lib/capturas.json pelo `npm run imagens`.
const SITES = {
  alimentacao: ["da Lanchonete Brasa & Pão", "título grande em vermelho, foto de hambúrguer e o botão “Pedir pelo WhatsApp”", "o cardápio começa com o botão de pedir pelo WhatsApp"],
  beleza: ["do Studio Íris Estética", "“Um tempo só seu, no Centro de Areado”, foto de um tratamento facial e o botão de agendar horário", "título, foto e o botão de agendar horário pelo WhatsApp"],
  cabeleireiro: ["da Barbearia Navalha Fina", "fundo escuro de barbearia, o nome em letras grandes e o botão “Marcar corte”", "o nome da barbearia e o botão “Marcar corte”"],
  saude: ["da Clínica Vida Integrada", "consultas e terapias, horário, endereço e o botão “Marcar consulta”", "horário, endereço, convênios e o botão “Marcar consulta”"],
  fitness: ["da Arena Fit Studio", "“Vem treinar na Arena” em azul forte e o botão de agendar a aula experimental", "chamada para a aula experimental grátis"],
  loja: ["do Empório da Praça", "“Da roça para a praça”, foto da prateleira e o catálogo com filtros", "o catálogo com filtros de produto"],
  servicos: ["da Prado Serviços Automotivos", "“Orçamento antes de mexer”, foto da oficina e o botão de pedir orçamento", "o pedido de orçamento pelo WhatsApp e a lista de serviços"],
};
const RAMOS = Object.keys(SITES);

export const CAPTURAS = [
  ...RAMOS.flatMap((ramo) => [
    { nome: `site-${ramo}-desktop`, rota: `/exemplos/sites/${ramo}/`, viewport: { width: 1440, height: 900 }, escala: 1, tipo: "desktop",
      alt: `Site de exemplo ${SITES[ramo][0]} no computador: ${SITES[ramo][1]}.` },
    { nome: `site-${ramo}-celular`, rota: `/exemplos/sites/${ramo}/`, viewport: { width: 390, height: 844 }, escala: 2, tipo: "celular",
      alt: `O mesmo site ${SITES[ramo][0]} no celular: ${SITES[ramo][2]}.` },
  ]),
  {
    nome: "automacao", rota: "/exemplos/automacoes/", viewport: { width: 390, height: 1800 }, escala: 2, elemento: "main .d-demo", tipo: "celular",
    alt: "Demonstração de automação: os pedidos de uma lanchonete inventada viram linhas numa planilha, com cliente e itens.",
    acao: async (p) => {
      const chegar = p.locator("main .d-demo button.c-button").first();
      for (let i = 0; i < 4; i += 1) await chegar.click();
      await p.getByRole("button", { name: "Fechar o dia" }).click();
    },
  },
  {
    nome: "sistema", rota: "/exemplos/sistemas/", viewport: { width: 390, height: 1800 }, escala: 2, elemento: "main .d-demo", tipo: "celular",
    alt: "Demonstração de sistema: controle de estoque com entrada como equipe ou como dono e botões para registrar entrada e saída.",
    acao: async (p) => {
      const saida = p.locator("main .d-row-actions button").first();
      for (let i = 0; i < 3; i += 1) await saida.click();
    },
  },
  {
    nome: "bot-conversa", rota: "/exemplos/bots/", viewport: { width: 390, height: 844 }, escala: 2, elemento: "main .d-chat", tipo: "conversa",
    alt: "Conversa simulada com o bot de uma lanchonete inventada no Telegram: o cliente pergunta se abre hoje e o bot responde o horário.",
    acao: async (p) => {
      // Só o roteiro sem emoji: o Chromium sem fonte de emoji desenharia uma caixa no lugar do 🔔.
      await p.getByRole("button", { name: "Cliente pergunta o horário" }).click();
      await p.locator("main .d-chat").evaluate((el) => { el.scrollTop = 0; });
    },
  },
];

const esperar = async (url, tentativas = 50) => {
  for (let i = 0; i < tentativas; i += 1) {
    try { if ((await fetch(url)).ok) return; } catch { /* ainda subindo */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`capturas: ${url} não respondeu`);
};

if (import.meta.url === `file://${process.argv[1]}`) {
  if (!fs.existsSync("out/index.html")) { console.error("capturas: rode `npm run build` antes (falta out/)."); process.exit(1); }
  fs.mkdirSync(DIR, { recursive: true });
  const servidor = spawn(process.execPath, ["scripts/serve-out.mjs", "out", String(PORTA)], { stdio: "ignore" });
  try {
    await esperar(`${BASE}/`);
    const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
    const origem = {};
    for (const c of CAPTURAS) {
      const ctx = await browser.newContext({ viewport: c.viewport, deviceScaleFactor: c.escala, reducedMotion: "reduce" });
      // Tema padrão (claro) e som desligado: o print não depende do que ficou salvo.
      await ctx.addInitScript(() => { localStorage.setItem("gsys:tema", "light"); localStorage.setItem("gsys:sound", "0"); });
      const p = await ctx.newPage();
      await p.goto(BASE + c.rota, { waitUntil: "networkidle" });
      await p.evaluate(() => document.fonts.ready);
      // No recorte de um elemento, as camadas fixas da pagina (cabecalho e botao
      // de WhatsApp) cairiam por cima do print: somem so durante a captura.
      if (c.elemento) await p.addStyleTag({ content: ".c-header, .c-whats-fixo { display: none !important; }" });
      if (c.acao) await c.acao(p);
      await p.waitForTimeout(400);
      const arquivo = path.join(DIR, `${c.nome}.png`);
      const buffer = c.elemento ? await p.locator(c.elemento).screenshot() : await p.screenshot();
      await sharp(buffer).png({ compressionLevel: 9, palette: false }).toFile(arquivo);
      origem[c.nome] = { rota: c.rota, tipo: c.tipo, alt: c.alt, viewport: c.viewport, escala: c.escala, elemento: c.elemento ?? null };
      console.log(`capturas: ${arquivo} <- ${c.rota}${c.elemento ? ` (${c.elemento})` : ""}`);
      await ctx.close();
    }
    await browser.close();
    fs.writeFileSync(path.join(DIR, "origem.json"), JSON.stringify(origem, null, 2) + "\n");
  } finally {
    servidor.kill();
  }
}

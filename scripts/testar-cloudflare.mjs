// Prévia local no runtime da Cloudflare (VERIFICACAO.md, A9 e A10): sobe
// `wrangler pages dev out` com o R2 simulado num diretório novo, sem login e sem
// telemetria, confere redirecionamentos, cabeçalhos e o upload do /material/, e
// derruba tudo. Rode depois de `npm run build`. Precisa do .dev.vars (segredo local).
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { assinarLink } from "../lib/material.ts";

const root = process.cwd();
const PORTA = 8788;
const BASE = `http://127.0.0.1:${PORTA}`;
const estado = path.join(root, ".wrangler", `teste-${Date.now()}`);
const segredo = fs.readFileSync(path.join(root, ".dev.vars"), "utf8").match(/^MATERIAL_SECRET=(.+)$/m)?.[1];
if (!segredo) throw new Error(".dev.vars sem MATERIAL_SECRET");
if (!fs.existsSync(path.join(root, "out", "index.html"))) throw new Error("out/ ausente: rode npm run build");

// Cota baixa só neste teste (60 KB), para provar o limite por cliente sem gravar 300 MB.
const COTA_TESTE = 60 * 1024;
const wrangler = spawn(path.join(root, "node_modules/.bin/wrangler"), ["pages", "dev", "out", "--port", String(PORTA), "--ip", "127.0.0.1", "--persist-to", estado, "--binding", `MATERIAL_COTA_BYTES=${COTA_TESTE}`], {
  env: { ...process.env, WRANGLER_SEND_METRICS: "false", CI: "1" },
  stdio: ["ignore", "pipe", "pipe"],
});
let log = "";
wrangler.stdout.on("data", (d) => { log += d; });
wrangler.stderr.on("data", (d) => { log += d; });

const resultados = [];
const confere = (nome, ok, detalhe = "") => resultados.push({ nome, ok, detalhe });

async function esperar() {
  for (let i = 0; i < 120; i += 1) {
    try {
      if ((await fetch(`${BASE}/`)).ok) return;
    } catch { /* ainda subindo */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`wrangler não respondeu em 60 s\n${log.slice(-2000)}`);
}

const agora = () => Math.floor(Date.now() / 1000);
const bytes = (cabeca, tamanho) => {
  const b = new Uint8Array(tamanho);
  b.set(cabeca);
  return b;
};
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const SVG = [...Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')];
const RESPOSTAS = { negocio: "Teste Ltda", nome: "Fulano", ramo: "loja", whatsappSite: "35 90000-0000", autorizaUso: true, autorizaDireitos: true };

async function enviar(link, arquivos = [], { respostas = RESPOSTAS, origem } = {}) {
  const form = new FormData();
  form.set("c", link.c);
  form.set("e", String(link.e));
  form.set("t", link.t);
  form.set("respostas", JSON.stringify(respostas));
  for (const [campo, nome, tipo, dados] of arquivos) form.append(campo, new Blob([dados], { type: tipo }), nome);
  const headers = origem ? { origin: origem } : {};
  const r = await fetch(`${BASE}/api/material/enviar`, { method: "POST", body: form, headers });
  return r.status;
}

try {
  await esperar();

  // ── redirecionamentos (_redirects) ──
  for (const [de, para] of [["/about/", "/sobre/"], ["/archive", "/projetos/"], ["/projects/telegram-offers/", "/projetos/telegram-offers/"], ["/area/web/", "/projetos/area/web/"], ["/l/cafe-do-coreto", "/para/cafe-do-coreto/"], ["/alimentacao", "/exemplos/sites/alimentacao/"]]) {
    const r = await fetch(BASE + de, { redirect: "manual" });
    const destino = new URL(r.headers.get("location") ?? "", BASE).pathname;
    confere(`redirect ${de} -> ${para}`, r.status === 301 && destino === para, `${r.status} ${destino}`);
  }
  for (const rota of ["/", "/sobre/", "/projetos/", "/orcamento/", "/material/", "/exemplos/sites/alimentacao/", "/para/cafe-do-coreto/"]) {
    const r = await fetch(BASE + rota, { redirect: "manual" });
    confere(`página ${rota}`, r.status === 200, String(r.status));
  }

  // ── cabeçalhos (_headers) ──
  const h = (await fetch(`${BASE}/`)).headers;
  confere("CSP com frame-ancestors 'none'", /frame-ancestors 'none'/.test(h.get("content-security-policy") ?? ""));
  confere("nosniff", h.get("x-content-type-options") === "nosniff");
  confere("X-Frame-Options DENY", h.get("x-frame-options") === "DENY");
  confere("Referrer-Policy", h.get("referrer-policy") === "strict-origin-when-cross-origin");
  const hm = (await fetch(`${BASE}/material/`)).headers;
  confere("/material/ sem Referer", hm.get("referrer-policy") === "no-referrer", hm.get("referrer-policy") ?? "");
  confere("/material/ noindex", /noindex/.test(hm.get("x-robots-tag") ?? ""));

  // ── link assinado ──
  const valido = await assinarLink(segredo, "cliente-teste", agora() + 3600);
  const vencido = await assinarLink(segredo, "cliente-teste", agora() - 10);
  const falso = { ...valido, t: "A".repeat(43) };
  const outro = { ...valido, c: "outro-cliente" };
  const verificar = async (link) => (await fetch(`${BASE}/api/material/verificar`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ c: link.c, e: String(link.e), t: link.t }) })).status;
  confere("verificar: token válido 200", (await verificar(valido)) === 200);
  confere("verificar: token falso 403", (await verificar(falso)) === 403);
  confere("verificar: vencido 403", (await verificar(vencido)) === 403);
  confere("verificar: outro cliente 403", (await verificar(outro)) === 403);

  // ── upload ──
  const png = bytes(PNG, 2048);
  let s = await enviar(valido, [["logo", "logo.png", "image/png", png], ["fachada", "fachada.png", "image/png", png]]);
  confere("enviar: token válido + PNG 201", s === 201, String(s));
  confere("enviar: token falso 403", (s = await enviar(falso, [["logo", "logo.png", "image/png", png]])) === 403, String(s));
  confere("enviar: vencido 403", (s = await enviar(vencido, [["logo", "logo.png", "image/png", png]])) === 403, String(s));
  confere("enviar: SVG 415", (s = await enviar(valido, [["logo", "logo.svg", "image/svg+xml", new Uint8Array(SVG)]])) === 415, String(s));
  confere("enviar: SVG com nome .png 415", (s = await enviar(valido, [["logo", "logo.png", "image/png", new Uint8Array(SVG)]])) === 415, String(s));
  confere("enviar: arquivo de 11 MB 413", (s = await enviar(valido, [["logo", "grande.png", "image/png", bytes(PNG, 11 * 1024 * 1024)]])) === 413, String(s));
  const nove = bytes(PNG, 9 * 1024 * 1024);
  confere("enviar: 45 MB no envio 413", (s = await enviar(valido, [1, 2, 3, 4, 5].map((i) => ["fachada", `f${i}.png`, "image/png", nove]))) === 413, String(s));
  confere("enviar: sem autorizações 422", (s = await enviar(valido, [], { respostas: { ...RESPOSTAS, autorizaUso: false } })) === 422, String(s));
  confere("enviar: campo desconhecido 400", (s = await enviar(valido, [["../../x", "a.png", "image/png", png]])) === 400, String(s));
  confere("enviar: outra origem 403", (s = await enviar(valido, [], { origem: "https://atacante.example" })) === 403, String(s));

  // Cota por cliente: outro cliente envia até estourar; o primeiro continua livre.
  const cheio = await assinarLink(segredo, "cliente-cheio", agora() + 3600);
  const vinte = bytes(PNG, 20 * 1024);
  const estados = [];
  for (let i = 0; i < 4; i += 1) estados.push(await enviar(cheio, [["fachada", `c${i}.png`, "image/png", vinte]]));
  confere("cota: envios até o limite passam e o seguinte dá 507", estados.slice(0, 2).every((x) => x === 201) && estados.at(-1) === 507, estados.join(","));
  confere("cota: é por cliente", (s = await enviar(valido, [["logo", "logo2.png", "image/png", png]])) === 201, String(s));

  // Verificação sem Content-Length (corpo em pedaços): recusada.
  const semTamanho = await new Promise((resolve) => {
    import("node:http").then(({ request }) => {
      const req = request(`${BASE}/api/material/verificar`, { method: "POST", headers: { "content-type": "application/json", "transfer-encoding": "chunked" } }, (r) => resolve(r.statusCode));
      req.on("error", () => resolve(0));
      req.write("{");
      req.end("}");
    });
  });
  confere("verificar sem Content-Length 411", semTamanho === 411, String(semTamanho));

  // ── sem leitura nem listagem ──
  for (const rota of ["/api/material/", "/api/material/cliente-teste", "/api/material/cliente-teste/respostas.json"]) {
    const r = await fetch(BASE + rota);
    const corpo = await r.text();
    confere(`sem listagem em GET ${rota}`, r.status === 404 || (r.status !== 200 || !corpo.includes("cliente-teste/")), String(r.status));
  }
  const get = await fetch(`${BASE}/api/material/enviar`);
  confere("GET /api/material/enviar não responde dados", get.status !== 200 || !(await get.text()).includes("cliente-teste"), String(get.status));

  // ── o R2 simulado recebeu o envio, sob o prefixo do cliente ──
  const arquivosR2 = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? arquivosR2(path.join(dir, e.name)) : [path.join(dir, e.name)])) : []);
  const tudo = arquivosR2(estado).map((f) => fs.readFileSync(f).toString("latin1")).join("\n");
  confere("R2 local tem cliente-teste/…/logo-1.png", /cliente-teste\/[^\s"]+\/logo-1\.png/.test(tudo));
  confere("R2 local tem cliente-teste/…/respostas.json", /cliente-teste\/[^\s"]+\/respostas\.json/.test(tudo));
  confere("R2 local não tem nada dos envios recusados", !/grande\.png|logo\.svg|\.\.\/|outro-cliente/.test(tudo));
} catch (erro) {
  confere("execução", false, String(erro?.message ?? erro));
} finally {
  wrangler.kill("SIGTERM");
  await new Promise((r) => setTimeout(r, 800));
  fs.rmSync(estado, { recursive: true, force: true });
}

for (const r of resultados) console.log(`${r.ok ? "PASS" : "FALHOU"}  ${r.nome}${r.detalhe ? `  (${r.detalhe})` : ""}`);
const falhas = resultados.filter((r) => !r.ok).length;
console.log(`\ntestar-cloudflare: ${resultados.length - falhas}/${resultados.length} passaram`);
process.exit(falhas ? 1 : 0);

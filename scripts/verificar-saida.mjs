// Oráculo da saída publicada (out/), depois do build único (VERIFICACAO.md, A1 e A7).
//  1. todo número de celular brasileiro em HTML/JS/JSON/XML/TXT, todo wa.me e todo tel: é o
//     WhatsApp Business, escrito AQUI à mão (não importado do código que o monta);
//  2. os 7 demos e o lead existem, com noindex, e todo src/href local deles resolve em out/;
//  3. /orcamento/, /material/ e /para/ têm noindex;
//  4. a palavra "robô"/"robôs" não aparece em nenhum texto da saída (pedido de 2026-11-20:
//     o site diz "bot", inclusive em metadados, alt e demos).
import fs from "node:fs";
import path from "node:path";

const BUSINESS = "5535998840168";
const out = path.join(process.cwd(), "out");
const errors = [];

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const all = walk(out);
const text = all.filter((f) => /\.(html|js|json|xml|txt|css)$/.test(f));

let waCount = 0;
for (const file of text) {
  const body = fs.readFileSync(file, "utf8");
  const rel = path.relative(out, file);
  for (const [, num] of body.matchAll(/wa\.me\/(\+?\d+)/g)) {
    waCount += 1;
    if (num !== BUSINESS) errors.push(`${rel}: wa.me/${num} não é o Business`);
  }
  for (const [, num] of body.matchAll(/tel:([+\d\s()-]+)/g)) {
    if (num.replace(/\D/g, "") !== BUSINESS) errors.push(`${rel}: tel:${num} não é o Business`);
  }
  // Celular com DDI 55: 55 + DDD + 9 + 8 dígitos, colado ou formatado.
  for (const [match] of body.matchAll(/(?<!\d)\+?55\s?\(?\d{2}\)?\s?9\s?\d{4}[\s-]?\d{4}(?!\d)/g)) {
    if (match.replace(/\D/g, "") !== BUSINESS) errors.push(`${rel}: telefone ${match} não é o Business`);
  }
  // Celular sem DDI, formatado: (35) 9xxxx-xxxx.
  for (const [match] of body.matchAll(/\(\d{2}\)\s?9\d{4}-\d{4}/g)) {
    if (`55${match.replace(/\D/g, "")}` !== BUSINESS) errors.push(`${rel}: telefone ${match} não é o Business`);
  }
}
for (const file of text) {
  const hits = fs.readFileSync(file, "utf8").match(/rob[ôÔ]s?/gi);
  if (hits) errors.push(`${path.relative(out, file)}: "${hits[0]}" (o site diz "bot")`);
}

if (waCount === 0) errors.push("nenhum link wa.me na saída (o oráculo não viu nada)");

const page = (route) => path.join(out, route, "index.html");
const noindex = (html) => /<meta name="robots" content="noindex/.test(html);
const ramos = ["alimentacao", "beleza", "cabeleireiro", "saude", "fitness", "loja", "servicos"];
const demos = [...ramos.map((r) => `exemplos/sites/${r}`), "para/cafe-do-coreto"];
for (const route of demos) {
  if (!fs.existsSync(page(route))) {
    errors.push(`/${route}/: ausente`);
    continue;
  }
  const html = fs.readFileSync(page(route), "utf8");
  if (!noindex(html)) errors.push(`/${route}/: sem noindex`);
  if (!/data-faixa="whatsapp"/.test(html)) errors.push(`/${route}/: faixa de demonstração ausente`);
  for (const [, attr, value] of html.matchAll(/\s(src|href|srcset)="(\/[^"]*)"/g)) {
    const urls = attr === "srcset" ? value.split(",").map((part) => part.trim().split(/\s+/)[0]) : [value];
    for (const url of urls) {
      const clean = decodeURIComponent(url.split(/[?#]/)[0]);
      const target = path.join(out, clean);
      const ok = fs.existsSync(target) && (fs.statSync(target).isFile() || fs.existsSync(path.join(target, "index.html")));
      if (!ok) errors.push(`/${route}/: link local quebrado ${url}`);
    }
  }
}
for (const route of ["orcamento", "material"]) {
  if (fs.existsSync(page(route)) && !noindex(fs.readFileSync(page(route), "utf8"))) errors.push(`/${route}/: sem noindex`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`verificar-saida: ${waCount} links wa.me, todos ${BUSINESS}; ${demos.length} demos completos`);

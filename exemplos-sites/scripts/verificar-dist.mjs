// Prova as alegações A2, A3 (parte HTML) e A5 de docs/PLANO.md lendo o dist/ gerado:
// - inventário: 7 rotas de nicho declaradas × encontradas, home e ao menos uma rota de lead;
// - toda página com noindex e cartão de compartilhamento completo (D-125);
// - todo link wa.me usa o número de src/data/contato.ts e o texto "[Demo …] Oi Gabriel, …";
// - a home não aponta para /l/ (leads ficam fora da home e do menu).
// Sai com 1 em qualquer divergência.
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { WHATSAPP_GABRIEL, PORTFOLIO_GABRIEL } from '../src/data/contato.ts';

const RAIZ = new URL('..', import.meta.url).pathname;
const DIST = join(RAIZ, 'dist');
// Inventário declarado no pedido do projeto (tabela "Os 7 demos").
const DECLARADAS = ['alimentacao', 'beleza', 'cabeleireiro', 'saude', 'fitness', 'loja', 'servicos'];
const OG = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type', 'og:locale', 'og:site_name', 'twitter:card', 'twitter:image'];

const falhas = [];
const falha = (m) => falhas.push(m);

async function htmls(dir, base = '') {
  const lista = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, item.name);
    if (item.isDirectory()) lista.push(...(await htmls(p, `${base}${item.name}/`)));
    else if (item.name.endsWith('.html')) lista.push(`${base}${item.name}`);
  }
  return lista;
}

if (!existsSync(DIST)) { console.log('dist/ não existe: rode npm run build'); process.exit(2); }

// Inventário
const encontradas = DECLARADAS.filter((r) => existsSync(join(DIST, r, 'index.html')));
const dirsNicho = (await readdir(DIST, { withFileTypes: true }))
  .filter((d) => d.isDirectory() && !['img', '_astro', 'l'].includes(d.name) && existsSync(join(DIST, d.name, 'index.html')))
  .map((d) => d.name);
console.log(`inventário de nichos: declarado ${DECLARADAS.length} · encontrado ${dirsNicho.length} (${dirsNicho.join(', ')})`);
for (const r of DECLARADAS) if (!encontradas.includes(r)) falha(`rota declarada ausente: /${r}`);
for (const r of dirsNicho) if (!DECLARADAS.includes(r)) falha(`rota de nicho não declarada: /${r}`);
if (!existsSync(join(DIST, 'index.html'))) falha('home ausente: /index.html');
const leads = existsSync(join(DIST, 'l')) ? (await readdir(join(DIST, 'l'))).filter((s) => existsSync(join(DIST, 'l', s, 'index.html'))) : [];
console.log(`rotas de lead: ${leads.length} (${leads.map((s) => '/l/' + s).join(', ')})`);
if (leads.length === 0) falha('nenhuma rota de lead em dist/l/');

// Páginas
const paginas = await htmls(DIST);
let links = 0;
let faixas = 0;
for (const pag of paginas) {
  const html = await readFile(join(DIST, pag), 'utf8');
  if (!/<meta name="robots" content="noindex[^"]*"/.test(html)) falha(`${pag}: sem noindex`);
  for (const p of OG) {
    const re = new RegExp(`<meta (?:property|name)="${p}" content="[^"]+"`);
    if (!re.test(html)) falha(`${pag}: sem ${p}`);
  }
  if (!/<title>[^<]+<\/title>/.test(html)) falha(`${pag}: sem <title>`);
  const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  if (og && !existsSync(join(DIST, new URL(og).pathname))) falha(`${pag}: og:image aponta para arquivo inexistente (${new URL(og).pathname})`);
  for (const [, href] of html.matchAll(/href="(https:\/\/wa\.me\/[^"]+)"/g)) {
    links++;
    const url = new URL(href.replaceAll('&amp;', '&'));
    const texto = url.searchParams.get('text') ?? '';
    if (url.pathname !== `/${WHATSAPP_GABRIEL}`) falha(`${pag}: wa.me com outro número (${url.pathname})`);
    if (!/^\[Demo [^\]]+\] Oi Gabriel, vi o demo e quero um site assim$/.test(texto)) falha(`${pag}: texto do wa.me fora do padrão: ${texto}`);
  }
  if (!html.includes('data-principal')) falha(`${pag}: sem botão principal marcado`);
  // Faixa de demo (R3 de docs/PLANO-RENOMEAR.md): nas páginas que a têm, exatamente um link para o
  // WhatsApp e um para o portfólio, os dois com rel contendo noopener e target _blank.
  const faixa = html.match(/<aside class="faixa-demo[^"]*"[^>]*>([\s\S]*?)<\/aside>/)?.[1];
  if (faixa !== undefined) {
    faixas++;
    const ancoras = [...faixa.matchAll(/<a\b[^>]*>/g)].map((m) => m[0]);
    const whats = ancoras.filter((t) => /href="https:\/\/wa\.me\//.test(t));
    const port = ancoras.filter((t) => t.includes(`href="${PORTFOLIO_GABRIEL}"`));
    if (ancoras.length !== 2 || whats.length !== 1 || port.length !== 1) falha(`${pag}: faixa com ${ancoras.length} links (wa.me ${whats.length}, portfólio ${port.length}); esperado 1 + 1`);
    for (const t of ancoras) {
      if (!/rel="[^"]*\bnoopener\b[^"]*"/.test(t)) falha(`${pag}: link da faixa sem rel=noopener: ${t}`);
      if (/target=/.test(t) && !/target="_blank"/.test(t)) falha(`${pag}: link da faixa com target inválido: ${t}`);
    }
  }
  if (/wa\.me\//.test(html.replace(/https:\/\/wa\.me\/\d+\?text=[^"]+/g, ''))) falha(`${pag}: wa.me fora de link padrão`);
}
const home = await readFile(join(DIST, 'index.html'), 'utf8');
if (/href="\/l\//.test(home)) falha('home aponta para uma rota de lead');

console.log(`páginas HTML: ${paginas.length} · links wa.me conferidos: ${links} · faixas com WhatsApp + portfólio: ${faixas}`);
if (faixas !== DECLARADAS.length + leads.length) falha(`faixa de demo em ${faixas} páginas; esperado ${DECLARADAS.length + leads.length} (nichos + leads)`);
if (falhas.length) {
  console.log('FALHOU:\n  ' + falhas.join('\n  '));
  process.exit(1);
}
console.log('PASS: inventário, noindex, cartão de compartilhamento e links wa.me conferidos');

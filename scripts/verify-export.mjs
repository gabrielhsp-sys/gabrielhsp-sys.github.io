import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const out = path.join(root, "out");
const errors = [];

const items = fs
  .readdirSync(path.join(root, "content/public"))
  .filter((file) => /\.mdx?$/.test(file))
  .map((file) => matter(fs.readFileSync(path.join(root, "content/public", file), "utf8")).data);

// Uma area so existe no site exportado se carregar pelo menos um registro.
const used = new Set(items.map((item) => item.area));
// Só diretórios são áreas; /area/icon.svg é o favicon do segmento.
const exported = fs.existsSync(path.join(out, "area"))
  ? fs
      .readdirSync(path.join(out, "area"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  : [];

for (const slug of exported) {
  if (!used.has(slug)) errors.push(`/area/${slug} nao tem registro publico`);
}
for (const area of used) {
  if (!exported.includes(area)) errors.push(`/area/${area} faltando`);
}

// Nada privado ou nao publicado pode ter virado pagina.
for (const item of items) {
  if (item.visibility !== "public") errors.push(`${item.id}: visibility diferente de public`);
  if (!fs.existsSync(path.join(out, "projects", item.id, "index.html"))) {
    errors.push(`${item.id}: pagina ausente na exportacao`);
  }
}

// Toda pagina publica leva o cartao de compartilhamento completo. O openGraph
// de uma pagina substitui o do layout sem mesclar, e as internas tinham ficado
// sem imagem (auditoria 2026-10, achado 1). Projeto usa o proprio cartao.
const pageOf = (route) => fs.readFileSync(path.join(out, route, "index.html"), "utf8");
const ogImage = (html) => html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
for (const route of ["", "archive", "about", ...[...used].map((area) => `area/${area}`)]) {
  const image = ogImage(pageOf(route));
  if (!image) errors.push(`/${route}: og:image ausente`);
  else if (!fs.existsSync(path.join(out, new URL(image).pathname))) errors.push(`/${route}: ${image} nao foi exportada`);
}
for (const item of items) {
  const html = pageOf(path.join("projects", item.id));
  const image = ogImage(html);
  if (!image?.endsWith(`/og/${item.id}.png`)) errors.push(`${item.id}: og:image nao e o cartao do projeto`);
  else if (!fs.existsSync(path.join(out, "og", `${item.id}.png`))) errors.push(`${item.id}: cartao og ausente`);
  if (!/<meta name="twitter:title" content="[^"]*/.test(html) || !html.includes(`<meta name="twitter:title" content="${item.title}`)) {
    errors.push(`${item.id}: twitter:title nao e o titulo do projeto`);
  }
}

// Indice do estudo de caso: todo link "nesta pagina" aponta para um <h2> que
// existe com aquele id no HTML exportado (os dois saem de lib/headings.ts).
for (const item of items) {
  const html = pageOf(path.join("projects", item.id));
  const toc = html.match(/<nav class="page-toc"[\s\S]*?<\/nav>/)?.[0];
  if (!toc) continue;
  for (const [, id] of toc.matchAll(/href="#([^"]+)"/g)) {
    if (!new RegExp(`<h2 id="${id}"`).test(html)) errors.push(`${item.id}: indice aponta para #${id}, que nao existe`);
  }
}

// Video de estudo de caso: sem som, sem pre-carga, com poster, e leve o bastante
// para ser versionado (~5 MB). O componente so atribui o src ao entrar na tela.
for (const item of items) {
  const video = path.join(out, "videos", `${item.id}.mp4`);
  if (!fs.existsSync(video)) continue;
  const size = fs.statSync(video).size;
  if (size > 5.5 * 1024 * 1024) errors.push(`${item.id}: video com ${(size / 1048576).toFixed(1)} MB (limite ~5 MB)`);
  if (!fs.existsSync(path.join(out, "videos", `${item.id}.jpg`))) errors.push(`${item.id}: poster do video ausente`);
  const html = pageOf(path.join("projects", item.id));
  const tag = html.match(/<video[^>]*>/)?.[0] ?? "";
  for (const attr of ["muted", 'preload="none"', `poster="/videos/${item.id}.jpg"`, "playsInline"]) {
    if (!tag.toLowerCase().includes(attr.toLowerCase())) errors.push(`${item.id}: <video> sem ${attr}`);
  }
  if (/<video[^>]*\ssrc=/.test(tag)) errors.push(`${item.id}: <video> ja sai com src no HTML`);
}

// A home mostra os destaques em cards; a secao #arquivo lista so o que nao e
// destaque, para nenhum projeto aparecer duas vezes (auditoria visual, item 4).
const home = fs.readFileSync(path.join(out, "index.html"), "utf8");
const archiveSection = home.match(/<section[^>]*id="arquivo"[^>]*>[\s\S]*?<\/section>/);
if (!archiveSection) {
  if (items.some((item) => !item.featured)) errors.push("home: secao #arquivo ausente");
} else {
  const listed = new Set(
    [...archiveSection[0].matchAll(/href="\/projects\/([^/"]+)\/?"/g)].map((match) => match[1]),
  );
  for (const item of items) {
    if (item.featured && listed.has(item.id)) errors.push(`home #arquivo: ${item.id} repete um destaque`);
    if (!item.featured && !listed.has(item.id)) errors.push(`home #arquivo: ${item.id} faltando`);
  }
}

// /orcamento circula so por link: sem indexacao, fora do sitemap e da busca, e
// sem o menu do site, que tirava a pessoa do formulario sem volta.
const briefing = fs.readFileSync(path.join(out, "orcamento", "index.html"), "utf8");
if (!/<meta name="robots" content="noindex, nofollow"/.test(briefing)) errors.push("/orcamento: noindex ausente");
for (const [label, marker] of [["trilho", 'class="system-rail"'], ["dock", 'class="mobile-dock"'], ["busca", 'class="search-trigger"'], ["rodape", 'class="site-footer"']]) {
  if (briefing.includes(marker)) errors.push(`/orcamento: ${label} do site presente`);
}
if (!home.includes('class="system-rail"')) errors.push("home: trilho do site ausente");
for (const file of ["sitemap.xml", "search-index.json"]) {
  if (fs.readFileSync(path.join(out, file), "utf8").includes("orcamento")) errors.push(`${file}: lista /orcamento`);
}

// O prototipo de identidade e rascunho para o Gabriel escolher: sem indexacao,
// fora do sitemap e da busca, sem o chrome do site, e nenhuma pagina linka para
// ele (auditoria 2026-10).
const prototypeFile = path.join(out, "prototipos", "identidade", "index.html");
if (fs.existsSync(prototypeFile)) {
  const prototype = fs.readFileSync(prototypeFile, "utf8");
  if (!/<meta name="robots" content="noindex, nofollow"/.test(prototype)) errors.push("/prototipos/identidade: noindex ausente");
  if (prototype.includes('class="system-rail"') || prototype.includes('class="topbar"')) errors.push("/prototipos/identidade: chrome do site presente");
  for (const file of ["sitemap.xml", "search-index.json"]) {
    if (fs.readFileSync(path.join(out, file), "utf8").includes("prototipos")) errors.push(`${file}: lista /prototipos`);
  }
  const pages = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "_next" || entry.name === "prototipos" ? [] : pages(full);
    return entry.name.endsWith(".html") ? [full] : [];
  });
  for (const file of pages(out)) {
    if (/href="\/prototipos/.test(fs.readFileSync(file, "utf8"))) errors.push(`${path.relative(out, file)}: linka /prototipos`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`export: ${exported.length} areas, ${items.length} registros`);

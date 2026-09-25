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

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`export: ${exported.length} areas, ${items.length} registros`);

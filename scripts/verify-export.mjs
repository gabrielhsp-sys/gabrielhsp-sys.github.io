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

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`export: ${exported.length} areas, ${items.length} registros`);

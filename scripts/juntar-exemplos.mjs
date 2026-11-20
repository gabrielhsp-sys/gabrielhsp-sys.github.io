// Junta a saída do Astro (exemplos-sites/dist) ao out/ do Next, no mesmo build:
//   dist/<ramo>/, dist/_astro/, dist/img/  ->  out/exemplos/sites/...
//   dist/l/<slug>/                          ->  out/para/<slug>/
// Nunca sobrescreve um arquivo do Next: colisão é erro.
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "exemplos-sites", "dist");
const out = path.join(root, "out");
if (!fs.existsSync(dist)) {
  console.error("juntar-exemplos: exemplos-sites/dist não existe (rode npm run exemplos:build)");
  process.exit(1);
}

let files = 0;
function copy(from, to) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(dst, { recursive: true });
      copy(src, dst);
    } else {
      if (fs.existsSync(dst)) throw new Error(`colisão com o Next: ${path.relative(out, dst)}`);
      fs.copyFileSync(src, dst);
      files += 1;
    }
  }
}

const sites = path.join(out, "exemplos", "sites");
fs.mkdirSync(sites, { recursive: true });
for (const entry of fs.readdirSync(dist, { withFileTypes: true })) {
  if (entry.name === "l") continue;
  // O dist do Astro só tem pastas (a home e o 404 saíram); arquivo solto é erro de build.
  if (!entry.isDirectory()) throw new Error(`arquivo inesperado na raiz de exemplos-sites/dist: ${entry.name}`);
  fs.mkdirSync(path.join(sites, entry.name), { recursive: true });
  copy(path.join(dist, entry.name), path.join(sites, entry.name));
}
const leads = path.join(dist, "l");
if (fs.existsSync(leads)) {
  fs.mkdirSync(path.join(out, "para"), { recursive: true });
  copy(leads, path.join(out, "para"));
}
console.log(`juntar-exemplos: ${files} arquivos em out/exemplos/sites e out/para`);

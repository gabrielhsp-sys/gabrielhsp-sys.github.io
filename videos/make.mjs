// Monta os projetos HyperFrames dos videos dos estudos de caso.
// Uso: node videos/make.mjs            -> gera videos/<id>/index.html + assets
// Cada fragmento em videos/src/<id>.html traz o proprio <style>, a marcacao e o
// <script> da timeline; a base (tokens, fontes, cabecalho e rodape) e comum.
// Os assets (fontes do fontsource e o GSAP vendorizado do plugin HyperFrames)
// sao copiados na hora e nao entram no Git.
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.join(here, "..");
const gsap = process.env.GSAP_JS
  ?? path.join(process.env.HOME, ".claude/plugins/cache/hyperframes/hyperframes/0.8.134/skills/talking-head-recut/assets/vendor/gsap.min.js");
const assets = {
  "bricolage-latin-wght.woff2": path.join(root, "node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2"),
  "plex-mono-400.woff2": path.join(root, "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2"),
  "plex-mono-600.woff2": path.join(root, "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2"),
  "gsap.min.js": gsap,
};
const base = fs.readFileSync(path.join(here, "src/base.css"), "utf8");
const only = process.argv.slice(2);

for (const file of fs.readdirSync(path.join(here, "src")).filter((name) => name.endsWith(".html"))) {
  const id = file.replace(/\.html$/, "");
  if (only.length && !only.includes(id)) continue;
  const fragment = fs.readFileSync(path.join(here, "src", file), "utf8");
  const meta = JSON.parse(fragment.match(/<!--meta(.*?)-->/s)[1]);
  const body = fragment.replace(/<!--meta.*?-->/s, "").trim();
  const dir = path.join(here, id);
  fs.mkdirSync(path.join(dir, "assets"), { recursive: true });
  for (const [name, source] of Object.entries(assets)) fs.copyFileSync(source, path.join(dir, "assets", name));
  fs.writeFileSync(path.join(dir, "hyperframes.json"), JSON.stringify({ paths: { assets: "assets" }, media: { autoProxy: false } }, null, 2));
  fs.writeFileSync(
    path.join(dir, "index.html"),
    `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1280, height=720" />
    <title>${meta.title} — GABRIEL.SYS</title>
    <script src="assets/gsap.min.js"></script>
    <style>
${base}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${meta.duration}" data-width="1280" data-height="720" data-fps="30" style="--area: ${meta.area}; --status: ${meta.status}">
${body}
    </div>
  </body>
</html>
`,
  );
  console.log(`videos/${id}/index.html`);
}

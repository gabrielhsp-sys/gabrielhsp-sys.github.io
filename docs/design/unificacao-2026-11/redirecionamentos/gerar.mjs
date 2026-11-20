// Gera as páginas de redirecionamento dos endereços antigos (NADA disto é publicado
// por esta sessão). Rodar da raiz do repositório:
//   node docs/design/unificacao-2026-11/redirecionamentos/gerar.mjs
// Saída: github-pages/ (para gabrielhsp-sys.github.io) e vercel/ (para gabriel-sites.vercel.app).
import fs from "node:fs";
import path from "node:path";
import { SITE_URL } from "../../../../lib/site.ts";

const aqui = path.dirname(new URL(import.meta.url).pathname);
const novo = SITE_URL.replace(/\/$/, "");

// Mapa dos caminhos antigos do portfólio (o mesmo de public/_redirects). Projetos e
// áreas derivados de content/public (AGENTS.md, regra 3), não escritos à mão.
const raiz = path.resolve(aqui, "../../../..");
const registros = fs.readdirSync(path.join(raiz, "content/public")).filter((f) => /\.mdx?$/.test(f));
const PROJETOS = registros.map((f) => f.replace(/\.mdx?$/, ""));
const AREAS = [...new Set(registros.map((f) => fs.readFileSync(path.join(raiz, "content/public", f), "utf8").match(/^area:\s*(\S+)/m)?.[1]).filter(Boolean))];
const mapa = {
  "/": "/",
  "/about/": "/sobre/",
  "/archive/": "/projetos/",
  "/orcamento/": "/orcamento/",
  ...Object.fromEntries(PROJETOS.map((p) => [`/projects/${p}/`, `/projetos/${p}/`])),
  ...Object.fromEntries(AREAS.map((a) => [`/area/${a}/`, `/projetos/area/${a}/`])),
};

// O GitHub Pages não faz 301: a página leva por meta refresh (sem JS) e por
// location.replace (com JS, preservando ?consulta e #fragmento).
const pagina = (destino) => `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>GABRIEL.SYS mudou de endereço</title>
<link rel="canonical" href="${novo}${destino}">
<meta http-equiv="refresh" content="0; url=${novo}${destino}">
<script>location.replace(${JSON.stringify(novo + destino)} + location.search + location.hash);</script>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0c0b0a;color:#e9e0ca;font:18px/1.5 system-ui,sans-serif;padding:24px}a{color:#f0ab3c}</style>
</head>
<body>
<p>O GABRIEL.SYS mudou de endereço. <a href="${novo}${destino}">Continuar para ${novo.replace(/^https:\/\//, "")}${destino}</a></p>
</body>
</html>
`;

// 404.html: qualquer outro caminho antigo, mapeado no navegador.
const pagina404 = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>GABRIEL.SYS mudou de endereço</title>
<script>
(function () {
  var p = location.pathname;
  var m = [[/^\\/about\\/?$/, "/sobre/"], [/^\\/archive\\/?$/, "/projetos/"], [/^\\/projects\\/([^/]+)\\/?$/, "/projetos/$1/"], [/^\\/area\\/([^/]+)\\/?$/, "/projetos/area/$1/"]];
  for (var i = 0; i < m.length; i++) if (m[i][0].test(p)) { p = p.replace(m[i][0], m[i][1]); break; }
  location.replace(${JSON.stringify(novo)} + p + location.search + location.hash);
})();
</script>
<meta http-equiv="refresh" content="0; url=${novo}/">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0c0b0a;color:#e9e0ca;font:18px/1.5 system-ui,sans-serif;padding:24px}a{color:#f0ab3c}</style>
</head>
<body>
<p>O GABRIEL.SYS mudou de endereço. <a href="${novo}/">Continuar para ${novo.replace(/^https:\/\//, "")}</a></p>
</body>
</html>
`;

const gh = path.join(aqui, "github-pages");
fs.rmSync(gh, { recursive: true, force: true });
for (const [antigo, destino] of Object.entries(mapa)) {
  const dir = path.join(gh, antigo);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), pagina(destino));
}
fs.writeFileSync(path.join(gh, "404.html"), pagina404);
fs.writeFileSync(path.join(gh, ".nojekyll"), "");

// Vercel: 308 de verdade, por vercel.json. Pasta pública vazia (só o index de fallback).
const vc = path.join(aqui, "vercel");
fs.rmSync(vc, { recursive: true, force: true });
fs.mkdirSync(path.join(vc, "public"), { recursive: true });
const nichos = ["alimentacao", "beleza", "cabeleireiro", "saude", "fitness", "loja", "servicos"];
const vercel = {
  $schema: "https://openapi.vercel.sh/vercel.json",
  outputDirectory: "public",
  redirects: [
    { source: "/", destination: `${novo}/exemplos/sites/`, permanent: true },
    ...nichos.map((n) => ({ source: `/${n}`, destination: `${novo}/exemplos/sites/${n}/`, permanent: true })),
    ...nichos.map((n) => ({ source: `/${n}/`, destination: `${novo}/exemplos/sites/${n}/`, permanent: true })),
    { source: "/l/:slug", destination: `${novo}/para/:slug/`, permanent: true },
    { source: "/l/:slug/", destination: `${novo}/para/:slug/`, permanent: true },
    { source: "/:path*", destination: `${novo}/exemplos/sites/`, permanent: true },
  ],
};
fs.writeFileSync(path.join(vc, "vercel.json"), `${JSON.stringify(vercel, null, 2)}\n`);
fs.writeFileSync(path.join(vc, "public", "index.html"), pagina("/exemplos/sites/"));
console.log(`redirecionamentos: ${Object.keys(mapa).length} páginas + 404 em github-pages/, vercel/vercel.json com ${vercel.redirects.length} regras`);

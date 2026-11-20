// Lighthouse (13.5.0, fixado no package.json, D-132) nas páginas principais da
// prévia, em 390x844 (celular) e 1440x900 (computador). Precisa do out/ servido em
// :4173 (node scripts/serve-out.mjs out 4173) e de um Chrome em CHROME_PATH.
// Uso: node scripts/lighthouse-previa.mjs <pasta-de-saida>
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const saida = process.argv[2] ?? "lighthouse";
fs.mkdirSync(saida, { recursive: true });
const rotas = ["/", "/servicos/sites/", "/exemplos/", "/exemplos/sites/alimentacao/", "/como-funciona/", "/orcamento/", "/sobre/"];
const perfis = {
  "390": ["--form-factor=mobile", "--screenEmulation.mobile", "--screenEmulation.width=390", "--screenEmulation.height=844", "--screenEmulation.deviceScaleFactor=3"],
  "1440": ["--preset=desktop", "--screenEmulation.width=1440", "--screenEmulation.height=900", "--screenEmulation.deviceScaleFactor=1"],
};
const linhas = [];
for (const rota of rotas) {
  for (const [nome, flags] of Object.entries(perfis)) {
    const arquivo = path.join(saida, `${rota.replace(/\//g, "_") || "_"}-${nome}.json`);
    execFileSync("node_modules/.bin/lighthouse", [
      `http://127.0.0.1:4173${rota}`, "--quiet", "--output=json", `--output-path=${arquivo}`,
      "--only-categories=performance,accessibility,best-practices,seo",
      "--chrome-flags=--headless=new --no-sandbox", ...flags,
    ], { stdio: "ignore" });
    const r = JSON.parse(fs.readFileSync(arquivo, "utf8"));
    const c = r.categories;
    const n = (k) => Math.round((c[k]?.score ?? 0) * 100);
    linhas.push(`| ${rota} | ${nome} | ${n("performance")} | ${n("accessibility")} | ${n("best-practices")} | ${n("seo")} | ${r.audits["largest-contentful-paint"].displayValue} | ${r.audits["cumulative-layout-shift"].displayValue} |`);
    console.log(linhas.at(-1));
  }
}
fs.writeFileSync(path.join(saida, "resumo.md"), ["| Rota | Largura | Desempenho | Acessibilidade | Boas práticas | SEO | LCP | CLS |", "|---|---|---|---|---|---|---|---|", ...linhas].join("\n") + "\n");

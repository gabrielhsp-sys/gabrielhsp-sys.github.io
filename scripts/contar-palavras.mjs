// Conta as palavras visíveis do <main> das páginas de cliente num out/.
// Uso: node scripts/contar-palavras.mjs <out> — imprime "rota palavras" e o total.
// Texto visível = o HTML do <main> sem <script>, <style>, comentários, tags e
// texto só para leitor de tela (.sr-only). É uma medida de comparação
// (antes/depois), não de leitura exata.
import fs from "node:fs";
import path from "node:path";

const out = process.argv[2] ?? "out";
const rotas = ["/", "/servicos/", "/exemplos/", "/como-funciona/", "/servicos/sites/", "/exemplos/sites/", "/exemplos/bots/"];
let total = 0;
for (const rota of rotas) {
  const file = path.join(out, rota, "index.html");
  if (!fs.existsSync(file)) { console.log(`${rota} (sem arquivo)`); continue; }
  const html = fs.readFileSync(file, "utf8");
  const main = html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? "";
  const texto = main
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<span class="sr-only">[\s\S]*?<\/span>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ");
  const n = texto.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  total += n;
  console.log(`${rota} ${n}`);
}
console.log(`total ${total}`);

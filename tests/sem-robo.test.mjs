import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

// Pedido de 2026-11-20: o site diz "bot", nunca "robô". Este teste varre o
// código-fonte que vira texto na saída (páginas, componentes, dados, conteúdo,
// demos e o gerador do cartão de compartilhamento). A saída do build tem o
// mesmo oráculo em scripts/verificar-saida.mjs.
const roots = ["app", "components", "lib", "content", "exemplos-sites/src", "scripts/generate-og-image.mjs"];
const walk = (p) =>
  fs.statSync(p).isDirectory()
    ? fs.readdirSync(p).flatMap((name) => (name === "node_modules" ? [] : walk(path.join(p, name))))
    : [p];

test('no "robô" or "robôs" in any source that becomes site text', () => {
  const hits = roots
    .filter((root) => fs.existsSync(root))
    .flatMap(walk)
    .filter((file) => /\.(tsx?|mjs|mdx?|astro|json|css)$/.test(file))
    .flatMap((file) =>
      fs.readFileSync(file, "utf8").split("\n").flatMap((line, i) => (/rob[ôÔ]s?/i.test(line) ? [`${file}:${i + 1}`] : [])),
    );
  assert.deepEqual(hits, []);
});

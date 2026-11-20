import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

// Toda imagem das paginas de cliente e print do proprio trabalho (rodada visual
// 2026-11-20, VERIFICACAO.md I1): cada arquivo em public/capturas/ tem entrada no
// manifesto lib/capturas.json, com a rota de origem DESTE site, o print bruto em
// assets-src/capturas/ e um texto alternativo. A saida do build confere que a
// rota existe em out/ (scripts/verificar-saida.mjs).
const manifesto = JSON.parse(fs.readFileSync("lib/capturas.json", "utf8"));

test("every published capture comes from the manifest", () => {
  const esperados = new Set(Object.entries(manifesto).flatMap(([nome, c]) => c.variantes.flatMap((w) => [`${nome}-${w}.avif`, `${nome}-${w}.webp`])));
  const publicados = fs.readdirSync("public/capturas");
  assert.deepEqual(publicados.filter((f) => !esperados.has(f)), [], "arquivo sem origem no manifesto");
  assert.deepEqual([...esperados].filter((f) => !publicados.includes(f)), [], "variante do manifesto sem arquivo");
});

test("every capture has its raw print, a route of this site and a real alt text", () => {
  for (const [nome, c] of Object.entries(manifesto)) {
    assert.ok(fs.existsSync(`assets-src/capturas/${nome}.png`), `${nome}: falta o print bruto`);
    assert.match(c.rota, /^\/exemplos\/(sites\/[a-z]+|automacoes|sistemas|bots)\/$/, `${nome}: rota fora dos exemplos`);
    assert.ok(c.alt.length >= 40 && !/^(imagem|foto|print)\b/i.test(c.alt), `${nome}: alt curto ou genérico`);
    assert.ok(c.width > 0 && c.height > 0 && c.variantes.length > 0, `${nome}: medidas`);
  }
});

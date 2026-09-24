import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const css = fs.readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");

// Converte um tamanho absoluto para px; `em`, `%` e `vw` dependem do contexto
// e ficam fora da regra.
const toPx = (value) => {
  const match = value.trim().match(/^(\d*\.?\d+)(px|rem)$/);
  if (!match) return null;
  return match[2] === "rem" ? Number(match[1]) * 16 : Number(match[1]);
};

// Os tokens do tema padrao, para `var(--text-min)` ser medido pelo valor real.
const rootBlock = css.match(/:root \{([^}]*)\}/)[1];
const tokens = Object.fromEntries(
  [...rootBlock.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
);
const resolve = (value) => value.trim().replace(/var\((--[\w-]+)\)/g, (_, name) => tokens[name] ?? name);

// Rotulos de 9 e 10px ficavam ilegiveis no celular (auditoria visual, item 2).
// O piso vale tambem para o minimo de um clamp().
test("no text in the stylesheet is smaller than 11px", () => {
  const tooSmall = [];
  for (const [declaration, raw] of css.matchAll(/font-size:\s*([^;}]+)/g)) {
    const value = resolve(raw);
    const clamp = value.match(/^clamp\(([^,]+),/);
    const px = toPx(clamp ? clamp[1] : value);
    if (px !== null && px < 11) tooSmall.push(declaration.trim());
  }
  assert.deepEqual(tooSmall, []);
});

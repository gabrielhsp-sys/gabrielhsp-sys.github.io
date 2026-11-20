import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import sharp from "sharp";

// Logo do tema claro (decisao de 2026-11-20): o ".SYS" fica num ambar mais
// escuro, com pelo menos 3:1 sobre o fundo do cabecalho claro (WCAG 1.4.11,
// objeto grafico). O desenho nao muda, e o logo do tema escuro fica identico.
// Le o PNG e o CSS direto, com a formula da WCAG 2.2 escrita aqui.
const ESCURO = "public/marca/logo-horizontal.png";
const CLARO = "public/marca/logo-horizontal-claro.png";
const ESCURO_SHA256 = "6eeb73fcd5464b0e05c67469f82615ecdaac95fe2fe87e15c9a256b6ee0a0cb8";

const lin = (v) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
const hex = (h) => [0, 2, 4].map((i) => parseInt(h.slice(1 + i, 3 + i), 16));

// Fundo do cabecalho no claro: --c-header-bg (rgb com alfa) composto sobre --ink.
function fundoCabecalhoClaro() {
  const css = fs.readFileSync("app/cliente.css", "utf8");
  const sel = ':root[data-theme="light"]:not([data-retro="on"]):not(:has(.site-frame)) {';
  const bloco = css.slice(css.indexOf(sel), css.indexOf("}", css.indexOf(sel)));
  const ink = hex(bloco.match(/--ink:\s*(#[0-9a-f]{6});/i)[1]);
  const [, r, g, b, a] = bloco.match(/--c-header-bg:\s*rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\);/).map(Number);
  return [r, g, b].map((c, i) => Math.round(c * a + ink[i] * (1 - a)));
}

// Pixels do ".SYS": saturados (o nome e cinza/tinta) e a direita do simbolo,
// que termina na primeira coluna toda transparente.
async function corDoSys(arquivo) {
  const { data, info } = await sharp(arquivo).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => (y * info.width + x) * 4;
  let fimSimbolo = 0;
  while ([...Array(info.height).keys()].some((y) => data[px(fimSimbolo, y) + 3] > 0)) fimSimbolo += 1;
  const contagem = new Map();
  for (let y = 0; y < info.height; y++) {
    for (let x = fimSimbolo; x < info.width; x++) {
      const i = px(x, y);
      if (data[i + 3] < 255) continue;
      const c = [data[i], data[i + 1], data[i + 2]];
      if (Math.max(...c) - Math.min(...c) <= 48) continue;
      contagem.set(c.join(","), (contagem.get(c.join(",")) ?? 0) + 1);
    }
  }
  assert.ok(contagem.size > 0, `nenhum pixel ambar depois do simbolo em ${arquivo}`);
  // Cor mais frequente entre os pixels opacos: o miolo das letras.
  return [...contagem].sort((a, b) => b[1] - a[1])[0][0].split(",").map(Number);
}

test('the light-theme logo ".SYS" has at least 3:1 contrast on the light header', async () => {
  const sys = await corDoSys(CLARO);
  const r = ratio(sys, fundoCabecalhoClaro());
  assert.ok(r >= 3, `.SYS rgb(${sys}) sobre rgb(${fundoCabecalhoClaro()}): ${r.toFixed(2)} < 3`);
});

test("the dark-theme logo is unchanged", () => {
  const sha = crypto.createHash("sha256").update(fs.readFileSync(ESCURO)).digest("hex");
  assert.equal(sha, ESCURO_SHA256);
});

test("the light-theme logo keeps the same drawing size as the dark one", async () => {
  const [a, b] = await Promise.all([sharp(ESCURO).metadata(), sharp(CLARO).metadata()]);
  assert.deepEqual([b.width, b.height], [a.width, a.height]);
});

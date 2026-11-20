import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

// Oraculo de contraste dos dois temas das paginas de cliente (pedido de
// 2026-11-20; D-095). Le os tokens direto do CSS — o escuro e o :root de
// globals.css somado ao :root de cliente.css; o claro e o escuro sobrescrito
// pelo bloco [data-theme="light"] — e calcula a razao com a formula da WCAG 2.2
// escrita aqui, sem importar nada do site.
const globals = fs.readFileSync("app/globals.css", "utf8");
const cliente = fs.readFileSync("app/cliente.css", "utf8");
const tokensOf = (block) =>
  Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.replace(/\/\*.*?\*\//g, "").trim()]));
const block = (css, selector) => {
  const start = css.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `bloco ${selector} nao encontrado`);
  return css.slice(start, css.indexOf("}", start));
};
const escuro = { ...tokensOf(block(globals, ":root")), ...tokensOf(block(cliente, ":root")) };
const claro = { ...escuro, ...tokensOf(block(cliente, ':root[data-theme="light"]:not([data-retro="on"]):not(:has(.site-frame))')) };

const resolve = (tokens, value, depth = 0) => {
  const ref = value.match(/^var\((--[\w-]+)\)$/);
  if (!ref) return value;
  assert.ok(depth < 5 && tokens[ref[1]], `token ${ref[1]} sem valor`);
  return resolve(tokens, tokens[ref[1]], depth + 1);
};
const rgb = (color) => {
  const hex = color.match(/^#([0-9a-f]{6})$/i);
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16));
  const fn = color.match(/^rgb\((\d+) (\d+) (\d+)(?: \/ ([\d.]+))?\)$/);
  assert.ok(fn, `cor nao suportada pelo oraculo: ${color}`);
  return [fn[1], fn[2], fn[3]].map(Number);
};
const luminance = (c) => {
  const [r, g, b] = rgb(c).map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

// [frente, fundo, minimo]. Texto 4,5:1; borda de componente e foco 3:1 (1.4.11).
// O fundo do cabecalho e semitransparente; mede-se a cor sem o alfa, que e o
// pior caso so quando o conteudo de baixo e da mesma familia (fundo do tema).
const pares = [
  ["--paper", "--ink", 4.5], ["--paper", "--ink-2", 4.5], ["--paper", "--ink-3", 4.5],
  ["--paper-dim", "--ink", 4.5], ["--paper-dim", "--ink-2", 4.5], ["--paper-dim", "--ink-3", 4.5],
  ["--paper-faint", "--ink", 4.5], ["--paper-faint", "--ink-2", 4.5],
  ["--amber", "--ink", 4.5], ["--amber", "--ink-2", 4.5],
  ["--on-amber", "--amber-fill", 4.5], ["--on-amber", "--amber-fill-hover", 4.5],
  ["--mint", "--ink-2", 4.5], ["--error-text", "--ink", 4.5], ["--error-text", "--ink-2", 4.5],
  ["--paper", "--c-footer-bg", 4.5], ["--paper-dim", "--c-footer-bg", 4.5],
  ["--paper", "--c-header-bg", 4.5], ["--paper-dim", "--c-header-bg", 4.5],
  ["--line", "--ink", 3], ["--line", "--ink-2", 3],
  ["--amber", "--ink", 3], ["--amber-fill-border", "--ink", 3],
];

for (const [nome, tokens] of [["escuro", escuro], ["claro", claro]]) {
  test(`every text and border pair meets WCAG AA in the ${nome === "claro" ? "light" : "dark"} theme`, () => {
    const falhas = pares.flatMap(([fg, bg, min]) => {
      const r = ratio(resolve(tokens, tokens[fg]), resolve(tokens, tokens[bg]));
      return r + 1e-9 >= min ? [] : [`${fg} sobre ${bg}: ${r.toFixed(2)} < ${min}`];
    });
    assert.deepEqual(falhas, []);
  });
}

test("the light theme redefines every base color token", () => {
  const cores = Object.keys(tokensOf(block(globals, ":root"))).filter((k) => /^#|^rgb/.test(escuro[k]));
  const claroBloco = tokensOf(block(cliente, ':root[data-theme="light"]:not([data-retro="on"]):not(:has(.site-frame))'));
  assert.deepEqual(cores.filter((k) => !(k in claroBloco)), []);
});

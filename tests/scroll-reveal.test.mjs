import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { benchExitProgress, lineProgress, smoothstep } from "../lib/scroll-reveal.ts";

// A curva tem as pontas presas e velocidade zero nelas: sem pulo nos limites.
test("smoothstep starts and ends still", () => {
  assert.equal(smoothstep(0), 0);
  assert.equal(smoothstep(1), 1);
  assert.equal(smoothstep(0.5), 0.5);
  const slope = (t) => (smoothstep(t + 1e-4) - smoothstep(t)) / 1e-4;
  assert.ok(slope(0) < 0.01);
  assert.ok(slope(1 - 1e-4) < 0.01);
});

// A faixa e a tela menos o scroll-padding do html (88px em cima), como no CSS.
const view = { top: 88, bottom: 900 };

// Mesmas faixas do CSS: a frase comeca a acender ao entrar pela base da tela
// e termina a 38% do caminho de "cover".
test("a line lights up between entering the viewport and cover 38%", () => {
  const top = 3000;
  const height = 60;
  assert.equal(lineProgress(top - view.bottom - 10, view, top, height), 0);
  assert.equal(lineProgress(top - view.bottom, view, top, height), 0);
  const end = top - view.bottom + 0.38 * (view.bottom - view.top + height);
  assert.ok(Math.abs(lineProgress(end, view, top, height) - 1) < 1e-9);
  assert.equal(lineProgress(end + 500, view, top, height), 1);
  // Rolar de volta apaga de novo: o progresso so depende da posicao.
  assert.ok(lineProgress(end - 100, view, top, height) < 1);
});

test("the bench image fades between exit 0% and exit 70%", () => {
  const bottom = 5000;
  const visible = view.bottom - view.top;
  assert.equal(benchExitProgress(bottom - view.bottom, view, bottom), 0);
  assert.ok(Math.abs(benchExitProgress(bottom - view.bottom + 0.7 * visible, view, bottom) - 1) < 1e-9);
  assert.equal(benchExitProgress(bottom, view, bottom), 1);
});

// Regressao (2026-10): no Firefox, sem animation-timeline, as frases ficavam
// paradas e acesas porque todo o efeito morava dentro do @supports. O fallback
// em JS precisa existir e respeitar o movimento reduzido.
test("the scroll reveal has a fallback outside @supports", () => {
  const css = fs.readFileSync("app/globals.css", "utf8");
  assert.match(css, /\.bench\[data-scroll-fallback\] \.bench-about-lines p \{/);
  const component = fs.readFileSync("components/bench-scroll.tsx", "utf8");
  assert.match(component, /CSS\.supports\("animation-timeline: view\(\)"\)/);
  assert.match(component, /prefers-reduced-motion: reduce/);
});

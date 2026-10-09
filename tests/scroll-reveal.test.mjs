import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { benchExitProgress, LINE_BAND, lineProgress, reveal, smoothstep } from "../lib/scroll-reveal.ts";

// A curva tem as pontas presas e velocidade zero nelas: sem pulo nos limites.
test("smoothstep starts and ends still", () => {
  assert.equal(smoothstep(0), 0);
  assert.equal(smoothstep(1), 1);
  assert.equal(smoothstep(0.5), 0.5);
  const slope = (t) => (smoothstep(t + 1e-4) - smoothstep(t)) / 1e-4;
  assert.ok(slope(0) < 0.01);
  assert.ok(slope(1 - 1e-4) < 0.01);
});

// A curva das frases sai andando (sem o ease-in do smoothstep), pousa parada,
// e nunca volta para tras no meio da faixa.
test("reveal leaves moving and lands still", () => {
  assert.equal(reveal(0), 0);
  assert.ok(Math.abs(reveal(1) - 1) < 1e-12);
  const slope = (t) => (reveal(t + 1e-4) - reveal(t)) / 1e-4;
  assert.ok(slope(0) > 0.5);
  assert.ok(slope(1 - 1e-4) < 0.01);
  for (let t = 0; t < 1; t += 0.01) assert.ok(reveal(t + 0.01) >= reveal(t));
  // Responde antes do smoothstep no primeiro trecho da faixa.
  assert.ok(reveal(0.2) > smoothstep(0.2) + 0.05);
});

// A faixa e a tela menos o scroll-padding do html (88px em cima), como no CSS.
const view = { top: 88, bottom: 900, height: 900 };
const onScreen = (top, fraction) => top - fraction * view.height; // scrollY que poe o topo a `fraction`

// Mesmas faixas do CSS (cover 15vh a cover 50vh): a frase comeca a acender com
// o topo a 85% da tela e termina a 50%.
test("a line lights up while its top goes from 85% to 50% of the screen", () => {
  const top = 3000;
  assert.deepEqual(LINE_BAND, { from: 0.85, to: 0.5 });
  assert.equal(lineProgress(onScreen(top, 0.95), view, top), 0);
  assert.ok(Math.abs(lineProgress(onScreen(top, 0.85), view, top)) < 1e-9);
  assert.ok(Math.abs(lineProgress(onScreen(top, 0.675), view, top) - 0.5) < 1e-9);
  assert.ok(Math.abs(lineProgress(onScreen(top, 0.5), view, top) - 1) < 1e-9);
  assert.equal(lineProgress(onScreen(top, 0.2), view, top), 1);
  // Rolar de volta apaga de novo: o progresso so depende da posicao.
  assert.ok(lineProgress(onScreen(top, 0.6), view, top) < 1);
});

// Com o dock do celular (scroll-padding-bottom), a faixa sobe junto com a base.
test("the band starts above the bottom scroll-padding", () => {
  const top = 3000;
  const docked = { top: 88, bottom: 816, height: 900 };
  assert.ok(Math.abs(lineProgress(top - docked.bottom + 0.15 * 900, docked, top)) < 1e-9);
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

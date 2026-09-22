import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

// Regressao: a tela de entrada cobria a pagina com pointer-events ativo, entao o
// primeiro clique em um link so pulava a animacao e a navegacao pedia dois
// cliques (ADR-014).
test("the entry animation never intercepts the pointer", () => {
  const css = read("app/globals.css");

  const bootScreen = css.match(/\.boot-screen \{[^}]*\}/);
  assert.ok(bootScreen, "expected a .boot-screen rule");
  assert.match(bootScreen[0], /pointer-events:\s*none/);

  const bootSkip = css.match(/\.boot-skip \{[^}]*\}/);
  assert.ok(bootSkip, "expected a .boot-skip rule");
  assert.match(bootSkip[0], /pointer-events:\s*auto/);
});

// Regressao: remover as tags <link rel="icon"> do <head> apagava nos que o React
// renderiza e estourava removeChild na transicao de rota seguinte (ADR-014).
test("the personality layer does not touch icon links rendered by React", () => {
  // Só o código conta: o comentário do arquivo cita o defeito de propósito.
  const code = read("components/browser-chrome.tsx")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");

  for (const forbidden of [/rel~="icon"/, /\.remove\(\)/, /appendChild/]) {
    assert.doesNotMatch(code, forbidden);
  }
});

test("the per-route icon is declared by file convention", () => {
  for (const icon of ["app/icon.svg", "app/archive/icon.svg", "app/area/icon.svg"]) {
    assert.ok(fs.existsSync(path.join(process.cwd(), icon)), `${icon} must exist`);
  }
});

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { verificarLink } from "../lib/material.ts";

// `npm run material:link -- <cliente> --producao`: le o segredo de producao de
// ~/.config/gabrielsys/material-secret e usa https://gabrielsys.com.br como base.
// HOME falso com um segredo sintetico; o real nunca entra em teste.
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SEGREDO = "segredo-sintetico-de-producao-com-mais-de-32";

function casa({ segredo = SEGREDO, modo = 0o600 } = {}) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "material-link-"));
  if (segredo !== null) {
    fs.mkdirSync(path.join(home, ".config/gabrielsys"), { recursive: true });
    fs.writeFileSync(path.join(home, ".config/gabrielsys/material-secret"), `${segredo}\n`, { mode: modo });
  }
  return home;
}

// cwd vazio: sem .dev.vars por perto, para provar que o --producao nao depende dele.
function rodar(home, args, env = {}) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "material-link-cwd-"));
  const limpo = { ...process.env, HOME: home, ...env };
  if (!("MATERIAL_SECRET" in env)) delete limpo.MATERIAL_SECRET;
  return spawnSync(process.execPath, ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", path.join(raiz, "scripts/material-link.mjs"), ...args], { cwd, env: limpo, encoding: "utf8" });
}

const fragmento = (url) => Object.fromEntries(new URLSearchParams(new URL(url).hash.slice(1)));

test("--producao signs with the secret file and uses gabrielsys.com.br", async () => {
  const r = rodar(casa(), ["cafe-do-coreto", "--producao"]);
  assert.equal(r.status, 0, r.stderr);
  const url = r.stdout.trim();
  assert.match(url, /^https:\/\/gabrielsys\.com\.br\/material\/#c=cafe-do-coreto&e=\d+&t=/);
  assert.equal(await verificarLink(SEGREDO, fragmento(url), Math.floor(Date.now() / 1000)), true);
  assert.ok(!r.stdout.includes(SEGREDO) && !r.stderr.includes(SEGREDO), "o segredo nunca e impresso");
});

test("--producao ignores MATERIAL_SECRET from the environment", async () => {
  const r = rodar(casa(), ["cafe-do-coreto", "--producao"], { MATERIAL_SECRET: "outro-segredo-qualquer-com-mais-de-32-caracteres" });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(await verificarLink(SEGREDO, fragmento(r.stdout.trim()), Math.floor(Date.now() / 1000)), true);
});

test("--base replaces the production origin", () => {
  const r = rodar(casa(), ["cafe-do-coreto", "--producao", "--base", "https://gabrielsys.pages.dev"]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout.trim(), /^https:\/\/gabrielsys\.pages\.dev\/material\/#c=cafe-do-coreto&/);
});

test("--producao without the secret file fails without a link", () => {
  const r = rodar(casa({ segredo: null }), ["cafe-do-coreto", "--producao"]);
  assert.equal(r.status, 1);
  assert.equal(r.stdout, "");
  assert.match(r.stderr, /material-secret/);
});

test("--producao refuses a secret file readable by others", () => {
  const r = rodar(casa({ modo: 0o644 }), ["cafe-do-coreto", "--producao"]);
  assert.equal(r.status, 1);
  assert.equal(r.stdout, "");
  assert.match(r.stderr, /chmod 600/);
});

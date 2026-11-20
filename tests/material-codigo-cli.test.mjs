import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { verificarCodigo } from "../lib/material-codigo.ts";

// `npm run material:codigo -- <apelido> [--dias N] --producao`: casca fina sobre
// lib/material-codigo.ts. Mesmas travas do material:link: o segredo de produção vem só de
// ~/.config/gabrielsys/material-secret (chmod 600). HOME falso com segredo sintético.
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SEGREDO = "segredo-sintetico-de-producao-com-mais-de-32";

function casa({ segredo = SEGREDO, modo = 0o600 } = {}) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "material-codigo-"));
  if (segredo !== null) {
    fs.mkdirSync(path.join(home, ".config/gabrielsys"), { recursive: true });
    fs.writeFileSync(path.join(home, ".config/gabrielsys/material-secret"), `${segredo}\n`, { mode: modo });
  }
  return home;
}

function rodar(home, args, env = {}) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "material-codigo-cwd-"));
  const limpo = { ...process.env, HOME: home, ...env };
  if (!("MATERIAL_SECRET" in env)) delete limpo.MATERIAL_SECRET;
  return spawnSync(process.execPath, ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", path.join(raiz, "scripts/material-codigo.mjs"), ...args], { cwd, env: limpo, encoding: "utf8" });
}

const agora = () => Math.floor(Date.now() / 1000);
const codigoDa = (saida) => saida.match(/\b(ana-[a-z2-9]{4}-[a-z2-9]{4})\b/)?.[1];
const ddmm = (diasAFrente) => {
  const d = new Date(Date.now() - 3 * 3600 * 1000 + diasAFrente * 86400 * 1000);
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};

test("prints a working code and a ready WhatsApp message with the address, the code and the end date", async () => {
  const r = rodar(casa(), ["ana", "--producao"]);
  assert.equal(r.status, 0, r.stderr);
  const codigo = codigoDa(r.stdout);
  assert.ok(codigo, r.stdout);
  assert.deepEqual(await verificarCodigo(SEGREDO, codigo, agora()), { cliente: "ana" });
  assert.match(r.stdout, /gabrielsys\.com\.br\/material/);
  assert.ok(r.stdout.includes(`até ${ddmm(30)}`), `30 dias por padrão: ${r.stdout}`);
  assert.equal(r.stdout.split(codigo).length - 1, 2, "o código aparece sozinho e dentro da mensagem");
  assert.ok(!r.stdout.includes(SEGREDO) && !r.stderr.includes(SEGREDO), "o segredo nunca é impresso");
});

test("--dias changes the validity, within 1 to 60", async () => {
  const r = rodar(casa(), ["ana", "--dias", "5", "--producao"]);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.includes(`até ${ddmm(5)}`), r.stdout);
  for (const dias of ["0", "61", "abc"]) {
    const x = rodar(casa(), ["ana", "--dias", dias, "--producao"]);
    assert.equal(x.status, 1, dias);
    assert.equal(x.stdout, "");
  }
});

test("the nickname follows the material:link rule: lowercase letters, digits and hyphens", () => {
  for (const apelido of ["Ana", "ana maria", "../x", "-ana", "ãna"]) {
    const r = rodar(casa(), [apelido, "--producao"]);
    assert.equal(r.status, 1, apelido);
    assert.equal(r.stdout, "");
    assert.match(r.stderr, /minúsculas, dígitos e hífen/);
  }
  assert.equal(rodar(casa(), ["--producao"]).status, 1, "sem apelido");
});

test("--producao reads the secret only from its file and refuses a file others can read", async () => {
  const outro = rodar(casa(), ["ana", "--producao"], { MATERIAL_SECRET: "outro-segredo-qualquer-com-mais-de-32-caracteres" });
  assert.equal(outro.status, 0, outro.stderr);
  assert.deepEqual(await verificarCodigo(SEGREDO, codigoDa(outro.stdout), agora()), { cliente: "ana" });
  const sem = rodar(casa({ segredo: null }), ["ana", "--producao"]);
  assert.equal(sem.status, 1);
  assert.equal(sem.stdout, "");
  assert.match(sem.stderr, /material-secret/);
  const aberto = rodar(casa({ modo: 0o644 }), ["ana", "--producao"]);
  assert.equal(aberto.status, 1);
  assert.equal(aberto.stdout, "");
  assert.match(aberto.stderr, /chmod 600/);
});

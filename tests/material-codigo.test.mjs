import assert from "node:assert/strict";
import test from "node:test";
import { gerarCodigo, iguaisTempoConstante, verificarCodigo } from "../lib/material-codigo.ts";

// Código de acesso do /material/ (docs/design/material-codigo-2026-11/VERIFICACAO.md).
// Os códigos esperados vêm de uma implementação independente em Python (hmac +
// hashlib, base 31), não deste módulo. Segredo de teste, nunca o real.
const SEGREDO = "segredo-de-teste-com-32-caracteres!!";
const AGORA = 1_800_000_000; // 2027-01-15 05:00 em São Paulo

test("a code for a client lasts 30 days by default and shows the end date as dd/mm", async () => {
  const r = await gerarCodigo(SEGREDO, "ana", { agora: AGORA });
  assert.equal(r.codigo, "ana-u45r-cj4x");
  assert.equal(r.validoAte, "14/02");
});

test("the right code is accepted, for its client, until the end of its last day in São Paulo", async () => {
  // 14/02/2027 termina às 03:00 UTC de 15/02 (meia-noite em São Paulo).
  const fimDoUltimoDia = Date.UTC(2027, 1, 15, 3, 0, 0) / 1000;
  assert.deepEqual(await verificarCodigo(SEGREDO, "ana-u45r-cj4x", AGORA), { cliente: "ana" });
  assert.deepEqual(await verificarCodigo(SEGREDO, "ana-u45r-cj4x", fimDoUltimoDia - 1), { cliente: "ana" });
});

test("a wrong code, another client's code or an expired code is refused", async () => {
  const fimDoUltimoDia = Date.UTC(2027, 1, 15, 3, 0, 0) / 1000;
  assert.equal(await verificarCodigo(SEGREDO, "ana-u45r-cj4y", AGORA), null, "um caractere trocado");
  assert.equal(await verificarCodigo(SEGREDO, "bia-u45r-cj4x", AGORA), null, "código da ana com o apelido da bia");
  assert.equal(await verificarCodigo(SEGREDO, "ana-rzbm-xyep", AGORA), null, "código da bia com o apelido da ana");
  assert.deepEqual(await verificarCodigo(SEGREDO, "bia-rzbm-xyep", AGORA), { cliente: "bia" });
  assert.equal(await verificarCodigo(SEGREDO, "ana-u45r-cj4x", fimDoUltimoDia), null, "vencido");
  assert.equal(await verificarCodigo("outro-segredo-com-32-caracteres!!!!", "ana-u45r-cj4x", AGORA), null, "outro segredo");
});

test("capitals, spaces and extra or missing hyphens are accepted, and nothing else", async () => {
  assert.deepEqual(await verificarCodigo(SEGREDO, "ANA-KNJE-Y2YQ", AGORA), { cliente: "ana" }, "o código de 5 dias também vale");
  for (const variacao of ["ANA-U45R-CJ4X", "  ana-u45r-cj4x ", "ana u45r cj4x", "anau45rcj4x", "ana--u45r--cj4x", "a-n-a-u45rcj4x", "Ana - U45R - Cj4x", "ana-u45r-cj4x\n"]) {
    assert.deepEqual(await verificarCodigo(SEGREDO, variacao, AGORA), { cliente: "ana" }, JSON.stringify(variacao));
  }
  for (const variacao of [
    "ana-u45r-cj4", "ana-u45r-cj4xx", "xana-u45r-cj4x", "ana_u45r_cj4x", "ana.u45r.cj4x", "ana–u45r–cj4x",
    "ana-u45r-cj4K".replace("K", "x") === "ana-u45r-cj4x" ? "ana-u45r-cjKx" : "", // K de Kelvin
    "ãna-u45r-cj4x", "ana-u45r-cj4x!", "ana-u45r-cj4x%00", "", "-", "u45rcj4x", "ana-u45r-cj4x".repeat(8),
  ]) {
    assert.equal(await verificarCodigo(SEGREDO, variacao, AGORA), null, JSON.stringify(variacao));
  }
});

test("the code comparison reads every byte even when the first one already differs", () => {
  const contar = (bytes) => {
    const lidos = new Set();
    const p = new Proxy(bytes, { get: (alvo, k) => { if (typeof k === "string" && /^\d+$/.test(k)) lidos.add(k); const v = Reflect.get(alvo, k); return typeof v === "function" ? v.bind(alvo) : v; } });
    return { p, lidos };
  };
  const enc = new TextEncoder();
  const a = contar(enc.encode("zzzzzzzz"));
  assert.equal(iguaisTempoConstante(a.p, enc.encode("u45rcj4x")), false);
  assert.equal(a.lidos.size, 8, "leu só o começo: a comparação sai cedo");
  assert.equal(iguaisTempoConstante(enc.encode("u45rcj4x"), enc.encode("u45rcj4x")), true);
  assert.equal(iguaisTempoConstante(enc.encode("u45rcj4"), enc.encode("u45rcj4x")), false);
});

test("the number of days can change, up to 60, and bad nicknames or short secrets are refused", async () => {
  assert.deepEqual(await gerarCodigo(SEGREDO, "ana", { agora: AGORA, dias: 5 }), { codigo: "ana-knje-y2yq", cliente: "ana", validoAte: "20/01", expiraEm: "2027-01-20" });
  const cafe = await gerarCodigo(SEGREDO, "cafe-do-coreto", { agora: AGORA });
  assert.equal(cafe.codigo, "cafe-do-coreto-znz4-6a7x");
  assert.equal(cafe.cliente, "cafedocoreto", "a identidade do código é o apelido sem hífens");
  assert.deepEqual(await verificarCodigo(SEGREDO, "cafedocoreto-znz4-6a7x", AGORA), { cliente: "cafedocoreto" });
  await gerarCodigo(SEGREDO, "ana", { agora: AGORA, dias: 60 });
  for (const dias of [0, 61, 1.5, -1, Number.NaN]) await assert.rejects(() => gerarCodigo(SEGREDO, "ana", { agora: AGORA, dias }), /dias/, String(dias));
  for (const apelido of ["Ana", "ana maria", "../x", "-ana", "ana-", "ãna", "", "a".repeat(49)]) {
    await assert.rejects(() => gerarCodigo(SEGREDO, apelido, { agora: AGORA }), /apelido/, apelido);
  }
  await assert.rejects(() => gerarCodigo("curto", "ana", { agora: AGORA }), /segredo/);
  assert.equal(await verificarCodigo("curto", "ana-u45r-cj4x", AGORA), null);
});

test("the WhatsApp message carries the address, the code and the end date, in Gabriel's voice", async () => {
  const { mensagemWhatsApp } = await import("../lib/material-codigo.ts");
  const texto = mensagemWhatsApp({ codigo: "ana-u45r-cj4x", validoAte: "14/02" });
  assert.match(texto, /gabrielsys\.com\.br\/material\b/);
  assert.match(texto, /\bana-u45r-cj4x\b/);
  assert.match(texto, /\b14\/02\b/);
  assert.match(texto, /\bme\b/, "primeira pessoa");
  assert.doesNotMatch(texto, /R\$|preço|robô/i);
});

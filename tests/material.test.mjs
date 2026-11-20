import assert from "node:assert/strict";
import test from "node:test";
import { assinarLink, LIMITES, tipoPermitido, verificarLink } from "../lib/material.ts";

// Regras do prompt de 2026-11-19, tarefa 6: link só com token HMAC e validade;
// só png, jpg, webp e pdf (nada de SVG). Segredo de teste, nunca o real.
const SEGREDO = "segredo-de-teste-com-32-caracteres!!";
const AGORA = 1_800_000_000; // segundos, relógio injetado

test("a link signed for a client verifies until it expires", async () => {
  const { e, t } = await assinarLink(SEGREDO, "cafe-do-coreto", AGORA + 3600);
  assert.equal(await verificarLink(SEGREDO, { c: "cafe-do-coreto", e: String(e), t }, AGORA), true);
  assert.equal(await verificarLink(SEGREDO, { c: "cafe-do-coreto", e: String(e), t }, AGORA + 3601), false);
});

test("changing the client, the expiry, the token or the secret breaks the link", async () => {
  const { e, t } = await assinarLink(SEGREDO, "cafe-do-coreto", AGORA + 3600);
  assert.equal(await verificarLink(SEGREDO, { c: "outro-cliente", e: String(e), t }, AGORA), false);
  assert.equal(await verificarLink(SEGREDO, { c: "cafe-do-coreto", e: String(e + 1), t }, AGORA), false);
  assert.equal(await verificarLink(SEGREDO, { c: "cafe-do-coreto", e: String(e), t: t.slice(0, -2) + "AA" }, AGORA), false);
  assert.equal(await verificarLink("outro-segredo-com-32-caracteres!!!!", { c: "cafe-do-coreto", e: String(e), t }, AGORA), false);
});

test("bad client names, absurd expiries and missing fields never verify", async () => {
  await assert.rejects(() => assinarLink(SEGREDO, "../etc", AGORA + 60));
  await assert.rejects(() => assinarLink(SEGREDO, "Cafe Do Coreto", AGORA + 60));
  await assert.rejects(() => assinarLink("curto", "cafe", AGORA + 60));
  const { e, t } = await assinarLink(SEGREDO, "cafe", AGORA + LIMITES.validadeMaximaSegundos + 10);
  assert.equal(await verificarLink(SEGREDO, { c: "cafe", e: String(e), t }, AGORA), false, "validade acima do teto");
  assert.equal(await verificarLink(SEGREDO, { c: "cafe", e: "1e12", t }, AGORA), false);
  assert.equal(await verificarLink(SEGREDO, {}, AGORA), false);
});

const bytes = (...b) => new Uint8Array([...b, ...new Array(16).fill(0)]);
const PNG = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
const JPG = bytes(0xff, 0xd8, 0xff, 0xe0);
const WEBP = new Uint8Array([...Buffer.from("RIFF"), 0, 0, 0, 0, ...Buffer.from("WEBPVP8 "), 0, 0, 0, 0]);
const PDF = new Uint8Array([...Buffer.from("%PDF-1.7\n"), ...new Array(16).fill(0)]);
const SVG = new Uint8Array(Buffer.from('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"></svg>'));
const GIF = new Uint8Array(Buffer.from("GIF89a................"));

test("only png, jpg, webp and pdf pass, judged by their bytes and matching name and type", () => {
  assert.deepEqual(tipoPermitido(PNG, "logo.png", "image/png"), { ext: "png", mime: "image/png" });
  assert.deepEqual(tipoPermitido(JPG, "fachada.JPEG", "image/jpeg"), { ext: "jpg", mime: "image/jpeg" });
  assert.deepEqual(tipoPermitido(WEBP, "prato.webp", "image/webp"), { ext: "webp", mime: "image/webp" });
  assert.deepEqual(tipoPermitido(PDF, "cardapio.pdf", "application/pdf"), { ext: "pdf", mime: "application/pdf" });
  assert.equal(tipoPermitido(SVG, "logo.svg", "image/svg+xml"), null);
  assert.equal(tipoPermitido(SVG, "logo.png", "image/png"), null, "SVG disfarçado de PNG");
  assert.equal(tipoPermitido(GIF, "a.gif", "image/gif"), null);
  assert.equal(tipoPermitido(PNG, "logo.pdf", "application/pdf"), null, "nome e conteúdo discordam");
  assert.equal(tipoPermitido(PNG, "logo.png", "text/html"), null, "tipo declarado discorda");
});

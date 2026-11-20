import assert from "node:assert/strict";
import test from "node:test";
import { linkWhatsApp } from "../lib/whatsapp.ts";
import { WHATSAPP } from "../lib/contato.ts";

// Oráculo escrito à mão: o número do Business, sem importar o código que o monta.
const BUSINESS = "5535998840168";

test("the client contact is the Business number", () => {
  assert.equal(WHATSAPP, BUSINESS);
});

test("builds the wa.me link with the encoded text", () => {
  assert.equal(linkWhatsApp(BUSINESS, "Oi, Gabriel! *Site* & app?"), "https://wa.me/5535998840168?text=Oi%2C%20Gabriel!%20*Site*%20%26%20app%3F");
});

test("drops formatting from the number and omits an empty text", () => {
  assert.equal(linkWhatsApp("+55 (35) 99884-0168"), "https://wa.me/5535998840168");
  assert.equal(linkWhatsApp(BUSINESS, "   "), "https://wa.me/5535998840168");
});

test("refuses a number without country and area code", () => {
  assert.throws(() => linkWhatsApp("99884-0168"), RangeError);
});

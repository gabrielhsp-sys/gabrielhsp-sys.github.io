// Gera o link do /material/ para um cliente: `npm run material:link -- <cliente> [--dias 14] [--base URL]`
// O segredo vem de MATERIAL_SECRET no ambiente ou do .dev.vars (ignorado pelo Git). O
// script nunca imprime o segredo. O token vai no fragmento (#), que o navegador não envia
// ao servidor nem no Referer: o link não fica em log de acesso.
import fs from "node:fs";
import path from "node:path";
import { assinarLink, CLIENTE, LIMITES } from "../lib/material.ts";
import { SITE_URL } from "../lib/site.ts";

const args = process.argv.slice(2);
const opcao = (nome, padrao) => {
  const i = args.indexOf(`--${nome}`);
  return i >= 0 ? args.splice(i, 2)[1] : padrao;
};
const dias = Number(opcao("dias", "14"));
const base = opcao("base", SITE_URL).replace(/\/$/, "");
const [cliente] = args;

const sair = (msg) => {
  console.error(`material:link: ${msg}`);
  process.exit(1);
};
if (!cliente || !CLIENTE.test(cliente)) sair("informe o cliente em minúsculas, dígitos e hífen, ex.: npm run material:link -- cafe-do-coreto");
if (!Number.isInteger(dias) || dias < 1 || dias * 86400 > LIMITES.validadeMaximaSegundos) sair(`--dias entre 1 e ${LIMITES.validadeMaximaSegundos / 86400}`);
if (!/^https?:\/\/[^\s/]+$/.test(base)) sair("--base precisa ser uma origem, ex.: http://127.0.0.1:8788");

const lerDevVars = () => {
  const arquivo = path.join(process.cwd(), ".dev.vars");
  if (!fs.existsSync(arquivo)) return undefined;
  const linha = fs.readFileSync(arquivo, "utf8").split(/\r?\n/).find((l) => l.startsWith("MATERIAL_SECRET="));
  return linha?.slice("MATERIAL_SECRET=".length).replace(/^"|"$/g, "");
};
const segredo = process.env.MATERIAL_SECRET ?? lerDevVars();
if (!segredo) sair("MATERIAL_SECRET ausente (no ambiente ou no .dev.vars)");
if (segredo.length < LIMITES.segredoMinimo) sair(`MATERIAL_SECRET com menos de ${LIMITES.segredoMinimo} caracteres`);

const expira = Math.floor(Date.now() / 1000) + dias * 86400;
const { c, e, t } = await assinarLink(segredo, cliente, expira);
console.log(`${base}/material/#c=${c}&e=${e}&t=${t}`);
console.error(`válido até ${new Date(expira * 1000).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`);

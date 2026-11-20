// Gera o link do /material/ para um cliente: `npm run material:link -- <cliente> [--dias 14] [--base URL] [--producao]`
// O segredo vem de MATERIAL_SECRET no ambiente ou do .dev.vars (ignorado pelo Git). Com
// --producao, vem só de ~/.config/gabrielsys/material-secret (chmod 600, fora do
// repositório), o mesmo gravado no projeto Pages, e a base é https://gabrielsys.com.br
// (--base troca). O script nunca imprime o segredo. O token vai no fragmento (#), que o navegador não envia
// ao servidor nem no Referer: o link não fica em log de acesso.
import { assinarLink, CLIENTE, LIMITES } from "../lib/material.ts";
import { SITE_URL } from "../lib/site.ts";
import { lerSegredo } from "./segredo-material.mjs";

const args = process.argv.slice(2);
const opcao = (nome, padrao) => {
  const i = args.indexOf(`--${nome}`);
  return i >= 0 ? args.splice(i, 2)[1] : padrao;
};
const producao = args.includes("--producao");
if (producao) args.splice(args.indexOf("--producao"), 1);
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

const segredo = lerSegredo({ producao, minimo: LIMITES.segredoMinimo, sair });

const expira = Math.floor(Date.now() / 1000) + dias * 86400;
const { c, e, t } = await assinarLink(segredo, cliente, expira);
console.log(`${base}/material/#c=${c}&e=${e}&t=${t}`);
console.error(`válido até ${new Date(expira * 1000).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`);

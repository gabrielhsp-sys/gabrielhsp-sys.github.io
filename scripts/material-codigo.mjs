// Gera o código de acesso do /material/ para um cliente e a mensagem pronta para o WhatsApp:
//   npm run material:codigo -- <apelido> [--dias N] [--producao]
// Casca fina sobre lib/material-codigo.ts (o mesmo módulo que a Pages Function usa e que o painel
// vai usar). O segredo vem de scripts/segredo-material.mjs, com as mesmas travas do material:link;
// nunca é impresso. Sem --producao, usa o segredo local (.dev.vars) da prévia.
import { CLIENTE, LIMITES } from "../lib/material.ts";
import { DIAS_MAXIMO, DIAS_PADRAO, gerarCodigo, mensagemWhatsApp } from "../lib/material-codigo.ts";
import { lerSegredo } from "./segredo-material.mjs";

const args = process.argv.slice(2);
const sair = (msg) => {
  console.error(`material:codigo: ${msg}`);
  process.exit(1);
};
const opcao = (nome, padrao) => {
  const i = args.indexOf(`--${nome}`);
  return i >= 0 ? args.splice(i, 2)[1] : padrao;
};
const producao = args.includes("--producao");
if (producao) args.splice(args.indexOf("--producao"), 1);
const textoDias = opcao("dias", String(DIAS_PADRAO));
const [apelido] = args;

if (!apelido || !CLIENTE.test(apelido)) sair("informe o apelido em minúsculas, dígitos e hífen, ex.: npm run material:codigo -- ana --producao");
if (!/^\d{1,3}$/.test(textoDias ?? "") || Number(textoDias) < 1 || Number(textoDias) > DIAS_MAXIMO) sair(`--dias entre 1 e ${DIAS_MAXIMO}`);

const segredo = lerSegredo({ producao, minimo: LIMITES.segredoMinimo, sair });
const { codigo, validoAte } = await gerarCodigo(segredo, apelido, { agora: Math.floor(Date.now() / 1000), dias: Number(textoDias) });

console.log(`Código: ${codigo}`);
console.log(`Vale até ${validoAte} (${textoDias} dias)${producao ? "" : "  [segredo LOCAL: só vale na prévia]"}`);
console.log("");
console.log("Mensagem para o WhatsApp (copie daqui para baixo):");
console.log("");
console.log(mensagemWhatsApp({ codigo, validoAte }));

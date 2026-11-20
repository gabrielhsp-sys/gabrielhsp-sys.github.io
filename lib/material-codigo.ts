// Código de acesso do /material/: `<apelido>-xxxx-xxxx`, um por cliente, que o Gabriel manda no
// WhatsApp. Funções puras (o relógio entra como parâmetro), sem terminal, sem Next e sem formato
// de saída de script: usadas pela Pages Function (functions/api/material/*), pelo gerador de
// terminal (scripts/material-codigo.mjs) e, no futuro, pelo painel de gestão
// (docs/design/material-codigo-2026-11/PARA-O-PAINEL.md). Só Web Crypto.

import { CLIENTE, LIMITES } from "./material.ts";
import { SITE_URL } from "./site.ts";

const ALFABETO = "abcdefghjkmnpqrstuvwxyz23456789"; // 31 símbolos: sem 0/o e 1/l/i
const TAMANHO = 8;
const DIA = 86400;
const FUSO_SP = -3 * 3600; // America/Sao_Paulo, sem horário de verão desde 2019

const enc = new TextEncoder();

/** Dia corrido em São Paulo (dias desde 1970-01-01 no calendário de lá). */
const diaSaoPaulo = (segundos: number) => Math.floor((segundos + FUSO_SP) / DIA);

const ddmm = (dia: number) => {
  const d = new Date(dia * DIA * 1000);
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};

const ROTULO = "gabrielsys:material:codigo:v1"; // separação de domínio do token do link

const importar = (bytes: Uint8Array<ArrayBuffer>) =>
  crypto.subtle.importKey("raw", bytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);

/** Subchave do código: HMAC(MATERIAL_SECRET, rótulo). Importada uma vez por chamada (custo de CPU). */
const chaveDoCodigo = async (segredo: string) =>
  importar(new Uint8Array(await crypto.subtle.sign("HMAC", await importar(enc.encode(segredo)), enc.encode(ROTULO))));

/** 8 símbolos base 31 dos primeiros 64 bits de HMAC(subchave, "<apelido compacto>:<dia>"). */
async function derivar(chave: CryptoKey, compacto: string, dia: number): Promise<string> {
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", chave, enc.encode(`${compacto}:${dia}`)));
  let n = 0n;
  for (const b of mac.slice(0, 8)) n = (n << 8n) | BigInt(b);
  let s = "";
  for (let i = 0; i < TAMANHO; i += 1) {
    s += ALFABETO[Number(n % 31n)];
    n /= 31n;
  }
  return s;
}

/** Validade padrão e máxima, em dias corridos de São Paulo (o máximo é o mesmo teto do link). */
export const DIAS_PADRAO = 30;
export const DIAS_MAXIMO = LIMITES.validadeMaximaSegundos / DIA;

export type CodigoGerado = {
  /** O que a pessoa digita: o apelido como foi escrito + 8 caracteres em dois grupos. */
  codigo: string;
  /** Identidade no bucket: o apelido sem hífens (prefixo `<cliente>/`). */
  cliente: string;
  /** Último dia válido, dd/mm, em São Paulo. */
  validoAte: string;
  /** Último dia válido, AAAA-MM-DD, em São Paulo. */
  expiraEm: string;
};

/**
 * Gera o código de um cliente. `agora` em segundos Unix; vale até o fim do dia `hoje + dias` em
 * São Paulo. `segredo` é o MATERIAL_SECRET (o mesmo do projeto Pages); nunca vai na saída.
 */
export async function gerarCodigo(segredo: string, apelido: string, { agora, dias = DIAS_PADRAO }: { agora: number; dias?: number }): Promise<CodigoGerado> {
  if (typeof segredo !== "string" || segredo.length < LIMITES.segredoMinimo) throw new Error("segredo curto demais");
  if (typeof apelido !== "string" || !CLIENTE.test(apelido)) throw new Error("apelido inválido: use minúsculas, dígitos e hífen");
  if (!Number.isInteger(dias) || dias < 1 || dias > DIAS_MAXIMO) throw new Error(`dias entre 1 e ${DIAS_MAXIMO}`);
  if (!Number.isSafeInteger(agora)) throw new Error("agora inválido");
  const cliente = apelido.replace(/-/g, "");
  const expiraDia = diaSaoPaulo(agora) + dias;
  const mac = await derivar(await chaveDoCodigo(segredo), cliente, expiraDia);
  return {
    codigo: `${apelido}-${mac.slice(0, 4)}-${mac.slice(4)}`,
    cliente,
    validoAte: ddmm(expiraDia),
    expiraEm: new Date(expiraDia * DIA * 1000).toISOString().slice(0, 10),
  };
}

/**
 * Forma compacta do que a pessoa digitou: tira espaços e hífens ASCII e passa A-Z para minúsculas.
 * Só ASCII: `toLowerCase()` transformaria o K de Kelvin (U+212A) em "k". Qualquer outro caractere
 * recusa. Devolve o apelido sem hífens e os 8 caracteres finais, ou null.
 */
export function normalizarCodigo(texto: string): { apelido: string; mac: string } | null {
  if (typeof texto !== "string" || texto.length > 120) return null;
  const compacto = texto.replace(/[\s-]/g, "").replace(/[A-Z]/g, (c) => c.toLowerCase());
  const m = compacto.match(/^([a-z0-9]{1,48})([a-z2-9]{8})$/);
  if (!m || /[01ilo]/.test(m[2])) return null;
  return { apelido: m[1], mac: m[2] };
}

export async function verificarCodigo(segredo: string, texto: string, agora: number): Promise<{ cliente: string } | null> {
  if (typeof segredo !== "string" || segredo.length < LIMITES.segredoMinimo) return null;
  const partes = normalizarCodigo(texto);
  if (!partes) return null;
  const { apelido, mac } = partes;
  const recebido = enc.encode(mac);
  // O vencimento não vai no código: testa todos os dias possíveis, sempre todos, sem sair cedo.
  const hoje = diaSaoPaulo(agora);
  const chave = await chaveDoCodigo(segredo);
  let achou = false;
  for (let dia = hoje; dia <= hoje + DIAS_MAXIMO; dia += 1) {
    achou = iguaisTempoConstante(enc.encode(await derivar(chave, apelido, dia)), recebido) || achou;
  }
  return achou ? { cliente: apelido } : null;
}

/** Igualdade de bytes que lê tudo, mesmo quando o primeiro já difere (sem atalho por tempo). */
export function iguaisTempoConstante(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false; // o tamanho do código é público (8)
  let dif = 0;
  for (let i = 0; i < a.length; i += 1) dif |= a[i] ^ b[i];
  return dif === 0;
}

/** Endereço como a pessoa digita: sem https:// e sem barra final. */
export const ENDERECO_MATERIAL = `${SITE_URL.replace(/^https?:\/\//, "")}/material`;

/** Mensagem pronta para o Gabriel colar no WhatsApp do cliente. Nunca leva o segredo. */
export function mensagemWhatsApp({ codigo, validoAte }: { codigo: string; validoAte: string }): string {
  return [
    "Oi! Para me mandar as fotos, a logo e os textos do seu site, abra:",
    ENDERECO_MATERIAL,
    "",
    "e digite este código de acesso:",
    codigo,
    "",
    `Ele vale até ${validoAte}. Se tiver qualquer dúvida, me chame aqui.`,
  ].join("\n");
}

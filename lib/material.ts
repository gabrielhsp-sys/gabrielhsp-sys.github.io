// /material/ (envio de fotos, logo e textos depois da venda): o link assinado e
// a checagem de tipo de arquivo. Usado pela Pages Function
// (functions/api/material/*.ts), pelo gerador de links (scripts/material-link.mjs)
// e pelos testes. Só Web Crypto (crypto.subtle), que existe no Node 22 e no
// runtime da Cloudflare; sem import, para o Node ler este arquivo direto.

export const LIMITES = {
  /** Por arquivo (o mesmo do formulário Tally de onde as perguntas vieram). */
  arquivoBytes: 10 * 1024 * 1024,
  /** Por envio (um POST). Quem tiver mais, envia de novo com o mesmo link. */
  envioBytes: 40 * 1024 * 1024,
  /** Arquivos por envio. */
  arquivosPorEnvio: 20,
  /** Respostas de texto (JSON) por envio. */
  respostasBytes: 64 * 1024,
  /** Cota por cliente no bucket (soma de todos os envios do link). */
  cotaClienteBytes: 300 * 1024 * 1024,
  /** Teto de validade de um link, a partir de agora. */
  validadeMaximaSegundos: 60 * 24 * 3600,
  /** Segredo mínimo (caracteres). */
  segredoMinimo: 32,
} as const;

/** Identificador do cliente no link e no prefixo do bucket: minúsculas, dígitos e hífen. */
export const CLIENTE = /^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$/;

const enc = new TextEncoder();

const base64url = (bytes: Uint8Array) => {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const deBase64url = (texto: string): Uint8Array<ArrayBuffer> | null => {
  if (!/^[A-Za-z0-9_-]{43}$/.test(texto)) return null; // HMAC-SHA256 = 32 bytes = 43 caracteres
  const bin = atob(texto.replace(/-/g, "+").replace(/_/g, "/") + "=");
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

const chave = (segredo: string, uso: KeyUsage) =>
  crypto.subtle.importKey("raw", enc.encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, [uso]);

// O texto assinado tem versão e finalidade: um token deste link não serve para outra coisa.
const mensagem = (cliente: string, expira: number) => enc.encode(`gabrielsys:material:v1:${cliente}:${expira}`);

/** Assina o link de um cliente até `expira` (segundos Unix). */
export async function assinarLink(segredo: string, cliente: string, expira: number): Promise<{ c: string; e: number; t: string }> {
  if (segredo.length < LIMITES.segredoMinimo) throw new Error("segredo curto demais");
  if (!CLIENTE.test(cliente)) throw new Error("cliente inválido: use minúsculas, dígitos e hífen");
  if (!Number.isSafeInteger(expira)) throw new Error("validade inválida");
  const assinatura = await crypto.subtle.sign("HMAC", await chave(segredo, "sign"), mensagem(cliente, expira));
  return { c: cliente, e: expira, t: base64url(new Uint8Array(assinatura)) };
}

/**
 * Confere o link. `agora` em segundos Unix (injetado nos testes). A comparação
 * da assinatura é a do crypto.subtle.verify, em tempo constante.
 */
export async function verificarLink(segredo: string, link: { c?: string | null; e?: string | null; t?: string | null }, agora: number): Promise<boolean> {
  const { c, e, t } = link;
  if (!segredo || segredo.length < LIMITES.segredoMinimo) return false;
  if (!c || !e || !t || !CLIENTE.test(c) || !/^\d{1,12}$/.test(e)) return false;
  const expira = Number(e);
  if (expira <= agora || expira > agora + LIMITES.validadeMaximaSegundos) return false;
  const assinatura = deBase64url(t);
  if (!assinatura) return false;
  return crypto.subtle.verify("HMAC", await chave(segredo, "verify"), assinatura, mensagem(c, expira));
}

type Tipo = { ext: "png" | "jpg" | "webp" | "pdf"; mime: string };

const comeca = (b: Uint8Array, assinatura: number[], desde = 0) => assinatura.every((v, i) => b[desde + i] === v);
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

/**
 * Só png, jpg, webp e pdf, e só quando os três concordam: os primeiros bytes,
 * a extensão do nome e o tipo declarado. SVG nunca passa (é texto/XML e pode
 * levar script). Devolve a extensão e o tipo canônicos, ou null.
 */
export function tipoPermitido(cabeca: Uint8Array, nome: string, tipoDeclarado: string): Tipo | null {
  const ext = (nome.toLowerCase().match(/\.([a-z0-9]{1,5})$/)?.[1] ?? "").replace("jpeg", "jpg");
  const declarado = tipoDeclarado.toLowerCase().split(";")[0].trim();
  let tipo: Tipo | null = null;
  if (comeca(cabeca, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) tipo = { ext: "png", mime: "image/png" };
  else if (comeca(cabeca, [0xff, 0xd8, 0xff])) tipo = { ext: "jpg", mime: "image/jpeg" };
  else if (comeca(cabeca, ascii("RIFF")) && comeca(cabeca, ascii("WEBP"), 8)) tipo = { ext: "webp", mime: "image/webp" };
  else if (comeca(cabeca, ascii("%PDF-"))) tipo = { ext: "pdf", mime: "application/pdf" };
  if (!tipo || tipo.ext !== ext) return null;
  // Navegador que não informa o tipo manda "" ou octet-stream: aí valem bytes e nome.
  if (declarado && declarado !== "application/octet-stream" && declarado !== tipo.mime) return null;
  return tipo;
}

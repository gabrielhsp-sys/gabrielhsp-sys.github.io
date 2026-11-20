// Peças comuns das Pages Functions do /material/ (functions/api/material/). Fica fora de
// functions/ para nunca virar rota.
// Tipos mínimos escritos aqui (sem @cloudflare/workers-types, que seria outra dependência).
import { verificarLink } from "./material.ts";
import { verificarCodigo } from "./material-codigo.ts";

export interface R2PutOptions {
  httpMetadata?: { contentType?: string };
  customMetadata?: Record<string, string>;
}
export interface R2BucketMinimo {
  put(key: string, value: ArrayBuffer | string, options?: R2PutOptions): Promise<unknown>;
  get(key: string): Promise<{ text(): Promise<string> } | null>;
  list(options: { prefix: string; cursor?: string; limit?: number }): Promise<{ objects: { size: number }[]; truncated: boolean; cursor?: string }>;
}
export interface Env {
  MATERIAL_SECRET?: string;
  MATERIAL_BUCKET?: R2BucketMinimo;
  /** Cota por cliente em bytes; sem ela vale LIMITES.cotaClienteBytes. Só para teste local. */
  MATERIAL_COTA_BYTES?: string;
}

/** Bytes já gravados sob o prefixo do cliente. Uso interno: nenhuma rota devolve listagem. */
export async function usoDoCliente(bucket: R2BucketMinimo, cliente: string): Promise<number> {
  let total = 0;
  let cursor: string | undefined;
  do {
    const pagina = await bucket.list({ prefix: `${cliente}/`, cursor, limit: 1000 });
    total += pagina.objects.reduce((soma, o) => soma + o.size, 0);
    cursor = pagina.truncated ? pagina.cursor : undefined;
  } while (cursor);
  return total;
}
export interface Contexto {
  request: Request;
  env: Env;
}

/**
 * Atraso fixo antes de responder a uma credencial recusada (código ou link errado, vencido,
 * revogado, de outro cliente). Fixo: não depende do motivo, então não revela qual foi.
 */
export const ATRASO_RECUSA_MS = 600;

/** Fronteiras das rotas: o relógio e a espera. Os testes injetam as suas. */
export interface Dependencias {
  agora: () => number;
  esperar: (ms: number) => Promise<void>;
}

/** Credencial vinda do corpo da requisição: o código OU o link longo (c, e, t). */
export type Credencial = { codigo?: unknown; c?: unknown; e?: unknown; t?: unknown };

const texto = (v: unknown) => (typeof v === "string" ? v : null);

/**
 * Confere a credencial e devolve o cliente (prefixo no bucket), ou null. O código ganha do link
 * quando os dois vêm. Não diz o motivo da recusa.
 */
export async function autorizar(env: Env, credencial: Credencial, agora: number): Promise<string | null> {
  const segredo = env.MATERIAL_SECRET ?? "";
  const codigo = texto(credencial.codigo);
  let cliente: string | null = null;
  if (codigo !== null) {
    cliente = (await verificarCodigo(segredo, codigo, agora))?.cliente ?? null;
  } else {
    const link = { c: texto(credencial.c), e: texto(credencial.e), t: texto(credencial.t) };
    if (await verificarLink(segredo, link, agora)) cliente = link.c;
  }
  if (!cliente || !env.MATERIAL_BUCKET) return null;
  return (await revogados(env.MATERIAL_BUCKET)).has(compactar(cliente)) ? null : cliente;
}

/**
 * Revogação antes do prazo: objeto privado `_controle/revogados.txt` no mesmo bucket, um apelido
 * por linha (`#` comenta). Vale para o código e para o link longo do apelido. O prefixo
 * `_controle/` nunca é de cliente: apelido começa com letra ou dígito (CLIENTE).
 */
export const CHAVE_REVOGADOS = "_controle/revogados.txt";

const compactar = (apelido: string) => apelido.replace(/[\s-]/g, "").replace(/[A-Z]/g, (c) => c.toLowerCase());

async function revogados(bucket: R2BucketMinimo): Promise<Set<string>> {
  const objeto = await bucket.get(CHAVE_REVOGADOS);
  if (!objeto) return new Set();
  const linhas = (await objeto.text()).split(/\r?\n/).map((l) => l.replace(/#.*/, "")).map(compactar);
  return new Set(linhas.filter(Boolean));
}

export const resposta = (status: number, corpo: Record<string, unknown>) =>
  new Response(JSON.stringify(corpo), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" },
  });

/** Só aceita chamada da própria origem quando o navegador manda Origin (defesa extra; o token é a regra). */
export const origemValida = (request: Request) => {
  const origem = request.headers.get("origin");
  return !origem || origem === new URL(request.url).origin;
};

export const agoraSegundos = () => Math.floor(Date.now() / 1000);

export const PADRAO: Dependencias = {
  agora: agoraSegundos,
  esperar: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

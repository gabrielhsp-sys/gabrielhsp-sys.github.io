// Peças comuns das Pages Functions do /material/ (functions/api/material/). Fica fora de
// functions/ para nunca virar rota.
// Tipos mínimos escritos aqui (sem @cloudflare/workers-types, que seria outra dependência).

export interface R2PutOptions {
  httpMetadata?: { contentType?: string };
  customMetadata?: Record<string, string>;
}
export interface R2BucketMinimo {
  put(key: string, value: ArrayBuffer | string, options?: R2PutOptions): Promise<unknown>;
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

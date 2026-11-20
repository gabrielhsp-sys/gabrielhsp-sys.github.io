// Peças comuns das Pages Functions do /material/ (functions/api/material/). Fica fora de
// functions/ para nunca virar rota.
// Tipos mínimos escritos aqui (sem @cloudflare/workers-types, que seria outra dependência).

export interface R2PutOptions {
  httpMetadata?: { contentType?: string };
  customMetadata?: Record<string, string>;
}
export interface R2BucketMinimo {
  put(key: string, value: ArrayBuffer | string, options?: R2PutOptions): Promise<unknown>;
}
export interface Env {
  MATERIAL_SECRET?: string;
  MATERIAL_BUCKET?: R2BucketMinimo;
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

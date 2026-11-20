// POST /api/material/verificar  {codigo} ou {c, e, t}  ->  200 {ok, cliente} se vale, 403 se não.
// A página /material/ chama antes de mostrar o formulário. Não revela o motivo.
// O código vem só no corpo (nunca na URL) e nada aqui é logado.
import { ATRASO_RECUSA_MS, type Contexto, type Credencial, type Dependencias, PADRAO, autorizar, origemValida, resposta } from "../../../lib/material-function.ts";

export const criarVerificar = (deps: Dependencias = PADRAO) => async ({ request, env }: Contexto): Promise<Response> => {
  if (!env.MATERIAL_SECRET || !env.MATERIAL_BUCKET) return resposta(503, { ok: false });
  if (!origemValida(request)) return resposta(403, { ok: false });
  // Sem Content-Length não há como limitar a leitura (auditoria 2026-11-19, achado 2).
  const tamanho = request.headers.get("content-length");
  if (!tamanho) return resposta(411, { ok: false });
  if (Number(tamanho) > 1024) return resposta(413, { ok: false });
  let credencial: Credencial;
  try {
    credencial = (await request.json()) as Credencial;
  } catch {
    return resposta(400, { ok: false });
  }
  const cliente = await autorizar(env, credencial ?? {}, deps.agora());
  if (cliente) return resposta(200, { ok: true, cliente });
  await deps.esperar(ATRASO_RECUSA_MS);
  return resposta(403, { ok: false });
};

export const onRequestPost = criarVerificar();

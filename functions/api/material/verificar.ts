// POST /api/material/verificar  {c, e, t}  ->  200 se o link vale, 403 se não.
// A página /material/ chama antes de mostrar o formulário. Não revela o motivo.
import { verificarLink } from "../../../lib/material";
import { type Contexto, agoraSegundos, origemValida, resposta } from "../../../lib/material-function";

export async function onRequestPost({ request, env }: Contexto): Promise<Response> {
  if (!origemValida(request)) return resposta(403, { ok: false });
  // Sem Content-Length não há como limitar a leitura (auditoria 2026-11-19, achado 2).
  const tamanho = request.headers.get("content-length");
  if (!tamanho) return resposta(411, { ok: false });
  if (Number(tamanho) > 1024) return resposta(413, { ok: false });
  let link: { c?: string; e?: string; t?: string };
  try {
    link = (await request.json()) as typeof link;
  } catch {
    return resposta(400, { ok: false });
  }
  const ok = await verificarLink(env.MATERIAL_SECRET ?? "", link ?? {}, agoraSegundos());
  return resposta(ok ? 200 : 403, { ok });
}

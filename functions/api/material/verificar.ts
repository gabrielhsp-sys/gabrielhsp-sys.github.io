// POST /api/material/verificar  {c, e, t}  ->  200 se o link vale, 403 se não.
// A página /material/ chama antes de mostrar o formulário. Não revela o motivo.
import { verificarLink } from "../../../lib/material";
import { type Contexto, agoraSegundos, origemValida, resposta } from "../../../lib/material-function";

export async function onRequestPost({ request, env }: Contexto): Promise<Response> {
  if (!origemValida(request)) return resposta(403, { ok: false });
  if (Number(request.headers.get("content-length") ?? "0") > 1024) return resposta(413, { ok: false });
  let link: { c?: string; e?: string; t?: string };
  try {
    link = (await request.json()) as typeof link;
  } catch {
    return resposta(400, { ok: false });
  }
  const ok = await verificarLink(env.MATERIAL_SECRET ?? "", link ?? {}, agoraSegundos());
  return resposta(ok ? 200 : 403, { ok });
}

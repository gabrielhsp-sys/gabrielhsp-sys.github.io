// POST /api/material/enviar (multipart/form-data)
//   c, e, t        o link assinado (lib/material.ts)
//   respostas      JSON com as respostas de texto
//   <campo>        arquivos, só nos campos de CAMPOS_ARQUIVO
// Grava no R2 privado (binding MATERIAL_BUCKET) sob o prefixo do cliente, num
// "envio" novo a cada POST. Não há rota de leitura nem de listagem.
import { CLIENTE, LIMITES, tipoPermitido, verificarLink } from "../../../lib/material";
import { type Contexto, agoraSegundos, origemValida, resposta } from "../../../lib/material-function";

export const CAMPOS_ARQUIVO = ["logo", "fachada", "trabalhos", "equipe", "cardapio", "produtos"] as const;
const OBRIGATORIOS = ["negocio", "nome", "ramo", "whatsappSite"] as const;
const AUTORIZACOES = ["autorizaUso", "autorizaDireitos"] as const;
const FOLGA_MULTIPART = 1024 * 1024;

const aleatorio = () => [...crypto.getRandomValues(new Uint8Array(6))].map((b) => b.toString(16).padStart(2, "0")).join("");

export async function onRequestPost({ request, env }: Contexto): Promise<Response> {
  if (!env.MATERIAL_SECRET || !env.MATERIAL_BUCKET) return resposta(503, { ok: false, erro: "Envio indisponível agora." });
  if (!origemValida(request)) return resposta(403, { ok: false, erro: "Origem não permitida." });

  // Tamanho antes de ler o corpo: sem Content-Length não há como limitar.
  const tamanho = request.headers.get("content-length");
  if (!tamanho) return resposta(411, { ok: false, erro: "Tamanho do envio ausente." });
  if (Number(tamanho) > LIMITES.envioBytes + FOLGA_MULTIPART) {
    return resposta(413, { ok: false, erro: "Envio grande demais: até 40 MB por vez. Mande o resto num segundo envio." });
  }
  if (!(request.headers.get("content-type") ?? "").startsWith("multipart/form-data")) {
    return resposta(415, { ok: false, erro: "Formato de envio inválido." });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return resposta(400, { ok: false, erro: "Envio ilegível." });
  }

  const link = { c: form.get("c") as string | null, e: form.get("e") as string | null, t: form.get("t") as string | null };
  if (!(await verificarLink(env.MATERIAL_SECRET, link, agoraSegundos()))) {
    return resposta(403, { ok: false, erro: "Link inválido ou vencido." });
  }
  const cliente = link.c as string;
  if (!CLIENTE.test(cliente)) return resposta(403, { ok: false, erro: "Link inválido ou vencido." });

  // Respostas de texto: objeto plano, só texto e booleano, com limites.
  const bruto = form.get("respostas");
  if (typeof bruto !== "string" || bruto.length > LIMITES.respostasBytes) return resposta(400, { ok: false, erro: "Respostas ausentes ou grandes demais." });
  let respostas: Record<string, unknown>;
  try {
    respostas = JSON.parse(bruto);
  } catch {
    return resposta(400, { ok: false, erro: "Respostas ilegíveis." });
  }
  if (!respostas || typeof respostas !== "object" || Array.isArray(respostas) || Object.keys(respostas).length > 60
    || Object.entries(respostas).some(([k, v]) => !/^[A-Za-z][A-Za-z0-9]{0,39}$/.test(k) || !(typeof v === "boolean" || (typeof v === "string" && v.length <= 5000)))) {
    return resposta(400, { ok: false, erro: "Respostas em formato inválido." });
  }
  const faltando = OBRIGATORIOS.filter((k) => typeof respostas[k] !== "string" || !(respostas[k] as string).trim());
  if (faltando.length || AUTORIZACOES.some((k) => respostas[k] !== true)) {
    return resposta(422, { ok: false, erro: "Faltam respostas obrigatórias ou as autorizações.", campos: [...faltando] });
  }

  // Arquivos: só dos campos conhecidos; tipo pelos bytes + nome + tipo declarado.
  const arquivos: { campo: string; arquivo: File }[] = [];
  for (const [campo, valor] of form.entries()) {
    if (typeof valor === "string") continue;
    if (!(CAMPOS_ARQUIVO as readonly string[]).includes(campo)) return resposta(400, { ok: false, erro: "Campo de arquivo desconhecido." });
    if (valor.size === 0) continue;
    arquivos.push({ campo, arquivo: valor });
  }
  if (arquivos.length > LIMITES.arquivosPorEnvio) return resposta(413, { ok: false, erro: "Arquivos demais: até 20 por envio." });
  const total = arquivos.reduce((soma, { arquivo }) => soma + arquivo.size, 0);
  if (total > LIMITES.envioBytes) return resposta(413, { ok: false, erro: "Envio grande demais: até 40 MB por vez." });

  const prontos: { chave: string; dados: ArrayBuffer; mime: string }[] = [];
  const envio = `${cliente}/${new Date().toISOString().replace(/[:.]/g, "-")}-${aleatorio()}`;
  const contagem: Record<string, number> = {};
  for (const { campo, arquivo } of arquivos) {
    if (arquivo.size > LIMITES.arquivoBytes) return resposta(413, { ok: false, erro: `Arquivo grande demais: até 10 MB cada (${campo}).` });
    const dados = await arquivo.arrayBuffer();
    const tipo = tipoPermitido(new Uint8Array(dados.slice(0, 16)), arquivo.name, arquivo.type);
    if (!tipo) return resposta(415, { ok: false, erro: `Tipo não aceito em ${campo}: só PNG, JPG, WEBP ou PDF.` });
    contagem[campo] = (contagem[campo] ?? 0) + 1;
    // O nome original não entra na chave (só nos metadados, aparado): nada de caminho vindo do cliente.
    prontos.push({ chave: `${envio}/${campo}-${contagem[campo]}.${tipo.ext}`, dados, mime: tipo.mime });
  }

  // Tudo validado: só agora grava. Respostas por último, como "envio completo".
  for (const p of prontos) {
    await env.MATERIAL_BUCKET.put(p.chave, p.dados, { httpMetadata: { contentType: p.mime } });
  }
  await env.MATERIAL_BUCKET.put(`${envio}/respostas.json`, JSON.stringify({ cliente, recebidoEm: new Date().toISOString(), respostas, arquivos: prontos.map((p) => p.chave) }, null, 2), {
    httpMetadata: { contentType: "application/json; charset=utf-8" },
  });
  return resposta(201, { ok: true, arquivos: prontos.length });
}

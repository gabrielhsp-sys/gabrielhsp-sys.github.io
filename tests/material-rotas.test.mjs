import assert from "node:assert/strict";
import test from "node:test";
import { criarEnviar } from "../functions/api/material/enviar.ts";
import { criarVerificar } from "../functions/api/material/verificar.ts";
import { assinarLink } from "../lib/material.ts";

// Rotas da Pages Function do /material/, chamadas como o runtime da Cloudflare chama
// (onRequestPost({ request, env })). Fronteiras simuladas: o relógio, a espera e o R2
// (um Map em memória). Códigos esperados: o mesmo vetor independente de
// tests/material-codigo.test.mjs. Segredo de teste, nunca o real.
const SEGREDO = "segredo-de-teste-com-32-caracteres!!";
const AGORA = 1_800_000_000;
const ORIGEM = "https://gabrielsys.com.br";

function bucketFalso(inicial = {}) {
  const objetos = new Map(Object.entries(inicial));
  return {
    objetos,
    async put(chave, valor) { objetos.set(chave, typeof valor === "string" ? valor : new Uint8Array(valor)); },
    async get(chave) {
      if (!objetos.has(chave)) return null;
      const v = objetos.get(chave);
      return { text: async () => (typeof v === "string" ? v : new TextDecoder().decode(v)) };
    },
    async list({ prefix }) {
      const objects = [...objetos].filter(([k]) => k.startsWith(prefix)).map(([key, v]) => ({ key, size: v.length }));
      return { objects, truncated: false };
    },
  };
}

function contexto({ bucket = bucketFalso(), esperas = [] } = {}) {
  const deps = { agora: () => AGORA, esperar: async (ms) => { esperas.push(ms); } };
  const env = { MATERIAL_SECRET: SEGREDO, MATERIAL_BUCKET: bucket };
  return { deps, env, bucket, esperas };
}

const json = (rota, corpo, headers = {}) => {
  const texto = JSON.stringify(corpo);
  return new Request(`${ORIGEM}/api/material/${rota}`, {
    method: "POST",
    headers: { "content-type": "application/json", "content-length": String(new TextEncoder().encode(texto).length), ...headers },
    body: texto,
  });
};

test("verificar: the right code opens the form for its client; a wrong one gets 403", async () => {
  const { deps, env } = contexto();
  const verificar = criarVerificar(deps);
  const ok = await verificar({ request: json("verificar", { codigo: "ana-u45r-cj4x" }), env });
  assert.equal(ok.status, 200);
  assert.deepEqual(await ok.json(), { ok: true, cliente: "ana" });
  const errado = await verificar({ request: json("verificar", { codigo: "ana-u45r-cj4y" }), env });
  assert.equal(errado.status, 403);
  assert.deepEqual(await errado.json(), { ok: false });
});

test("verificar: every refusal waits the same fixed time and looks the same, whether the nickname exists or not", async () => {
  const esperas = [];
  const { deps, env } = contexto({ esperas });
  const verificar = criarVerificar(deps);
  const respostas = [];
  for (const codigo of ["ana-u45r-cj4y", "nunca-existiu-u45r-cj4x", "zz", "ana-u45r-cj4x-extra"]) {
    const r = await verificar({ request: json("verificar", { codigo }), env });
    respostas.push([r.status, await r.text(), r.headers.get("cache-control")]);
  }
  assert.equal(new Set(respostas.map((r) => JSON.stringify(r))).size, 1, JSON.stringify(respostas));
  assert.deepEqual(respostas[0], [403, '{"ok":false}', "no-store"]);
  assert.equal(esperas.length, 4, "uma espera por recusa");
  assert.equal(new Set(esperas).size, 1, "sempre o mesmo atraso");
  assert.ok(esperas[0] >= 300 && esperas[0] <= 2000, `atraso curto: ${esperas[0]} ms`);
  esperas.length = 0;
  await verificar({ request: json("verificar", { codigo: "ana-u45r-cj4x" }), env });
  assert.equal(esperas.length, 0, "o código certo não espera");
});

test("verificar: a nickname in the private revocation list is refused before its date, code and long link alike", async () => {
  const esperas = [];
  const bucket = bucketFalso({ "_controle/revogados.txt": "# revogados à mão\nana\n\n  Cafe-Do-Coreto  \n" });
  const { deps, env } = contexto({ bucket, esperas });
  const verificar = criarVerificar(deps);
  const status = async (corpo) => (await verificar({ request: json("verificar", corpo), env })).status;
  assert.equal(await status({ codigo: "ana-u45r-cj4x" }), 403, "código revogado");
  assert.equal(await status({ codigo: "cafe-do-coreto-znz4-6a7x" }), 403, "revogado com hífens na lista");
  assert.equal(await status({ codigo: "bia-rzbm-xyep" }), 200, "quem não está na lista continua");
  const link = await assinarLink(SEGREDO, "cafe-do-coreto", AGORA + 3600);
  assert.equal(await status({ c: link.c, e: String(link.e), t: link.t }), 403, "o link longo do mesmo cliente também cai");
  assert.equal(esperas.length, 3, "revogado espera como qualquer recusa");
  bucket.objetos.delete("_controle/revogados.txt");
  assert.equal(await status({ codigo: "ana-u45r-cj4x" }), 200, "sem a lista, nada é revogado");
});

test("verificar: the code only counts in the request body, the query string is ignored and nothing is logged", async (t) => {
  const chamadas = [];
  for (const m of ["log", "info", "warn", "error", "debug", "trace"]) t.mock.method(console, m, (...a) => chamadas.push([m, ...a]));
  const { deps, env } = contexto();
  const verificar = criarVerificar(deps);
  const naUrl = new Request(`${ORIGEM}/api/material/verificar?codigo=ana-u45r-cj4x`, { method: "POST", headers: { "content-type": "application/json", "content-length": "2" }, body: "{}" });
  const r1 = await verificar({ request: naUrl, env });
  assert.equal(r1.status, 403, "código na URL não vale");
  const r2 = await verificar({ request: json("verificar", { codigo: "ana-u45r-cj4x" }), env });
  assert.equal(r2.status, 200);
  for (const r of [r1, r2]) assert.equal(r.headers.get("cache-control"), "no-store");
  await verificar({ request: json("verificar", { codigo: "ana-u45r-cj4y" }), env });
  assert.deepEqual(chamadas, [], "nada vai para o log");
});

test("verificar: the long signed link still works, and without the secret or the bucket nothing opens", async () => {
  const { deps, env } = contexto();
  const verificar = criarVerificar(deps);
  const link = await assinarLink(SEGREDO, "cafe-do-coreto", AGORA + 3600);
  const r = await verificar({ request: json("verificar", { c: link.c, e: String(link.e), t: link.t }), env });
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true, cliente: "cafe-do-coreto" });
  const vencido = await assinarLink(SEGREDO, "cafe-do-coreto", AGORA - 1);
  assert.equal((await verificar({ request: json("verificar", { c: vencido.c, e: String(vencido.e), t: vencido.t }), env })).status, 403);
  for (const faltando of [{ ...env, MATERIAL_SECRET: undefined }, { ...env, MATERIAL_BUCKET: undefined }]) {
    assert.equal((await verificar({ request: json("verificar", { codigo: "ana-u45r-cj4x" }), env: faltando })).status, 503);
  }
});

const PNG = () => { const b = new Uint8Array(2048); b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]); return b; };
const RESPOSTAS = { negocio: "Teste Ltda", nome: "Fulano", ramo: "loja", whatsappSite: "35 90000-0000", autorizaUso: true, autorizaDireitos: true };

async function multipart(campos, arquivos = []) {
  const form = new FormData();
  for (const [k, v] of Object.entries(campos)) form.set(k, v);
  form.set("respostas", JSON.stringify(RESPOSTAS));
  for (const [campo, nome, tipo, dados] of arquivos) form.append(campo, new Blob([dados], { type: tipo }), nome);
  const rascunho = new Request(`${ORIGEM}/api/material/enviar`, { method: "POST", body: form });
  const corpo = await rascunho.arrayBuffer();
  return new Request(`${ORIGEM}/api/material/enviar`, {
    method: "POST",
    headers: { "content-type": rascunho.headers.get("content-type"), "content-length": String(corpo.byteLength) },
    body: corpo,
  });
}

test("enviar: with the right code the PNG and the answers land under the client's prefix", async () => {
  const { deps, env, bucket } = contexto();
  const enviar = criarEnviar(deps);
  const r = await enviar({ request: await multipart({ codigo: "ana-u45r-cj4x" }, [["logo", "logo.png", "image/png", PNG()]]), env });
  assert.equal(r.status, 201, await r.clone().text());
  const chaves = [...bucket.objetos.keys()];
  assert.equal(chaves.length, 2, chaves.join(", "));
  assert.ok(chaves.some((k) => /^ana\/[^/]+\/logo-1\.png$/.test(k)), chaves.join(", "));
  assert.ok(chaves.some((k) => /^ana\/[^/]+\/respostas\.json$/.test(k)), chaves.join(", "));
  assert.equal(r.headers.get("cache-control"), "no-store");
  const { envio } = await r.json();
  assert.match(envio ?? "", /^ana\/[^/]+$/, "o 201 devolve o envio como recibo");
  assert.ok(chaves.every((k) => k.startsWith(`${envio}/`)), "todas as chaves do envio ficam sob o recibo");
});

test("enviar: a wrong, foreign, revoked or expired code gets 403 after the fixed wait and writes nothing", async () => {
  const esperas = [];
  const bucket = bucketFalso({ "_controle/revogados.txt": "bia\n" });
  const { deps, env } = contexto({ bucket, esperas });
  const enviar = criarEnviar(deps);
  const depois = { ...deps, agora: () => Date.UTC(2027, 1, 15, 3, 0, 0) / 1000 }; // 15/02 em São Paulo
  const casos = [
    [enviar, { codigo: "ana-u45r-cj4y" }],
    [enviar, { codigo: "bia-u45r-cj4x" }],
    [enviar, { codigo: "bia-rzbm-xyep" }],
    [criarEnviar(depois), { codigo: "ana-u45r-cj4x" }],
    [enviar, {}],
  ];
  for (const [rota, campos] of casos) {
    const r = await rota({ request: await multipart(campos, [["logo", "logo.png", "image/png", PNG()]]), env });
    assert.equal(r.status, 403, JSON.stringify(campos));
    assert.deepEqual(await r.json(), { ok: false, erro: "Código inválido ou vencido." });
  }
  assert.deepEqual([...bucket.objetos.keys()], ["_controle/revogados.txt"], "nada foi gravado");
  assert.equal(esperas.length, casos.length);
});

test("enviar: the long signed link still uploads, and size and type limits still hold with a code", async () => {
  const { deps, env, bucket } = contexto();
  const enviar = criarEnviar(deps);
  const link = await assinarLink(SEGREDO, "cafe-do-coreto", AGORA + 3600);
  const r = await enviar({ request: await multipart({ c: link.c, e: String(link.e), t: link.t }, [["logo", "logo.png", "image/png", PNG()]]), env });
  assert.equal(r.status, 201);
  assert.ok([...bucket.objetos.keys()].some((k) => k.startsWith("cafe-do-coreto/")));
  const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
  const s = await enviar({ request: await multipart({ codigo: "ana-u45r-cj4x" }, [["logo", "logo.png", "image/png", svg]]), env });
  assert.equal(s.status, 415);
  const grande = new Uint8Array(11 * 1024 * 1024); grande.set(PNG().slice(0, 8));
  const g = await enviar({ request: await multipart({ codigo: "ana-u45r-cj4x" }, [["logo", "grande.png", "image/png", grande]]), env });
  assert.equal(g.status, 413);
  assert.ok(![...bucket.objetos.keys()].some((k) => k.startsWith("ana/")), "os recusados não gravaram nada");
});

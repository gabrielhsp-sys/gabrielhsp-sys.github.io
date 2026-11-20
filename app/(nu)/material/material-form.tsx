"use client";

import { CheckCircleIcon as CheckCircle, WhatsappLogoIcon as WhatsappLogo } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState } from "react";
import { whatsappContato } from "@/lib/contato-links";

/* Envio do material do site (fotos, logo, textos e autorizacoes), para quem ja
   fechou. Perguntas do formulario Tally "Material do seu site" (tally.so/r/Eqd2ML,
   lido em 2026-11-19). A entrada e o codigo de acesso que o Gabriel manda no
   WhatsApp (lib/material-codigo.ts) ou o link longo antigo (#c=&e=&t=); a Function
   /api/material/* confere a credencial, o tipo e o tamanho de cada arquivo.
   O codigo fica so em memoria e no sessionStorage desta aba (try/catch); vai no
   corpo das requisicoes, nunca na URL. */

const RAMOS = [
  ["alimentacao", "Alimentação"], ["beleza", "Beleza e estética"], ["cabeleireiro", "Barbearia ou cabeleireiro"],
  ["saude", "Saúde"], ["fitness", "Fitness"], ["loja", "Loja"], ["servicos", "Outros serviços"],
] as const;

type Texto = { id: string; rotulo: string; longo?: boolean; ajuda?: string; obrigatorio?: boolean; tipo?: "tel" | "text" };
type Arquivo = { id: string; rotulo: string; ajuda?: string; varios?: boolean };

const PORRAMO: Record<string, { textos: Texto[]; arquivos?: Arquivo[] }> = {
  alimentacao: {
    textos: [{ id: "cardapioTexto", rotulo: "Cardápio com preços", longo: true }, { id: "entrega", rotulo: "Faz entrega? Qual a taxa?" }],
    arquivos: [{ id: "cardapio", rotulo: "Foto do cardápio", ajuda: "Se preferir, mande a foto do cardápio em vez de digitar.", varios: true }],
  },
  beleza: { textos: [{ id: "servicosDuracao", rotulo: "Serviços com duração e preço", longo: true }, { id: "profissionais", rotulo: "Profissionais", longo: true }, { id: "appAgenda", rotulo: "Já usa algum app de agenda? Qual?" }] },
  cabeleireiro: { textos: [{ id: "servicosDuracao", rotulo: "Serviços com duração e preço", longo: true }, { id: "profissionais", rotulo: "Profissionais", longo: true }, { id: "appAgenda", rotulo: "Já usa algum app de agenda? Qual?" }] },
  saude: { textos: [{ id: "especialidades", rotulo: "Especialidades", longo: true }, { id: "profissionaisRegistro", rotulo: "Profissionais e registro", longo: true }, { id: "convenios", rotulo: "Convênios aceitos", longo: true }] },
  fitness: { textos: [{ id: "planos", rotulo: "Planos e preços", longo: true }, { id: "grade", rotulo: "Grade de aulas", longo: true }] },
  loja: {
    textos: [{ id: "observacoesProdutos", rotulo: "Observações sobre os produtos", longo: true }],
    arquivos: [{ id: "produtos", rotulo: "Produtos", ajuda: "Fotos ou PDF, com nome e preço de cada produto.", varios: true }],
  },
  servicos: { textos: [{ id: "servicosOferecidos", rotulo: "Serviços oferecidos", longo: true }, { id: "areaAtendida", rotulo: "Cidades e bairros atendidos" }] },
};

const ACEITOS = ".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf";
const MB = 1024 * 1024;
const extOk = (nome: string) => /\.(png|jpe?g|webp|pdf)$/i.test(nome);

type Estado = "entrada" | "conferindo" | "pronto" | "enviando" | "enviado";
type Credencial = { codigo: string } | { c: string; e: string; t: string };
type Aviso = null | "codigo" | "vazio" | "link" | "rede";

const ERRO_CODIGO = "Código inválido ou vencido. Confira ou chame no WhatsApp.";
const TEXTO_AVISO: Record<Exclude<Aviso, null | "link">, string> = {
  codigo: ERRO_CODIGO,
  vazio: "Digite o código de acesso.",
  rede: "Não consegui conferir agora. Confira a internet e tente de novo.",
};

const CHAVE_SESSAO = "gsys:material-codigo";
const lerSessao = () => {
  try { return sessionStorage.getItem(CHAVE_SESSAO); } catch { return null; }
};
const gravarSessao = (codigo: string | null) => {
  try {
    if (codigo) sessionStorage.setItem(CHAVE_SESSAO, codigo);
    else sessionStorage.removeItem(CHAVE_SESSAO);
  } catch { /* storage bloqueado: o codigo fica so em memoria */ }
};

export function MaterialForm() {
  const [estado, setEstado] = useState<Estado>("entrada");
  const [porCodigo, setPorCodigo] = useState(true);
  const [aviso, setAviso] = useState<Aviso>(null);
  const [digitado, setDigitado] = useState("");
  const [credencial, setCredencial] = useState<Credencial | null>(null);
  const [cliente, setCliente] = useState("");
  const [textos, setTextos] = useState<Record<string, string>>({});
  const [ramo, setRamo] = useState("");
  const [autoriza, setAutoriza] = useState({ autorizaUso: false, autorizaDireitos: false });
  const [arquivos, setArquivos] = useState<Record<string, File[]>>({});
  const [erros, setErros] = useState<string[]>([]);
  const [progresso, setProgresso] = useState(0);
  const resumoRef = useRef<HTMLDivElement>(null);
  const fimRef = useRef<HTMLHeadingElement>(null);
  const codigoRef = useRef<HTMLInputElement>(null);

  const recusar = (proximo: Aviso) => {
    gravarSessao(null);
    setCredencial(null);
    setAviso(proximo);
    setEstado("entrada");
  };

  const conferir = async (cred: Credencial, origem: "codigo" | "link" | "sessao") => {
    setPorCodigo(origem === "codigo");
    setAviso(null);
    setEstado("conferindo");
    try {
      const r = await fetch("/api/material/verificar", { method: "POST", cache: "no-store", headers: { "content-type": "application/json" }, body: JSON.stringify(cred) });
      const dados = r.ok ? ((await r.json()) as { ok?: boolean; cliente?: string }) : null;
      if (dados?.ok) {
        if ("codigo" in cred) gravarSessao(cred.codigo);
        setCredencial(cred);
        setCliente(typeof dados.cliente === "string" ? dados.cliente : "");
        setEstado("pronto");
        return;
      }
      recusar(origem === "link" ? "link" : origem === "sessao" ? null : "codigo");
    } catch {
      setAviso(origem === "link" ? "link" : "rede");
      setEstado("entrada");
    }
  };

  useEffect(() => {
    const p = new URLSearchParams(window.location.hash.slice(1));
    const link = { c: p.get("c") ?? "", e: p.get("e") ?? "", t: p.get("t") ?? "" };
    const salvo = lerSessao();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura unica do endereco e da aba
    if (link.c || link.e || link.t) void conferir(link, "link");
    else if (salvo) void conferir({ codigo: salvo }, "sessao");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- uma vez, na montagem
  }, []);

  const entrar = (event: React.FormEvent) => {
    event.preventDefault();
    if (estado === "conferindo") return;
    if (!digitado.trim()) {
      setAviso("vazio");
      codigoRef.current?.focus();
      return;
    }
    void conferir({ codigo: digitado }, "codigo");
  };

  // Saindo com respostas ou arquivos ainda nao enviados: o navegador pergunta antes.
  const sujo = estado === "pronto" && (Object.values(textos).some((v) => v.trim()) || Object.values(arquivos).some((l) => l.length > 0));
  useEffect(() => {
    if (!sujo) return;
    const avisar = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [sujo]);

  const texto = (id: string) => textos[id] ?? "";
  const setTexto = (id: string, v: string) => setTextos((t) => ({ ...t, [id]: v }));

  const validar = () => {
    const lista: string[] = [];
    if (!texto("negocio").trim()) lista.push("Nome do negócio: escreva uma resposta.");
    if (!texto("nome").trim()) lista.push("Seu nome: escreva uma resposta.");
    if (!ramo) lista.push("Tipo de negócio: escolha uma opção.");
    if (texto("whatsappSite").replace(/\D/g, "").length < 10) lista.push("WhatsApp que vai aparecer no site: escreva o número com DDD.");
    if (!autoriza.autorizaUso || !autoriza.autorizaDireitos) lista.push("Autorizações: marque as duas para eu poder usar o material.");
    const todos = Object.values(arquivos).flat();
    for (const f of todos) {
      if (!extOk(f.name)) lista.push(`${f.name}: só PNG, JPG, WEBP ou PDF.`);
      if (f.size > 10 * MB) lista.push(`${f.name}: até 10 MB por arquivo.`);
    }
    if (todos.length > 20) lista.push("Até 20 arquivos por envio. Mande o resto num segundo envio.");
    if (todos.reduce((s, f) => s + f.size, 0) > 40 * MB) lista.push("Até 40 MB por envio. Mande o resto num segundo envio.");
    return lista;
  };

  const enviar = (event: React.FormEvent) => {
    event.preventDefault();
    const lista = validar();
    setErros(lista);
    if (lista.length || !credencial) {
      window.setTimeout(() => resumoRef.current?.focus(), 0);
      return;
    }
    const camposRamo = PORRAMO[ramo]?.textos.map((t) => t.id) ?? [];
    const base = ["negocio", "nome", "endereco", "horario", "whatsappSite", "instagram", "cores", "referencias", "historia", "diferencial", "depoimentos"];
    const respostas: Record<string, string | boolean> = { ramo, ...autoriza };
    for (const id of [...base, ...camposRamo]) if (texto(id).trim()) respostas[id] = texto(id).trim();

    const form = new FormData();
    if ("codigo" in credencial) form.set("codigo", credencial.codigo);
    else {
      form.set("c", credencial.c);
      form.set("e", credencial.e);
      form.set("t", credencial.t);
    }
    form.set("respostas", JSON.stringify(respostas));
    const permitidos = ["logo", "fachada", "trabalhos", "equipe", ...(PORRAMO[ramo]?.arquivos?.map((a) => a.id) ?? [])];
    for (const [campo, lista2] of Object.entries(arquivos)) if (permitidos.includes(campo)) for (const f of lista2) form.append(campo, f);

    // XHR, nao fetch: o progresso do envio de fotos grandes aparece na tela.
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/material/enviar");
    xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) setProgresso(Math.round((ev.loaded / ev.total) * 100)); };
    xhr.onload = () => {
      if (xhr.status === 201) {
        setEstado("enviado");
        setArquivos({});
        window.setTimeout(() => fimRef.current?.focus(), 0);
        return;
      }
      if (xhr.status === 403) {
        recusar(porCodigoAtual(credencial) ? "codigo" : "link");
        return;
      }
      let msg = "Não consegui receber. Tente de novo ou me mande pelo WhatsApp.";
      try { msg = (JSON.parse(xhr.responseText) as { erro?: string }).erro ?? msg; } catch { /* resposta sem JSON */ }
      setErros([msg]);
      setEstado("pronto");
      window.setTimeout(() => resumoRef.current?.focus(), 0);
    };
    xhr.onerror = () => {
      setErros(["A conexão caiu durante o envio. Tente de novo."]);
      setEstado("pronto");
      window.setTimeout(() => resumoRef.current?.focus(), 0);
    };
    setProgresso(0);
    setEstado("enviando");
    xhr.send(form);
  };

  if (estado === "conferindo" && !porCodigo) return <p className="o-hint" role="status">Conferindo o seu acesso…</p>;

  if (estado === "entrada" || estado === "conferindo") {
    const textoErro = aviso && aviso !== "link" ? TEXTO_AVISO[aviso] : "";
    return (
      <>
        {aviso === "link" && (
          <div className="o-error-summary" role="alert">
            <h2>Este link não vale mais</h2>
            <p>Ele pode ter vencido ou estar incompleto. Digite o código que eu te mandei ou me chame no WhatsApp.</p>
            <a className="c-button o-send" href={whatsappContato} target="_blank" rel="noopener"><WhatsappLogo size={20} aria-hidden="true" /> Chamar no WhatsApp</a>
          </div>
        )}
        {/* method="post": sem JavaScript, o codigo nunca vai para a URL. */}
        <form className="m-acesso" method="post" onSubmit={entrar} noValidate aria-busy={estado === "conferindo"}>
          <div className="o-field">
            <label htmlFor="m-codigo">Código de acesso</label>
            <p className="o-hint" id="m-codigo-ajuda">Está na mensagem que eu te mandei no WhatsApp. Parece com: ana-k7m2-qxp4</p>
            <input
              ref={codigoRef}
              id="m-codigo"
              name="codigo"
              className="m-codigo"
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={80}
              value={digitado}
              onChange={(e) => setDigitado(e.target.value)}
              aria-invalid={textoErro ? true : undefined}
              aria-describedby="m-codigo-ajuda m-codigo-erro"
            />
            <p className="o-error" id="m-codigo-erro" role="alert">{textoErro}</p>
          </div>
          <button className="c-button" type="submit">{estado === "conferindo" ? "Conferindo…" : "Entrar"}</button>
        </form>
        <div className="m-sem-codigo">
          <p>Ainda não tem código?</p>
          <a className="c-button o-send" href={whatsappContato} target="_blank" rel="noopener"><WhatsappLogo size={20} aria-hidden="true" /> Chame no WhatsApp</a>
        </div>
      </>
    );
  }

  if (estado === "enviado") {
    return (
      <section className="m-done" aria-labelledby="m-fim">
        <CheckCircle size={40} weight="fill" aria-hidden="true" />
        <h2 id="m-fim" ref={fimRef} tabIndex={-1}>Recebi tudo!</h2>
        <p>Obrigado. Vou começar o seu site e te chamo no WhatsApp se faltar alguma coisa.</p>
        <button type="button" className="c-button c-button-ghost" onClick={() => setEstado("pronto")}>Mandar mais arquivos</button>
      </section>
    );
  }

  const extras = PORRAMO[ramo];
  return (
    <form className="m-form" onSubmit={enviar} noValidate aria-busy={estado === "enviando"}>
      <p className="m-cliente">Envio de <strong>{cliente || "você"}</strong>. Leva uns 10 minutos. Não tem alguma coisa agora? Pule e me mande depois pelo WhatsApp.</p>
      <p className="o-hint">Aceito PNG, JPG, WEBP e PDF, até 10&nbsp;MB por arquivo e 40&nbsp;MB por envio. Só eu vejo o que você mandar.</p>
      {erros.length > 0 && (
        <div className="o-error-summary" ref={resumoRef} tabIndex={-1} role="alert" aria-labelledby="m-erro">
          <h2 id="m-erro">Falta acertar</h2>
          <ul>{erros.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}

      <fieldset className="m-section">
        <legend>Sobre o negócio</legend>
        <CampoTexto id="negocio" rotulo="Nome do negócio" obrigatorio valor={texto("negocio")} onChange={setTexto} />
        <CampoTexto id="nome" rotulo="Seu nome" obrigatorio valor={texto("nome")} onChange={setTexto} />
        <fieldset className="o-field">
          <legend>Tipo de negócio</legend>
          <div className="o-options">
            {RAMOS.map(([valor, rotulo]) => (
              <label key={valor} className="o-option">
                <input type="radio" name="ramo" value={valor} checked={ramo === valor} onChange={() => setRamo(valor)} />
                <span><strong>{rotulo}</strong></span>
              </label>
            ))}
          </div>
        </fieldset>
        <CampoTexto id="endereco" rotulo="Endereço" valor={texto("endereco")} onChange={setTexto} />
        <CampoTexto id="horario" rotulo="Horário de funcionamento" longo valor={texto("horario")} onChange={setTexto} />
        <CampoTexto id="whatsappSite" rotulo="WhatsApp que vai aparecer no site" obrigatorio tipo="tel" ajuda="Com DDD, do jeito que o cliente vai chamar." valor={texto("whatsappSite")} onChange={setTexto} />
        <CampoTexto id="instagram" rotulo="Instagram" valor={texto("instagram")} onChange={setTexto} />
      </fieldset>

      <fieldset className="m-section">
        <legend>Marca</legend>
        <CampoArquivo campo={{ id: "logo", rotulo: "Logo", ajuda: "Se tiver. Pode ser foto ou arquivo (PNG, JPG, WEBP ou PDF)." }} arquivos={arquivos} setArquivos={setArquivos} />
        <CampoTexto id="cores" rotulo="Cores que você usa ou gosta" valor={texto("cores")} onChange={setTexto} />
        <CampoTexto id="referencias" rotulo="Sites ou perfis que você acha bonitos" longo valor={texto("referencias")} onChange={setTexto} />
      </fieldset>

      <fieldset className="m-section">
        <legend>Fotos</legend>
        <p className="o-hint">Foto de celular serve. Até 10&nbsp;MB cada. Pode mandar várias de uma vez.</p>
        <CampoArquivo campo={{ id: "fachada", rotulo: "Fachada e ambiente", varios: true }} arquivos={arquivos} setArquivos={setArquivos} />
        <CampoArquivo campo={{ id: "trabalhos", rotulo: "Produtos, pratos ou trabalhos", varios: true }} arquivos={arquivos} setArquivos={setArquivos} />
        <CampoArquivo campo={{ id: "equipe", rotulo: "Equipe", varios: true }} arquivos={arquivos} setArquivos={setArquivos} />
      </fieldset>

      {extras && (
        <fieldset className="m-section">
          <legend>Do seu ramo</legend>
          {extras.textos.map((t) => <CampoTexto key={t.id} {...t} valor={texto(t.id)} onChange={setTexto} />)}
          {extras.arquivos?.map((a) => <CampoArquivo key={a.id} campo={a} arquivos={arquivos} setArquivos={setArquivos} />)}
        </fieldset>
      )}

      <fieldset className="m-section">
        <legend>A história</legend>
        <CampoTexto id="historia" rotulo="Conte a história do negócio em poucas linhas" longo valor={texto("historia")} onChange={setTexto} />
        <CampoTexto id="diferencial" rotulo="O que diferencia vocês?" longo valor={texto("diferencial")} onChange={setTexto} />
        <CampoTexto id="depoimentos" rotulo="Depoimentos de clientes" longo ajuda="Só com autorização deles. Pode colar mensagens ou avaliações do Google." valor={texto("depoimentos")} onChange={setTexto} />
      </fieldset>

      <fieldset className="m-section">
        <legend>Autorizações</legend>
        <label className="o-option">
          <input type="checkbox" checked={autoriza.autorizaUso} onChange={(e) => setAutoriza((a) => ({ ...a, autorizaUso: e.target.checked }))} />
          <span><strong>Autorizo o uso das fotos e textos enviados no meu site</strong></span>
        </label>
        <label className="o-option">
          <input type="checkbox" checked={autoriza.autorizaDireitos} onChange={(e) => setAutoriza((a) => ({ ...a, autorizaDireitos: e.target.checked }))} />
          <span><strong>Confirmo que tenho direito de usar a logo e as fotos enviadas</strong></span>
        </label>
      </fieldset>

      {estado === "enviando" && (
        <p className="o-progress" role="status">
          Enviando… {progresso}%
          <span className="o-progress-bar" aria-hidden="true"><i style={{ width: `${progresso}%` }} /></span>
        </p>
      )}
      <button className="c-button" type="submit" disabled={estado === "enviando"}>Enviar o material</button>
    </form>
  );
}

const porCodigoAtual = (c: Credencial | null) => Boolean(c && "codigo" in c);

function CampoTexto({ id, rotulo, longo, ajuda, obrigatorio, tipo = "text", valor, onChange }: Texto & { valor: string; onChange: (id: string, v: string) => void }) {
  const ajudaId = useId();
  const props = {
    id: `m-${id}`,
    value: valor,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(id, e.target.value),
    "aria-describedby": ajuda ? ajudaId : undefined,
    "aria-required": obrigatorio || undefined,
    maxLength: longo ? 5000 : 300,
  };
  return (
    <div className="o-field">
      <label htmlFor={`m-${id}`}>{rotulo}{!obrigatorio && <span className="o-optional"> (opcional)</span>}</label>
      {ajuda && <p className="o-hint" id={ajudaId}>{ajuda}</p>}
      {longo ? <textarea rows={4} {...props} /> : <input type={tipo} inputMode={tipo === "tel" ? "tel" : undefined} autoComplete={tipo === "tel" ? "tel" : "off"} {...props} />}
    </div>
  );
}

function CampoArquivo({ campo, arquivos, setArquivos }: { campo: Arquivo; arquivos: Record<string, File[]>; setArquivos: React.Dispatch<React.SetStateAction<Record<string, File[]>>> }) {
  const ajudaId = useId();
  const lista = arquivos[campo.id] ?? [];
  return (
    <div className="o-field">
      <label htmlFor={`m-${campo.id}`}>{campo.rotulo}<span className="o-optional"> (opcional)</span></label>
      {campo.ajuda && <p className="o-hint" id={ajudaId}>{campo.ajuda}</p>}
      <input
        id={`m-${campo.id}`}
        className="m-file"
        type="file"
        accept={ACEITOS}
        multiple={campo.varios}
        aria-describedby={campo.ajuda ? ajudaId : undefined}
        onChange={(e) => setArquivos((a) => ({ ...a, [campo.id]: [...(e.target.files ?? [])] }))}
      />
      {lista.length > 0 && <p className="o-hint">{lista.length === 1 ? "1 arquivo escolhido" : `${lista.length} arquivos escolhidos`}</p>}
    </div>
  );
}

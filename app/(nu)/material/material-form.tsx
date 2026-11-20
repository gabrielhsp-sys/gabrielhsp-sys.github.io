"use client";

import { CheckCircleIcon as CheckCircle, WhatsappLogoIcon as WhatsappLogo } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState } from "react";
import { whatsappContato } from "@/lib/contato-links";

/* Envio do material do site (fotos, logo, textos e autorizacoes), para quem ja
   fechou. Perguntas do formulario Tally "Material do seu site" (tally.so/r/Eqd2ML,
   lido em 2026-11-19). O link traz o token no fragmento (#c=&e=&t=); a Function
   /api/material/* confere o token, o tipo e o tamanho de cada arquivo. */

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

type Estado = "verificando" | "invalido" | "pronto" | "enviando" | "enviado";

export function MaterialForm() {
  const [estado, setEstado] = useState<Estado>("verificando");
  const [link, setLink] = useState<{ c: string; e: string; t: string } | null>(null);
  const [textos, setTextos] = useState<Record<string, string>>({});
  const [ramo, setRamo] = useState("");
  const [autoriza, setAutoriza] = useState({ autorizaUso: false, autorizaDireitos: false });
  const [arquivos, setArquivos] = useState<Record<string, File[]>>({});
  const [erros, setErros] = useState<string[]>([]);
  const [progresso, setProgresso] = useState(0);
  const resumoRef = useRef<HTMLDivElement>(null);
  const fimRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.hash.slice(1));
    const dados = { c: p.get("c") ?? "", e: p.get("e") ?? "", t: p.get("t") ?? "" };
    if (!dados.c || !dados.e || !dados.t) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura unica do endereco
      setEstado("invalido");
      return;
    }
    fetch("/api/material/verificar", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(dados) })
      .then((r) => {
        setLink(dados);
        setEstado(r.ok ? "pronto" : "invalido");
      })
      .catch(() => setEstado("invalido"));
  }, []);

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
    if (lista.length || !link) {
      window.setTimeout(() => resumoRef.current?.focus(), 0);
      return;
    }
    const camposRamo = PORRAMO[ramo]?.textos.map((t) => t.id) ?? [];
    const base = ["negocio", "nome", "endereco", "horario", "whatsappSite", "instagram", "cores", "referencias", "historia", "diferencial", "depoimentos"];
    const respostas: Record<string, string | boolean> = { ramo, ...autoriza };
    for (const id of [...base, ...camposRamo]) if (texto(id).trim()) respostas[id] = texto(id).trim();

    const form = new FormData();
    form.set("c", link.c);
    form.set("e", link.e);
    form.set("t", link.t);
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
      let msg = "Não consegui receber. Tente de novo ou me mande pelo WhatsApp.";
      try { msg = (JSON.parse(xhr.responseText) as { erro?: string }).erro ?? msg; } catch { /* resposta sem JSON */ }
      setErros([msg]);
      setEstado(xhr.status === 403 ? "invalido" : "pronto");
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

  if (estado === "verificando") return <p className="o-hint" role="status">Conferindo o seu link…</p>;

  if (estado === "invalido") {
    return (
      <div className="o-error-summary" role="alert">
        <h2>Este link não vale mais</h2>
        <p>Ele pode ter vencido ou estar incompleto. Me chame no WhatsApp que eu mando um novo.</p>
        <a className="c-button o-send" href={whatsappContato} target="_blank" rel="noopener"><WhatsappLogo size={20} aria-hidden="true" /> Chamar no WhatsApp</a>
      </div>
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

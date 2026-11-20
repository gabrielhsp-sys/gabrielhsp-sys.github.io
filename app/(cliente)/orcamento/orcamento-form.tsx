"use client";

import { ArrowLeftIcon as ArrowLeft, ArrowRightIcon as ArrowRight, CheckIcon as Check, CopyIcon as Copy, WhatsappLogoIcon as WhatsappLogo } from "@phosphor-icons/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { WHATSAPP } from "@/lib/contato";
import { whatsappContato } from "@/lib/contato-links";
import { demoHref, demosSites } from "@/lib/exemplos";
import { type Campo, type EtapaId, type Respostas, etapaPorId, etapasVisiveis, lerParametros, montarMensagem, validarEtapa } from "@/lib/orcamento";
import { SITE_URL } from "@/lib/site";
import { linkWhatsApp } from "@/lib/whatsapp";

/* Formulario de orcamento: uma tela por vez, titulo da tela = a pergunta,
   "Voltar" em toda tela depois da primeira, erro ao lado do campo e resumido
   no topo com o foco nele (PLANO.md secao 4, GOV.UK question pages). A arvore,
   a validacao e a mensagem moram em lib/orcamento.ts, com teste. */

const RASCUNHO = "gsys:orcamento";
const host = new URL(SITE_URL).host;

const ler = (): Respostas => {
  try {
    const raw = window.localStorage.getItem(RASCUNHO);
    return raw ? (JSON.parse(raw) as Respostas) : {};
  } catch {
    return {};
  }
};
const gravar = (r: Respostas) => {
  try {
    window.localStorage.setItem(RASCUNHO, JSON.stringify(r));
  } catch {
    /* sem armazenamento: o formulario funciona igual, so nao lembra */
  }
};

export function OrcamentoForm() {
  const [respostas, setRespostas] = useState<Respostas>({});
  const [origem, setOrigem] = useState<string>();
  const [atual, setAtual] = useState<EtapaId>("precisa");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [copiado, setCopiado] = useState(false);
  const [pronto, setPronto] = useState(false);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const resumoRef = useRef<HTMLDivElement>(null);
  const primeiraTela = useRef(true);

  // Rascunho e parametros da URL so existem no navegador: carregam depois da
  // hidratacao, para o HTML estatico e o primeiro render baterem.
  useEffect(() => {
    const params = lerParametros(window.location.search);
    const salvo = ler();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura unica de armazenamento externo
    setRespostas(params.precisa && !salvo.precisa ? { ...salvo, precisa: params.precisa } : salvo);
    setOrigem(params.origem);
    setPronto(true);
  }, []);

  useEffect(() => { if (pronto) gravar(respostas); }, [pronto, respostas]);

  // Trocou de tela: o foco vai para o titulo da nova pergunta (o leitor de
  // tela anuncia a pergunta e o passo). Na carga da pagina, nao.
  useEffect(() => {
    if (primeiraTela.current) { primeiraTela.current = false; return; }
    tituloRef.current?.focus();
  }, [atual]);

  const visiveis = etapasVisiveis(respostas);
  const indice = Math.max(0, visiveis.indexOf(atual));
  const etapa = etapaPorId(atual);
  const mensagem = useMemo(() => montarMensagem(respostas, { site: host, origem }), [respostas, origem]);
  const link = linkWhatsApp(WHATSAPP, mensagem);

  const definir = (id: string, valor: string | string[]) => {
    setRespostas((r) => ({ ...r, [id]: valor }));
    if (erros[id]) setErros((e) => Object.fromEntries(Object.entries(e).filter(([campo]) => campo !== id)));
  };

  const continuar = (event: React.FormEvent) => {
    event.preventDefault();
    const novos = validarEtapa(atual, respostas);
    setErros(novos);
    if (Object.keys(novos).length) {
      window.setTimeout(() => resumoRef.current?.focus(), 0);
      return;
    }
    setAtual(visiveis[indice + 1] ?? "confira");
  };

  const voltar = () => { setErros({}); setAtual(visiveis[Math.max(0, indice - 1)]); };
  const mudar = (id: EtapaId) => { setErros({}); setAtual(id); };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(mensagem);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  };

  const demo = respostas.precisa === "site" ? demosSites.find((d) => d.id === respostas.ramo) : undefined;
  const listaErros = Object.entries(erros);

  return (
    <div className="o-form">
      <p className="o-progress" id="o-progresso">
        Passo {indice + 1} de {visiveis.length}
        <span className="o-progress-bar" aria-hidden="true"><i style={{ width: `${((indice + 1) / visiveis.length) * 100}%` }} /></span>
      </p>

      {indice > 0 && (
        <button type="button" className="o-back" onClick={voltar}>
          <ArrowLeft size={18} aria-hidden="true" /> Voltar
        </button>
      )}

      {listaErros.length > 0 && (
        <div className="o-error-summary" ref={resumoRef} tabIndex={-1} role="alert" aria-labelledby="o-erro-titulo">
          <h2 id="o-erro-titulo">Falta responder</h2>
          <ul>
            {listaErros.map(([id, texto]) => (
              <li key={id}><a href={`#campo-${id}`}>{etapa.campos.find((c) => c.id === id)?.rotulo}: {texto}</a></li>
            ))}
          </ul>
        </div>
      )}

      {atual !== "confira" ? (
        <form className="o-step" onSubmit={continuar} noValidate>
          <h2 className="o-title" ref={tituloRef} tabIndex={-1} aria-describedby="o-progresso">{etapa.titulo}</h2>
          {etapa.descricao && <p className="o-hint">{etapa.descricao}</p>}
          {etapa.campos.map((campo) => (
            <CampoForm
              key={campo.id}
              campo={campo}
              valor={respostas[campo.id]}
              erro={erros[campo.id]}
              // Na tela 1 a pergunta ja e o titulo: o grupo nao repete a legenda na tela.
              legendaOculta={etapa.campos.length === 1 && campo.rotulo === etapa.titulo}
              onChange={(v) => definir(campo.id, v)}
            />
          ))}
          {atual === "site" && demo && (
            <p className="o-hint">
              <a href={demoHref(demo.id)} target="_blank" rel="noopener">Veja o site de exemplo do seu ramo (abre em outra aba)</a>
            </p>
          )}
          {atual === "negocio" && (
            <p className="o-hint">Suas respostas ficam só neste aparelho até você enviar.</p>
          )}
          <button className="c-button o-next" type="submit">
            Continuar <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
      ) : (
        <section className="o-step" aria-labelledby="o-confira">
          <h2 className="o-title" id="o-confira" ref={tituloRef} tabIndex={-1} aria-describedby="o-progresso">Confira e envie</h2>
          <p className="o-hint">A mensagem chega assim no meu WhatsApp. Se quiser mudar algo, toque em “Mudar”.</p>
          <pre className="o-message" aria-label="Mensagem que vai ser enviada">{mensagem}</pre>
          <ul className="o-change">
            {visiveis.filter((id) => id !== "confira").map((id) => (
              <li key={id}>
                <span>{etapaPorId(id).titulo}</span>
                <button type="button" onClick={() => mudar(id)}>Mudar<span className="sr-only"> {etapaPorId(id).titulo}</span></button>
              </li>
            ))}
          </ul>
          <div className="c-ctas">
            <a className="c-button o-send" href={link} target="_blank" rel="noopener" data-envio="whatsapp">
              <WhatsappLogo size={20} aria-hidden="true" /> Enviar pelo WhatsApp
            </a>
            <button className="c-button c-button-ghost" type="button" onClick={copiar}>
              {copiado ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
              {copiado ? "Mensagem copiada" : "Copiar a mensagem"}
            </button>
          </div>
          <p className="sr-only" role="status">{copiado ? "Mensagem copiada" : ""}</p>
        </section>
      )}

      <p className="o-direct">
        <a href={whatsappContato} target="_blank" rel="noopener">
          <WhatsappLogo size={18} aria-hidden="true" /> Prefiro conversar direto no WhatsApp
        </a>
      </p>
    </div>
  );
}

function CampoForm({ campo, valor, erro, legendaOculta, onChange }: {
  campo: Campo;
  valor: string | string[] | undefined;
  erro?: string;
  legendaOculta?: boolean;
  onChange: (v: string | string[]) => void;
}) {
  const base = useId();
  const ajudaId = campo.ajuda ? `${base}-ajuda` : undefined;
  const erroId = erro ? `${base}-erro` : undefined;
  const descritoPor = [ajudaId, erroId].filter(Boolean).join(" ") || undefined;
  const rotulo = (
    <>
      {campo.rotulo}
      {!campo.obrigatorio && <span className="o-optional"> (opcional)</span>}
    </>
  );

  if (campo.opcoes) {
    const multiplo = campo.tipo === "checkbox";
    const marcadas = multiplo ? (Array.isArray(valor) ? valor : []) : [];
    return (
      <fieldset className="o-field" id={`campo-${campo.id}`} aria-describedby={descritoPor} data-invalid={erro ? "true" : undefined} tabIndex={-1}>
        <legend className={legendaOculta ? "sr-only" : undefined}>{rotulo}</legend>
        {campo.ajuda && <p className="o-hint" id={ajudaId}>{campo.ajuda}</p>}
        {erro && <p className="o-error" id={erroId}>{erro}</p>}
        <div className="o-options">
          {campo.opcoes.map((o) => (
            <label key={o.valor} className="o-option">
              <input
                type={multiplo ? "checkbox" : "radio"}
                name={campo.id}
                value={o.valor}
                checked={multiplo ? marcadas.includes(o.valor) : valor === o.valor}
                aria-invalid={erro ? true : undefined}
                onChange={(event) => {
                  if (!multiplo) return onChange(o.valor);
                  onChange(event.target.checked ? [...marcadas, o.valor] : marcadas.filter((v) => v !== o.valor));
                }}
              />
              <span>
                <strong>{o.rotulo}</strong>
                {o.dica && <small>{o.dica}</small>}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  const comum = {
    id: `campo-${campo.id}`,
    name: campo.id,
    value: typeof valor === "string" ? valor : "",
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
    "aria-invalid": erro ? true : undefined,
    "aria-describedby": descritoPor,
    "aria-required": campo.obrigatorio || undefined,
    maxLength: campo.tipo === "textarea" ? 1500 : 200,
  };
  return (
    <div className="o-field" data-invalid={erro ? "true" : undefined}>
      <label htmlFor={`campo-${campo.id}`}>{rotulo}</label>
      {campo.ajuda && <p className="o-hint" id={ajudaId}>{campo.ajuda}</p>}
      {erro && <p className="o-error" id={erroId}>{erro}</p>}
      {campo.tipo === "textarea"
        ? <textarea rows={4} {...comum} />
        : <input type="text" autoComplete={campo.autocomplete ?? "off"} {...comum} />}
    </div>
  );
}

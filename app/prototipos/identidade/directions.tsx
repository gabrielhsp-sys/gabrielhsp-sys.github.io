import { areaLabels, statusLabels } from "@/lib/site";
import type { ProtoItem } from "./picker";

/* As tres direcoes, com o mesmo conteudo real. Cada uma e uma home reduzida —
   abertura, estudos de caso, o resto do arquivo e o contato — porque e ali que
   a identidade se decide. Nada aqui e aplicado ao site. */

export type Facts = {
  course: string;
  term: string;
  institution: string;
  city: string;
  seeking: string;
  email: string;
  github: string;
  linkedin: string;
};

type Props = { featured: ProtoItem[]; others: ProtoItem[]; facts: Facts };

const thesis = "Eu construo software que fica de pé sozinho.";
const lede =
  "Serviços em Python que rodam sem supervisão, sistemas em Java com arquitetura e teste, interfaces web estáticas e acessíveis. Cada projeto aqui explica o problema que resolve antes de listar a tecnologia.";

/* ═════════════════════════════ 1 · BANCADA ═════════════════════════════════
   O sistema atual, polido: mesmas cores, mesmas fontes, mesma forma por funcao.
   O que muda e a primeira dobra — a metade direita, vazia hoje, vira a bancada
   com os estudos de caso reais e o estado de cada um. */
export function Bancada({ featured, others, facts }: Props) {
  const live = [...featured, ...others].filter((item) => item.status === "live").length;
  const [lead, ...rest] = featured;
  return (
    <div className="bn">
      <section className="bn-hero">
        <div className="bn-copy">
          <p className="hero-kicker">
            <span className="hero-available"><i aria-hidden="true" /> Disponível para estágio</span>
            <span>Gabriel Henrique · {facts.course.split(" (")[0]}, {facts.institution}</span>
          </p>
          <h1>Eu construo software que <em>fica de pé sozinho.</em></h1>
          <p className="bn-lede">{lede}</p>
          <div className="hero-actions">
            <a className="button-solid" href={`mailto:${facts.email}`}>Falar comigo</a>
            <a className="button-ghost" href="#bn-casos">Ver os projetos</a>
          </div>
        </div>
        <aside className="bn-panel" aria-label="Estudos de caso">
          <div className="bn-panel-head">
            <span>estudos de caso</span>
            <span>{live} no ar agora</span>
          </div>
          <ol>
            {featured.map((item) => (
              <li key={item.id}>
                <a href={item.href}>
                  <span className="area-mark" data-area={item.area}>{areaLabels[item.area]}</span>
                  <strong>{item.title}</strong>
                  <span className="status" data-status={item.status}><i aria-hidden="true" /> {statusLabels[item.status]}</span>
                  <span className="bn-period">{item.period}</span>
                </a>
              </li>
            ))}
          </ol>
          <p className="bn-panel-foot">{others.length} outros projetos no arquivo</p>
        </aside>
      </section>
      <section className="bn-cases" id="bn-casos" aria-label="Projetos em destaque">
        {lead && (
          <article className="case-card bn-lead" data-area={lead.area}>
            <div className="case-meta">
              <span className="area-mark" data-area={lead.area}>{areaLabels[lead.area]}</span>
              <span className="status" data-status={lead.status}><i aria-hidden="true" /> {statusLabels[lead.status]}</span>
            </div>
            <h2><a href={lead.href}>{lead.title}</a></h2>
            <p>{lead.summary}</p>
            <ul className="case-stack">{lead.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
          </article>
        )}
        <div className="bn-rest">
          {rest.map((item) => (
            <article className="case-card" key={item.id} data-area={item.area}>
              <div className="case-meta">
                <span className="area-mark" data-area={item.area}>{areaLabels[item.area]}</span>
                <span className="status" data-status={item.status}><i aria-hidden="true" /> {statusLabels[item.status]}</span>
              </div>
              <h3><a href={item.href}>{item.title}</a></h3>
              <p>{item.summary}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="contact-section bn-contact">
        <div className="contact-copy"><h2>Quer conversar sobre uma vaga ou um projeto?</h2></div>
        <div className="contact-actions"><a className="contact-primary" href={`mailto:${facts.email}`}>{facts.email}</a></div>
      </section>
    </div>
  );
}

/* ═════════════════════════════ 2 · FOLHA ═══════════════════════════════════
   Folha de dados: fundo claro, uma familia so, o projeto lido como uma linha
   de especificacao. A unica cor forte e o marca-texto, usado no fato que quem
   contrata procura primeiro — a disponibilidade. */
export function Folha({ featured, others, facts }: Props) {
  const all = [...featured, ...others];
  return (
    <div className="fo">
      <header className="fo-top">
        <strong>Gabriel Henrique</strong>
        <nav aria-label="Seções">
          <a href="#fo-projetos">Projetos</a>
          <a href="/about/">Sobre</a>
          <a href={`mailto:${facts.email}`}>Contato</a>
        </nav>
      </header>
      <section className="fo-hero">
        <h1>{thesis}</h1>
        <p className="fo-lede">{lede}</p>
        <dl className="fo-spec">
          <div><dt>Curso</dt><dd>{facts.course}, {facts.term}</dd></div>
          <div><dt>Onde</dt><dd>{facts.institution}, {facts.city}</dd></div>
          <div><dt>Procura</dt><dd><mark>{facts.seeking}</mark></dd></div>
          <div><dt>Contato</dt><dd><a href={`mailto:${facts.email}`}>{facts.email}</a></dd></div>
        </dl>
      </section>
      <section className="fo-projects" id="fo-projetos" aria-labelledby="fo-projetos-h">
        <h2 id="fo-projetos-h">Projetos</h2>
        <div className="fo-table" role="table" aria-label="Projetos">
          <div className="fo-row fo-head" role="row">
            <span role="columnheader">Projeto</span>
            <span role="columnheader">O que faz</span>
            <span role="columnheader">Estado</span>
            <span role="columnheader">Período</span>
          </div>
          {all.map((item, index) => (
            <a className="fo-row" role="row" href={item.href} key={item.id} data-lead={index === 0 || undefined}>
              <span role="cell" className="fo-name">
                <i className="fo-swatch" data-area={item.area} aria-hidden="true" />
                {item.title}
              </span>
              <span role="cell" className="fo-what">
                {item.summary}
                {index === 0 && <span className="fo-tags">{item.tags.join(", ")}</span>}
              </span>
              <span role="cell" className="fo-status" data-status={item.status}>{statusLabels[item.status]}</span>
              <span role="cell" className="fo-period">{item.period}</span>
            </a>
          ))}
        </div>
      </section>
      <footer className="fo-foot">
        <p>Respondo por e-mail.</p>
        <a className="fo-cta" href={`mailto:${facts.email}`}>Escrever para {facts.email}</a>
      </footer>
    </div>
  );
}

/* ═════════════════════════════ 3 · ETIQUETA ════════════════════════════════
   Equipamento: chassi de aluminio, placas pretas gravadas, um laranja de
   sinalizacao so para a acao. Cada projeto ganha um codigo de catalogo tirado
   do proprio registro — iniciais do titulo e o ano em que comecou. */
const SKIP = new Set(["de", "da", "do", "em", "e", "a", "o"]);
export const catalogCode = (item: ProtoItem) => {
  const initials = item.title
    .split(/[^A-Za-zÀ-ÿ0-9+]+/)
    .filter((word) => word && !SKIP.has(word.toLowerCase()))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
  return `${initials}-${item.startedAt.slice(2, 4)}`;
};

export function Etiqueta({ featured, others, facts }: Props) {
  const all = [...featured, ...others];
  return (
    <div className="et">
      <header className="et-top">
        <span className="et-plate">GH</span>
        <strong>Gabriel Henrique</strong>
        <span className="et-led" data-status="live">Disponível para estágio</span>
      </header>
      <section className="et-hero">
        <h1>{thesis}</h1>
        <p className="et-lede">{lede}</p>
        <div className="et-actions">
          <a className="et-cta" href={`mailto:${facts.email}`}>Falar comigo</a>
          <a className="et-ghost" href="#et-modulos">Ver os módulos</a>
        </div>
      </section>
      <section className="et-rack" id="et-modulos" aria-labelledby="et-rack-h">
        <h2 id="et-rack-h">Módulos</h2>
        <ol>
          {all.map((item, index) => (
            <li key={item.id} data-area={item.area} data-lead={index === 0 || undefined}>
              <a href={item.href}>
                <span className="et-code" aria-label={`código ${catalogCode(item)}`}>{catalogCode(item)}</span>
                <span className="et-body">
                  <strong>{item.title}</strong>
                  <span>{item.summary}</span>
                </span>
                <span className="et-meta">
                  <span className="et-led" data-status={item.status}>{statusLabels[item.status]}</span>
                  <span>{areaLabels[item.area]}</span>
                  <span>{item.period}</span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </section>
      <footer className="et-foot">
        <span className="et-plate">{facts.email}</span>
        <span>{facts.course} · {facts.institution}</span>
      </footer>
    </div>
  );
}

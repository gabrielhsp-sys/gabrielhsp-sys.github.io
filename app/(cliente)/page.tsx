import Link from "next/link";
import { ArrowRightIcon as ArrowRight, ArrowUpRightIcon as ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Ctas, ServicoImagem, Steps } from "@/components/cliente-ui";
import { Captura, Celular, MolduraCaptura, type CapturaNome } from "@/components/molduras";
import { StructuredData } from "@/components/structured-data";
import { ATENDIMENTO } from "@/lib/contato";
import { demoHref, demosSites, ramos } from "@/lib/exemplos";
import { servicos } from "@/lib/servicos";

// Inicio para quem chega pelo Instagram. Rodada visual 2026-11-20: o trabalho
// aparece em prints (molduras em CSS) e o texto so nomeia o que a imagem mostra.
export default function Inicio() {
  return (
    <main id="conteudo" className="c-page">
      <StructuredData page="home" />
      <section className="c-hero c-hero-split" aria-labelledby="inicio-titulo">
        <div className="c-hero-text">
          <h1 id="inicio-titulo">Sites, aplicativos e bots para o seu negócio.</h1>
          <p className="c-lede">Eu sou o Gabriel. Faço sob encomenda, do jeito que o seu negócio funciona.</p>
          <Ctas orcamento="/orcamento/?origem=inicio" />
          <p className="c-note">{ATENDIMENTO.frase} {ATENDIMENTO.resposta}</p>
        </div>
        {/* So o print do notebook tem prioridade de rede: e o LCP no celular.
            Composicao de prints reais: um site de exemplo no notebook, outro no
            celular e a conversa do bot. Rotulo "Demonstracao" na legenda. */}
        <figure className="c-vitrine">
          <div className="c-vitrine-notebook">
            <MolduraCaptura moldura="notebook" captura="site-loja-desktop" sizes="(min-width: 1100px) 520px, 84vw" prioridade />
          </div>
          <div className="c-vitrine-celular">
            <MolduraCaptura moldura="celular" captura="site-alimentacao-celular" sizes="(min-width: 1100px) 190px, 30vw" />
          </div>
          <div className="c-vitrine-bot">
            {/* Abaixo de 1000 px a conversa sai da composicao (cliente.css): nem baixa. */}
            <MolduraCaptura moldura="conversa" captura="bot-conversa" sizes="170px" aPartirDe={1000} />
          </div>
          <figcaption>
            <span className="c-badge" data-kind="demo">Demonstração</span>
            Sites e bot de exemplo, com negócios inventados.
          </figcaption>
        </figure>
      </section>

      <section className="c-section" aria-labelledby="faco-titulo">
        <h2 id="faco-titulo">O que eu faço</h2>
        <ul className="c-service-grid">
          {servicos.map((s) => (
            <li key={s.slug}>
              <Link href={`/servicos/${s.slug}/`} className="c-service-tile">
                <ServicoImagem servico={s} sizes={{ navegador: "(max-width: 520px) 140px, 320px", celular: "(max-width: 520px) 110px, 190px" }} />
                <strong>{s.nome} <ArrowRight className="c-tile-arrow" size={20} aria-hidden="true" /></strong>
                <span>{s.resumo}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="c-section" aria-labelledby="veja-titulo">
        <div className="c-section-head">
          <h2 id="veja-titulo">Veja antes de pedir</h2>
          <p className="c-badge" data-kind="demo">Demonstração</p>
        </div>
        <p>Um site de exemplo para cada ramo, com negócio inventado. Toque e mexa à vontade.</p>
        <ul className="c-phone-strip">
          {demosSites.map((d) => (
            <li key={d.id}>
              <a href={demoHref(d.id)}>
                <Celular>
                  <Captura
                    nome={`site-${d.id}-celular` as CapturaNome}
                    sizes="(min-width: 1100px) 140px, 40vw"
                    alt=""
                  />
                </Celular>
                <span>
                  {ramos.find((r) => r.id === d.id)?.exemplo}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </span>
                <span className="sr-only">: abrir o site de exemplo {d.negocio}</span>
              </a>
            </li>
          ))}
        </ul>
        <Link className="c-more" href="/exemplos/">
          Ver todos os exemplos <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>

      <section className="c-section" aria-labelledby="como-titulo">
        <h2 id="como-titulo">Como funciona</h2>
        <Steps />
        <Link className="c-more" href="/como-funciona/">
          Perguntas comuns <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>

      <section className="c-section" aria-labelledby="quem-titulo">
        <h2 id="quem-titulo">Quem faz</h2>
        <p>
          Gabriel Henrique, estudante de Ciência da Computação na UNIFAL-MG. Você fala direto comigo, do
          primeiro contato à entrega.
        </p>
        <Link className="c-more" href="/sobre/">
          Quem sou eu <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>

      <section className="c-section c-final" aria-labelledby="final-titulo">
        <h2 id="final-titulo">Vamos conversar sobre o seu negócio?</h2>
        <Ctas orcamento="/orcamento/?origem=inicio" />
      </section>
    </main>
  );
}

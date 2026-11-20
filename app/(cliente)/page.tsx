import Link from "next/link";
import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Ctas, Steps } from "@/components/cliente-ui";
import { StructuredData } from "@/components/structured-data";
import { ATENDIMENTO } from "@/lib/contato";
import { demoHref, demosSites, ramos } from "@/lib/exemplos";
import { servicos } from "@/lib/servicos";

// Inicio para quem chega pelo Instagram (decisoes de 2026-11-19): o que eu
// faco, para quem, e como pedir, sem jargao. O texto vem do PLANO.md, secao 3.
export default function Inicio() {
  return (
    <main id="conteudo" className="c-page">
      <StructuredData page="home" />
      <section className="c-hero" aria-labelledby="inicio-titulo">
        <p className="c-kicker">{ATENDIMENTO.frase}</p>
        <h1 id="inicio-titulo">Sites, aplicativos e robôs para o seu negócio.</h1>
        <p className="c-lede">
          Eu sou o Gabriel. Faço sob encomenda o que o seu negócio precisa: um site que leva o cliente
          direto para o seu WhatsApp, um aplicativo, um robô no Telegram ou uma tarefa repetitiva que
          passa a se fazer sozinha.
        </p>
        <Ctas orcamento="/orcamento/?origem=inicio" />
        <p className="c-note">{ATENDIMENTO.resposta}</p>
      </section>

      <section className="c-section" aria-labelledby="faco-titulo">
        <h2 id="faco-titulo">O que eu faço</h2>
        <ul className="c-service-list">
          {servicos.map((s) => (
            <li key={s.slug}>
              <Link href={`/servicos/${s.slug}/`}>
                <strong>{s.nome}</strong>
                <span>{s.resumo}</span>
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="c-section" aria-labelledby="veja-titulo">
        <h2 id="veja-titulo">Veja antes de pedir</h2>
        <p>
          Fiz sites de exemplo para sete tipos de negócio. Os negócios são inventados; o site funciona
          de verdade. Abra o do seu ramo e mexa à vontade.
        </p>
        <ul className="c-chips">
          {demosSites.map((d) => (
            <li key={d.id}>
              <a href={demoHref(d.id)}>{ramos.find((r) => r.id === d.id)?.exemplo}</a>
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
          Ver os detalhes <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>

      <section className="c-section" aria-labelledby="quem-titulo">
        <h2 id="quem-titulo">Quem faz</h2>
        <p>
          Gabriel Henrique, estudante de Ciência da Computação na UNIFAL-MG. {ATENDIMENTO.frase} Você
          fala direto comigo, do primeiro contato à entrega.
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

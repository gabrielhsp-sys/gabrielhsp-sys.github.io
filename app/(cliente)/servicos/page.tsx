import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Ctas, ServicoImagem } from "@/components/cliente-ui";
import { pageMetadata } from "@/lib/metadata";
import { servicos } from "@/lib/servicos";

export const metadata: Metadata = pageMetadata({
  title: "Serviços",
  description: "Sites, aplicativos, bots no Telegram, automações e sistemas sob encomenda para o seu negócio.",
  path: "/servicos/",
});

// Um cartao por servico: imagem do trabalho (print em moldura) e uma linha de
// texto. O detalhe fica na pagina de cada servico (rodada visual 2026-11-20).
export default function ServicosPage() {
  return (
    <main id="conteudo" className="c-page">
      <header className="c-hero c-hero-compact">
        <h1>O que eu faço pelo seu negócio.</h1>
        <p className="c-lede">Tudo sob encomenda. Escolha o que parece com o que você precisa.</p>
      </header>
      <div className="c-feature-list">
        {servicos.map((s, i) => (
          <section key={s.slug} className="c-feature" aria-labelledby={`s-${s.slug}`} data-lado={i % 2 ? "direita" : "esquerda"}>
            <ServicoImagem servico={s} sizes="(min-width: 900px) 460px, 92vw" prioridade={i === 0} />
            <div className="c-feature-text">
              <h2 id={`s-${s.slug}`}>{s.nome}</h2>
              <p>{s.resumo}</p>
              <div className="c-feature-links">
                <Link className="c-button c-button-ghost" href={s.exemplo.href}>
                  {s.exemplo.rotulo} <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link className="c-more" href={`/servicos/${s.slug}/`}>
                  Como funciona<span className="sr-only"> o serviço de {s.nome}</span> <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        ))}
      </div>
      <section className="c-section c-final" aria-labelledby="final-titulo">
        <h2 id="final-titulo">Não sabe qual é o seu caso?</h2>
        <p>Me conte o problema do seu jeito. Eu digo o que resolve e quanto custa antes de você decidir.</p>
        <Ctas orcamento="/orcamento/?origem=servicos" />
      </section>
    </main>
  );
}

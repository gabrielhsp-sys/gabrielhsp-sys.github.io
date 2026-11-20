import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Ctas } from "@/components/cliente-ui";
import { pageMetadata } from "@/lib/metadata";
import { servicos } from "@/lib/servicos";

export const metadata: Metadata = pageMetadata({
  title: "Serviços",
  description: "Sites, aplicativos, robôs no Telegram, automações e sistemas sob encomenda para o seu negócio.",
  path: "/servicos/",
});

export default function ServicosPage() {
  return (
    <main id="conteudo" className="c-page">
      <header className="c-hero c-hero-compact">
        <h1>O que eu faço pelo seu negócio.</h1>
        <p className="c-lede">Tudo sob encomenda, do jeito que o seu negócio funciona. Escolha o que parece com o que você precisa.</p>
      </header>
      <div className="c-service-cards">
        {servicos.map((s) => (
          <section key={s.slug} className="c-service-card" aria-labelledby={`s-${s.slug}`}>
            <h2 id={`s-${s.slug}`}>{s.nome}</h2>
            <p>{s.resolve}</p>
            <Link className="c-more" href={`/servicos/${s.slug}/`}>
              Saber mais<span className="sr-only"> sobre {s.nome}</span> <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </section>
        ))}
      </div>
      <section className="c-section c-final" aria-labelledby="final-titulo">
        <h2 id="final-titulo">Não sabe qual é o seu caso?</h2>
        <p>Me conte o problema do seu jeito. Eu digo o que resolve e quanto custa antes de você decidir qualquer coisa.</p>
        <Ctas orcamento="/orcamento/?origem=servicos" />
      </section>
    </main>
  );
}

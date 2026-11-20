import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon as ArrowLeft, ArrowRightIcon as ArrowRight, CheckIcon as Check } from "@phosphor-icons/react/dist/ssr";
import { Ctas, ServicoImagem } from "@/components/cliente-ui";
import { whatsappSobre } from "@/lib/contato-links";
import { pageMetadata } from "@/lib/metadata";
import { servicoPorSlug, servicos } from "@/lib/servicos";

type Props = { params: Promise<{ servico: string }> };

export function generateStaticParams() {
  return servicos.map((s) => ({ servico: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = servicoPorSlug((await params).servico);
  if (!s) return {};
  return pageMetadata({ title: s.nome, description: s.titulo, path: `/servicos/${s.slug}/` });
}

// Cada pagina: o que resolve, onde ajuda, o que voce recebe, um exemplo e pedir.
export default async function ServicoPage({ params }: Props) {
  const s = servicoPorSlug((await params).servico);
  if (!s) notFound();
  return (
    <main id="conteudo" className="c-page">
      <Link className="c-back" href="/servicos/"><ArrowLeft size={18} aria-hidden="true" /> Todos os serviços</Link>
      <header className="c-hero c-hero-compact c-hero-split">
        <div className="c-hero-text">
          <h1>{s.titulo}</h1>
          <p className="c-lede">{s.resolve}</p>
          <Ctas
            orcamento={`/orcamento/?precisa=${s.orcamento}&origem=servicos-${s.slug}`}
            whatsapp={whatsappSobre(s.um)}
            label={`Pedir orçamento de ${s.um.replace(/^uma? /, "")}`}
          />
        </div>
        <ServicoImagem servico={s} sizes={{ navegador: "(min-width: 1000px) 460px, 82vw", celular: "190px" }} prioridade />
      </header>
      <section className="c-section" aria-labelledby="ajuda-titulo">
        <h2 id="ajuda-titulo">Onde isso ajuda</h2>
        <ul className="c-list">{s.situacoes.map((t) => <li key={t}>{t}</li>)}</ul>
      </section>
      <section className="c-section" aria-labelledby="recebe-titulo">
        <h2 id="recebe-titulo">O que você recebe</h2>
        <ul className="c-checks">
          {s.recebe.map((t) => <li key={t}><Check size={20} weight="bold" aria-hidden="true" /> {t}</li>)}
        </ul>
      </section>
      <section className="c-section" aria-labelledby="exemplo-titulo">
        <h2 id="exemplo-titulo">Veja um exemplo</h2>
        <Link className="c-button c-button-ghost" href={s.exemplo.href}>
          {s.exemplo.rotulo} <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}

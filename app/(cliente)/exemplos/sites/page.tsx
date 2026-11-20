import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon as ArrowLeft, ArrowUpRightIcon as ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Ctas } from "@/components/cliente-ui";
import { demoHref, demosSites, ramoLabel } from "@/lib/exemplos";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Sites de exemplo",
  description: "Sete sites de exemplo, um para cada ramo: lanchonete, estética, barbearia, clínica, academia, loja e oficina.",
  path: "/exemplos/sites/",
});

// Os demos sao paginas Astro do mesmo build (exemplos-sites/), fora do
// roteador do Next: <a> comum, nao <Link>.
export default function SitesExemploPage() {
  return (
    <main id="conteudo" className="c-page">
      <Link className="c-back" href="/exemplos/"><ArrowLeft size={18} aria-hidden="true" /> Todos os exemplos</Link>
      <header className="c-hero c-hero-compact">
        <h1>Sites de exemplo, um para cada ramo.</h1>
        <p className="c-lede">
          Os negócios são inventados; o site funciona de verdade. O seu fica igual, com o seu nome, as suas
          fotos e o seu WhatsApp.
        </p>
      </header>
      <ul className="c-demo-list">
        {demosSites.map((d) => (
          <li key={d.id}>
            <a href={demoHref(d.id)}>
              <span className="c-demo-ramo">{ramoLabel(d.id)}</span>
              <strong>{d.negocio}</strong>
              <span>{d.mostra}</span>
              <span className="c-demo-open">Abrir o exemplo <ArrowUpRight size={18} aria-hidden="true" /></span>
            </a>
          </li>
        ))}
      </ul>
      <section className="c-section c-final" aria-labelledby="final-titulo">
        <h2 id="final-titulo">Quer um assim?</h2>
        <Ctas orcamento="/orcamento/?precisa=site&origem=exemplos-sites" label="Pedir orçamento de site" />
      </section>
    </main>
  );
}

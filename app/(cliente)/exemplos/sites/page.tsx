import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon as ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Ctas } from "@/components/cliente-ui";
import { ExemplosGrade } from "@/components/exemplos-grade";
import { exemplos } from "@/lib/exemplos";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Sites de exemplo",
  description: "Sete sites de exemplo, um para cada ramo: lanchonete, estética, barbearia, clínica, academia, loja e oficina.",
  path: "/exemplos/sites/",
});

// Os demos sao paginas Astro do mesmo build (exemplos-sites/), fora do
// roteador do Next: <a> comum, nao <Link> (ExemplosGrade cuida disso).
export default function SitesExemploPage() {
  return (
    <main id="conteudo" className="c-page">
      <Link className="c-back" href="/exemplos/"><ArrowLeft size={18} aria-hidden="true" /> Todos os exemplos</Link>
      <header className="c-hero c-hero-compact">
        <h1>Sites de exemplo, um para cada ramo.</h1>
        <p className="c-lede">
          Os negócios são inventados e os sites funcionam de verdade. O seu fica igual, com o seu nome, as
          suas fotos e o seu WhatsApp.
        </p>
      </header>
      <ExemplosGrade exemplos={exemplos.filter((e) => e.tipo === "sites")} filtro={false} />
      <section className="c-section c-final" aria-labelledby="final-titulo">
        <h2 id="final-titulo">Quer um assim?</h2>
        <Ctas orcamento="/orcamento/?precisa=site&origem=exemplos-sites" label="Pedir orçamento de site" />
      </section>
    </main>
  );
}

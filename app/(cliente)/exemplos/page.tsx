import type { Metadata } from "next";
import { Ctas } from "@/components/cliente-ui";
import { ExemplosGrade } from "@/components/exemplos-grade";
import { exemplos } from "@/lib/exemplos";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Exemplos",
  description: "Sites de exemplo para sete ramos, um aplicativo, bots no Telegram e demonstrações de automação e de sistema.",
  path: "/exemplos/",
});

// Grade com imagem e filtro por tipo (rodada visual 2026-11-20). O que e
// projeto real e o que e demonstracao fica escrito em cada cartao.
export default function ExemplosPage() {
  return (
    <main id="conteudo" className="c-page">
      <header className="c-hero c-hero-compact">
        <h1>Veja antes de pedir.</h1>
        <p className="c-lede">Projetos reais e demonstrações, marcados em cada um. Abra e mexa à vontade.</p>
      </header>
      <ExemplosGrade exemplos={exemplos} />
      <section className="c-section c-final" aria-labelledby="final-titulo">
        <h2 id="final-titulo">Gostou de algum?</h2>
        <Ctas orcamento="/orcamento/?origem=exemplos" />
      </section>
    </main>
  );
}

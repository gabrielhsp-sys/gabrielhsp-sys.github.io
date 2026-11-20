import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon as ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Ctas, Demonstracao } from "@/components/cliente-ui";
import { AutomacaoDemo } from "@/components/exemplos-demo";
import { whatsappSobre } from "@/lib/contato-links";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Automação de exemplo",
  description: "Demonstração: pedidos que chegam no WhatsApp viram planilha e resumo do dia, sem ninguém digitar.",
  path: "/exemplos/automacoes/",
});

export default function AutomacoesExemploPage() {
  return (
    <main id="conteudo" className="c-page">
      <Link className="c-back" href="/exemplos/"><ArrowLeft size={18} aria-hidden="true" /> Todos os exemplos</Link>
      <header className="c-hero c-hero-compact">
        <Demonstracao />
        <h1>Os pedidos do dia viram planilha e resumo, sem ninguém digitar.</h1>
        <p className="c-lede">
          Uma lanchonete inventada recebe pedidos pelo WhatsApp. Hoje alguém copia cada um para a planilha e,
          no fim do dia, soma tudo na mão. Teste aqui como fica quando isso se faz sozinho. Os dados são de
          mentira e nada sai desta página.
        </p>
      </header>
      <section className="c-section" aria-labelledby="teste-titulo">
        <h2 id="teste-titulo">Teste</h2>
        <AutomacaoDemo />
      </section>
      <section className="c-section c-final" aria-labelledby="final-titulo">
        <h2 id="final-titulo">Qual tarefa toma o seu tempo?</h2>
        <p>Me conte como você faz hoje, passo a passo. Eu digo o que dá para automatizar antes de você decidir.</p>
        <Ctas orcamento="/orcamento/?precisa=automacao&origem=exemplos-automacoes" whatsapp={whatsappSobre("uma automação")} label="Pedir orçamento de automação" />
      </section>
    </main>
  );
}

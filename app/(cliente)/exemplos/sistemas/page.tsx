import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon as ArrowLeft, ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Ctas, Demonstracao } from "@/components/cliente-ui";
import { SistemaDemo } from "@/components/exemplos-demo";
import { whatsappSobre } from "@/lib/contato-links";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Sistema de exemplo",
  description: "Demonstração: um controle de estoque em que o dono e a equipe veem coisas diferentes.",
  path: "/exemplos/sistemas/",
});

export default function SistemasExemploPage() {
  return (
    <main id="conteudo" className="c-page">
      <Link className="c-back" href="/exemplos/"><ArrowLeft size={18} aria-hidden="true" /> Todos os exemplos</Link>
      <header className="c-hero c-hero-compact">
        <Demonstracao />
        <h1>Cada pessoa vê e mexe só no que é dela.</h1>
        <p className="c-lede">
          Um controle de estoque de uma lanchonete inventada. A equipe registra o que entra e o que sai; o dono
          vê o estoque mínimo e recebe o alerta antes de faltar. Troque de pessoa e veja a diferença. Os dados
          são de mentira e nada sai desta página.
        </p>
      </header>
      <section className="c-section" aria-labelledby="teste-titulo">
        <h2 id="teste-titulo">Teste</h2>
        <SistemaDemo />
      </section>
      <section className="c-section" aria-labelledby="real-titulo">
        <p className="c-badge" data-kind="real">Projeto real</p>
        <h2 id="real-titulo">Já fiz assim de verdade</h2>
        <p>
          Um sistema acadêmico com cadastro e controle de acesso por papel: cada tipo de usuário entra com o
          próprio login e só faz o que o papel dele permite.
        </p>
        <Link className="c-more" href="/projetos/academic-system/">Como eu fiz <ArrowRight size={18} aria-hidden="true" /></Link>
      </section>
      <section className="c-section c-final" aria-labelledby="final-titulo">
        <h2 id="final-titulo">Quer um sistema para o seu negócio?</h2>
        <Ctas orcamento="/orcamento/?precisa=sistema&origem=exemplos-sistemas" whatsapp={whatsappSobre("um sistema")} label="Pedir orçamento de sistema" />
      </section>
    </main>
  );
}

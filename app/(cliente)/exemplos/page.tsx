import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Ctas } from "@/components/cliente-ui";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Exemplos",
  description: "Sites de exemplo para sete ramos, um aplicativo, um bot no Telegram e demonstrações de automação e de sistema.",
  path: "/exemplos/",
});

// O que e trabalho real e o que e demonstracao fica escrito em cada cartao.
const grupos = [
  { href: "/exemplos/sites/", nome: "Sites", texto: "Sete sites de exemplo, um para cada ramo, com negócios inventados. Abra no celular e mexa à vontade.", tipo: "Exemplos para mexer" },
  { href: "/exemplos/aplicativos/", nome: "Aplicativos", texto: "Um aplicativo Android que eu fiz: divide as contas de uma carona diária entre os celulares do grupo.", tipo: "Projeto real" },
  { href: "/exemplos/bots/", nome: "Bots no Telegram", texto: "Um bot que eu fiz e que está no ar: lê canais de promoção e só avisa quando aparece o que eu procuro.", tipo: "Projeto real" },
  { href: "/exemplos/automacoes/", nome: "Automações", texto: "Pedidos que viram planilha e resumo do dia, sem digitar nada. Teste aqui mesmo, com dados de mentira.", tipo: "Demonstração" },
  { href: "/exemplos/sistemas/", nome: "Sistemas", texto: "Um controle de estoque com acesso diferente para o dono e para a equipe. Teste aqui mesmo.", tipo: "Demonstração" },
];

export default function ExemplosPage() {
  return (
    <main id="conteudo" className="c-page">
      <header className="c-hero c-hero-compact">
        <h1>Veja antes de pedir.</h1>
        <p className="c-lede">Exemplos para cada serviço. Os projetos reais estão marcados; o resto é demonstração, para você ver como funciona.</p>
      </header>
      <div className="c-service-cards">
        {grupos.map((g) => (
          <section key={g.href} className="c-service-card" aria-labelledby={`g-${g.href}`}>
            <p className="c-badge" data-kind={g.tipo === "Projeto real" ? "real" : "demo"}>{g.tipo}</p>
            <h2 id={`g-${g.href}`}>{g.nome}</h2>
            <p>{g.texto}</p>
            <Link className="c-more" href={g.href}>Ver o exemplo<span className="sr-only"> de {g.nome}</span> <ArrowRight size={18} aria-hidden="true" /></Link>
          </section>
        ))}
      </div>
      <section className="c-section c-final" aria-labelledby="final-titulo">
        <h2 id="final-titulo">Gostou de algum?</h2>
        <Ctas orcamento="/orcamento/?origem=exemplos" />
      </section>
    </main>
  );
}

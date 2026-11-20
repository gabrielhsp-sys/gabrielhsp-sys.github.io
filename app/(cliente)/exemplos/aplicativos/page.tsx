import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon as ArrowLeft, ArrowUpRightIcon as ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Ctas } from "@/components/cliente-ui";
import { whatsappSobre } from "@/lib/contato-links";
import { demoHref } from "@/lib/exemplos";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Aplicativo de exemplo",
  description: "Carona 70: um aplicativo Android que eu fiz para um grupo dividir os custos de uma carona diária.",
  path: "/exemplos/aplicativos/",
});

// Carona 70 (decisao 12 de 2026-11-19). Sem prints por enquanto: obte-los
// exigiria rodar o app, e esta sessao nao instala nada. Nenhum nome, valor,
// chave PIX ou dado real de quem usa o app aparece aqui.
export default function AplicativosExemploPage() {
  return (
    <main id="conteudo" className="c-page">
      <Link className="c-back" href="/exemplos/"><ArrowLeft size={18} aria-hidden="true" /> Todos os exemplos</Link>
      <header className="c-hero c-hero-compact">
        <p className="c-badge" data-kind="real">Projeto real</p>
        <h1>Carona 70: as contas da carona, certas e sem discussão.</h1>
        <p className="c-lede">
          Um aplicativo Android que eu fiz para um grupo que divide a carona até a faculdade. Cada viagem,
          cada passageiro e cada pagamento ficam registrados no celular de todo mundo.
        </p>
      </header>
      <section className="c-section" aria-labelledby="faz-titulo">
        <h2 id="faz-titulo">O que ele faz</h2>
        <ul className="c-list">
          <li>Marca quem foi na ida e na volta de cada saída do carro, no dia.</li>
          <li>Calcula sozinho quanto cada pessoa deve, dia a dia e na semana.</li>
          <li>Quando alguém paga, desconta da dívida mais antiga e guarda o histórico.</li>
          <li>Os celulares do grupo veem a mesma coisa na hora, e o app funciona mesmo sem internet.</li>
          <li>Manda lembretes toda semana.</li>
        </ul>
      </section>
      <section className="c-section" aria-labelledby="seu-titulo">
        <h2 id="seu-titulo">E no seu negócio?</h2>
        <p>
          O mesmo jeito de fazer serve para agenda de horários, pedidos, cartão de fidelidade ou controle de
          quem pagou. Alguns sites de exemplo já se comportam como aplicativo no celular:
        </p>
        <ul className="c-chips">
          <li><a href={demoHref("beleza")}>agenda de estética <ArrowUpRight size={16} aria-hidden="true" /></a></li>
          <li><a href={demoHref("cabeleireiro")}>horário na barbearia <ArrowUpRight size={16} aria-hidden="true" /></a></li>
          <li><a href={demoHref("loja")}>carrinho de compras <ArrowUpRight size={16} aria-hidden="true" /></a></li>
        </ul>
      </section>
      <section className="c-section c-final" aria-labelledby="final-titulo">
        <h2 id="final-titulo">Quer um aplicativo assim?</h2>
        <Ctas orcamento="/orcamento/?precisa=aplicativo&origem=exemplos-aplicativos" whatsapp={whatsappSobre("um aplicativo")} label="Pedir orçamento de aplicativo" />
      </section>
    </main>
  );
}

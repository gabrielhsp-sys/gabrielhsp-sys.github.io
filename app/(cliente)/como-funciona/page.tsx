import type { Metadata } from "next";
import { Ctas, Steps } from "@/components/cliente-ui";
import { ATENDIMENTO } from "@/lib/contato";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Como funciona",
  description: "Do primeiro contato à entrega: como eu trabalho, o que preciso de você e as perguntas mais comuns.",
  path: "/como-funciona/",
});

// Perguntas frequentes: so o que e verdade sem depender de preco ou prazo
// inventado. Rascunho para o Gabriel revisar (relatorio, "Textos").
const faq = [
  {
    q: "Quanto custa?",
    a: "Depende do tamanho do que você precisa. Por isso eu não coloco preço no site: você me conta o que quer e eu te mando o valor e o prazo antes de você decidir qualquer coisa.",
  },
  {
    q: "Preciso entender de tecnologia?",
    a: "Não. Você me explica como o seu negócio funciona, do seu jeito. A parte técnica é comigo.",
  },
  {
    q: "Você atende fora de Areado?",
    a: "Sim. Converso por WhatsApp e mando tudo pela internet, então atendo em qualquer cidade do Brasil.",
  },
  {
    q: "Como eu mando fotos, logo e textos?",
    a: "Depois que você aprovar o orçamento, eu te mando um link só seu para enviar o material. Também dá para mandar pelo WhatsApp.",
  },
  {
    q: "E se eu quiser mudar alguma coisa depois?",
    a: "A gente combina isso no orçamento. Antes de ir ao ar, você confere tudo e pede os ajustes.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <main id="conteudo" className="c-page">
      <header className="c-hero c-hero-compact">
        <h1>Como funciona.</h1>
        <p className="c-lede">Você fala direto comigo, do primeiro contato à entrega. {ATENDIMENTO.resposta}</p>
      </header>
      <section className="c-section" aria-labelledby="passos-titulo">
        <h2 id="passos-titulo">Do pedido à entrega</h2>
        <Steps />
      </section>
      <section className="c-section" aria-labelledby="faq-titulo">
        <h2 id="faq-titulo">Perguntas comuns</h2>
        <div className="c-faq">
          {faq.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="c-section c-final" aria-labelledby="final-titulo">
        <h2 id="final-titulo">Pronto para começar?</h2>
        <Ctas orcamento="/orcamento/?origem=como-funciona" />
      </section>
    </main>
  );
}

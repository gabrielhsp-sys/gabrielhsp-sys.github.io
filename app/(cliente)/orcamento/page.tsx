import type { Metadata } from "next";
import { WHATSAPP_EXIBICAO } from "@/lib/contato";
import { whatsappContato } from "@/lib/contato-links";
import { site } from "@/lib/site";
import { OrcamentoForm } from "./orcamento-form";

/* Formulario de orcamento: fora do sitemap e da busca, sem indexacao (o link
   circula no Instagram e no WhatsApp). A primeira pergunta e "O que voce
   precisa?" e a resposta termina no WhatsApp Business com a mensagem pronta. */
export const metadata: Metadata = {
  title: "Pedir orçamento",
  description: "Algumas perguntas rápidas sobre o que você precisa. No fim, a mensagem sai pronta no meu WhatsApp.",
  alternates: { canonical: "/orcamento/" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  // O openGraph da pagina substitui o do layout inteiro, sem mesclar.
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/orcamento/",
    siteName: site.name,
    title: `Pedir orçamento — ${site.name}`,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: site.name }],
  },
};

export default function OrcamentoPage() {
  return (
    <main id="conteudo" className="c-page o-page">
      <header className="c-hero c-hero-compact">
        <h1>Pedir orçamento.</h1>
        <p className="c-lede">
          Umas perguntas rápidas, uns 2 minutos. No fim, a mensagem sai pronta no meu WhatsApp e eu respondo
          em até 24 horas. Não sabe responder alguma coisa? Escolha “Não sei” ou deixe para a conversa.
        </p>
      </header>
      <noscript>
        <p className="o-hint">
          Este formulário precisa de JavaScript. Se preferir, fale direto no WhatsApp {WHATSAPP_EXIBICAO}:{" "}
          <a href={whatsappContato}>abrir conversa</a>.
        </p>
      </noscript>
      <OrcamentoForm />
    </main>
  );
}

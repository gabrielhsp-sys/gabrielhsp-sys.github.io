import type { Metadata } from "next";
import { site } from "@/lib/site";
import { BriefingForm } from "./briefing-form";

/* Pagina so para quem recebe o link: fora do menu, da busca global e do
   sitemap, e sem indexacao. A busca le content/public e o sitemap lista rotas
   por nome, entao basta nao cadastra-la em nenhum dos dois. */
export const metadata: Metadata = {
  title: "Briefing de projeto",
  description: "Perguntas para entender o seu projeto: site, automação, sistema ou outra ideia com tecnologia.",
  alternates: { canonical: "/orcamento/" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  // O link circula no WhatsApp: a previa precisa da imagem, e o openGraph da
  // pagina substitui o do layout inteiro, sem mesclar.
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/orcamento/",
    siteName: site.name,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: site.name }],
  },
};

export default function BriefingPage() {
  return (
    <main id="conteudo" className="inner-page">
      <header className="page-intro">
        <h1>Vamos entender o seu projeto.</h1>
        <p>
          Serve para site, automação, sistema ou qualquer ideia que envolva tecnologia. Leva uns 10 minutos.
          Não sabe responder alguma coisa? “Não sei” é uma resposta válida.
        </p>
      </header>
      <noscript>
        <p className="page-intro">
          Este formulário precisa de JavaScript ligado. Se preferir, escreva para {site.email}.
        </p>
      </noscript>
      <BriefingForm />
    </main>
  );
}

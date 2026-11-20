import type { Metadata } from "next";
import { MaterialForm } from "./material-form";

// Pagina escondida (decisao 11 de 2026-11-19): so por link assinado, fora do
// menu, do sitemap e da busca, sem indexacao e sem Referer.
export const metadata: Metadata = {
  title: "Material do seu site",
  description: "Envio de fotos, logo e textos para quem já fechou o site.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  referrer: "no-referrer",
};

export default function MaterialPage() {
  return (
    <main id="conteudo" className="c-page o-page">
      <header className="c-hero c-hero-compact">
        <h1>Material do seu site.</h1>
        <p className="c-lede">
          Aqui você me manda tudo o que vai no seu site: informações, fotos e textos. Leva uns 10 minutos. Não
          tem alguma coisa agora? Pule e me mande depois pelo WhatsApp.
        </p>
        <p className="o-hint">Aceito PNG, JPG, WEBP e PDF, até 10&nbsp;MB por arquivo e 40&nbsp;MB por envio. Só eu vejo o que você mandar.</p>
      </header>
      <noscript><p className="o-hint">Esta página precisa de JavaScript para enviar arquivos.</p></noscript>
      <MaterialForm />
    </main>
  );
}

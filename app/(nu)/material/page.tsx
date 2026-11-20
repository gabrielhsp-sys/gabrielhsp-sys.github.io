import type { Metadata } from "next";
import { MaterialForm } from "./material-form";

// Pagina visivel para quem tem o codigo de acesso (pedido de 2026-11-20; antes,
// decisao 11 de 2026-11-19, so por link assinado). Continua fora do menu, do
// sitemap e da busca, sem indexacao e sem Referer.
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
        <p className="c-lede">Aqui você me manda as fotos, a logo e os textos do seu site, com o código que eu te mandei.</p>
      </header>
      <noscript><p className="o-hint">Esta página precisa de JavaScript para enviar arquivos.</p></noscript>
      <MaterialForm />
    </main>
  );
}

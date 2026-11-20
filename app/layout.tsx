import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./cliente.css";
import { display, mono } from "./fonts";
import { PersonalityProvider } from "@/components/personality";
import { site } from "@/lib/site";
import { TEMA_SCRIPT } from "@/lib/tema";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
  authors: [{ name: site.owner, url: site.github }],
  alternates: { canonical: "/", types: { "application/rss+xml": "/feed.xml" } },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${site.name}: sites, aplicativos e bots para o seu negócio` }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [{ url: "/og.png", alt: `${site.name}: sites, aplicativos e bots para o seu negócio` }],
  },
};

// Sem themeColor aqui: a cor da barra do navegador acompanha o tema e quem
// escreve o <meta name="theme-color"> e o script do tema (lib/tema.ts). O dock
// e as camadas fixas somam env(safe-area-inset-*) no CSS.
export const viewport: Viewport = {
  colorScheme: "light dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // Extensoes que reescrevem a pagina antes da hidratacao (Dark Reader e
    // companhia) injetam atributos no <html>. O aviso e delas, nao do site;
    // suprimir aqui nao esconde divergencia de nenhum outro elemento.
    // data-theme: o servidor manda o claro (padrao); o script do <head> troca
    // pela escolha salva antes do primeiro pintar (lib/tema.ts).
    <html lang="pt-BR" data-theme="light" className={`${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: TEMA_SCRIPT }} />
      </head>
      <body>
        <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
        <PersonalityProvider>
          {/* Cada grupo de rotas traz o seu chrome: (cliente), (recrutador), (nu). */}
          {children}
        </PersonalityProvider>
      </body>
    </html>
  );
}

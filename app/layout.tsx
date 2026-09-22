import type { Metadata } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./globals.css";
import { PersonalityProvider } from "@/components/personality";
import { SystemChrome } from "@/components/system-chrome";
import { site } from "@/lib/site";

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
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${site.name} — projetos` }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [{ url: "/og.png", alt: `${site.name} — projetos` }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // Extensoes que reescrevem a pagina antes da hidratacao (Dark Reader e
    // companhia) injetam atributos no <html>. O aviso e delas, nao do site;
    // suprimir aqui nao esconde divergencia de nenhum outro elemento.
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
        <PersonalityProvider>
          <SystemChrome>{children}</SystemChrome>
        </PersonalityProvider>
      </body>
    </html>
  );
}

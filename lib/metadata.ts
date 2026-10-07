import type { Metadata } from "next";
import { site } from "@/lib/site";

/* O metadata dos segmentos do Next se mescla de forma rasa: o `openGraph` de
   uma pagina substitui o do layout inteiro, sem herdar imagem, nome do site
   nem idioma (generate-metadata.md, "Merging"). Toda pagina monta o seu
   cartao completo por aqui, para nenhuma ficar sem imagem na previa. */

type PageCard = {
  title: string;
  description: string;
  path: string;
  // Caminho de uma imagem 1200 x 630 em /public; sem ela, o cartao do site.
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
};

export function pageMetadata({ title, description, path, image = "/og.png", imageAlt, type = "website" }: PageCard): Metadata {
  const fullTitle = `${title} — ${site.name}`;
  const images = [{ url: image, width: 1200, height: 630, alt: imageAlt ?? fullTitle }];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type, locale: "pt_BR", url: path, siteName: site.name, title: fullTitle, description, images },
    twitter: { card: "summary_large_image", title: fullTitle, description, images },
  };
}

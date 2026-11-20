// Helper de metadata (D-125): toda página monta o cartão de compartilhamento completo
// (Open Graph + Twitter) e o noindex por aqui. O layout só renderiza o que sai desta função.

export interface EntradaMetadata {
  titulo: string;
  descricao: string;
  /** Caminho da página, começando com "/" (ex.: "/alimentacao"). */
  caminho: string;
  /** Caminho da imagem em public/ (ex.: "/img/og/alimentacao.jpg"), 1200×630. */
  imagem: string;
  imagemAlt: string;
  /** URL base do site (astro.config `site`). */
  site: string | URL;
  nomeSite: string;
}

export interface Metadata {
  title: string;
  canonical: string;
  metas: { name?: string; property?: string; content: string }[];
}

export function montarMetadata(e: EntradaMetadata): Metadata {
  const url = new URL(e.caminho, e.site).href;
  const imagem = new URL(e.imagem, e.site).href;
  return {
    title: e.titulo,
    canonical: url,
    metas: [
      { name: 'description', content: e.descricao },
      // Negócios fictícios: não podem aparecer na busca de quem procura comércio real.
      { name: 'robots', content: 'noindex, nofollow' },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'pt_BR' },
      { property: 'og:site_name', content: e.nomeSite },
      { property: 'og:title', content: e.titulo },
      { property: 'og:description', content: e.descricao },
      { property: 'og:url', content: url },
      { property: 'og:image', content: imagem },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: e.imagemAlt },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: e.titulo },
      { name: 'twitter:description', content: e.descricao },
      { name: 'twitter:image', content: imagem },
    ],
  };
}

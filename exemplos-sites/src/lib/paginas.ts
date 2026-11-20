// Utilidades das páginas de nicho (título, imagem do cartão de compartilhamento).
import type { Comum } from '../data/tipos.ts';

/** Cartão OG gerado por `npm run imagens` a partir da foto do hero (ver scripts/imagens.mjs). */
export function imagemOg(fotoHero: string): string {
  return `/img/og/${fotoHero.replace(/\/hero$/, '').replaceAll('/', '-')}.jpg`;
}

export function tituloPagina(d: Comum): string {
  return `${d.negocio.resumo} | ${d.endereco.cidade} - ${d.endereco.uf}`;
}

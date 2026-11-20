// @ts-check
import { defineConfig } from 'astro/config';

// URL pública usada no cartão de compartilhamento (og:url, og:image absolutos, D-125).
// Padrão = produção na Vercel (docs/PLANO-RENOMEAR.md), para um build sem a variável não publicar
// localhost. SITE_URL no ambiente sobrescreve (ex.: outro domínio no futuro).
const site = process.env.SITE_URL ?? 'https://gabriel-sites.vercel.app';

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  vite: {
    // a mirante fica fora da raiz do projeto e é importada por caminho relativo
    server: { fs: { allow: ['.', '../../tools/mirante'] } },
  },
});

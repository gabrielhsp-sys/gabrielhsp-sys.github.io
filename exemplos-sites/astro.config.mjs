// @ts-check
import { defineConfig } from 'astro/config';

import { SITE_URL } from '../lib/site.ts';

// Os demos agora fazem parte do site GABRIEL.SYS (2026-11-19): mesma URL pública (a constante
// única de lib/site.ts, domínio ainda pendente de compra) e base /exemplos/sites/. O build da raiz
// (`npm run build`) junta dist/ ao out/ do Next (scripts/juntar-exemplos.mjs); os leads saem de
// dist/l/<slug>/ para out/para/<slug>/.
const site = SITE_URL;

export default defineConfig({
  site,
  base: '/exemplos/sites/',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  vite: {
    // lib/whatsapp.ts e lib/contato.ts vêm da raiz do repositório (gerador único do site)
    server: { fs: { allow: ['.', '../lib'] } },
  },
});

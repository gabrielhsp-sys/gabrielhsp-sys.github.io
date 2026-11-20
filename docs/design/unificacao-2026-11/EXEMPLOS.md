# Exemplos de sites no repositório (2026-11-19)

## Origem

Os sete demos e o demo de lead vêm de `~/Dev/projects/personal/demos-nichos`, commit
**`2e7a9f42fc72c0eb996110ebbf6e23a90a1aaa71`** (só os arquivos versionados; ver
`exemplos-sites/ORIGEM.md`). O projeto original não foi alterado. Prova:

    git -C ~/Dev/projects/personal/demos-nichos cat-file -e 2e7a9f42fc72c0eb996110ebbf6e23a90a1aaa71 && echo existe

## O que mudou na cópia

| Mudança | Por quê |
|---|---|
| `base: '/exemplos/sites/'` e `site` = `SITE_URL` de `lib/site.ts` | um domínio, um build (decisão 10) |
| `Foto.astro` e `Base.astro` prefixam fotos, cartão e canônico com o base | as fotos estavam em `/img/...` na raiz |
| lead `l/[slug]` com canônico `/para/<slug>/`; `scripts/juntar-exemplos.mjs` move `dist/l/` para `out/para/` | mapa do site: `/para/<slug>/` fora do menu |
| `src/lib/whatsapp.ts` usa `lib/whatsapp.ts` da raiz; `WHATSAPP_GABRIEL` vem de `lib/contato.ts` | um gerador e um número para o site inteiro; a cópia não leva a mirante (código com licença própria) |
| faixa: "Site de demonstração, negócio fictício — feito por GABRIEL.SYS"; o link "Portfólio" virou "Pedir orçamento" (`/orcamento/?precisa=site&origem=demo-<ramo>`) | nenhum demo se apresenta como trabalho para cliente; passo 6 do PLANO |
| removidos `pages/index.astro`, `pages/404.astro`, `data/home.ts` | a lista dos demos é `/exemplos/sites/` (Next) e o 404 é o do site |
| `scripts/verificar-*.mjs` e `cdp.mjs` **mantidos e adaptados** (o servidor local do `cdp.mjs` tira o base e mapeia `/para/` para `l/`; o `verificar-dist` confere a faixa nova e a ausência da home Astro) | rodam no `npm run check` da raiz (`exemplos:verificar`), ao lado de `scripts/verificar-saida.mjs`. Numa primeira versão desta branch eles tinham sido apagados; a revisão de código apontou que isso enfraquecia a verificação, e voltaram |
| teste da faixa (`src/lib/whatsapp.test.ts`) com o novo oráculo | a especificação da faixa mudou (orçamento no lugar do portfólio) |

Os depoimentos que aparecem dentro de alguns demos são dos negócios fictícios, como o resto do
conteúdo deles, e a faixa diz isso em todas as páginas. Não são depoimentos sobre o GABRIEL.SYS.

## Como rodar

    npm ci && npm run exemplos:instalar   # dependências travadas da raiz e de exemplos-sites
    npm run build                         # next build + astro build + junção em out/

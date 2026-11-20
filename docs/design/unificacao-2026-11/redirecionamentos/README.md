# Redirecionamentos dos endereços antigos

Estado em 2026-11-20: o site novo está no ar em `gabrielsys.com.br`; `github-pages/` é o que o
workflow `.github/workflows/deploy.yml` publica em `gabrielhsp-sys.github.io` (seção 1). Regerar, se o domínio ou o
mapa mudar: `node docs/design/unificacao-2026-11/redirecionamentos/gerar.mjs` (lê `SITE_URL` de
`lib/site.ts`).

Dentro do site novo, os endereços antigos são cobertos por `public/_redirects` (301 de verdade no
Cloudflare Pages), testados por `npm run test:cloudflare`.

## 1. `gabrielhsp-sys.github.io` (GitHub Pages) → `github-pages/`

O GitHub Pages não faz 301. Cada página leva ao endereço novo por `meta refresh` (sem JavaScript) e
por `location.replace` (com JavaScript, guardando `?origem=…` e `#…`), tem `rel=canonical` para o
novo e um link visível. O `404.html` mapeia no navegador qualquer outro caminho antigo
(`/projects/<x>/` → `/projetos/<x>/`, `/area/<x>/` → `/projetos/area/<x>/` etc.).

Passos (Gabriel, à mão, só depois do domínio novo responder):

1. Conferir que `https://gabrielsys.com.br/` abre o site novo.
2. Publicar o conteúdo de `github-pages/` no lugar do site atual do GitHub Pages. O jeito mais
   simples: trocar, numa branch, o passo de build de `.github/workflows/deploy.yml` por um que
   publique esta pasta (`path: docs/design/unificacao-2026-11/redirecionamentos/github-pages`), e
   só então fazer o merge na `main`. **Atenção:** enquanto o workflow atual existir, qualquer push
   na `main` publica o site inteiro no GitHub Pages.
3. Conferir: `curl -s https://gabrielhsp-sys.github.io/orcamento/ | grep -c 'http-equiv="refresh"'`
   deve dar 1, e o destino tem que ser `https://gabrielsys.com.br/orcamento/`.

Reversão: voltar o workflow ao commit anterior e publicar de novo.

## 2. `gabriel-sites.vercel.app` (Vercel) → `vercel/`

`vercel/vercel.json` faz 308 (permanente): `/` → `/exemplos/sites/`, `/<ramo>` →
`/exemplos/sites/<ramo>/`, `/l/<slug>` → `/para/<slug>/`, o resto → `/exemplos/sites/`.

Passos (Gabriel, à mão, com a Vercel logada, só depois do domínio novo responder):

1. Copiar a pasta `vercel/` para fora do repositório (ex.: `/tmp/gabriel-sites-redirect`).
2. Dentro dela, `vercel link` no projeto `gabriel-sites` (time `gabriel-bcc`) e `vercel deploy --prod`.
3. Conferir: `curl -sI https://gabriel-sites.vercel.app/alimentacao` → `308` e
   `location: https://gabrielsys.com.br/exemplos/sites/alimentacao/`.

Reversão: redeploy do `dist/` antigo dos demos, pelo procedimento do `RELATORIO.md` do
`demos-nichos`.

## 3. `tally.so/r/Eqd2ML`

O Tally não redireciona a URL do formulário. Com o `/material/` no ar, o formulário pode ser
fechado no Tally (com uma mensagem apontando para o WhatsApp) — decisão e ação do Gabriel.

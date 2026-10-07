# Plano verificável — auditoria geral 2026-10

Branch `auditoria-geral-2026-10`, criada de `main` em `36669cd` (igual a `origin/main` no
`git fetch` de 2026-10-06). Só commits locais; sem push, sem merge.

## Objetivo

O portfólio sai desta branch mais claro, mais polido e sem defeito conhecido, com cada achado da
auditoria terminando como commit, protótipo/proposta ou descarte justificado — e sem regredir
Lighthouse, contraste, teclado ou as decisões D-088 a D-101.

## Fora de escopo

- Aplicar paleta, tipografia ou marca nova ao site (vira protótipo em rota isolada).
- Reorganizar navegação, criar página pública nova, remover ou alterar recurso da camada de
  personalidade (vira proposta).
- Push, merge, deploy, mudança em outro repositório, dependência sem os 7 gates.
- Reabrir os temas já resolvidos: clique duplo e favicon (ADR-014), "v3" no texto, contraste do
  hardware-line (D-095), varredura de e-mail.

## Alegações e caminho de evidência

| # | Alegação | Rota escolhida | Alternativas descartadas |
|---|---|---|---|
| A1 | O site continua construindo, passando lint e testes | `npm run check` (lint + `node --test` + build + `verify-export.mjs`) com exit 0 em cada commit | CI do GitHub — exigiria push |
| A2 | Desempenho não regride | Lighthouse 13.5.0 (mobile e desktop) sobre `out/` servido localmente, mesmas rotas antes e depois, 3 execuções, mediana | PageSpeed Insights — mede o site publicado, não a branch |
| A3 | Acessibilidade não regride | Lighthouse a11y + axe-core 4.13.0 via Playwright em todas as rotas, antes e depois; contagem de violações | só leitura de código — não pega contraste calculado nem nome acessível |
| A4 | Contraste AA em texto e 3:1 em borda de componente | `contrast.py` do ecossistema sobre todos os pares de token usados, antes e depois | só axe — não cobre tokens que só aparecem em hover/estado |
| A5 | Nada quebrou na navegação | `tests/navigation.test.mjs` + varredura Playwright que clica em cada link interno do `out/` e confere status 200 e ausência de erro de console | teste manual — não é verificação |
| A6 | Busca, terminal, Konami e som funcionam como antes | roteiro Playwright: `Ctrl+K` abre/filtra/`Enter` navega/`Esc` devolve foco; crase abre terminal, `help`, `projetos`, `abrir <id>`; Konami liga/desliga `data-retro`; botão de som alterna `aria-pressed` e `localStorage` | inspeção de código — ADR-014 mostra que esses bugs só aparecem rodando |
| A7 | Sem estouro horizontal em 360/768/1280/1920 | Playwright: `scrollWidth <= innerWidth` por rota e largura | captura e olho — "revisei visualmente" não é verificação |
| A8 | `prefers-reduced-motion` desliga movimento não essencial | Playwright com `reducedMotion: 'reduce'`: boot não monta, `getAnimations()` vazio após carga, vídeo vira só poster | — |
| A9 | Protótipo isolado | `verify-export.mjs` ganha checagem: rota do protótipo com `noindex`, fora do sitemap, da busca e de qualquer `href` do site | só `robots` no metadata — não prova que nenhuma página linka |
| A10 | Vídeos dentro dos limites | `ls -l` ≤ ~5 MB por arquivo; `<video>` com `muted`, `playsinline`, `poster`, `preload="none"`, controle de pausa, carga por `IntersectionObserver`; Playwright confirma que o `src` só é atribuído ao entrar na tela | — |
| A11 | Texto sem fato inventado | cada frase nova de texto/vídeo cita a fonte (README ou arquivo do projeto) no relatório | — |
| A12 | A branch faz o que o prompt pediu | `pocock-code-review` desde `main` (eixos Padrões e Spec) | auto-avaliação |

## Passos

| # | Passo | Arquivos | Tipo | Verificação | Reversão |
|---|---|---|---|---|---|
| 1 | Branch + este plano | `docs/audits/2026-10-auditoria-geral/PLANO.md` | comando | `git branch --show-current` = `auditoria-geral-2026-10` | `git switch main && git branch -D auditoria-geral-2026-10` |
| 2 | Baseline: capturas "antes", Lighthouse, axe, contraste, audit-ui.sh | `docs/audits/.../capturas/antes/`, `.../medidas/antes.json` | observador | arquivos gerados a partir do build de `36669cd` | apagar a pasta |
| 3 | Auditoria escrita, achado a achado | `.../ACHADOS.md` | manual (julgamento de design) + observador | cada achado tem onde, evidência, impacto, esforço, destino | — |
| 4 | Referências | `.../REFERENCIAS.md` | manual | cada referência tem princípio, o que não trazer e licença | — |
| 5 | Lotes de implementação | `app/`, `components/`, `lib/`, `tests/` | teste + build | `npm run check` exit 0 antes de cada commit | `git revert <sha>` |
| 6 | Protótipos de identidade | rota isolada + checagem no `verify-export.mjs` | comando + manual | A9; abre em `npm run dev` | `git revert` |
| 7 | Vídeos | `public/videos/` (≤ 5 MB) ou pasta ignorada | arquivo-existe + observador | A10 | apagar arquivos e o componente |
| 8 | Regressão e medidas "depois" | — | teste + observador | A1–A8 | — |
| 9 | Revisão e relatório | `.../RELATORIO.md` | manual | `pocock-code-review` | — |

## Afordâncias criadas

| Afordância | Ciclo de vida | Remoção |
|---|---|---|
| Scripts de medição (Playwright/Lighthouse) no scratchpad da sessão | temporária, fora do repo | some com o scratchpad |
| Checagem do protótipo isolado em `scripts/verify-export.mjs` | permanente enquanto a rota existir | sai junto com a rota |

## Suposições

- Lighthouse local em `out/` servido por `python3 -m http.server` é comparável antes × depois, não
  com o site publicado (sem CDN, sem HTTP/2). Os números valem como comparação, não como absoluto.
- As ferramentas usadas (Lighthouse, Playwright, axe) já estão instaladas em
  `~/Dev/projects/personal/movimente-se-site/node_modules` e são só executadas daqui, sem alterar
  aquele repositório nem instalar nada.

## Riscos / irreversíveis

Nenhum passo desta sessão é irreversível: nada é publicado, nada sai da máquina.

# Achados da auditoria — 2026-10

Auditoria feita sobre o build de `main` em `36669cd`, servido localmente a partir de `out/`.
Ferramentas: Playwright 1.63.0 + axe-core 4.13.0 (13 rotas × 360/768/1280/1920 px, com e sem
`prefers-reduced-motion`), Lighthouse 13.5.0 (6 rotas × mobile/desktop × 3 execuções, mediana),
`workflows/ui/audit-ui.sh` e `contrast.py` do ecossistema, e leitura do código com os catálogos de
`kc1t-ui-audit` (SLOP.md, 67 detectores), `web-design-guidelines` (Vercel), `vercel-react-best-practices`,
`break-ui` (conteúdo no pior caso, montado numa cópia descartável do repo), `mobile-native`,
`emil-design-eng`, `apple-design`, `find-animation-opportunities` e `improve-animations`.

**Destino** de cada achado: **I** = implementável (entra nesta branch), **G** = grande (vira
protótipo ou proposta), **D** = descartado, com motivo. Critério de grande: muda identidade, reorganiza
páginas ou navegação, adiciona página, mexe em recurso da camada de personalidade, ou contraria
decisão vigente.

Impacto: **A** alto, **M** médio, **B** baixo. Esforço: **P** pequeno, **M** médio, **G** grande.

## O que já estava bom (medido, não suposto)

- Nenhuma rota com estouro horizontal em 360/768/1280/1920 px.
- Nenhum erro de console; todos os 12 destinos internos respondem 200.
- Nenhum texto abaixo de 11 px; nenhum alvo interativo abaixo de 24 px fora de frase.
- Lighthouse acessibilidade 100 e boas práticas 100 em todas as rotas; SEO 100 (o 404 tem 66 por
  `noindex`, o que é correto).
- Todo par de texto do sistema passa AA (pior caso `#9b9487` sobre `#201d19`, 5,58:1).
- Busca, terminal, Konami, som, conquistas e clique único (ADR-014) funcionam: roteiro Playwright
  em `medidas/antes/report.json`.
- `prefers-reduced-motion`: nenhuma animação rodando depois da carga em nenhuma rota.
- `/orcamento` existe e já está fora da navegação, do sitemap e da busca, com `noindex`
  (`scripts/verify-export.mjs`). Nada foi mudado nela.
- Clichês de IA: zero. Gradientes e blur são textura de fundo, CRT do modo retrô e camadas
  sobrepostas; "depoimentos" aparece só como pergunta do briefing.

## Primeira impressão em 5 segundos (crítica, declarada como julgamento)

Fica claro **quem** (linha de apresentação), **o quê** (tese grande e parágrafo com a stack real) e
**como contratar** (botão âmbar "Falar comigo" e "Disponível para estágio"). O que falta é **prova
visual** acima da dobra: no desktop a metade direita do hero é vazia (a 1920 px, mais da metade da
tela), e o primeiro projeto real só aparece depois de rolar uma tela inteira. Os quatro estudos de
caso têm o mesmo peso — o `DESIGN.md` pede "um único projeto ou ação liderando cada superfície", e a
grade 2 × 2 de cards iguais contradiz a própria regra "não estruture o conteúdo como grade de cards
iguais".

## Achados priorizados

Ordem: impacto ÷ esforço. Cada linha diz onde, a evidência e o destino.

| # | Eixo | Onde | Evidência | Imp. | Esf. | Destino |
|---|---|---|---|---|---|---|
| 1 | SEO / compartilhamento | `app/projects/[slug]/page.tsx:31`, `app/about/page.tsx:10`, `app/archive/page.tsx:8`, `app/area/[area]/page.tsx:22` | O `openGraph` da página substitui o do layout sem mesclar: `out/projects/telegram-offers/index.html` não tem `og:image`, `og:site_name` nem `og:locale`, e o `twitter:title` continua o título da home | A | P | **I** |
| 2 | SEO / texto | `scripts/generate-og-image.mjs:16` → `public/og.png` | O cartão de compartilhamento diz "Projetos, estudos, **homelab, hardware** e registros" — homelab saiu do público em D-090. Também não traz o nome, a tese nem a disponibilidade | A | P | **I** |
| 3 | SEO / compartilhamento | estudos de caso | Todo link compartilhado mostra o mesmo cartão genérico; um estudo de caso não tem cartão próprio com título e resumo | A | M | **I** |
| 4 | Hierarquia | `app/page.tsx:83`, `app/globals.css:748` | Quatro cards idênticos em 2 × 2; o primeiro do `featuredRank` não lidera. Contradiz `DESIGN.md` ("Do deixe um único projeto liderar"; "Don't grade de cards iguais") | A | M | **I** |
| 5 | Texto / bug | `app/page.tsx:80` | "Quatro estudos de caso" está escrito à mão; com 5 destaques (fixture do pior caso) a frase mente | M | P | **I** |
| 6 | Mobile | `app/layout.tsx` | Sem `theme-color`, sem `viewport-fit=cover`; dock, terminal e toast fixos sem `env(safe-area-inset-bottom)` — o dock fica sob o indicador do iPhone | M | P | **I** |
| 7 | Mobile / bug | `app/globals.css:327` (filtro do arquivo, 15,2 px), `:595` (terminal, 12 px) | iOS dá zoom em campo abaixo de 16 px e não volta | M | P | **I** |
| 8 | Mobile / microinteração | `app/globals.css` (≈40 regras `:hover`) | Hover sem `(hover: hover) and (pointer: fine)`: no toque o título do card fica âmbar "preso" depois do tap. Sem `-webkit-tap-highlight-color`, sem `touch-action: manipulation` | M | M | **I** |
| 9 | Microinteração | botões e links de ação | Nenhum `:active`: o botão não responde ao aperto, só à soltura | M | P | **I** |
| 10 | Acessibilidade | `.prose pre` em `telegram-offers` e `fedora-post-install` | axe `scrollable-region-focusable` (serious) a 360 px: bloco de código rolável que o teclado não alcança | M | P | **I** |
| 11 | Acessibilidade | ícones Phosphor | 33 `<svg>` decorativos sem `aria-hidden` só na home (o rótulo já está no texto vizinho) | B | P | **I** |
| 12 | Desempenho | `app/layout.tsx:2-4` | A fonte do LCP (h1 do hero, Bricolage) não tem `preload`; Lighthouse mobile: LCP 5,05 s, `render-blocking` 960 ms. As fontes vêm do CSS do fontsource, sem métrica de fallback | M | M | **I** |
| 13 | Movimento | `app/globals.css:549` | A busca abre com `translateY + scale + blur` em 220 ms; ela é aberta por atalho de teclado (Ctrl/⌘ K) — regra de frequência: atalho não anima | M | P | **I** |
| 14 | Movimento | `app/globals.css:584` | Terminal entra em 340 ms (> 300 ms de UI) | B | P | **I** |
| 15 | Movimento / coesão | `app/globals.css` | A mesma curva `cubic-bezier(.16, 1, .3, 1)` digitada em 5 lugares, sem token; `@keyframes save-written` sem uso | B | P | **I** |
| 16 | Movimento | `components/personality.tsx`, toast | A conquista entra subindo e some de uma vez, sem saída | B | P | **I** |
| 17 | Microinteração | `components/contact-actions.tsx:24` | "copiar e-mail": o ícone troca de Copy para Check sem transição | B | P | **I** |
| 18 | Microinteração | card de estudo de caso, linha do arquivo | O card inteiro é clicável, mas o hover só muda a cor do título; a seta da linha do arquivo não responde | M | P | **I** |
| 19 | Consistência | `components/archive-line.tsx:31` | A linha do arquivo usa `ArrowUpRight` (↗, link externo) para link interno; o índice `01` fica centralizado na vertical e desalinha do título | B | P | **I** |
| 20 | Usabilidade | `components/archive-explorer.tsx` | Filtros do arquivo não vão para a URL: não dá para mandar "só os projetos web no ar" para alguém, e o voltar do navegador perde o filtro | M | M | **I** |
| 21 | Usabilidade | estudo de caso a ≥ 1280 px | Texto de 72ch encostado à esquerda, metade direita vazia; sem índice das seções (problema → o que eu fiz → stack → resultado) | M | M | **I** |
| 22 | Texto | `components/system-chrome.tsx:608`, `app/not-found.tsx:41` | O atalho aparece como "Ctrl K" também no Mac, onde é ⌘ K | B | P | **I** |
| 23 | Usabilidade | `app/about/page.tsx` | A página "Sobre" termina sem caminho para os projetos; "mandar um e-mail" usa a seta de link externo | B | P | **I** |
| 24 | Pior caso | `.facts` a 360 px | Período longo ("JAN 2024 – SET 2026") quebra no meio | B | P | **I** |
| 25 | SEO | `app/layout.tsx`, `app/page.tsx` | Sem dados estruturados (`Person`, `WebSite`): o buscador não liga nome, GitHub, LinkedIn e site | M | P | **I** |
| 26 | Acessibilidade | `app/globals.css` | Âncoras (`#projetos`, `#contato`) sem `scroll-padding-top` sob a barra fixa de 72 px | B | P | **I** |
| 27 | Acessibilidade | camadas com `backdrop-filter` | Sem `prefers-reduced-transparency` | B | P | **I** |
| 28 | Acessibilidade | marca e nomes de projeto | Sem `translate="no"`: tradutor automático mexe em "GABRIEL.SYS" | B | P | **I** |
| 29 | Hierarquia / impacto | hero, primeira dobra no desktop | Metade direita vazia; nenhum projeto acima da dobra. Mudar a primeira dobra contraria `docs/design/HOME.md` ("hero de coluna única") | A | M | **G** → protótipo |
| 30 | Identidade | paleta, tipografia, marca | Pedido da sessão: 2–3 direções navegáveis | A | G | **G** → protótipo |
| 31 | Navegação | trilho e dock | Não há "Contato" na navegação principal; o caminho é o botão do hero, o fim do estudo de caso e o fim da home. Adicionar item reorganiza a navegação | M | P | **G** → proposta |
| 32 | Vídeo | estudos de caso | Nenhum estudo de caso mostra o projeto em movimento | M | G | tarefa 6 (Hyperframes) |
| 33 | Texto | `app/page.tsx:150` | "Isso virou curso, virou homelab…" — o homelab é fato da história dele, mas não existe no público (D-090). Não é invenção; é decisão de voz | B | P | **D** → "Precisa do Gabriel" |
| 34 | Texto | `components/system-chrome.tsx:492` (`kernel`) | "uptime ... desde 2023" não tem fonte no repo. Está na camada de personalidade: mudar é grande | B | P | **G** → "Precisa do Gabriel" |
| 35 | Desempenho | `components/system-chrome.tsx:201-279` | O ouvinte global de teclado é recriado a cada tecla na busca. TBT medido 0–27 ms; mexer no teclado global tem risco de regressão (ADR-014) maior que o ganho | B | M | **D** |
| 36 | Desempenho | `components/snake.tsx` | Snake entra no bundle de toda página (≈2 KB gz). Ganho pequeno demais para `next/dynamic` | B | P | **D** |
| 37 | SEO | `/404.html` | SEO 66 por `noindex` — correto para 404 | — | — | **D** |
| 38 | Pior caso | títulos de 7 linhas a 360 px | Só com título de 100+ caracteres, que nenhum registro tem; continua legível | B | P | **D** |
| 39 | Desempenho | "document latency", "cache", compressão | Artefatos do `http.server` local (sem gzip, sem cache); o GitHub Pages comprime e cacheia | — | — | **D** (fora do controle do repo) |

## Movimento — oportunidades que passaram no filtro

Gate de `find-animation-opportunities` (frequência → propósito → duração → função):

| # | Onde | Propósito | Frequência | Movimento |
|---|---|---|---|---|
| a | botões e links de ação | feedback | dezenas por visita | `:active { transform: scale(.97) }`, 140 ms `--ease-out` |
| b | card de estudo de caso | feedback / affordance | ocasional | borda clareia e a seta de "ler o estudo de caso" anda 3 px, 200 ms, só com hover fino |
| c | copiar e-mail | indicação de estado | rara | crossfade do ícone com `blur(2px)`, 180 ms |
| d | toast de conquista | consistência espacial | rara | sai pelo mesmo caminho que entrou, 200 ms |
| e | vídeo dos estudos de caso | evitar troca brusca | ocasional | pôster → vídeo em `opacity` 240 ms |

Rejeitados: abertura da busca (atalho de teclado — reduzida a opacidade, ver #13); entrada em
cascata das seções da home (a animação de entrada é a única introdução, D-091); filtro do arquivo
(lista que a pessoa está lendo — movimento atrapalha); troca de rota (navegação frequente).

## Deriva do sistema (`DESIGN.md` × código)

- A home usa grade 2 × 2 de cards iguais, que o próprio `DESIGN.md` veta (#4).
- `.error-message` usa `#f09c8d`, fora da paleta documentada (vermelho clareado para texto).
- O botão sólido em hover usa `#ffc35c`, fora da paleta.
- O terminal usa uma rampa verde própria (`#090b09`, `#abc5ad`, `#d4e4d5`, `#748574`, `#364037`) não
  documentada. É camada de personalidade.

Os três últimos foram registrados no `DESIGN.md` (lote de documentação), sem mudar cor nenhuma.

## Não coberto

- Aparelho real: tap highlight, hover preso, zoom do iOS e área segura foram corrigidos por código e
  conferidos no Chromium com `hasTouch`; a sensação no telefone precisa do Gabriel.
- Leitor de tela real (NVDA/VoiceOver): só axe e leitura de código.
- Lighthouse do site publicado (só local, comparando antes × depois).

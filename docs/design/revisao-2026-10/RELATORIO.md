# Revisão 2026-10 — home com imagem, cortes, fluidez e UX

Branch `home-imagem-2026-10`, saída da `main` (`8512231`). A home com vídeo ficou na tag
local `home-video-arquivo-2026-10` (`e06bf6d`, branch `home-cinematica-2026-10`, intocada).
Ela tinha 441 quadros re-encodados sem commit; estão guardados em `git stash` com a mensagem
"home-cinematica-2026-10: quadros public/cine re-encodados…". Nada foi publicado.

Tudo foi medido no export de produção (`npm run build` + `out/` servido com gzip por
[`scripts/serve-out.mjs`](../../../scripts/serve-out.mjs), antes `medidas/gz-server.mjs`), nunca no `next dev`. "Antes" é a `main`;
"depois" é o `HEAD` desta branch. Os scripts estão em [`medidas/`](medidas/) e rodam de novo
com Playwright, Lighthouse e axe executados de `movimente-se-site/node_modules` (D-129, então em aberto;
desde a §8 eles são devDependencies daqui).

## 1. Etapa 1 — a home com imagem

Detalhes, comparações e contraste: [`../home-imagem/README.md`](../home-imagem/README.md).

- `npm run imagens` gera AVIF (q88, 4:4:4) e WebP (q95) em 1280/1920/2560/3840 e um recorte em
  retrato (550/825/1100) com a faixa do notebook, para celular em pé. **1920: 192 KB AVIF,
  276 KB WebP** (alvo ≤ 500 KB). A imagem já vinha ampliada; o script só reduz e codifica.
- Sem bloco nem faixa no escuro: recortes escuros com os escuros esticados 4× e zoom 2× contra a
  referência sem perda, em [`../home-imagem/comparacao-*.jpg`](../home-imagem/).
- Da cinemática vieram só o hero (tese + cartão "Estudos de caso" + botões) e o "Eu gosto do que
  acontece por baixo da interface." com as frases acendendo. Sem vídeo, quadros, `public/cine`,
  Lenis ou atos 2–4. A imagem fica presa atrás das duas seções, dentro de um trilho com a altura
  delas, e apaga enquanto o fim do "Sobre" sobe. O acender das frases e o apagar da imagem são CSS
  ligado à rolagem (`animation-timeline`, no compositor, zero JS); sem suporte (Firefox) ou com
  movimento reduzido, fica tudo parado e legível.
- LCP: `<img fetchpriority="high">` no HTML com largura e altura. O `<link rel=preload>` foi
  tirado depois de medir: o Next pré-carrega a rota da home a partir do link "Início" de toda página
  e o preload ia junto — o arquivo e os estudos de caso baixavam a imagem (Lighthouse celular do
  arquivo caiu para 65 em duas de três execuções). CLS da imagem: zero (camada absoluta).
- Celular: recorte próprio + `object-position`; o notebook e a bancada aparecem inteiros quando o
  "Sobre" entra ([`capturas/depois/home/390-2-bancada.jpg`](capturas/depois/home/390-2-bancada.jpg)).
- Contraste medido pixel a pixel atrás de cada texto (percentil 98 do fundo): nenhuma falha nas
  quatro larguras e três pontos de rolagem, menor folga 1,22× o mínimo AA. O véu foi baixado até
  esse limite: hero 0,90 → 0,84 (deitado) e 0,62–0,70 (em pé, era 0,88); "Sobre" 0,74 → 0,64
  (0,55 já falhava).

## 2. Etapa 2 — auditoria (antes de mexer)

### a) O corte ao rolar — causa

**Causa real:** a barra do topo é `sticky`, tem 72 px e é 94 % opaca com blur; ela fica sobre a
página o tempo todo. A roda do mouse anda 100 px por entalhe e os títulos de seção têm 55–75 px de
altura (`clamp(2rem, 4vw, 4.6rem)`), então **cada título passa uma parada da roda atravessado pela
borda de baixo da barra**. Não era âncora: `scroll-padding-top: 88px` já deixava "Ver os projetos"
e "Falar comigo" com o título 139–156 px abaixo da barra. Não havia Lenis nem scroll-snap na `main`.

Medido por [`medidas/roda.mjs`](medidas/roda.mjs) (eventos reais de wheel, 100 px, título com
mais de 6 px escondidos e mais de 6 px visíveis = cortado):

| Rota | 1440 | 1920 | 1366 | 390 |
|---|---|---|---|---|
| home, antes | 22 % das paradas | 21 % | 22 % | 5 % |
| home, depois | **0 %** | **0 %** | **0 %** | **0 %** |
| sobre / arquivo / estudo de caso, antes | 11 / 11 / 5 % | 0 / 0 / 5 % | 10 / 10 / 5 % | 6 / 0 / 2 % |
| sobre / arquivo / estudo de caso, depois | 0 / 0 / 0 % | 0 / 0 / 0 % | 0 / 0 / 0 % | 0 / 0 / 0 % |

Prova, rolando com a roda até "Projetos em destaque" passar pela altura da barra:
[antes](capturas/antes/corte/roda-1366-descendo.jpg) (título pela metade) ·
[depois](capturas/depois/corte/roda-1366-descendo.jpg) (barra recolhida, título inteiro) ·
[depois, um entalhe para cima](capturas/depois/corte/roda-1366-subindo.jpg) (a barra volta).

### a) Varredura de tamanhos e cortes, todas as páginas

14 rotas × 1440×900, 1920×1080, 1366×768 e 390×844 ([`medidas/capturas.mjs`](medidas/capturas.mjs),
capturas em [`capturas/antes/`](capturas/antes/) e [`capturas/depois/`](capturas/depois/),
página inteira da home, sobre, arquivo e um estudo de caso em 1440 e 390). Sem scroll horizontal,
sem texto abaixo de 11 px, sem sobreposição de texto em nenhuma combinação. Achados:

| # | Sev. | Achado | Estado |
|---|---|---|---|
| A1 | alta | Título cortado pela barra ao rolar (acima) | corrigido |
| A2 | média | Celular: o foco do Tab parava embaixo do dock de 74 px (2–4 links por página; WCAG 2.4.11) | corrigido |
| A3 | média | Pior caso ([`medidas/pior-caso.mjs`](medidas/pior-caso.mjs)): palavra longa sem espaço vazava do cartão do hero, dos cards, da linha do arquivo (celular), de "próximo estudo" e dos relacionados | corrigido |
| A4 | média | 1366–1440: título do card líder com o mesmo tamanho do h2 da seção (57,6 px = 57,6 px) | corrigido |
| A5 | média | Celular, arquivo: os filtros quebravam em 4 linhas e o primeiro projeto começava a 545 px | corrigido |
| A6 | baixa | 404 sem h1 (axe `page-has-heading-one`) | corrigido |
| A7 | baixa | Campo do filtro só trocava a borda de 1 px no foco; DESIGN.md promete o anel global | corrigido |
| A8 | baixa | Sobre, 390: a foto passa 145 px da moldura | não é defeito: recorte intencional (`overflow: hidden`) |

Depois: os únicos avisos do detector são esperados — texto `sr-only` (orçamento e 404), a foto
recortada do Sobre e os chips do arquivo que continuam além da borda na linha que rola de lado
([`capturas/depois/layout.json`](capturas/depois/layout.json)).

### b) Desempenho e fluidez — medido antes de mexer

Na `main` não havia problema de fluidez: rolando 4000 px com a CPU 4× mais lenta, p95 do quadro
de 17 ms e nenhum quadro acima de 34 ms em nenhuma página; nenhuma long task durante a rolagem. A
única long task é a hidratação (110–125 ms a 4×), antes da interação. JS: 162–168 KB gzip, dos
quais ~155 KB são React, Next e o runtime; o código do site é ~33 KB gzip. Fontes: 70 KB (Bricolage
41 KB, Plex Mono 400 e 600, 30 KB). Nada a cortar ali sem trocar identidade ou framework. A nova
home acrescenta a imagem (o LCP passa a ser ela) — a tabela abaixo mostra o custo e a justificativa.

### c) UX/UI — "um recrutador entende em 10 s quem é o Gabriel, o que ele faz e como falar com ele?"

Julgamento, declarado como julgamento (kc1t-ui-audit, mobile-native, break-ui):

- **O que faz:** sim, a tese, o parágrafo da stack e o cartão de estudos de caso estão na primeira
  tela em todas as larguras.
- **Como falar com ele:** sim, "Falar comigo" está na primeira tela (também no celular), mas leva ao
  fim da página; o e-mail em si só aparece lá → **proposta 1**.
- **Quem é:** era o ponto fraco. O nome estava num rótulo mono de 11 px em caixa-alta, o menor texto
  da tela → **corrigido** (C1): o nome sai na fonte do texto, 18 px, marfim.
- Celular: o cartão do hero repete os quatro cards de "Projetos em destaque" logo abaixo e empurra o
  "Sobre" para longe → **proposta 2**.
- Deriva do sistema (DESIGN.md como régua): ~20 tamanhos de texto de corpo entre .82 e 1.3rem fora da
  escala; raios de 4, 6, 7 e 9 px fora de 3/5/8/13; dez cores fora da paleta documentada
  (`#6f675b`, `#494238`, `#3f3931`, `#4c3314`, `#241f19`, `#0a0908`, `#0f0d0b`, `#111511`,
  `#aeb8ae`, `#5f7a60`) → **proposta 3** (mexe no sistema inteiro, por isso não foi aplicado).
- Mobile-native: base sólida (tap highlight, `touch-action`, hover só com ponteiro fino, input de
  16 px, safe areas, `svh`). Faltava resposta ao toque nas linhas do cartão do hero → corrigido.
- Movimento: uma curva só, tudo abaixo de 300 ms, reduced-motion respeitado. A barra nova usa a
  mesma curva, 280 ms, só `transform`.

## 3. Etapa 3 — o que foi implementado, por impacto

| Commit | Assunto |
|---|---|
| `9ade04a` `0e9f079` | pipeline da imagem; recorte em retrato só com a faixa do notebook |
| `caf346a` `c07c418` | hero e "Sobre" sobre a imagem; sem o preload que vazava para as outras páginas |
| `1b7b36d` `5388d7b` | **o corte:** a barra recolhe ao rolar para baixo e volta no primeiro gesto para cima, no topo e com foco dentro dela; os filtros fixos do arquivo grudam no topo junto (só o `top` do sticky muda, para não mexer neles enquanto estão no fluxo) |
| `e8fd68f` | o nome em destaque no hero; resposta ao toque no cartão |
| `8641515` | foco acima do dock (`scroll-padding-bottom`), anel no filtro, h1 no 404 |
| `9e48ea0` `23ebf66` | pior caso: títulos quebram em vez de vazar; card líder abaixo do h2 |
| `f74b1d2` | celular: grupos de filtro numa linha que rola de lado |
| `76482ea` | o Ctrl do Ctrl+K criava o AudioContext sem gesto válido e o Chrome avisava no console; o som continua ligado por padrão (D-092) |
| `44517b6` `5c4e39f` | DESIGN.md, HOME.md e ADR-022 (registra o que muda na ADR-006 e na ADR-015) |

A barra que recolhe muda o comportamento de uma peça do chrome. Ficou implementada porque é a
correção do corte e não troca identidade nem estrutura, mas a escolha é sua: se preferir a barra
sempre fixa, `git revert 1b7b36d 5388d7b` volta ao comportamento antigo (e o corte volta).
O recorte em retrato também foi além do pedido (que era `object-position`): ele existe pelo LCP do
celular e continua usando `object-position`.

## 4. Métricas antes → depois

### Lighthouse 13.5 (mediana de 3; celular = Moto G simulado em 4G lento)

| Página | Perfil | Desempenho | LCP | TBT | CLS | Peso |
|---|---|---|---|---|---|---|
| home | desktop | 100 → 99 | 0,55 → 0,68 s | 0 → 0 ms | 0,002 → 0,010 | 274 → 500 KB |
| home | celular | 97 → 94 | 2,65 → 3,00 s | 51 → 32 ms | 0,004 → 0,004 | 274 → 396 KB |
| arquivo | desktop | 100 → 100 | 0,60 → 0,56 s | 25 → 0 ms | 0,003 → 0,003 | 303 → 306 KB |
| arquivo | celular | 96 → 97 | 2,71 → 2,52 s | 105 → 32 ms | 0,004 → 0,004 | 287 → 294 KB |
| estudo de caso | desktop | 100 → 100 | 0,62 → 0,55 s | 29 → 0 ms | 0,002 → 0,002 | 300 → 303 KB |
| estudo de caso | celular | 96 → 97 | 2,69 → 2,66 s | 91 → 60 ms | 0,004 → 0,004 | 284 → 286 KB |
| sobre | desktop | 100 → 100 | 0,57 → 0,58 s | 0 → 0 ms | 0,009 → 0,009 | 420 → 423 KB |
| sobre | celular | 96 → 96 | 2,73 → 2,73 s | 26 → 27 ms | 0,004 → 0,004 | 420 → 423 KB |

Acessibilidade, boas práticas e SEO: 100 nos dois lados, nas oito linhas. Brutos:
[`medidas/antes-lighthouse.md`](medidas/antes-lighthouse.md),
[`medidas/etapa1-lighthouse.md`](medidas/etapa1-lighthouse.md) (home só com a etapa 1, recorte largo:
celular 92, LCP 3,30 s), [`medidas/depois-lighthouse.md`](medidas/depois-lighthouse.md).

**O que piorou, e por quê (só na home):** o LCP passou de texto para a imagem que o Gabriel pediu.
No celular simulado (1,6 Mbps) os 94 KB do AVIF somam +0,35 s; no desktop, +0,13 s. Foi o mínimo
sem abrir mão do critério de qualidade ("priorize qualidade e informe"): o recorte estreito tirou
0,30 s, e baixar o AVIF de q88 para q82 tiraria mais ~0,15 s ao custo das manchas na estante que as
comparações mostram. O CLS de desktop (0,010, "bom" é < 0,1) vem da troca de fonte no Chrome do
Lighthouse: com a fonte de fallback a coluna do texto quebra diferente e o cartão, centralizado na
linha, recentraliza. Com a fonte em cache (preload do next/font), não acontece.

### Laboratório com a CPU 4× mais lenta ([`medidas/vitais.mjs`](medidas/vitais.mjs), mediana de 3)

INP aproximado = maior interação entre abrir a busca, digitar, fechar e ligar o som. Fluidez =
quadros durante 4000 px de rolagem (roda no desktop, gesto de toque no celular).

| Largura e rota | LCP (elemento) | CLS | TBT | Maior long task | INP aprox. | Quadro p95 / > 34 ms | Imagens |
|---|---|---|---|---|---|---|---|
| 1440 home | 172 → 180 ms (h1 → img) | 0 → 0 | 0 → 75 ms | 111 → 125 ms | 56 → 56 ms | 17 → 17 ms / 0 → 0 | 0.5 → 192.2 KB |
| 1440 sobre | 132 → 132 ms (p → p) | 0 → 0 | 0 → 0 ms | 121 → 119 ms | 40 → 48 ms | 17 → 17 ms / 0 → 0 | 150.5 → 150.5 KB |
| 1440 arquivo | 140 → 148 ms (h1 → h1) | 0 → 0 | 0 → 0 ms | 119 → 121 ms | 48 → 48 ms | 17 → 17 ms / 0 → 0 | 0.5 → 0.5 KB |
| 1440 caso-telegram | 148 → 148 ms (p → p) | 0 → 0 | 71 → 0 ms | 123 → 120 ms | 48 → 48 ms | 17 → 17 ms / 0 → 0 | 17.2 → 17.2 KB |
| 390 home | 172 → 196 ms (p → img) | 0 → 0 | 0 → 0 ms | 121 → 125 ms | 40 → 40 ms | 17 → 17 ms / 0 → 0 | 0.5 → 140.5 KB |
| 390 sobre | 156 → 128 ms (img → img) | 0 → 0 | 66 → 71 ms | 118 → 121 ms | 40 → 40 ms | 17 → 17 ms / 0 → 0 | 150.5 → 150.5 KB |
| 390 arquivo | 136 → 128 ms (p → p) | 0 → 0 | 0 → 0 ms | 116 → 123 ms | 40 → 40 ms | 17 → 17 ms / 0 → 0 | 0.5 → 0.5 KB |
| 390 caso-telegram | 192 → 156 ms (p → p) | 0 → 0 | 0 → 0 ms | 113 → 125 ms | 40 → 40 ms | 17 → 17 ms / 0 → 0 | 0.5 → 0.5 KB |

TBT de 75 ms na home a 1440: a hidratação (uma tarefa de 125 ms) caiu depois do FCP nesta mediana;
no Lighthouse a TBT da home não piorou (0 → 0 desktop, 51 → 32 celular). Rolagem igual: 60 fps,
nenhum quadro longo. HTML da home: 11,2 → 13,0 KB gzip; CSS 12,0 → 13,3 KB.

### Corte, teclado, console

- Títulos cortados ao rolar: tabela da seção 2a — 0 % em todas as rotas e larguras medidas.
- Tab por home, sobre, arquivo e estudo de caso ([`medidas/teclado.mjs`](medidas/teclado.mjs),
  esperando a rolagem suave chegar): todo foco visível (o campo do filtro mostra o anel no
  contêiner); encobertos pelo dock no celular: antes 4 + 2 + 2 + 0, depois **0**. Primeiro link do
  conteúdo no Tab 10 (desktop, depois do trilho; o "Pular para o conteúdo" é o Tab 1) e 4 (celular).
- axe 4.13 em 1440 e 390, 14 rotas: antes 1 violação (404 sem h1), depois **0**.
- Console: zero erro e zero aviso de hidratação em 56 combinações de rota × largura, antes e
  depois. O único aviso visto (AudioContext no Ctrl+K) foi corrigido.

## 5. Verificação

No `HEAD` (`5c4e39f`):

```text
$ npm run lint
> eslint .
lint exit 0
$ npm test
# tests 14
# pass 14
# fail 0
test exit 0
$ npm run build
✓ Generating static pages using 15 workers (21/21) in 836ms
export: 3 areas, 6 registros
build exit 0
```

Revisão em dois eixos (pocock-code-review, subagentes separados) contra a `main`. Corrigidos:
os filtros do arquivo subiam 72 px também no celular e antes de grudar (`5388d7b`); ADR-006 e
ADR-015 contrariadas sem registro (`5c4e39f`, ADR-022); sombra do cartão fora do vocabulário e
"no ar agora" (estado que o site não mede) (`5c4e39f`); `contraste.txt` medido de novo com o nome.
Mantidos, como julgamento: `transition: … .2s ease` em cores (o arquivo inteiro já usa assim);
o efeito da barra dentro de `SiteChrome` em vez de um hook próprio; a altura 72 repetida no CSS e
no JS (já era assim no `scroll-padding-top`); os bytes por variante em `lib/hero-image.json`
(documentam o peso, o código não lê). Os commits de a11y e de layout juntam correções do mesmo
assunto (três de acessibilidade, dois de pior caso).
[`medidas/verificacao.mjs`](medidas/verificacao.mjs) → [`medidas/depois-verificacao.json`](medidas/depois-verificacao.json):

- animação de entrada aparece, some sozinha e pula com tecla; com reduced-motion não roda;
- reduced-motion: frases do "Sobre" e imagem sem animação, barra sem transição;
- Ctrl+K abre a busca, acha "telegram" e fecha com Esc; a crase abre o terminal, `help` responde e
  `snake` roda; o Konami liga o modo retrô e o CRT; o botão de som alterna; Web Audio presente;
- sem JS, a home tem h1, as quatro frases, a imagem e os quatro cards.

## 6. Propostas para o Gabriel

Não implementadas: mudam a estrutura da página ou o sistema. Mockups injetados só na captura
([`medidas/propostas.mjs`](medidas/propostas.mjs)).

1. **E-mail à vista no hero.** "ou escreva direto: gabrielhspereira36@gmail.com · copiar" abaixo
   dos botões. Hoje "Falar comigo" leva ao fim da página; o recrutador copiaria o e-mail sem rolar.
   [1440](propostas/p1-email-no-hero-1440.jpg) · [390](propostas/p1-email-no-hero-390.jpg)
2. **Celular sem o cartão "Estudos de caso" no hero.** Ele repete os quatro cards que vêm logo
   depois; sem ele, a bancada aparece entre os botões e o "Sobre" e a página encurta ~480 px.
   [antes/depois](propostas/p2-celular-sem-cartao-do-hero.jpg)
3. **Consolidar a escala.** Texto de corpo em quatro degraus (.92, 1, 1.08 e 1.2rem) no lugar de
   ~20 valores; raios só 3/5/8 px; as dez cores fora da paleta entram no DESIGN.md ou somem.
   Visualmente quase igual, mas acaba a deriva. [antes/depois](propostas/p3-escala-de-texto.jpg)
4. **Ferramentas de medida (D-129, em aberto).** Continuar executando Playwright, Lighthouse e axe
   de `movimente-se-site/node_modules`, ou instalá-los como devDependencies daqui pelos sete gates
   de `ecosystem-tool-adoption`. Esta rodada seguiu o primeiro caminho, sem instalar nada.
5. **O `sharp` do script de imagem** vem com o Next (dependência opcional dele). Se o Next deixar
   de trazê-lo, `npm run imagens` quebra; declará-lo em devDependencies seria uma instalação e
   passa pelos gates.

## 7. Lacunas

- Nada foi testado em celular de verdade: sensação de toque, barra do navegador e teclado precisam
  do aparelho (`npm run dev -- -H 0.0.0.0` e abrir pelo IP; desde a §9 o IP precisa estar em
  `allowedDevOrigins`, senão o Next 16 não hidrata a página — ou use o build servido).
- Firefox não tem `animation-timeline`: lá as frases aparecem acesas e a imagem não apaga (some
  com o fim do trilho). Não conferido no Firefox nem no Safari.
- Lighthouse local, sem a compressão e a CDN do GitHub Pages: serve para comparar, não para prever
  o campo.
- Skills usadas: kc1t-ui-audit, mobile-native, break-ui (como script), pocock-code-review. Não
  invocadas, por orçamento de contexto: apple-design, emil-design-eng, review-animations,
  find-animation-opportunities, web-quality-audit, ui-ux-pro-max — os critérios delas que cabiam
  (movimento, contraste, CWV) foram medidos pelos scripts acima.
- `assets-src/ref/` e `assets-src/videos/` estavam fora do Git e continuam assim; não são desta rodada.

## 8. Rodada de 2026-10-09 — o "Sobre" que não animava e as propostas aprovadas

Trabalho feito sem o Gabriel, na mesma branch, só com commits locais (sem push, merge ou deploy).

### Causa do texto parado (Tarefa 1)

**O Firefox não tem `animation-timeline`, e o efeito inteiro estava dentro de
`@supports (animation-timeline: view())`.** Sem suporte, o navegador ignorava o bloco e as frases
ficavam no estado base: paradas e 100% acesas. Era o comportamento previsto na §7 ("Firefox não tem
`animation-timeline`"), não um defeito do CSS.

| Hipótese | Teste | Resultado |
|---|---|---|
| (a) sem suporte no navegador | `CSS.supports("animation-timeline: view()")` no Firefox 157 do Fedora (perfil temporário) | **falso** — confirmada |
| (b) movimento reduzido ligado | `gsettings get org.gnome.desktop.interface enable-animations` → `true`; `prefers-reduced-motion: reduce` falso no Firefox 157, no Chromium 153 e no WebKitGTK 2.54; nenhuma pref de movimento no `prefs.js` do perfil | refutada |
| (c) outra causa no CSS/JS | mesma página no Chromium 153 e no WebKitGTK 2.54: as frases acendiam (0,26 → 1,00) e a imagem apagava | refutada |

Laço: `tests/e2e/bench-scroll.spec.mjs` no Firefox. Sem o fix, 2 dos 3 testes falham; com o fix,
passam (conferido revertendo o componente e reconstruindo).

**No PC do Gabriel o movimento reduzido não está ligado**, então ele verá o efeito. Se um dia ligar
"Reduzir animação" no GNOME (Configurações › Acessibilidade), o Firefox passa a pedir
`prefers-reduced-motion: reduce` e as frases ficam acesas e paradas — de propósito.

### Correção

- **CSS onde há suporte**, sem mudança de mecanismo (Chromium, Safari/WebKit).
- **Fallback em JS onde não há** (`components/bench-scroll.tsx` + `lib/scroll-reveal.ts`): mede a
  geometria uma vez (de novo só com `ResizeObserver` ou `resize`), ouve a rolagem com listener
  passivo, só enquanto a bancada está a uma tela de distância (`IntersectionObserver`), coalesce
  num `requestAnimationFrame` e escreve duas variáveis CSS que viram `opacity` e `transform`.
  Nenhuma leitura de layout por quadro. Faixas iguais às do CSS, inclusive o `scroll-padding` do
  `html` que o `view-timeline-inset: auto` desconta (sem isso a imagem apagava ~35 px fora de passo).
- **Estado apagado: .25** (era .16). No fundo do "Sobre" dá ~1,8:1 contra ~8:1 aceso: o efeito
  aparece e a frase ainda se lê. A .16 dava 1,5:1 e o texto sumia.
- **Curva:** `--ease-scroll`, `cubic-bezier(1/3, 0, 2/3, 1)`, que é exatamente o smoothstep
  `3t² − 2t³` do fallback. Velocidade zero nas duas pontas: sem tranco ao começar nem ao terminar de
  acender (apple-design: rolagem é manipulação direta — 1:1, reversível, sem tempo próprio).
  Registrada no DESIGN.md como a única exceção à curva única.
- Rolando de volta, a frase apaga de novo: o estado só depende da posição.

### Evidência (Tarefa 1)

Opacidade das quatro frases nas três paradas (`medidas/rolagem.json`; capturas em
[`capturas/rolagem/`](capturas/rolagem/)):

| Motor | Caminho | Início | Meio | Fim |
|---|---|---|---|---|
| Chromium 153 (Playwright) | CSS | .33 .25 .25 .25 | 1 .99 .89 .63 | 1 1 1 1 |
| Firefox 155 (Playwright) | JS | .33 .25 .25 .25 | 1 .99 .89 .63 | 1 1 1 1 |
| **Firefox 157 do Fedora** (BiDi, `firefox-sistema.mjs`) | JS | .33 .25 .25 .25 | 1 .99 .89 .63 | 1 1 1 1 |
| WebKitGTK 2.54.1 (`webkitgtk.py`) | CSS | .33 .25 .25 .25 | 1 .99 .89 .62 | 1 1 1 1 |

A curva da primeira frase (topo a 100 → 50% da tela) e da imagem (fim da bancada a 100 → 30%)
coincide nos quatro com diferença máxima de 0,01, inclusive no WebKitGTK com o caminho JS forçado
(`animation-timeline` negado e animações CSS desligadas).

Quadros, rolando a bancada inteira com a roda (2.008 px):

| Cenário | Intervalo de rAF (p50 / máx) | Quadros > 20 ms | Maior tarefa da main thread | Tarefas > 16 ms |
|---|---|---|---|---|
| Chromium, CPU 4×, CSS | 16,7 / 16,8 ms | 0 | 7,9 ms | 0 |
| Chromium, CPU 4×, só o JS | 16,7 / 16,8 ms | 0 | 8,1 ms | 0 |
| Firefox 155, JS (sem controle de CPU no Firefox) | 16,4 / 17,4 ms | 0 | — | — |

O intervalo de rAF é o período da tela (60 Hz); o que mede o custo do quadro é a tarefa da main
thread, que não passou de 8,1 ms com a CPU 4× mais lenta.

### Tarefa 2

| Item | O que mudou | Commit |
|---|---|---|
| P1 | ~~E-mail à vista abaixo de "Falar comigo", com botão "copiar"~~ — **revertido** na segunda rodada (§9), a pedido do Gabriel. Ficou só o `role="status"` fora do botão de copiar, que vale para o fim dos estudos de caso e o "Contato" | `1df4308`, `4dcbcc7`, revertido em `6270503` |
| P2 | O cartão "Estudos de caso" sai do hero no celular: até 600 px em pé, ou deitado com até 500 px de altura. O tablet (820×1180 testado) mantém o índice | `a261239`, `4dcbcc7` |
| P5 | `sharp` `0.35.4` em `dependencies`, versão exata, a mesma que o Next 16.3.5 traz; `npm run imagens` gera arquivos idênticos | `e1745b2` |
| P3 | Só o plano: [`P3-PLANO.md`](P3-PLANO.md) (24 tamanhos de texto → 4 degraus, raios 3/5/8, 10 cores) | `0519a2c` |
| P4 | Gate de `ecosystem-tool-adoption` (abaixo) e devDependencies fixadas | `ee002ea`, `cdc26d8` |

Capturas (refeitas sem o e-mail na §9): [hero 1440 ao lado da main](capturas/hero/main-vs-branch-1440.jpg),
[hero 390 ao lado da main](capturas/hero/main-vs-branch-390.jpg), [390 rolando, sem o cartão](capturas/hero/hero-390-pagina.jpg).

**P4 — resultado dos gates** (ficha no ecossistema: `docs/pilots/2026-10-09-playwright-lighthouse-axe.md`):

| Pacote | Versão | Resultado |
|---|---|---|
| `@playwright/test` + `playwright-core` | 1.63.0 | **aprovado (A)**; a 1.64.0 saiu há 2 dias e foi recusada pela idade |
| `lighthouse` | 13.5.0 | **aprovado (A)**; sempre com `--no-enable-error-reporting` (telemetria já desligada no `configstore`) |
| `axe-core`, `@axe-core/playwright` | 4.13.0 | **aprovado (A)**; a 4.14.0 tinha 4 dias |

Nenhum reprovado. Os sete gates passaram: publicadores oficiais, Apache-2.0/MPL-2.0, nenhum script
de instalação nos 119 pacotes, rollback testado. Navegadores instalados sem sudo: Firefox 155 roda;
**o WebKit do Playwright não roda no Fedora 44** (pede ICU 74, libjpeg 8 e libjxl 0.8 do Ubuntu).
Por isso o WebKit foi conferido no WebKitGTK do sistema, com um compositor sem tela
(`mutter --headless`), já que a sessão bloqueou no meio do trabalho.

Novo: `npm run e2e` (depois de `npm run build`) roda 24 testes em Chromium e Firefox sobre o `out/`:
o "Sobre" acendendo e apagando, a imagem saindo, movimento reduzido, o e-mail e o botão de copiar
(com e sem área de transferência; saíram com o P1, §9), o celular sem o cartão, o tablet com ele, e axe em quatro rotas.

### Verificação final

- `npm run lint` → exit 0, sem achados; `npm test` → 18/18; `npm run build` → exit 0
  (`export: 3 areas, 6 registros`); `npx playwright test` → 23 passaram, 1 pulado (a permissão de
  área de transferência só existe no Chromium do Playwright).
- `medidas/capturas.mjs` (14 rotas × 1440 e 390, Chromium): axe 0 violações, console sem erro; os
  únicos avisos de layout são os esperados da §2. Firefox 155: as mesmas 28 páginas roladas até o
  fim, 0 erros de console.
- Lighthouse 13.5 da home (mediana de 3): desktop 100, celular 94, TBT 26 ms (era 32 ms).
- Revisão em dois eixos (pocock-code-review), corrigido: DESIGN.md ainda dizia "sem JS" e "uma
  curva só"; o aviso de copiado dentro do botão; o corte do celular em 820 px escondia o cartão no
  tablet; `lib.mjs` importava `playwright` sem declarar; `@axe-core/playwright` declarado sem uso
  (agora roda em `tests/e2e/a11y.spec.mjs`). A ADR-023 não foi pedida, mas registra o que mudou na
  ADR-022. Ficaram como julgamento, sem mudança: o teste de regex em `tests/scroll-reveal.test.mjs`
  (é o único guarda que roda no CI) e duplicações pequenas nos scripts de medida.

### Pendente para o Gabriel

1. **`review-animations` não rodou:** a skill só aceita invocação dele (`/review-animations` na
   home). A curva e o ritmo seguiram apple-design.
2. **Safari de verdade (macOS/iOS): needs-verification.** O motor foi conferido no WebKitGTK 2.54,
   que já tem `animation-timeline`; Safari anterior ao 26 cairia no fallback JS, que só foi
   exercitado no WebKit com o CSS desligado à força.
3. **e2e no CI:** o deploy roda `npm run check` (lint, test, build). Incluir `npm run e2e` exige
   instalar os navegadores no workflow (`npx playwright install --with-deps chromium firefox`):
   decisão dele, não feita.
4. **P3:** as três escolhas no fim de [`P3-PLANO.md`](P3-PLANO.md).
5. `~/.cache/ms-playwright/webkit-2359` não serve neste Fedora; pode ser apagado.
6. Celular de verdade continua sem teste (§7).

### Como testar

```bash
npm run dev
```

Abrir `http://localhost:3000`, **Ctrl+Shift+R** (recarregar sem cache) e rolar devagar até "Eu gosto
do que acontece por baixo da interface.": cada frase entra apagada pela base da tela e acende até a
metade; rolando de volta, apaga. No fim do "Sobre" a imagem some. ~~No hero, o e-mail está abaixo de
"Falar comigo"~~ (revertido, §9); no celular (ou com a janela estreita, abaixo de 600 px) o cartão "Estudos de caso"
não aparece no hero.


## 9. Segunda rodada de 2026-10-09 — o "Sobre" ainda parado no PC do Gabriel, e o P1 revertido

> Superada pela §10: a seção inteira saiu da home, e com ela o reveal, o fallback e o
> `?debug=reveal`. O que segue é o registro da investigação.

Relato: no PC dele as frases de "Eu gosto do que acontece por baixo da interface" continuavam acesas
o tempo todo, inclusive na metade de baixo da tela; e o e-mail com "copiar" no hero ficou estranho.
Os testes da §8 passavam, então eles não reproduziam o caso dele. Tratado como bug observado
(pocock-diagnosing-bugs). Só commits locais; sem push, merge ou deploy.

### Laço

`ff-loop.mjs` (descartável, fora do repositório): o **Firefox 157 do Fedora com interface**, perfil
temporário, sessão nova (o boot roda), rolagem pela **roda do mouse** (`input.performActions`), e a
cada passo a posição e a opacidade de cada frase. Vermelho = nenhuma frase visível entre 70% e 95%
da tela está abaixo de 0,6 de opacidade.

| Cenário | Caminho | Resultado |
|---|---|---|
| `next dev`, aberto por `http://127.0.0.1:3100` | **nenhum** (`data-scroll-fallback` ausente, sem `--reveal`) | **vermelho**: tudo aceso e parado |
| `next dev`, aberto por `http://localhost:3100` | JS | as frases entram a .25, mas a frase a 70% da tela já está a .91 |
| idem, com o Dark Reader e o uBlock do perfil dele instalados | JS | igual: as extensões não interferem |
| build de produção (`out/`) | JS | igual ao `localhost` |

### Hipóteses

| # | Hipótese e previsão | Resultado |
|---|---|---|
| 1 | O fallback não monta → `data-scroll-fallback` ausente | **confirmada só pelo 127.0.0.1**: o Next 16 bloqueia recursos de dev de outra origem (`Blocked cross-origin request to Next.js dev resource /_next/hmr from "127.0.0.1"`), a página não hidrata e nenhum JS roda. Por `localhost` e no `out/` o fallback monta |
| 2 | A faixa termina cedo demais → frase a 70% da tela já acesa | **confirmada**: a faixa ia de `entry 0%` a `cover 38%`, ou seja, terminava com o topo da frase a ~60% da tela. A 85% a frase já estava a .50; a 70%, a .91. Só os ~15% de baixo da tela mostravam o efeito, e a roda (120 px por clique, com rolagem suave) atravessa isso em 3 cliques |
| 3 | A animação de entrada (boot) atrapalha a medição → os testes antigos pulavam o boot | refutada: com e sem boot, o mesmo resultado |
| 4 | Extensão (Dark Reader), CSS com `!important`, `transition` ou estado final por cima | refutada: com as extensões dele o fallback escreve `--reveal` e a opacidade computada acompanha; no CSS do site nenhuma regra mexe na opacidade dessas frases |
| 5 | Service worker ou cache servindo versão antiga | refutada: nenhum service worker do site; o perfil dele não tem registro para `localhost` (`serviceworker.txt`) |

Os testes da §8 não pegaram porque só olhavam a **primeira** frase em dois pontos extremos (97% e
40% da tela), por `scrollTo`, com o boot pulado.

### Causa real e correção

1. **A faixa.** Mesmo com o fallback funcionando, cada frase terminava de acender a ~60% da altura da
   tela: toda frase na metade de baixo estava acesa. Agora a frase acende enquanto o topo dela vai de
   **85% a 50%** da altura da tela (`animation-range: cover 15vh cover 50vh`; a mesma faixa em
   `lib/scroll-reveal.ts`), e apaga de volta ao rolar para cima.
2. **O dev por 127.0.0.1.** `next.config.ts` ganhou `allowedDevOrigins: ["127.0.0.1"]` (só vale no
   `next dev`). Por um IP da rede (celular), o bloqueio continua: para testar no celular, use o build
   (`npm run build && node scripts/serve-out.mjs out 4173`) ou acrescente o IP nessa lista.
3. **Mais evidente.** Começa a **.2** de opacidade e **.6em abaixo** (antes .25 e .5em). Contraste
   da frase apagada contra a mediana do fundo ([`medidas/apagado.mjs`](medidas/apagado.mjs)): .16 →
   1,41:1 (o texto sumia), **.2 → 1,60:1**, .25 → 1,88:1; acesa, ~15:1.
4. **Curva** (apple-design + review-animations). `--ease-reveal`, `cubic-bezier(1/3, .2, 2/3, 1)`;
   no fallback, `0,6t + 1,8t² − 1,4t³`. O smoothstep anterior começava em ease-in (aos 20% da faixa,
   só 10% do caminho), e ease-in em UI atrasa justo o momento que se olha (review-animations). A nova
   sai com velocidade 0,6, então a frase responde assim que entra na faixa, e pousa com velocidade
   zero a 50%, sem quina. Como só depende da posição, a volta percorre o mesmo caminho ao contrário
   (apple-design: manipulação direta 1:1, reversível, simétrica). A imagem da bancada segue no
   smoothstep (`--ease-scroll`).
5. **`?debug=reveal`** (`components/reveal-debug.tsx`): painel no canto com o caminho ativo (CSS, JS,
   reduzido ou "nenhum: o fallback JS não ligou"), dev/produção e o tamanho da janela, e por frase a
   posição na tela, o progresso `t` e a opacidade que o navegador aplicou, a cada quadro. Duas linhas
   tracejadas marcam 85% e 50%. Sem o parâmetro não existe nada no DOM. Se o painel nem aparece, o
   JS da página não rodou.

### Evidência

Opacidade aplicada, primeira e última frase, topo em cada fração da tela (`out/`, 1440×900):

| Fração da tela | .95 | .85 | .80 | .75 | .70 | .65 | .60 | .55 | .50 |
|---|---|---|---|---|---|---|---|---|---|
| esperado | .20 | .20 | .295 | .429 | .582 | .736 | .869 | .964 | 1 |
| Chromium (CSS) | .20 | .20 | .295 | .429 | .583 | .736 | .870 | .964 | 1 |
| Firefox (JS) | .20 | .20 | .294 | .429 | .582 | .735 | .870 | .964 | 1 |

A última frase dá os mesmos números (±0,001) nos dois motores.

Firefox 157 do sistema, com interface, roda do mouse, depois da correção (`localhost`, `127.0.0.1`
e `out/` dão a mesma tabela; o painel diz `caminho: JS (fallback)`):

```
rolagem  frase 1      frase 2      frase 3      frase 4      (topo na tela : opacidade)
 600     0.84:0.24    0.96:0.20    1.02:0.20    1.10:0.20
 720     0.70:0.60    0.83:0.26    0.88:0.20    0.97:0.20
 840     0.56:0.95    0.69:0.64    0.74:0.48    0.83:0.26
 960     0.43:1.00    0.55:0.97    0.60:0.87    0.69:0.63
```

Capturas ([`capturas/faixa/`](capturas/faixa/), [`medidas/faixa.mjs`](medidas/faixa.mjs), navegadores
do sistema com interface): Firefox 157 [entrando](capturas/faixa/firefox157-1-entrando.jpg) (de cima
para baixo .95 · .64 · .49 · .26), [mais adiante](capturas/faixa/firefox157-2-adiante.jpg) (todas 1),
[com o painel](capturas/faixa/firefox157-1-entrando-debug.jpg); Chromium 154
[entrando](capturas/faixa/chromium-1-entrando.jpg), [mais adiante](capturas/faixa/chromium-2-adiante.jpg),
[com o painel](capturas/faixa/chromium-1-entrando-debug.jpg).

**Regressão** (`tests/e2e/bench-scroll.spec.mjs`): todas as frases, não só a primeira, a .2 com
deslocamento a 85%, entre .35 e .8 a 70%, acesas a 50% e apagadas de novo ao voltar; e um teste
com a **roda do mouse** em que a frase de baixo (72–84% da tela) tem de estar ao menos 0,3 mais
apagada que a de cima. Contra o build anterior: **4 falhas** (as duas, no Chromium e no Firefox;
`Expected: < 0.25, Received: 0.504695` a 85%; `Received: 0.7795` com a roda). Com a correção: passam.
Mais um teste do painel: não existe sem o parâmetro; com ele, diz CSS no Chromium e JS no Firefox, e a
opacidade mostrada é a aplicada.

### P1 revertido

`6270503`: sai o `HeroEmail`, os estilos `.hero-email*`, o caminho "selecionar o endereço" do
`CopyEmailButton`, os testes e as capturas do e-mail no hero; a ADR-023 registra a reversão. Fica o
`role="status"` fora do botão de copiar (correção de acessibilidade que vale para os outros usos),
o P2 e o P5. O hero vai de "Falar comigo" direto para a dica do terminal, a 26 px, como na `main`:
[1440 lado a lado](capturas/hero/main-vs-branch-1440.jpg), [390 lado a lado](capturas/hero/main-vs-branch-390.jpg).
As outras diferenças nessas capturas (imagem da bancada, índice de estudos de caso, nome em
destaque) são da ADR-022 e não mudaram.

### Verificação

- `npm run lint` → exit 0, sem achados.
- `npm test` → 20/20 (`# pass 20`, `# fail 0`).
- `npm run build` → exit 0, `export: 3 areas, 6 registros`.
- `npx playwright test` → **24 passaram**, 0 falhas (Chromium e Firefox, sobre o `out/`).

### Como testar

```bash
rm -rf .next && npm run dev
```

Ctrl+Shift+R e abrir **`http://localhost:3000/?debug=reveal`**. Rolar devagar até "Eu gosto do que
acontece por baixo da interface.": o painel deve dizer `caminho: JS (fallback)` no Firefox (`CSS` no
Chrome), e cada frase sobe e acende entre as duas linhas tracejadas (85% e 50%); rolando de volta,
apaga. Sem `?debug=reveal`, nada de painel. Se o painel não aparecer, o JS não rodou: confira se o
endereço é `localhost` ou `127.0.0.1` (por IP da rede o Next bloqueia).

### Pendente

- O Gabriel não preencheu o que viu depois de `rm -rf .next` + Ctrl+Shift+R; o laço cobre as duas
  causas que dão esse sintoma, mas a confirmação no PC dele é com o painel acima.
- Celular de verdade e Safari continuam sem teste (§7, §8).

## 10. Terceira rodada de 2026-10-09 — o "Sobre" sai da home

**Decisão do Gabriel (confirmada):** tirar da home a seção "Eu gosto do que acontece por baixo da
interface." inteira; a imagem da bancada fica só atrás do hero e acaba num degradê curto; depois do
hero vem direto "Projetos em destaque", como na main. O hero continua como nesta branch (imagem,
nome em destaque, cartão "Estudos de caso" no desktop e no tablet, sem ele no celular, sem e-mail).
Commit `7b5a1bd`; só local.

### O que saiu

- A seção `.bench-about` (`#sobre`, nenhum link apontava para ela) e o texto dela na home.
- O reveal das frases (CSS com `animation-timeline`), o fallback em JS
  (`components/bench-scroll.tsx`), o painel `?debug=reveal` (`components/reveal-debug.tsx`),
  `lib/scroll-reveal.ts`, os tokens `--ease-scroll` e `--ease-reveal`, os estilos e os testes
  (`tests/e2e/bench-scroll.spec.mjs`, `tests/scroll-reveal.test.mjs`).
- O palco preso na tela (`.bench`, `.bench-track`, `.bench-stage` com `position: sticky` e
  `100lvh`). Não há mais movimento ligado à rolagem na home.

### O que ficou

- **A imagem, só no hero:** `.hero-image` dentro do `<section class="hero">`, `position: absolute;
  inset: 0`, da altura do hero, sem `fixed` nem `sticky`. Ao rolar, ela sobe com o hero.
- **A saída:** um degradê de transparente para `--ink` na base, da altura do respiro de baixo do
  hero (`--hero-fade`: `clamp(48px, 6vw, 96px)`; 64 px no celular), então nunca passa por cima de
  texto. O véu do lado do texto foi para a mesma camada (`.hero-image::after`). Sem JS.
- **A linha de 1 px da main** na base do hero (`border-bottom: 1px solid var(--line-soft)`): a
  imagem termina nela.
- **LCP:** o mesmo `<picture>` com `srcset` AVIF/WebP, `width`/`height` e `fetchpriority="high"`;
  continua sem `<link rel=preload>` (decisão da ADR-022). Laboratório
  ([`medidas/hero-vitais.json`](medidas/hero-vitais.json)): o LCP é o `img`, 176 ms em 1440 (era
  180) e 160 ms em 390 (era 196), CLS 0, mesmos 192 KB / 140 KB de imagem.
- **Contraste AA** ([`medidas/contraste-hero.txt`](medidas/contraste-hero.txt), `contraste.mjs` só
  com o hero agora): nenhuma falha em 1440, 1920, 1366 e 390; menor folga 1,20× (dica do terminal em
  1920, 5,38:1). Na rodada anterior era 1,22×: a caixa da imagem agora tem a altura do hero, não da
  janela, e o recorte mudou um pouco.
- `allowedDevOrigins: ["127.0.0.1"]`: não servia só ao reveal; sem ele o `next dev` aberto por
  `127.0.0.1` não hidrata nada (boot, terminal, busca).
- **O texto:** a página Sobre (`/about/`) não tem as frases da seção. Ela conta a mesma origem com
  outras palavras ("Começou quebrando e consertando o Windows…", `app/about/page.tsx:51`), e o
  terminal tem o `whoami` com "o registro do Windows". Nada foi acrescentado nem mexido lá.

### Comparação com a main

[`medidas/transicao.mjs`](medidas/transicao.mjs), Chromium, `out/` desta branch e da main (build num
worktree descartável):

| | altura do hero | fim do hero → título "Projetos em destaque" | último conteúdo do hero → título | imagens depois do hero | erros de console |
|---|---|---|---|---|---|
| 1440 main | 828 | **130** | 280 | 0 | 0 |
| 1440 branch | 828 | **130** | 246 | 0 | 0 |
| 390 main | 782 | **76** | 186 | 0 | 0 |
| 390 branch | 782 | **76** | 247 | 0 | 0 |

O espaço entre o hero e "Projetos em destaque" é o da main nas duas larguras. A distância a partir do
último texto do hero muda porque o conteúdo do hero é outro (cartão, nome em destaque) e, até
1000 px, ele começa no alto em vez de centrado; isso é do hero desta branch, que fica como está.

Capturas lado a lado (main à esquerda): [1440 hero](capturas/sem-sobre/1440-1-hero.jpg),
[1440 transição](capturas/sem-sobre/1440-2-transicao.jpg), [390 hero](capturas/sem-sobre/390-1-hero.jpg),
[390 transição](capturas/sem-sobre/390-2-transicao.jpg).

### Testes

`tests/e2e/hero.spec.mjs`, em 1440×900 e 390×844, Chromium e Firefox: a camada da imagem é
`absolute`, começa no topo do hero e acaba na linha de baixo dele, e some da tela ao rolar; não
existe `#sobre`; o hero é seguido por `#projetos`, com o título a exatamente o `padding-top` da seção;
nenhum elemento depois do hero tem imagem de fundo (`url(`) nem `img`/`picture`/`video`.

### Verificação

- `npm run lint` → exit 0, sem achados.
- `npm test` → 14/14 (`# pass 14`, `# fail 0`; os 6 testes da matemática do reveal saíram com ela).
- `npm run build` → exit 0, `export: 3 areas, 6 registros`.
- `npx playwright test` → **22 passaram**, 0 falhas.

### Como testar

```bash
rm -rf .next && npm run dev
```

Abrir `http://localhost:3000/` e Ctrl+Shift+R. A bancada aparece só atrás do hero e some num degradê
curto antes da linha de baixo; logo depois vem "Projetos em destaque", sem imagem atrás dele nem de
nada abaixo.

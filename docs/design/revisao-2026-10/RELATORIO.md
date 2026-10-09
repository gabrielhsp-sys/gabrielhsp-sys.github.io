# Revisão 2026-10 — home com imagem, cortes, fluidez e UX

Branch `home-imagem-2026-10`, saída da `main` (`8512231`). A home com vídeo ficou na tag
local `home-video-arquivo-2026-10` (`e06bf6d`, branch `home-cinematica-2026-10`, intocada).
Ela tinha 441 quadros re-encodados sem commit; estão guardados em `git stash` com a mensagem
"home-cinematica-2026-10: quadros public/cine re-encodados…". Nada foi publicado.

Tudo foi medido no export de produção (`npm run build` + `out/` servido com gzip por
[`medidas/gz-server.mjs`](medidas/gz-server.mjs)), nunca no `next dev`. "Antes" é a `main`;
"depois" é o `HEAD` desta branch. Os scripts estão em [`medidas/`](medidas/) e rodam de novo
com Playwright, Lighthouse e axe executados de `movimente-se-site/node_modules` (D-129, em aberto).

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
  do aparelho (`npm run dev -- -H 0.0.0.0` e abrir pelo IP).
- Firefox não tem `animation-timeline`: lá as frases aparecem acesas e a imagem não apaga (some
  com o fim do trilho). Não conferido no Firefox nem no Safari.
- Lighthouse local, sem a compressão e a CDN do GitHub Pages: serve para comparar, não para prever
  o campo.
- Skills usadas: kc1t-ui-audit, mobile-native, break-ui (como script), pocock-code-review. Não
  invocadas, por orçamento de contexto: apple-design, emil-design-eng, review-animations,
  find-animation-opportunities, web-quality-audit, ui-ux-pro-max — os critérios delas que cabiam
  (movimento, contraste, CWV) foram medidos pelos scripts acima.
- `assets-src/ref/` e `assets-src/videos/` estavam fora do Git e continuam assim; não são desta rodada.

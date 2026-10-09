# Home com imagem — a bancada

A home com vídeo ficou arquivada na tag local `home-video-arquivo-2026-10`
(branch `home-cinematica-2026-10`). No lugar do vídeo, uma imagem parada e nítida:
`assets-src/imagens/hero-bancada.png`, 3840 × 2143, já ampliada com Real-ESRGAN.

## Como é gerada

`npm run imagens` (`scripts/imagens.mjs`, com o `sharp` que já vem com o Next):

| Variante | Uso | AVIF | WebP |
|---|---|---|---|
| `bancada-1280` | deitado, telas pequenas | 116 KB | 160 KB |
| `bancada-1920` | deitado, notebook e desktop comum | **192 KB** | **276 KB** |
| `bancada-2560` | deitado, 1440p ou DPR alto | 280 KB | 407 KB |
| `bancada-3840` | deitado, 4K | 485 KB | 696 KB |
| `bancada-retrato-550/825/1100` | celular em pé: a faixa do notebook | 55 / 94 / 140 KB | 79 / 137 / 202 KB |

Alvo da variante de 1920: ≤ 500 KB. Cumprido com folga nos dois formatos.

O recorte em retrato existe porque, em pé, a imagem cobre pela altura: um celular de
390 px com DPR 3 pediria a variante de 3840 px para mostrar só um terço dela. O
recorte (x 1773–2873 da fonte, a largura do notebook com folga) é o que aparece
num celular em pé. Um primeiro corte mais largo (1720 px) mandava pixels
escondidos: no Lighthouse de celular, o LCP caiu de 3,30 s para 3,00 s com o
corte estreito.

## Qualidade: sem bloco nem faixa no escuro

AVIF qualidade 88, croma 4:4:4; WebP qualidade 95. Escolhidos comparando 55–88
(AVIF) e 82–96 (WebP) contra a referência sem perda, na variante de 1920.

As comparações (`comparacao-*.jpg`) mostram, da esquerda para a direita, a
referência sem perda, o AVIF e o WebP, em recortes escuros (estante, pé da
bancada, parede) **ampliados 2× sem suavização e com os escuros esticados 4×**,
um teste mais duro que o zoom de 100%. Abaixo de AVIF 82 apareciam manchas na
estante; WebP abaixo de 94 mostrava blocos de 8 px. Nas escolhidas, o que resta
só aparece com o esticamento: uma leve dominante azul no preto mais fundo do
AVIF (1 a 3 níveis de 255, embaixo do véu escuro da seção) e textura de bloco
residual no WebP, que só é servido a quem não lê AVIF.

`erro-no-escuro.txt`: erro médio por canal nos pixels com luma < 40 —
AVIF 0,68 (máximo 17), WebP 0,80 (máximo 41).

## Contraste sobre a imagem

`contraste.txt` (`docs/design/revisao-2026-10/medidas/contraste.mjs`): esconde o
texto, fotografa o fundo atrás de cada elemento e compara a cor do texto com o
pixel mais claro (percentil 98) daquela caixa, nas quatro larguras e em três
pontos de rolagem. Nenhuma falha; a menor folga é 1,21× o mínimo AA.

O véu foi baixado até onde o contraste deixou:

- **Hero, deitado:** 0,90 → 0,84 do lado do texto, 0,1–0,2 do lado do notebook.
  O limite é o nome em mono de 11 px em cima da luz da luminária; ele passou a
  usar o marfim suave (`--paper-dim`) no hero.
- **Hero, em pé:** 0,62–0,70 (era 0,86–0,88 no primeiro corte).
- **Sobre, deitado:** 0,74 → 0,64 na coluna do texto; 0,55 já falhava (3,1:1).
- **Sobre, em pé:** véu de 0,8 que acompanha o próprio bloco de texto.

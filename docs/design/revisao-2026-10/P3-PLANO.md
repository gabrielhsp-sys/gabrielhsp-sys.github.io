# P3 — consolidar a escala de texto, os raios e as cores (plano, não aplicado)

Proposta 3 do [RELATORIO.md](RELATORIO.md) §6. **Só o plano**: nada daqui foi aplicado. O inventário
foi lido de `app/globals.css` em 2026-10-09 (commit `e1745b2`), sem comentários, com a régua do
[`DESIGN.md`](../../../DESIGN.md). Mockup antigo: [p3-escala-de-texto.jpg](propostas/p3-escala-de-texto.jpg).

## Por quê

O DESIGN.md documenta uma escala (Display, Page title, Headline, Title, Body 1rem, Label 11px), três
raios (3/5/8 px, mais o cartucho) e uma paleta. O CSS foi crescendo ao lado dela: **24 tamanhos de
texto de corpo** fora dos tokens, **raios de 4, 6, 7 e 9 px** e **10 cores** do tema principal que
não estão na paleta. Visualmente a diferença é de 0,5 a 1,5 px por elemento; o problema é a deriva —
cada componente novo escolhe o seu valor, e a próxima revisão encontra 30.

## 1. Texto de corpo: quatro degraus

Tokens novos em `:root`, documentados em DESIGN.md › Typography:

| Token | Valor | Papel |
|---|---|---|
| `--text-min` (existe) | .6875rem (11 px) | rótulo mono; piso garantido por `tests/typography.test.mjs` |
| `--text-sm` | .92rem (14,7 px) | legenda, texto secundário, linha de índice |
| `--text-body` | 1rem (16 px) | leitura |
| `--text-lead` | 1.08rem (17,3 px) | prosa longa e linha de destaque |
| `--text-lg` | 1.2rem (19,2 px) | introdução de página, resumo de card líder |

Regra de mapeamento: cada valor vai para o degrau mais próximo; empate vai para cima (legibilidade).

| Hoje | Onde (linha de `globals.css`) | Depois | Diferença |
|---|---|---|---|
| .82rem | `.excerpt-body pre code` (517) | `--text-sm` | +1,6 px — código do trecho fica um pouco maior; conferir quebra das linhas mais longas |
| .9rem | `.excerpt figcaption` (518) | `--text-sm` | +0,3 px |
| .91rem | `.archive-line-title small` (416) | `--text-sm` | +0,2 px |
| .92rem | `.flow li span`, `.flow figcaption`, `.case-video figcaption` | `--text-sm` | 0 |
| .95rem | `.filter-search input` (353), `.page-toc a` (1396) | `--text-sm` | −0,5 px (o input fica em 16 px pela regra anti-zoom de 1346, que vence) |
| .97rem | `.craft-block > p` (890) | `--text-body` | +0,5 px |
| .98rem | `.excerpt-body p` (515) | `--text-body` | +0,3 px |
| 1.02rem | `.not-found-hint` (1259) | `--text-body` | −0,3 px |
| 1.05rem | `.flow li strong` (481), `.contact-copy p` (1007) | `--text-lead` | +0,5 px |
| 1.08rem | `.prose`, `.about-copy > p`, `.search-result strong`, `.craft-line` | `--text-lead` | 0 |
| 1.1rem | `.search-input-row input` (581) | `--text-lead` | −0,3 px |
| 1.15rem | `.case-end-contact p`, `.case-card[data-lead] p`, `.hero-panel li a strong` | `--text-lg` | +0,8 px |
| 1.2rem | `.page-intro > p` (292) | `--text-lg` | 0 |
| 1.25rem | `.archive-line-title strong` (415) | `--text-lg` | −0,8 px |
| 1.3rem | `.empty-state p` (427) | `--text-lg` | −1,6 px |
| 1.4rem / 1.5rem | `.prose h3`, `.relations h2`, `.case-card h3` (celular) | Title: `clamp(1.35rem, 2.2vw, 2rem)` | são títulos, não corpo: vão para o token Title que o DESIGN.md já tem |

**Fica como está, registrado como exceção no DESIGN.md:**

- `1.125rem` do nome no hero: o DESIGN.md já documenta (600, 1.125rem).
- `16px` dos campos (`.filter-search input`, `.terminal-prompt input`, `.search-input`): abaixo
  disso o iOS amplia a página ao focar.
- `.87em` do `code` na prosa: relativo ao parágrafo de propósito.
- Mono de controle: `12px` (chips — já documentado), `13px` (`.facts dd`, `.not-found-line`),
  `15px` (botões, e-mail do hero). Proposta: escala mono própria **11 / 12 / 13 / 15 px**, com os
  dois `14px` (`.wordmark` 197, `.achievement-toast strong` 1216) indo para 13 px (−1 px; o toast
  é camada de personalidade, a marca precisa de conferência visual).
- Terminal e jogo (`12px`): outro aparelho, rampa própria (DESIGN.md já registra a rampa verde).
- Títulos com `clamp()` próprio (≈12, de `.case-card h3` a `.contact-copy h2`): **fora desta P3**.
  Cada um passa a apontar para Headline ou Title numa fase 2, com captura antes/depois por seção,
  porque aí a mudança chega a 10–20 px e muda a hierarquia.

## 2. Raios: 3 / 5 / 8 px

| Hoje | Onde | Depois | Diferença |
|---|---|---|---|
| 4px (controles) | `.button-solid/.button-ghost` 789, `.contact-primary` 1015, `.copy-email` 1031, `.boot-skip` 1137, `.search-result` 586 | 5px (`control`) | +1 px |
| 4px (superfícies) | `.case-card` 846, `.case-end` 527, `.flow li` 492, `.excerpt-body pre` 516 | 5px | +1 px. **Decisão do Gabriel:** o token `panel` é 8 px, mas o card com o filete de área de 3 px no topo fica mais seco a 5; a recomendação é 5 e registrar "card = control" no DESIGN.md |
| 6px | `.not-found-screen` 1250, `.case-video-placeholder` 1410, `.case-video-frame` 1414 | 8px (`panel`) | +2 px |
| 7px | `.terminal-wrap` 609 | 8px | +1 px |
| 9px | `.identity-screen` 543 | 8px | −1 px |
| 7px 7px 3px 3px | `.brand-mark` 131 | exceção registrada ("mini-cartucho", a marca em escala do cartucho 13/13/5/5) | 0 |

`50%`, `0` e `inherit` ficam.

## 3. Cores fora da paleta

| Cor | Onde | Depois | Contraste antes → depois |
|---|---|---|---|
| `#0a0908` | `.system-rail` 112 | `--ink` `#0c0b0a` | 1,01:1 entre as duas — invisível |
| `#0f0d0b` | `.mobile-dock` 1358 | `--ink` `#0c0b0a` | 1,01:1 — invisível; a borda de cima continua separando a dock |
| `#494238` | `.contact-copy p` 1007 (sobre marfim) | `#3f3931`, registrada como "tinta quieta sobre marfim" | 7,54 → 8,68:1 |
| `#3f3931` | `.copy-email` 1033 | idem (vira token `--ink-on-ivory-quiet`) | 8,68:1, igual |
| `#6f675b` | borda do `.copy-email` 1030 | `--line` `#6b6459` | 4,24 → 4,45:1 (borda de controle, WCAG 1.4.11 pede 3:1) |
| `#4c3314` | `.contact-links a` 1040 | registrar como "âmbar sobre marfim" (texto de link) | 8,92:1, igual; o `--amber-deep` `#9f6421` daria só 3,70:1 |
| `#241f19` | hover do `.contact-primary` 1023 | `--ink-3` `#201d19` | contra o `--ink` do botão em repouso: 1,20 → 1,17:1 — conferir se o hover continua perceptível |
| `#111511`, `#aeb8ae` | `.terminal-titlebar` 615 | entram na rampa do terminal já registrada no DESIGN.md | 9,01:1, igual |
| `#5f7a60` | `.terminal-game-pad button` 1231 | `#748574` (dica da rampa) | 4,17 → 5,03:1 sobre o fundo do terminal |

`#000` (sombra) e a rampa do modo retrô (`#030803`…`#c9ffc9`, 16 tons) ficam: o retrô é uma
paleta inteira à parte e já vive num bloco próprio do CSS.

## Antes/depois previsto

- **Na tela:** quase nada. O maior salto de texto é −1,6 px no estado vazio do arquivo e +1,6 px no
  código dos trechos; o maior salto de raio é +2 px nas molduras de vídeo e na 404.
- **No código:** 24 valores de texto de corpo viram 4 tokens + 4 exceções registradas; 5 raios
  soltos somem; 10 cores viram 3 tokens novos documentados e 7 trocas por tokens existentes.
- **Altura das páginas:** muda pouco, mas muda — o arquivo (`.archive-line-title strong` −0,8 px em
  cada linha) e a home (`.hero-panel` +0,8 px por linha) precisam de captura.

## Como aplicar (quando aprovado)

1. Um commit por eixo (texto, raio, cor), nessa ordem, cada um com captura antes/depois das 14 rotas
   em 1440 e 390 (`docs/design/revisao-2026-10/medidas/capturas.mjs`).
2. Estender `tests/typography.test.mjs`: nenhum `font-size` em rem/px fora dos tokens e da lista
   de exceções; nenhum `border-radius` fora de 3/5/8 e das exceções.
3. Rodar de novo `medidas/contraste.mjs`, `medidas/roda.mjs` (títulos cortados pela barra) e o axe.
4. Atualizar DESIGN.md (tokens novos, exceções e as duas rampas: marfim e terminal) no mesmo commit
   de cada eixo.

## Pendente para o Gabriel

- Card a 5 px (recomendado) ou a 8 px (token `panel`).
- Escala mono 11/12/13/15 com a marca a 13 px, ou manter a marca em 14 px como exceção.
- Fase 2 (títulos com `clamp()` próprio) entra ou não.

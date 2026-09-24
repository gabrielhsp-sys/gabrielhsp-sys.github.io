---
name: GABRIEL.SYS
description: Um portfólio editorial operável, com rótulos claros e personalidade na camada de cima.
colors:
  signal-amber: "#f0ab3c"
  signal-amber-deep: "#9f6421"
  accent-pink: "#e76b91"
  accent-mint: "#72c9a7"
  accent-violet: "#a291c6"
  accent-blue: "#78a9d4"
  signal-red: "#f07863"
  warm-black: "#0c0b0a"
  raised-black: "#151311"
  inset-black: "#201d19"
  warm-ivory: "#e9e0ca"
  ivory-muted: "#b8b09f"
  ivory-quiet: "#9b9487"
  hardware-line: "#6b6459"
  hardware-line-soft: "#39342d"
  hardware-line-faint: "#26221e"
typography:
  display:
    fontFamily: "Bricolage Grotesque Variable, sans-serif"
    fontSize: "clamp(3rem, 6.7vw, 6rem)"
    fontWeight: 650
    lineHeight: 0.96
    letterSpacing: "-0.04em"
  page-title:
    fontFamily: "Bricolage Grotesque Variable, sans-serif"
    fontSize: "clamp(2.5rem, 4.5vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Bricolage Grotesque Variable, sans-serif"
    fontSize: "clamp(2rem, 4vw, 4.6rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Bricolage Grotesque Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.04em"
rounded:
  contact: "3px"
  control: "5px"
  panel: "8px"
  cartridge: "13px 13px 5px 5px"
spacing:
  contact: "5px"
  tight: "8px"
  control: "14px"
  cluster: "24px"
  touch: "44px"
  section: "72px"
  frame: "104px"
components:
  search-trigger:
    backgroundColor: "{colors.raised-black}"
    textColor: "{colors.ivory-muted}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 10px 0 13px"
    height: "40px"
  filter-chip:
    backgroundColor: "transparent"
    textColor: "{colors.ivory-quiet}"
    typography: "{typography.label}"
    rounded: "{rounded.contact}"
    padding: "5px 8px"
    height: "44px"
  case-card:
    backgroundColor: "{colors.raised-black}"
    textColor: "{colors.warm-ivory}"
    rounded: "{rounded.contact}"
    padding: "30px"
  record-row:
    backgroundColor: "transparent"
    textColor: "{colors.warm-ivory}"
    typography: "{typography.body}"
    height: "160px"
---

# Design System: GABRIEL.SYS

## Overview

**Creative North Star: "A Bancada de Trabalho"**

GABRIEL.SYS é um arquivo editorial operável. A densidade vem de índices, relações e sinais de estado; a personalidade vem de encaixes e contatos de hardware aplicados com contenção. A superfície precisa parecer mantida por uma pessoa que constrói sistemas, nunca montada a partir de um kit de landing page.

O mundo é escuro porque o arquivo é usado como estação de trabalho e leitura concentrada. Marfim mantém a página humana; âmbar indica atividade. A linguagem retro vive na lógica de slots, gravação e estados, sem pixel art espalhada, simulação de console ou ruído CRT dominando conteúdo.

**Key Characteristics:**

- Fluxo editorial denso no lugar de grades de cards iguais.
- Estrutura assimétrica com trilho persistente e linhas finas.
- Cor funcional: atividade, área e estado.
- Terminal opcional; leitura e navegação sempre primárias.
- Tipografia expressiva nos títulos e monoespaçada apenas para dados.

## Colors

A paleta combina preto aquecido e marfim com sinais curados, como etiquetas em uma bancada escura.

### Primary

- **Âmbar de Gravação:** ação principal, foco, estado ativo e sinal de escrita.
- **Âmbar de Contato:** versão profunda para bordas selecionadas e contatos com menor saliência.

### Secondary

- **Rosa de Interface:** área Web & Interfaces.
- **Menta de Operação:** estado "No ar".
- **Violeta Acadêmico:** área Acadêmico e estado "Arquivado".
- **Azul de Entrega:** estado "Concluído".
- **Vermelho de Falha:** erro recuperável e 404.

### Neutral

- **Preto Quente:** campo principal.
- **Preto Elevado:** controles, cartucho e superfícies operáveis.
- **Preto de Encaixe:** hover e código embutido.
- **Marfim de Tela:** títulos e conteúdo primário.
- **Marfim Suave:** corpo e explicações.
- **Marfim Quieto:** metadados pequenos; seu contraste permanece acima de 4.5:1 nos três fundos escuros.
- **Linha de Hardware:** borda de componente interativo. Vale 3.36:1 sobre preto quente e cumpre a WCAG 1.4.11 (D-056).
- **Linha Estrutural:** filete entre seções e linhas de lista. É decorativo: não identifica componente nem estado, então o limiar de 3:1 não se aplica.
- **Linha de Encaixe:** separações internas de baixa ênfase, também decorativas.

**The Signal Has Meaning Rule.** Âmbar e cores de área indicam uma ação, um estado ou uma origem; não são decoração espalhada.

## Typography

**Display Font:** Bricolage Grotesque Variable (sans-serif)

**Body Font:** Bricolage Grotesque Variable (sans-serif)

**Label/Mono Font:** IBM Plex Mono (ui-monospace, monospace)

**Character:** Bricolage fornece uma voz humana e irregular o bastante para não parecer interface corporativa. IBM Plex Mono mede estado, rota, data e comando; ela nunca fantasia um parágrafo como “técnico”.

### Hierarchy

- **Display** (650, clamp(3rem, 6.7vw, 6rem), 0.96): tese de uma superfície. Só a home usa.
- **Page title** (400, clamp(2.5rem, 4.5vw, 3.5rem), 1): título das páginas internas — arquivo, área, sobre e projeto. Em CSS, `var(--type-page-title)`. O título interno não ocupa o primeiro viewport inteiro: o conteúdo começa logo abaixo.
- **Headline** (600, clamp(2rem, 4vw, 4.6rem), 1): títulos de seção e projetos em destaque.
- **Title** (600, clamp(1.35rem, 2.2vw, 2rem), 1.15): registros do índice.
- **Body** (400, 1rem, 1.55): leitura em medidas de até 72 caracteres.
- **Label** (600, 0.6875rem, 0.04em): estado, área, data e controle curto. É também o piso: nenhum texto fica abaixo de 11px. Em CSS, `var(--text-min)`; `tests/typography.test.mjs` garante o piso. Chips de filtro usam 12px.

**The Mono Measures Rule.** Use uma face monoespaçada somente quando alinhamento, comando ou dado forem parte do significado.

## Layout

Desktop usa um trilho fixo de 88px e uma coluna de conteúdo fluida. A barra superior mede 72px; seções respiram entre 72px e 140px, com margens laterais responsivas que chegam a 104px. O conteúdo editorial prefere linhas e listas a contêineres fechados.

A 1180px, os estudos de caso e as frentes de trabalho viram uma coluna. A 820px, o trilho lateral vira dock inferior, a barra superior cai para 62px e grades de artigo e identidade viram uma coluna. A 520px, controles deixam metadados secundários cederem espaço; alvos interativos permanecem com 44px.

## Elevation & Depth

O sistema é plano por padrão. Separação nasce de tom e bordas de 1px. Sombras ambientais aparecem somente em superfícies realmente elevadas: cartucho atual, diálogo de busca, terminal, dock móvel e fotografia.

### Shadow Vocabulary

- **Camada:** 0 30px 100px rgb(0 0 0 / .65) para busca modal.
- **Terminal:** 0 30px 90px rgb(0 0 0 / .6) para a camada opcional.
- **Dock:** 0 18px 45px rgb(0 0 0 / .4) para separar navegação móvel do conteúdo.

**The Flat Until Lifted Rule.** Um bloco que não muda o plano de interação não recebe sombra.

## Shapes

Controles usam cantos pequenos de 3–8px. O cartão de estudo de caso é um retângulo com filete de área de 3px no topo. Bordas são sempre finas; não existem sombras duras deslocadas ou cápsulas em excesso.

## Components

### Buttons

- **Shape:** retângulo contido, canto de controle (5px).
- **Primary:** contorno neutro e fundo preto elevado; ações centrais podem receber âmbar no hover.
- **Hover / Focus:** borda muda de estado; foco usa anel âmbar de 2px com offset de 4px.
- **Touch:** controles compactos preservam alvo mínimo de 44px quando usados em sequência.

### Chips

- **Style:** fundo transparente, borda ausente em repouso, IBM Plex Mono e marfim quieto.
- **State:** seleção combina borda âmbar profunda e campo âmbar de baixa opacidade; aria-pressed comunica o mesmo estado.

### Cards / Containers

- **Corner Style:** painéis comuns não são cards. O cartão de estudo de caso é a exceção, documentada em Shapes.
- **Background:** preto elevado sobre preto quente.
- **Shadow Strategy:** somente o cartucho focal e camadas elevadas recebem sombra.
- **Border:** linha estrutural de 1px.
- **Internal Padding:** 24–34px conforme densidade.

### Inputs / Fields

- **Style:** campo transparente dentro de uma camada elevada; caret âmbar e placeholder em marfim quieto.
- **Focus:** o contêiner mantém a estrutura, e o controle herda o anel global de foco.
- **Error / Disabled:** erro usa vermelho de hardware e diz qual ação recupera a busca.

### Navigation

O trilho mostra ícone Phosphor e nome curto; o estado ativo usa campo preto elevado e contato âmbar de 2px. No celular, a mesma família vira dock inferior com cinco áreas iguais. Links editoriais preservam texto explícito fora dessa navegação compacta.

### Case Card

O cartão de estudo de caso abre com a área e o estado, leva o título, o resumo, a stack real e dois destinos: o texto completo e o código, quando o repositório é público. Quando não é, ele diz "repositório privado" em vez de esconder o fato.

### Personality Layer

A personalidade é uma camada por cima, nunca a estrutura. Animação de entrada (uma vez por sessão, pulável), sons sintetizados em Web Audio com botão visível, terminal opcional na crase, modo retrô pelo Konami e conquistas discretas. Regras que não se quebram: nada essencial depende dela, tudo alcançável por teclado, e `prefers-reduced-motion` remove flicker e glitch — o CRT fica estático e a animação de entrada não roda.

### Search Layer

Ctrl/⌘ + K abre uma camada central. Ela inclui carregamento, erro e vazio, torna o fundo inerte, prende o foco, fecha com Escape e devolve o foco ao invocador.

## Do's and Don'ts

### Do:

- **Do** deixe um único projeto ou ação liderar cada superfície.
- **Do** use linhas, estado e relações para tornar o arquivo percorrível.
- **Do** derive datas, contagens e indicadores do conteúdo real.
- **Do** preserve contraste mínimo de 4.5:1 e alvos móveis de 44px.
- **Do** remova movimento não essencial com prefers-reduced-motion.

### Don't:

- **Don't** transforme a navegação em terminal: o CRT e o console vivem no modo retrô opcional, que o visitante liga e desliga.
- **Don't** estruture o conteúdo como uma grade de cards iguais.
- **Don't** use brilho, vidro, texto em gradiente ou sombra dura como atalho de personalidade.
- **Don't** invente progresso, métricas ou estados que o conteúdo não sustenta.
- **Don't** use rótulos pequenos acima de títulos como decoração.

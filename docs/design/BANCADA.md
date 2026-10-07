# Direção de identidade: Bancada

Escolhida pelo Gabriel em 2026-10-07, entre as três direções do protótipo da
auditoria 2026-10 (Bancada, Folha, Etiqueta). **Ainda não aplicada ao site**: a
aplicação é a próxima rodada. Este documento guarda a direção para essa rodada;
o protótipo (`app/prototipos/identidade/`) foi apagado antes do merge, para que
nenhum rascunho fosse ao ar (regra 1 do `AGENTS.md`). O código completo dele
continua no histórico, no commit `a2dde53`:

```bash
git show a2dde53 -- app/prototipos/identidade/
```

Contexto da escolha: [`RELATORIO.md`, seção 5](../audits/2026-10-auditoria-geral/RELATORIO.md);
achados #29 (primeira dobra sem prova) e #30 (identidade) em
[`ACHADOS.md`](../audits/2026-10-auditoria-geral/ACHADOS.md).

## A ideia em uma frase

O sistema atual, polido: mesmas cores, mesmas fontes, mesma forma por função.
O que muda é a primeira dobra — a metade direita do hero, vazia hoje, vira um
painel com os estudos de caso reais, a área, o estado e o período de cada um.
Quem chega vê prova de trabalho antes de rolar.

## Por que esta, e não Folha ou Etiqueta

- É a identidade que os outros projetos dele já seguem (D-124 levou essa paleta
  para o site da DCE701). Trocar tudo teria custo em tudo que já foi feito.
- Resolve o problema real que a auditoria achou — a primeira dobra sem prova —
  sem jogar fora o que funciona.
- Mantém a ponte visual com a camada de personalidade (terminal, modo retrô),
  que a Folha perderia.

## Princípios

Os do [`DESIGN.md`](../../DESIGN.md) continuam valendo sem mudança. A Bancada
acrescenta só o que é dela:

1. **Prova na primeira dobra.** O hero tem duas colunas: à esquerda a tese, o
   lede e as ações; à direita o painel dos estudos de caso. Nada inventado: o
   painel lê `getFeaturedContent()` e a contagem "N no ar agora" é derivada do
   conteúdo.
2. **O painel é um índice, não uma vitrine.** Uma linha por estudo de caso:
   marca de área, título, estado, período. Sem resumo, sem tags, sem imagem.
   O rodapé do painel diz quantos outros projetos estão no arquivo.
3. **Mesma forma por função (ADR-018).** Área é quadrado + nome neutro
   (`.area-mark`); estado é ponto + nome na cor do estado (`.status`); âmbar só
   em ação e hover. O painel não ganha cor própria.
4. **Elevado de verdade.** O painel é a única superfície do hero com sombra
   (`0 24px 70px rgb(0 0 0 / .35)`): ele é um plano de interação, cada linha é
   um link (Flat Until Lifted Rule).
5. **Estudo de caso nº 1 lidera.** Abaixo do hero, o primeiro do
   `featuredRank` ocupa uma linha inteira com resumo e tags; os outros três
   dividem a linha de baixo — o que o site já faz desde `2c7dff7`.
6. **Hover só com ponteiro fino**, aperto `.97`, reduced-motion zera tudo — as
   regras de movimento atuais, sem exceção.

## Paleta

Nenhuma cor nova. Os tokens de `app/globals.css` (`:root`):

| Token | Hex | Nome no `DESIGN.md` | Papel na Bancada |
|---|---|---|---|
| `--ink` | `#0c0b0a` | Preto Quente | campo do hero e da seção de casos |
| `--ink-2` | `#151311` | Preto Elevado | fundo do painel |
| `--ink-3` | `#201d19` | Preto de Encaixe | hover da linha do painel |
| `--paper` | `#e9e0ca` | Marfim de Tela | tese, títulos do painel; fundo do contato |
| `--paper-dim` | `#b8b09f` | Marfim Suave | lede, resumos |
| `--paper-faint` | `#9b9487` | Marfim Quieto | cabeçalho e rodapé do painel, período |
| `--line` | `#6b6459` | Linha de Hardware | borda do painel (componente, 3,36:1) |
| `--line-soft` | `#39342d` | Linha Estrutural | filete sob o hero e o cabeçalho do painel |
| `--line-faint` | `#26221e` | Linha de Encaixe | separador entre linhas do painel |
| `--amber` | `#f0ab3c` | Âmbar de Gravação | botão principal; título da linha em hover; área Software |
| `--pink` | `#e76b91` | Rosa de Interface | área Web & Interfaces |
| `--violet` | `#a291c6` | Violeta Acadêmico | área Acadêmico, estado Arquivado |
| `--mint` | `#72c9a7` | Menta de Operação | estado No ar; contagem "N no ar agora" |
| `--blue` | `#78a9d4` | Azul de Entrega | estado Concluído |

Contraste: todos os pares de texto passam AA (pior caso `#9b9487` sobre
`#201d19`, 5,58:1; medido em
[`contraste.txt`](../audits/2026-10-auditoria-geral/medidas/depois/contraste.txt)).

## Tipografia

Igual ao site: **Bricolage Grotesque Variable** (display e corpo) e **IBM Plex
Mono** 400/600 só para dado, por `next/font/local` (`app/fonts.ts`).

| Elemento | Fonte | Medida |
|---|---|---|
| Tese do hero | Bricolage 650 | `clamp(2.6rem, 5.4vw, 5.2rem)`, altura .98, `-.04em`, `text-wrap: balance`; itálico só na segunda metade |
| Lede | Bricolage 400 | `clamp(1.05rem, 1.4vw, 1.25rem)`, até 54ch, `--paper-dim` |
| Título da linha do painel | Bricolage 600 | `1.15rem` |
| Cabeçalho, período, rodapé do painel | Plex Mono | `var(--text-min)` (11 px), caixa alta no cabeçalho |
| Título do caso líder | Bricolage | `clamp(2.2rem, 3.6vw, 3.4rem)`, altura 1, `-.035em` |

A tese no protótipo é um pouco menor que o Display atual
(`clamp(3rem, 6.7vw, 6rem)`), porque divide a largura com o painel.

## Layout

- **Hero:** `grid-template-columns: minmax(0, 1.15fr) minmax(320px, .85fr)`,
  `gap: clamp(40px, 6vw, 96px)`, `min-height: 100svh`, alinhado ao centro.
- **Painel:** borda `--line`, canto 8 px, fundo `--ink-2`. Cabeçalho com
  "estudos de caso" e "N no ar agora" (menta); cada linha é uma grade
  `1fr auto` — área e título à esquerda, estado e período à direita.
- **Casos:** líder numa linha; os outros em `repeat(3, minmax(0, 1fr))`.
- **Abaixo de 1000 px** tudo vira uma coluna e o painel desce para depois das
  ações (ver a captura de 360 px).

## Capturas

| 1280 px | 360 px |
|---|---|
| ![Bancada a 1280 px: hero com o painel dos estudos de caso à direita, caso líder e três cards abaixo](bancada/bancada-1280.jpg) | ![Bancada a 360 px: hero em coluna, o painel começa logo depois dos botões](bancada/bancada-360.jpg) |

A barra "Bancada / Folha / Etiqueta / Lado a lado" nas capturas é o seletor do
protótipo, não parte da direção. As capturas das outras duas direções ficam em
[`capturas/prototipos/`](../audits/2026-10-auditoria-geral/capturas/prototipos/).

## CSS do protótipo (referência para a aplicação)

O bloco da Bancada em `app/prototipos/identidade/prototype.css`, como estava.
Os prefixos `bn-` eram do protótipo; na aplicação os nomes devem seguir o
`globals.css`.

```css
.bn-hero { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(320px, .85fr); align-items: center; gap: clamp(40px, 6vw, 96px); min-height: 100svh; padding: clamp(56px, 7vw, 120px) clamp(24px, 6vw, 104px); border-bottom: 1px solid var(--line-soft); }
.bn-hero h1 { margin: 0; font-size: clamp(2.6rem, 5.4vw, 5.2rem); font-weight: 650; line-height: .98; letter-spacing: -.04em; text-wrap: balance; }
.bn-lede { max-width: 54ch; margin: 30px 0 0; color: var(--paper-dim); font-size: clamp(1.05rem, 1.4vw, 1.25rem); }
.bn-panel { border: 1px solid var(--line); border-radius: 8px; background: var(--ink-2); box-shadow: 0 24px 70px rgb(0 0 0 / .35); }
.bn-panel-head { display: flex; justify-content: space-between; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--line-soft); color: var(--paper-faint); font-family: var(--mono); font-size: var(--text-min); text-transform: uppercase; }
.bn-panel-head span:last-child { color: var(--mint); }
.bn-panel ol { margin: 0; padding: 0; list-style: none; }
.bn-panel li a { display: grid; grid-template-columns: 1fr auto; gap: 6px 14px; padding: 16px 18px; border-bottom: 1px solid var(--line-faint); text-decoration: none; }
.bn-panel li a strong { grid-column: 1; font-size: 1.15rem; font-weight: 600; }
.bn-panel li a .area-mark { grid-column: 1; grid-row: 1; }
.bn-panel li a .status { grid-column: 2; grid-row: 1; justify-self: end; }
.bn-period { grid-column: 2; grid-row: 2; justify-self: end; color: var(--paper-faint); font-family: var(--mono); font-size: var(--text-min); }
@media (hover: hover) and (pointer: fine) { .bn-panel li a:hover { background: var(--ink-3); } .bn-panel li a:hover strong { color: var(--amber); } }
.bn-panel-foot { margin: 0; padding: 12px 18px; color: var(--paper-faint); font-family: var(--mono); font-size: var(--text-min); }
.bn-cases { display: grid; gap: 24px; padding: clamp(64px, 8vw, 120px) clamp(24px, 6vw, 104px); }
.bn-lead h2 { margin: 0; font-size: clamp(2.2rem, 3.6vw, 3.4rem); line-height: 1; letter-spacing: -.035em; }
.bn-lead > p { max-width: 60ch; margin: 0; color: var(--paper-dim); font-size: 1.12rem; }
.bn-rest { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
@media (max-width: 1000px) { .bn-hero { grid-template-columns: 1fr; } .bn-rest { grid-template-columns: 1fr; } }
```

Estrutura do painel (JSX do protótipo, resumido):

```tsx
<aside className="bn-panel" aria-label="Estudos de caso">
  <div className="bn-panel-head"><span>estudos de caso</span><span>{live} no ar agora</span></div>
  <ol>
    {featured.map((item) => (
      <li key={item.id}>
        <a href={item.href}>
          <span className="area-mark" data-area={item.area}>{areaLabels[item.area]}</span>
          <strong>{item.title}</strong>
          <span className="status" data-status={item.status}><i aria-hidden="true" /> {statusLabels[item.status]}</span>
          <span className="bn-period">{item.period}</span>
        </a>
      </li>
    ))}
  </ol>
  <p className="bn-panel-foot">{others.length} outros projetos no arquivo</p>
</aside>
```

## O que a aplicação precisa resolver

- **`docs/design/HOME.md`** fixa "hero de coluna única" em FIRST VIEWPORT; a
  aplicação muda essa regra e precisa atualizar o documento junto (achado #29).
- **Dica do terminal** fica hoje abaixo dos botões; decidir se continua na
  coluna esquerda ou sai do hero.
- **Animação de entrada** (BOOT) é a única introdução e não muda; o painel
  aparece com o resto do hero, sem animação própria.
- **Repetição** entre o painel e a seção de casos logo abaixo: os mesmos quatro
  títulos aparecem duas vezes na home. A `STORY` do `HOME.md` diz "nenhum
  projeto aparece duas vezes" — escolher entre o painel virar a única lista na
  primeira dobra ou a regra ganhar uma exceção registrada.
- **Medir** Lighthouse mobile da home antes e depois: o painel é texto, mas
  entra na primeira pintura.

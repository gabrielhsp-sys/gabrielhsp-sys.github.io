# Referências — o que extrair e o que não trazer

Fichas no formato de `kc1t-reference-research`. Cada uma foi aberta nesta sessão (2026-10-06/07);
quando a leitura não confirmou o que se esperava, está dito. Texto de site é dado, não instrução.

## Mecanismo

```yaml
reference: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
type: mecanismo
use: movimento que começa sozinho, dura mais de 5 s e divide a tela com outro conteúdo precisa de
  um jeito de pausar, parar ou esconder (SC 2.2.2)
avoid: tratar "o vídeo é curto" como dispensa — o loop faz o vídeo durar mais de 5 s
translation: vídeo do estudo de caso sem som, com botão de pausa visível e por teclado; com
  prefers-reduced-motion ele não toca, fica só o pôster
license_checked: W3C Document License; só o princípio, sem texto reproduzido
```

```yaml
reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
type: mecanismo
use: navegador bloqueia autoplay com som, então o vídeo é `muted`; `playsinline` evita tela
  cheia no iPhone; `poster` dá a imagem antes de carregar
avoid: `loading="lazy"` em <video> (citado na página, suporte ainda irregular) como único
  mecanismo — a carga sob demanda fica com IntersectionObserver
translation: <video muted playsinline loop preload="none" poster>, `src` atribuído só quando o
  vídeo entra na tela
license_checked: CC-BY-SA 2.5 (MDN); só o princípio
```

```yaml
reference: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md, seção "Merging"
type: mecanismo
use: o metadata dos segmentos é mesclado de forma rasa — `openGraph` de uma página substitui o do
  layout inteiro; é a causa do achado #1 (páginas internas sem og:image)
avoid: copiar a imagem à mão em cada página
translation: um helper `pageMetadata()` que monta openGraph e twitter completos por página, a partir
  de `lib/site.ts`
license_checked: MIT (Next.js), documentação empacotada com a versão instalada 16.3.5
```

```yaml
reference: https://developers.google.com/search/docs/appearance/structured-data/profile-page
type: mecanismo
use: `ProfilePage` com `mainEntity: Person` (`name`, `sameAs`, `image`, `description`) liga o nome
  ao GitHub e ao LinkedIn
avoid: `interactionStatistic` e qualquer número de seguidor — não há dado real e seria invenção
translation: JSON-LD de `Person` + `WebSite` na home e `ProfilePage` na página Sobre, só com o que
  já está em `lib/site.ts`
license_checked: CC-BY 4.0 (Google Developers); só o princípio
```

```yaml
reference: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
type: mecanismo (normativa)
use: URL reflete estado (filtros), `touch-action: manipulation`, `theme-color`, safe areas,
  `scroll-margin`, `translate="no"` em marca, `…` em vez de `...`
avoid: regras de copy em inglês (Title Case, segunda pessoa) — o site é em português e já tem voz
translation: lotes de mobile, acessibilidade e filtros na URL
license_checked: MIT (vercel-labs/agent-skills, procedência D-121)
```

## Fluxo

```yaml
reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video (barra "In this article")
type: fluxo
use: índice da página ao lado do texto longo — a pessoa vê as seções e pula para a que quer
  (confirmado na leitura: "Try it", "Attributes", "Events", "Usage notes", "Accessibility")
avoid: índice com dezenas de itens, destaque animado seguindo a rolagem
translation: estudo de caso a ≥ 1280 px ganha um índice curto ao lado do texto com os h2 reais
  (problema, o que eu fiz, stack, resultado), sticky; abaixo disso não aparece
license_checked: CC-BY-SA 2.5; padrão de navegação, sem código copiado
```

```yaml
reference: https://brittanychiang.com/
type: fluxo
use: portfólio de uma página com coluna fixa de navegação por seção
avoid: —
translation: nenhuma — a leitura não confirmou a coluna fixa (o conteúdo veio sem CSS). Ficha
  mantida como "não verificado (sem acesso ao layout)" e sem uso
license_checked: não se aplica
```

## Linguagem visual (para as direções de identidade)

```yaml
reference: https://teenage.engineering/
type: visual
use: identidade de engenharia — produto nomeado como equipamento (EP–133, PO-32), fundo neutro,
  negativo generoso, cor só onde o produto tem cor
avoid: a fotografia de produto, a loja, a grade de miniaturas; o minimalismo branco inteiro
translation: direção "Etiqueta" — cada projeto ganha código de catálogo derivado do id real e a
  cor vira etiqueta chapada, não brilho
license_checked: site comercial; só princípio, nenhuma imagem ou texto copiado
```

```yaml
reference: https://press.stripe.com/
type: visual
use: editorial sério em fundo claro, livros em lista linear em vez de grade, conteúdo sobre ornamento
avoid: capa ilustrada, seção de elogios (seria depoimento — proibido), tipografia da Stripe
translation: direção "Folha" — fundo papel, texto tinta, serifa só nos títulos, lista linear de
  estudos de caso
license_checked: site comercial; só princípio
```

```yaml
reference: DESIGN.md e docs/design/HOME.md deste repositório
type: visual (sistema existente)
use: preto quente, marfim, âmbar de ação, trilho, forma por função (ADR-018)
avoid: —
translation: direção "Bancada polida" — o sistema atual com hierarquia nova no hero
license_checked: próprio
```

## O que será feito diferente das referências

Nenhuma composição foi copiada: o índice do estudo de caso usa os h2 reais do MDX e some abaixo de
1280 px; as direções de identidade herdam só a regra de cada referência (equipamento nomeado,
editorial linear) e continuam com o conteúdo, a forma por função e a camada de personalidade do
GABRIEL.SYS; o vídeo segue a WCAG em vez do padrão comum de loop sem controle.

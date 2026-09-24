# GABRIEL.SYS

Portfólio público de Gabriel Henrique: o que ele constrói, como cada coisa foi feita e como falar com ele.

Esta é a terceira versão. A v1 era uma página só, com boot, terminal e easter eggs. A v2 virou um índice editorial pesquisável, mas falava a própria língua (`PLAYING`, `CLEARED`, "saves", "canais"). A v3 mantém o índice e devolve a personalidade — só que nos lugares certos: **rótulo claro na navegação, personalidade na camada de cima**.

## Stack

- Next.js 16 com App Router e exportação estática.
- React 19 e TypeScript estrito.
- Tailwind CSS 4 + CSS autoral.
- Markdown/MDX validado com Zod.
- Phosphor Icons.
- GitHub Pages via Actions.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

O comando de desenvolvimento gera o índice de busca e a imagem de
compartilhamento antes de iniciar o servidor. Os dois artefatos são derivados
do conteúdo e não são versionados.

## Verificar e gerar

```bash
npm run check
```

O comando executa lint, testes de conteúdo e o build estático, que termina verificando a exportação. O site pronto fica em `out/`.

## Estrutura da home

Hero com proposta de valor e contato → quatro estudos de caso em destaque →
o que ele faz → outros projetos (com link para o arquivo completo) → sobre →
contato. Nenhum projeto aparece duas vezes.

Cada estudo de caso segue o mesmo formato: problema → o que ele fez → stack →
resultado, com uma figura, a ficha (área, estado, período, leitura e código) no
topo e o próximo estudo de caso e o contato no fim.

## Camada de personalidade

Opcional por princípio: nada essencial depende dela e tudo funciona só com
teclado.

- **Animação de entrada** — uma vez por sessão, ~1,5 s, pulável por qualquer
  tecla ou clique. Não roda com `prefers-reduced-motion`.
- **Sons** — clique, hover e transição, sintetizados em Web Audio no próprio
  código. Ligados por padrão, com botão visível na barra superior; o contexto de
  áudio nasce no primeiro gesto, porque é quando o navegador libera.
- **Terminal** — crase (ou til), botão do trilho, rodapé e dock móvel.
- **Modo retrô** — Konami (`↑↑↓↓←→←→BA`): glitch curto, fósforo verde com
  scanlines, pacote de sons chiptune e um comando secreto no terminal. A mesma
  sequência, ou o botão "sair do modo retrô", desfaz tudo.
- **Conquistas** — cinco segredos, com toast discreto ao achar cada um.
- **Favicon dinâmico** — terminal na home, arquivo na lista de projetos; cursor
  piscando no título quando a aba perde o foco.

Com `prefers-reduced-motion` não há flicker nem glitch, o CRT fica estático e a
animação de entrada não roda.

## Conteúdo

Cada registro público é um `.md` ou `.mdx` em `content/public`. O frontmatter segue [`docs/content/SCHEMA.md`](docs/content/SCHEMA.md). Antes do servidor local e durante o build, `scripts/generate-search-index.mjs` cria um índice compacto em `public/search-index.json` e `scripts/generate-og-image.mjs` grava `public/og.png`.

Exemplo:

```yaml
id: meu-projeto
title: Meu projeto
summary: Um resumo público e verificável.
type: project
area: software
status: building
visibility: public
publishedAt: 2026-09-15
updatedAt: 2026-09-15
startedAt: "2026-09"
tags: [TypeScript]
related: []
```

O ID deve ser igual ao nome do arquivo. Relações precisam apontar para IDs existentes.
`startedAt` e `endedAt` dizem quando o trabalho aconteceu; o esquema completo e os
componentes de figura (`Flow`, `Excerpt`) estão em `docs/content/SCHEMA.md`.

## Privacidade

Este repositório é público e contém somente material aprovado para publicação. O arquivo privado futuro deve viver fora do repositório de deploy. Importações de chats, e-mail, Rentry ou notas nunca são publicadas automaticamente.

## Navegação

A navegação principal tem três entradas: início, projetos e sobre.

- `/` — hero, estudos de caso, o que ele faz, outros projetos, sobre e contato.
- `/archive` — todos os projetos, com filtro textual, área, estado e ordenação.
- `/projects/[slug]` — estudo de caso completo e relações.
- `/area/[area]` — entrada por área, só para áreas com registro público.
- `Ctrl/⌘ + K` — busca global; setas navegam e `Enter` abre.
- `` ` `` (crase ou til) — camada terminal opcional, também no dock móvel.

No terminal: `help`, `projetos`, `abrir <slot>`, `contato`, `cv`,
`busca <termo>`, `theme`, `som`, `snake`, `sudo hire gabriel`, `clear` e `sair`.
Há mais um comando, que só existe no modo retrô.

As áreas públicas são **Software & Automação** (`/area/software/`), **Web &
Interfaces** (`/area/web/`) e **Acadêmico** (`/area/academico/`). Os estados são
**Em desenvolvimento**, **No ar**, **Concluído** e **Arquivado**.

## Documentação

- [`docs/product/PRODUCT.md`](docs/product/PRODUCT.md)
- [`docs/architecture/DECISIONS.md`](docs/architecture/DECISIONS.md)
- [`docs/design/HOME.md`](docs/design/HOME.md)
- [`docs/design/DESIGN.md`](docs/design/DESIGN.md)
- [`docs/quality/QUALITY.md`](docs/quality/QUALITY.md)

## Licença

Código e conteúdo deste repositório estão sob a licença MIT — ver [`LICENSE`](LICENSE).

Exceções, que a MIT deste repositório não cobre:

- `public/profile.jpg` é uma fotografia pessoal de Gabriel Henrique. A licença cobre o código que a
  exibe, não o uso da imagem.
- As dependências de terceiros (Next.js, React, Tailwind CSS, Zod, Phosphor Icons e as fontes IBM
  Plex Mono e Bricolage Grotesque) mantêm cada uma a sua própria licença. Nenhuma delas é
  redistribuída neste repositório: todas são instaladas pelo npm no build, e `node_modules/` não é
  versionado.

## Publicação

O workflow `.github/workflows/deploy.yml` executa `npm ci`, `npm run check` e envia somente `out/` ao GitHub Pages quando há push na `main`.

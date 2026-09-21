# GABRIEL.SYS

Arquivo público vivo de Gabriel Henrique: projetos, estudos, infraestrutura, referências e registros conectados.

Esta é a segunda versão do portfólio. O site deixou de ser uma apresentação estática com estética de terminal e passou a funcionar como um índice editorial pesquisável. A personalidade retro continua na lógica de saves, nos estados e em detalhes de hardware; leitura e navegação permanecem diretas.

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

## Conteúdo

Cada registro público é um `.md` ou `.mdx` em `content/public`. O frontmatter segue [`docs/content/SCHEMA.md`](docs/content/SCHEMA.md). Antes do servidor local e durante o build, `scripts/generate-search-index.mjs` cria um índice compacto em `public/search-index.json` e `scripts/generate-og-image.mjs` grava `public/og.png`.

Exemplo:

```yaml
id: meu-projeto
title: Meu projeto
summary: Um resumo público e verificável.
type: project
channel: CODE
status: PLAYING
visibility: public
publishedAt: 2026-09-15
updatedAt: 2026-09-15
tags: [typescript]
related: []
```

O ID deve ser igual ao nome do arquivo. Relações precisam apontar para IDs existentes.

## Privacidade

Este repositório é público e contém somente material aprovado para publicação. O arquivo privado futuro deve viver fora do repositório de deploy. Importações de chats, e-mail, Rentry ou notas nunca são publicadas automaticamente.

## Navegação

A navegação principal tem três entradas: início, arquivo e sobre. Não existe
uma listagem de projetos separada; o arquivo é a coleção central.

- `/` — abertura editorial, save atual e últimos registros.
- `/archive` — todos os saves, com filtro textual, canal, estado, tipo e ordenação.
- `/projects/[slug]` — detalhe e relações.
- `/channel/[channel]` — entrada por área, só para canais com registro público.
- `Ctrl/⌘ + K` — busca global; setas navegam e `Enter` abre.
- `~` (ou crase) — camada terminal opcional, também no dock móvel.

No terminal: `help`, `ls`, `open <slot>`, `archive`, `channels`,
`search <termo>`, `whoami`, `clear` e `exit`.

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

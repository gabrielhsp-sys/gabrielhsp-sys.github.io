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

## Verificar e gerar

```bash
npm run check
```

O comando executa lint, testes de conteúdo e o build estático. O site pronto fica em `out/`.

## Conteúdo

Cada registro público é um `.md` ou `.mdx` em `content/public`. O frontmatter segue [`docs/content/SCHEMA.md`](docs/content/SCHEMA.md). Durante o build, `scripts/generate-search-index.mjs` cria um índice compacto em `public/search-index.json`.

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

- `/` — índice e atividade recente.
- `/archive` — todos os saves com filtros.
- `/projects` — projetos por estado.
- `/projects/[slug]` — detalhe e relações.
- `/channel/[channel]` — entrada por área.
- `Ctrl/⌘ + K` — busca global.
- `~` — camada terminal opcional.

## Documentação

- [`docs/product/PRODUCT.md`](docs/product/PRODUCT.md)
- [`docs/architecture/DECISIONS.md`](docs/architecture/DECISIONS.md)
- [`docs/design/HOME.md`](docs/design/HOME.md)
- [`docs/design/DESIGN.md`](docs/design/DESIGN.md)
- [`docs/quality/QUALITY.md`](docs/quality/QUALITY.md)

## Publicação

O workflow `.github/workflows/deploy.yml` executa `npm ci`, `npm run check` e envia somente `out/` ao GitHub Pages quando há push na `main`.

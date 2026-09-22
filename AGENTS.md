# GABRIEL.SYS — router

Antes de alterar produto, conteúdo ou interface, leia:

- `PRODUCT.md` e `docs/product/PRODUCT.md` — promessa, público, escopo e privacidade.
- `docs/content/SCHEMA.md` — frontmatter, canais, estados e relações.
- `docs/architecture/DECISIONS.md` — decisões técnicas e fronteira público/privado.
- `docs/quality/QUALITY.md` — critérios de aceite.
- `docs/design/HOME.md` — direção da superfície principal.
- `DESIGN.md` — sistema visual consolidado; `docs/design/DESIGN.md` mantém o atalho documental.

Regras que não podem ser quebradas:

1. O repositório de deploy contém apenas conteúdo aprovado como público.
2. Nada importado de chats, e-mail, histórico ou arquivos privados é publicado automaticamente.
3. Conteúdo público nasce em Markdown/MDX validado; índices são derivados no build.
4. A camada terminal é secundária. A navegação editorial funciona sem ela.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

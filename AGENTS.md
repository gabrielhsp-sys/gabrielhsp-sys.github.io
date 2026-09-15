# GABRIEL.SYS — router

Antes de alterar produto, conteúdo ou interface, leia:

- `PRODUCT.md` e `docs/product/PRODUCT.md` — promessa, público, escopo e privacidade.
- `docs/content/SCHEMA.md` — frontmatter, canais, estados e relações.
- `docs/architecture/DECISIONS.md` — decisões técnicas e fronteira público/privado.
- `docs/quality/QUALITY.md` — critérios de aceite.
- `docs/design/HOME.md` — direção da superfície principal.
- `docs/design/DESIGN.md` — sistema visual consolidado.

Regras que não podem ser quebradas:

1. O repositório de deploy contém apenas conteúdo aprovado como público.
2. Nada importado de chats, e-mail, histórico ou arquivos privados é publicado automaticamente.
3. Conteúdo público nasce em Markdown/MDX validado; índices são derivados no build.
4. A camada terminal é secundária. A navegação editorial funciona sem ela.

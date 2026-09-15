# Qualidade e aceite

## Conteúdo e privacidade

- [ ] Apenas fatos verificáveis em fontes públicas entram no site.
- [ ] Todo item possui `visibility: public` e frontmatter válido.
- [ ] Nenhum conteúdo privado, token ou segredo está no repositório ou no bundle.
- [ ] Relações apontam para IDs existentes.

## Experiência

- [ ] Busca abre com botão e `Ctrl/⌘ + K`, fecha com `Esc` e funciona por teclado.
- [ ] Navegação e leitura funcionam sem depender da camada terminal.
- [ ] Estados de carregamento, vazio e erro da busca são legíveis.
- [ ] Foco, seleção, scrollbar e links pertencem ao sistema visual.
- [ ] `prefers-reduced-motion` remove movimentos não essenciais.
- [ ] Layout validado em 360, 768, 1280 e 1536 px.

## Engenharia

- [ ] `npm run lint` passa.
- [ ] `npm test` passa.
- [ ] `npm run build` gera `out/`.
- [ ] Índice de busca é derivado de `content/public`.
- [ ] Links internos e relações são verificados.
- [ ] GitHub Actions publica somente o diretório `out/`.

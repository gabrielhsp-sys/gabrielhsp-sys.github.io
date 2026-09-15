# Qualidade e aceite

## Conteúdo e privacidade

- [x] Apenas fatos verificáveis em fontes públicas entram no site.
- [x] Todo item possui `visibility: public` e frontmatter válido.
- [x] Nenhum conteúdo privado, token ou segredo está no repositório ou no bundle.
- [x] Relações apontam para IDs existentes.

## Experiência

- [x] Busca abre com botão e `Ctrl/⌘ + K`, fecha com `Esc` e funciona por teclado.
- [x] Navegação e leitura funcionam sem depender da camada terminal.
- [x] Estados de carregamento, vazio e erro da busca são legíveis.
- [x] Foco, seleção, scrollbar e links pertencem ao sistema visual.
- [x] `prefers-reduced-motion` remove movimentos não essenciais.
- [ ] Layout validado em 360, 768, 1280 e 1536 px.

## Engenharia

- [x] `npm run lint` passa.
- [x] `npm test` passa.
- [x] `npm run build` gera `out/`.
- [x] Índice de busca é derivado de `content/public`.
- [x] Links internos e relações são verificados.
- [x] GitHub Actions publica somente o diretório `out/`.

## Evidência pendente

A captura renderizada desktop/mobile não foi produzida nesta sessão porque o navegador remoto bloqueou o servidor local e o binário local do Chromium não pôde ser baixado. A revisão independente permaneceu em `recapture` exclusivamente por essa ausência; as correções de código encontradas foram pontuadas como resolvidas.

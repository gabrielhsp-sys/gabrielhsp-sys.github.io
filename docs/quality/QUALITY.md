# Qualidade e aceite

## Conteúdo e privacidade

- [x] Apenas fatos verificáveis em fontes públicas entram no site.
- [x] Todo item possui `visibility: public` e frontmatter válido.
- [x] Nenhum conteúdo privado, token ou segredo está no repositório ou no bundle.
- [x] Relações apontam para IDs existentes.
- [x] Canais sem registro público não aparecem em nenhuma superfície.
- [x] A exportação é verificada depois do build por `scripts/verify-export.mjs`.

## Experiência

- [x] Busca abre com botão e `Ctrl/⌘ + K`, fecha com `Esc` e funciona por teclado.
- [x] Setas, `Home`, `End` e `Enter` percorrem e abrem resultados; o total é anunciado.
- [x] O arquivo filtra por texto, canal, estado e tipo, e ordena por data ou título.
- [x] O terminal aceita comandos reais e não promete um cursor que não digita.
- [x] A navegação principal separa apresentação, exploração do arquivo e contexto pessoal sem índices redundantes.
- [x] Navegação e leitura funcionam sem depender da camada terminal.
- [x] Estados de carregamento, vazio e erro da busca são legíveis.
- [x] Foco, seleção, scrollbar e links pertencem ao sistema visual.
- [x] `prefers-reduced-motion` remove movimentos não essenciais.
- [x] Layout validado em 360, 768 e 1280 px, sem estouro horizontal em nenhuma rota.

## Engenharia

- [x] `npm run lint` passa.
- [x] `npm test` passa.
- [x] `npm run build` gera `out/`.
- [x] Índice de busca é derivado de `content/public`.
- [x] Links internos e relações são verificados.
- [x] GitHub Actions publica somente o diretório `out/`.

## Evidência

As capturas pendentes foram produzidas com o Chromium local dirigido por CDP
sobre a exportação estática servida em `out/`, em 360, 768 e 1280 px, para
início, arquivo, sobre, projeto, canal vazio e 404, além das camadas de busca
e terminal.

Verificado no navegador, não apenas por inspeção de código:

- `Ctrl/⌘ + K` abre, foca o campo, torna o fundo inerte, filtra sem acento,
  mostra o estado vazio, navega por setas com retorno circular, abre com
  `Enter` e devolve o foco ao fechar.
- O terminal executa `help`, `ls`, `open <slot>` e comandos inválidos, e o
  atalho não é engolido ao digitar `~` dentro do campo.
- A barra de filtros fixa em 72 px e o painel lateral do projeto em 110 px,
  confirmando a correção do contêiner de rolagem.
- Nenhuma rota tem `scrollWidth` maior que a largura da janela.
- Nenhum erro de console em 360, 768 e 1280 px.
- Contraste conferido por cálculo em todos os pares usados: mínimo de 4,7:1.

# Qualidade e aceite

## Conteúdo e privacidade

- [x] Apenas fatos verificáveis em fontes públicas entram no site.
- [x] Todo item possui `visibility: public` e frontmatter válido.
- [x] Nenhum conteúdo privado, token ou segredo está no repositório ou no bundle.
- [x] Relações apontam para IDs existentes.
- [x] Áreas sem registro público não aparecem em nenhuma superfície.
- [x] Nenhum estudo de caso afirma métrica, usuário ou resultado sem fonte no repositório do projeto.
- [x] A exportação é verificada depois do build por `scripts/verify-export.mjs`.

## Experiência

- [x] Busca abre com botão e `Ctrl/⌘ + K`, fecha com `Esc` e funciona por teclado.
- [x] Setas, `Home`, `End` e `Enter` percorrem e abrem resultados; o total é anunciado.
- [x] O arquivo filtra por texto, área e estado, e ordena por data ou título.
- [x] Nenhum rótulo `PLAYING`, `CLEARED`, `CODEX`, `SAVES` ou "canais" aparece na navegação.
- [x] O terminal aceita comandos reais e não promete um cursor que não digita.
- [x] A navegação principal separa apresentação, exploração do arquivo e contexto pessoal sem índices redundantes.
- [x] Navegação e leitura funcionam sem depender da camada terminal.
- [x] Estados de carregamento, vazio e erro da busca são legíveis.
- [x] Foco, seleção, scrollbar e links pertencem ao sistema visual.
- [x] `prefers-reduced-motion` remove movimentos não essenciais.

## Camada de personalidade

Conferido por código e build:

- [x] Nada essencial depende de easter egg: terminal, modo retrô, snake e conquistas vivem em componentes próprios, fora de qualquer rota ou dado.
- [x] Sons são sintetizados em Web Audio no próprio código: sem arquivo de áudio e sem dependência nova no `package.json`.
- [x] O botão de som está na barra superior, com `aria-pressed` e rótulo acessível.
- [x] O modo retrô sai pela mesma sequência do Konami ou pelo botão "sair do modo retrô".
- [x] `prefers-reduced-motion` tem regra explícita para a tela de entrada, o glitch, o toast e o cursor do título; o CRT fica estático.
- [x] A animação de entrada lê e grava `sessionStorage`, então não repete na navegação interna.

Pendente de verificação no navegador (`needs-verification`):

- [ ] Animação de entrada: aparece na primeira carga, é pulável e não repete.
- [ ] Som: começa no primeiro gesto e a preferência sobrevive ao recarregar.
- [ ] Konami, snake, conquistas e favicon dinâmico em uso real.
- [ ] Teclado completo nas superfícies novas, em 360, 768 e 1280 px.
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
- Contraste conferido por cálculo em todos os pares usados.
- `hardware-line` passou de 1,59:1 para 3,36:1 sobre preto quente, cumprindo a
  WCAG 1.4.11 para borda de componente (D-056). Os filetes decorativos foram
  movidos para `hardware-line-soft` e `hardware-line-faint`, aos quais o limiar
  não se aplica.
- Paleta do modo retrô conferida no próprio fundo: texto 17,9:1 e borda de
  componente 4,7:1.

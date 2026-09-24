# Qualidade e aceite

## Conteúdo e privacidade

- [x] Apenas fatos verificáveis em fontes públicas entram no site.
- [x] Todo item possui `visibility: public` e frontmatter válido.
- [x] Nenhum conteúdo privado, token ou segredo está no repositório ou no bundle.
- [x] Relações apontam para IDs existentes.
- [x] Áreas sem registro público não aparecem em nenhuma superfície.
- [x] Nenhum estudo de caso afirma métrica, usuário ou resultado sem fonte no repositório do projeto.
- [x] O período de cada projeto vem de evidência (primeiro commit, semestre, envio) e o build recusa período que contradiga o estado.
- [x] Trecho de código em estudo de caso vem de arquivo público idêntico ao publicado, com as omissões marcadas.
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
- [x] Âmbar marca ação e foco; área é quadrado, estado é ponto, seleção é campo neutro (ADR-018).
- [x] Alvos interativos têm 44px, exceto link dentro de frase, que a WCAG 2.5.8 isenta.
- [x] A página de projeto não repete área, estado, stack nem link, e termina com próximo passo.
- [x] Home, arquivo e páginas de área desenham o projeto com a mesma linha.
- [x] `prefers-reduced-motion` remove movimentos não essenciais.

## Camada de personalidade

Conferido por código e build:

- [x] Nada essencial depende de easter egg: terminal, modo retrô, snake e conquistas vivem em componentes próprios, fora de qualquer rota ou dado.
- [x] Sons são sintetizados em Web Audio no próprio código: sem arquivo de áudio e sem dependência nova no `package.json`.
- [x] O botão de som está na barra superior, com `aria-pressed` e rótulo acessível.
- [x] O modo retrô sai pela mesma sequência do Konami ou pelo botão "sair do modo retrô".
- [x] `prefers-reduced-motion` tem regra explícita para a tela de entrada, o glitch, o toast e o cursor do título; o CRT fica estático.
- [x] A animação de entrada lê e grava `sessionStorage`, então não repete na navegação interna.
- [x] A animação de entrada leva ~1,9 s do carregamento ao conteúdo (medido em três execuções: 1,87–1,90 s em 1440 px e 1,84–1,85 s em 390 px; antes, 5,8 s). `Esc` pula e o conteúdo volta em ~0,34 s.
- [x] A animação de entrada não recebe ponteiro: um clique pula a animação e ainda chega no link, então nenhuma navegação precisa de dois cliques (ADR-014).
- [x] O ícone por rota é declarado pelo Next (`app/**/icon.svg`); a camada de personalidade não remove tags `<link>` que o React renderiza (ADR-014).

Pendente de verificação no navegador (`needs-verification`):

- [ ] Animação de entrada: aparece na primeira carga, é pulável e não repete.
- [ ] Som: começa no primeiro gesto e a preferência sobrevive ao recarregar.
- [ ] Konami, snake e conquistas em uso real.
- [ ] Teclado completo nas superfícies novas, em 360, 768 e 1280 px.
- [x] Layout validado em 360, 768 e 1280 px, sem estouro horizontal em nenhuma rota.

## Engenharia

- [x] `npm run lint` passa.
- [x] `npm test` passa, incluindo `normalizeSearch` e o formato e a ordem dos períodos.
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

### Rodada de 2026-09-24

Capturas com Playwright sobre a exportação estática, em 320, 390, 768 e
1440 px, antes e depois, para home, três estudos de caso, um projeto sem
destaque, arquivo, área, sobre e 404, mais modo retrô e a linha do tempo da
animação de entrada.

- Nenhuma rota com `scrollWidth` maior que a janela; nenhum texto abaixo de
  11px; nenhum erro de console além do 404 esperado na rota inexistente.
- Alvos menores que 44px caíram de 9–18 por página para zero, exceto o
  sobreposto do card (o card inteiro é clicável) e link dentro de frase.
- A fonte mono não carregava: o token pedia `"IBM Plex Mono Variable"` e o
  pacote instalado registra `"IBM Plex Mono"`. Todos os rótulos caíam na mono do
  sistema (Noto Sans Mono no Linux; no Windows, a mono padrão do navegador).
  Conferido por CDP depois da correção.
- Com o modo retrô ligado, o atalho da busca não quebra mais em duas linhas.

# Decisões de arquitetura

## ADR-001 — exportação estática

Next.js com `output: export` mantém rotas, geração de metadados e componentes React, mas entrega HTML estático compatível com GitHub Pages.

## ADR-002 — conteúdo versionado

Os registros públicos vivem em `content/public`. O build lê Markdown/MDX, valida o frontmatter com Zod e gera rotas e índice de busca. Não existe pasta de conteúdo privado neste repositório.

## ADR-003 — privacidade por separação física

O arquivo privado futuro deve existir fora do repositório de deploy. A publicação será uma cópia revisada para `content/public`, não uma alteração de flag em dados já enviados ao GitHub.

## ADR-004 — relações por identificadores

O campo `related` guarda IDs estáveis. As relações são resolvidas no build e aparecem nas páginas de detalhe.

## ADR-005 — JavaScript progressivo

Navegação, leitura e descoberta básica funcionam no HTML exportado. JavaScript adiciona a busca `Ctrl/⌘ + K`, filtros e a camada de personalidade opcional (animação de entrada, sons, terminal, modo retrô e conquistas).

`Ctrl/⌘ + K` continua sendo a busca. A v3 chegou a propor mover o atalho para o
terminal; a proposta foi recusada porque o atalho já está publicado e
documentado, e porque busca é função de produto, não easter egg. O terminal abre
na crase, pelo botão do trilho, pelo rodapé e pelo dock móvel.

## ADR-006 — dependências visuais pequenas

Phosphor fornece ícones consistentes. Bricolage Grotesque e IBM Plex Mono são empacotadas localmente. Não há vídeo de fundo nem biblioteca de animação nesta versão. A única imagem gerada é a carta de compartilhamento descrita na ADR-008.

## ADR-007 — o arquivo é a única listagem

A navegação principal tem início, arquivo e sobre. Uma listagem `/projects`
separada repetia o arquivo com outra roupa, ficava fora do menu e fora do
sitemap. Ela foi removida; `/projects/[slug]` continua sendo a rota de
detalhe, porque os endereços já publicados dependem dela.

## ADR-008 — imagem de compartilhamento gerada no build

A carta OpenGraph é desenhada a partir do próprio sistema visual e gerada por
`scripts/generate-og-image.mjs` em `public/og.png`, junto do índice de busca.

A convenção `opengraph-image` do Next emite um arquivo sem extensão na
exportação estática. O GitHub Pages serve esse arquivo como
`application/octet-stream`, que boa parte dos leitores de metadados recusa.
Gravar um `.png` explícito mantém o tipo correto sem serviço externo.

## ADR-009 — área vazia não aparece

As áreas continuam no esquema e seguem validando o frontmatter, mas a interface
pública só mostra as que têm pelo menos um registro. A home, as rotas
`/area/[area]`, o sitemap e os filtros derivam a lista de `getPublicAreas()`,
então uma área reaparece sozinha no primeiro projeto que receber.

Uma área sem conteúdo era um destino que só sabia dizer que estava vazio.
`scripts/verify-export.mjs` roda depois do build e falha se a exportação tiver
uma área sem registro, ou faltar uma que tenha.

## ADR-010 — rótulo claro, personalidade na camada de cima

A navegação usa a língua de quem contrata: **Software & Automação**, **Web &
Interfaces** e **Acadêmico**, com estados **Em desenvolvimento**, **No ar**,
**Concluído** e **Arquivado**. A metáfora de jogo e terminal — que antes estava
nos rótulos (`PLAYING`, `CLEARED`, `CODEX`, "saves", "canais") — passou inteira
para a camada de personalidade: animação de entrada, sons, terminal, modo retrô
e conquistas.

Um recrutador não deveria precisar decifrar um vocabulário próprio para
descobrir se um projeto está pronto.

Consequência nas rotas: `/channel/[channel]` virou `/area/[area]`. Nenhum
endereço sobreviveria de qualquer forma, porque todos os identificadores de
canal mudaram.

## ADR-011 — o que sai do público

Homelab, `/RESEARCH` e o tipo "Referência" saem da parte pública nesta versão.
O homelab é um projeto aposentado que será refeito do zero (D-041); manter a
ficha antiga no ar venderia uma coisa que não existe mais. O tipo "Referência"
sumiu junto com o filtro de tipo: com o acervo deste tamanho, ele separava sem
ajudar ninguém a decidir.

O guia do Fedora, que vivia em `/RESEARCH` como referência, foi reclassificado
para **Software & Automação** como projeto. Ele é mantido, testado e publicado —
a antiga classificação dizia menos do que o trabalho vale.

## ADR-012 — camada de personalidade separada da estrutura

A personalidade vive em componentes próprios (`personality.tsx`,
`boot-sequence.tsx`, `snake.tsx`, `browser-chrome.tsx`) e nunca em uma rota ou
em um dado. Isso torna verificável a regra do produto: nada essencial depende
dela.

As preferências (som, modo retrô, conquistas) vivem fora do React e entram por
`useSyncExternalStore`, com `getServerSnapshot` devolvendo o padrão. Assim a
exportação estática não carrega estado de navegador e a hidratação não diverge.

Sons são sintetizados com Web Audio no próprio código: sem arquivo de áudio e
sem biblioteca. O contexto de áudio nasce no primeiro gesto do visitante,
porque é quando o navegador libera — não há truque para tocar antes disso.

## ADR-013 — hardware-line passa a ser borda de componente

`hardware-line` valia `#39342d`, 1,59:1 sobre preto quente: abaixo dos 3:1 que a
WCAG 1.4.11 exige de qualquer borda necessária para identificar um componente
(D-056). O token passou para `#6b6459`, 3,36:1, e continua na rampa warm-black.

Os filetes que apenas separam seções e linhas de lista foram movidos para
`hardware-line-soft` (`#39342d`) e `hardware-line-faint` (`#26221e`). Eles são
decorativos: não identificam componente nem estado, então o limiar não se
aplica a eles e a densidade visual do arquivo não mudou.

## ADR-014 — a personalidade não intercepta clique nem mexe no DOM do React

Dois defeitos de navegação nasceram da mesma origem: a camada de personalidade
disputando com o navegador e com o React o que não era dela.

A animação de entrada entra **depois** da hidratação, por cima de uma página que
já estava visível e clicável. Enquanto ela cobria a tela com `pointer-events`
ativo, o primeiro clique em um link só servia para pulá-la — a navegação exigia
um segundo clique. A tela passou a ser `pointer-events: none` (só o botão
"pular" recebe ponteiro). Pular por clique continua valendo, porque o gesto é
ouvido na janela: um clique pula a animação **e** faz o que o visitante pediu.

O favicon por rota era trocado removendo do `<head>` toda tag
`<link rel="icon">` — inclusive a que o React renderiza a partir de
`app/icon.svg`. Na transição seguinte o React tentava desmontar um nó já sem
pai e estourava `Cannot read properties of null (reading 'removeChild')` no meio
da navegação. O ícone por rota passou a ser declarado pelo próprio Next, com
`app/archive/icon.svg` e `app/area/icon.svg` sobrescrevendo `app/icon.svg`;
`browser-chrome.tsx` ficou só com o cursor piscando no título da aba.

Regra que fica: a camada de personalidade nunca remove nem reordena nós que o
React renderiza, e nunca fica entre o visitante e um alvo clicável.

## ADR-015 — nenhum projeto aparece duas vezes na home

A home mostrava os estudos de caso em cards e, logo abaixo, o explorador do
arquivo com todos os projetos — quatro dos seis itens apareciam duas vezes, com
a mesma descrição. A repetição alongava a página e parecia enchimento.

A seção `#arquivo` da home passou a listar só os registros com
`featured: false`, sem busca nem filtros, sob o título "Outros projetos" e com
um link para o arquivo completo. O explorador filtrável continua existindo em
`/archive/`, que segue sendo a listagem completa (ADR-007). A linha de arquivo
virou um componente só (`components/archive-line.tsx`), usado pela home e pelo
explorador, para o mesmo projeto não ter duas caras.

Regra que fica: na home, cada projeto público aparece uma única vez — em
destaque ou em "Outros projetos". `scripts/verify-export.mjs` confere isso no
site exportado.

## ADR-016 — período real no lugar da data de entrada

As datas visíveis vinham de `updatedAt` e `publishedAt`, que marcam quando o
registro entrou ou foi revisto no site. Como o portfólio foi reescrito em
setembro de 2026, tudo parecia feito no mesmo mês — inclusive um trabalho do
primeiro semestre de 2025.

O esquema ganhou `startedAt` e `endedAt` (`YYYY` ou `YYYY-MM`), preenchidos a
partir de evidência: primeiro commit, semestre registrado no repositório da
faculdade, envio do trabalho. Linhas do arquivo, páginas de área e a ficha do
projeto mostram só o período. `updatedAt` continua existindo para feed, sitemap
e o "atualizado em" da barra superior. A validação recusa fim em projeto que
continua, ausência de fim em projeto concluído e fim antes do começo. A ordem
"mais recente" passou a ser a atividade mais recente, não a última revisão do
texto. `lib/period.ts` não importa nada, e `tests/format.test.mjs` o testa direto.

## ADR-017 — animação de entrada curta

A animação de entrada continua sendo a única introdução (decisão de
2026-09-21), mas medida no navegador levava 5,8 s até o conteúdo voltar. O
roteiro foi condensado para cinco linhas e o conjunto cabe em ~1,9 s do
carregamento ao conteúdo. A primeira versão condensada levava 1,5 s; a pedido
do proprietário, as pausas foram esticadas na mesma proporção, sem mudar
roteiro, aparência nem comportamento (medido: 1,84–1,90 s). As regras de antes
não mudam: uma vez por sessão, pulável por qualquer tecla ou clique, fora do
`prefers-reduced-motion`, sem interceptar ponteiro (ADR-014).

Tirar a animação da abertura e deixá-la só como comando foi considerado e
recusado pelo proprietário: ela é identidade, e o custo real era a duração.

## ADR-018 — cada função de cor tem uma forma

O âmbar marcava ação, navegação ativa, filtro selecionado, área Software,
estado "Em desenvolvimento", rótulos de rota e títulos de ficha ao mesmo tempo.
A cor sozinha deixava de dizer o que era clicável.

A paleta não mudou; mudou o uso:

- **Ação e foco** — âmbar em botão, link de ação, anel de foco e navegação ativa.
- **Área** — quadrado na cor da área ao lado do nome, em texto neutro, e os
  filetes de 3px do card, do projeto e da página de área.
- **Estado** — ponto redondo com o nome na cor do estado.
- **Seleção** — filtro e ordenação selecionados usam campo neutro com borda,
  não âmbar.

Marcadores de lista, código em linha e títulos de ficha voltaram ao neutro.

## ADR-019 — estudo de caso com ficha única, figura e saída

A página de projeto repetia área e estado no cabeçalho e na ficha lateral,
repetia a stack em etiquetas e no texto, repetia o link do repositório no topo e
na seção "Link", e terminava sem próximo passo.

Agora a ficha fica uma vez só, no cabeçalho: área, estado, período, leitura e
código. A seção "Link" saiu do MDX, porque o link já vem de `github` no
frontmatter. Cada destaque ganhou uma figura escrita no próprio MDX — `Flow`
para passos e camadas, `Excerpt` para trecho real de repositório público —, em
texto, para leitor de tela, busca do navegador e modo retrô. A página termina
com o próximo estudo de caso e o contato; o próximo sai da lista de
relacionados para não aparecer duas vezes.

As páginas de área passaram a usar a mesma linha do arquivo
(`components/archive-line.tsx`): o mesmo projeto não muda de cara conforme a
porta de entrada.

## ADR-020 — identidade sem enfeite de template

Revisão dos padrões que davam "cara de template dev", feita item a item com o
proprietário:

- O selo pulsante "Disponível para estágio" virou dado na linha de
  apresentação do hero, com o ponto verde parado.
- Saíram os rótulos de rota sob os títulos (`/whoami`, `/projetos --todos`,
  `/software`) e os números 01–04 dos cards. Eram decoração, e o DESIGN.md já
  vetava rótulo pequeno como enfeite.
- O itálico ficou só na tese do hero. A Bricolage não tem itálico, então o
  navegador inclina a fonte à força; um uso é assinatura, três eram tique.
- A marca aparece uma vez: no desktop, o monograma do trilho; no celular, sem
  trilho, o nome por extenso no topo. O selo "GH / SYS" da foto saiu. O botão
  de som virou ícone sem moldura, e a busca é o único controle com peso na
  barra. No celular a busca fica só no dock.
- O relógio "ONLINE HH:MM" era um estado inventado. No lugar, a data da revisão
  mais recente do conteúdo.

Ficaram, por serem identidade e não enfeite: textura de fundo, trilho,
monograma, índice numerado das linhas do arquivo, terminal, sons e Konami.

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

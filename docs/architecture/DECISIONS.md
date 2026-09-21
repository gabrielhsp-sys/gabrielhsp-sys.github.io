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

Navegação, leitura e descoberta básica funcionam no HTML exportado. JavaScript adiciona a busca `Ctrl/⌘ + K`, filtros e a camada terminal opcional.

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

## ADR-009 — canal vazio não aparece

Os seis canais continuam no esquema e seguem validando o frontmatter, mas a
interface pública só mostra os que têm pelo menos um registro. A home, as
rotas `/channel/[channel]`, o sitemap e os filtros do arquivo derivam a lista
de `getPublicChannels()`, então um canal reaparece sozinho no primeiro save
que receber.

Um canal sem conteúdo era um destino que só sabia dizer que estava vazio.
`scripts/verify-export.mjs` roda depois do build e falha se a exportação
tiver um canal sem registro, ou faltar um que tenha.

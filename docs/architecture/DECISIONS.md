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

Phosphor fornece ícones consistentes. Bricolage Grotesque e IBM Plex Mono são empacotadas localmente. Não há imagens geradas, vídeo de fundo ou biblioteca de animação nesta versão.

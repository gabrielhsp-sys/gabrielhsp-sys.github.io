# Esquema de conteúdo público

Cada arquivo `.md` ou `.mdx` em `content/public` usa:

```yaml
id: academic-system
title: Academic System
summary: Sistema acadêmico em Java com arquitetura em camadas.
type: project
channel: CODE
status: PLAYING
visibility: public
publishedAt: 2025-08-20
updatedAt: 2026-09-15
tags: [java, arquitetura, testes]
related: [faculdade-bcc, homelab]
github: https://github.com/gabrielhsp-sys/academic-system
featured: true
```

## Campos

| Campo | Regra |
|---|---|
| `id` | Único, estável e em kebab-case |
| `title` | Título público |
| `summary` | Resumo curto para índice e busca |
| `type` | `project`, `log`, `note` ou `reference` |
| `channel` | `CODE`, `HOMELAB`, `COLLEGE`, `HARDWARE`, `CREATE` ou `RESEARCH` |
| `status` | `PLAYING`, `PAUSED`, `CLEARED` ou `CODEX` |
| `visibility` | Neste repositório, obrigatoriamente `public` |
| `publishedAt` | Data pública inicial, ISO-8601 |
| `updatedAt` | Última revisão, ISO-8601 |
| `tags` | Termos públicos de descoberta |
| `related` | IDs de registros relacionados |
| `github` | URL pública opcional |
| `featured` | Destaque opcional na página inicial |

## Estados

- `PLAYING`: trabalho em curso.
- `PAUSED`: preservado, sem atividade atual.
- `CLEARED`: encerrado ou entregue.
- `CODEX`: material de consulta que alimenta outros trabalhos.

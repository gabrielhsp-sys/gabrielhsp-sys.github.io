# Esquema de conteúdo público

Cada arquivo `.md` ou `.mdx` em `content/public` usa:

```yaml
id: academic-system
title: Academic System
summary: Sistema acadêmico em Java com arquitetura em camadas.
type: project
area: software
status: building
visibility: public
publishedAt: 2026-06-30
updatedAt: 2026-09-11
tags: [java, arquitetura, testes]
related: [faculdade-bcc]
github: https://github.com/gabrielhsp-sys/academic-system
featured: true
featuredRank: 3
```

## Campos

| Campo | Regra |
|---|---|
| `id` | Único, estável e em kebab-case |
| `title` | Título público |
| `summary` | Resumo curto para índice e busca |
| `type` | `project`, `log` ou `note` |
| `area` | `software`, `web` ou `academico` |
| `status` | `building`, `live`, `done` ou `archived` |
| `visibility` | Neste repositório, obrigatoriamente `public` |
| `publishedAt` | Data pública inicial, ISO-8601 |
| `updatedAt` | Última revisão, ISO-8601 |
| `tags` | Termos públicos de descoberta |
| `related` | IDs de registros relacionados |
| `github` | URL pública opcional. Ausente quando o repositório é privado |
| `featured` | Vira estudo de caso em destaque na home |
| `featuredRank` | Ordem entre os destaques. Menor vem primeiro; o padrão é 99 |

## Áreas

Os rótulos públicos usam a língua de quem contrata. O prefixo em mono
(`/software`) é decoração ao lado do nome legível, nunca o rótulo principal.

- `software` — **Software & Automação**: serviços que rodam sozinhos, sistemas
  com arquitetura e teste, Linux e automação.
- `web` — **Web & Interfaces**: sites e interfaces, acessibilidade, performance
  e conteúdo versionado.
- `academico` — **Acadêmico**: Ciência da Computação na UNIFAL-MG.

## Estados

- `building` — **Em desenvolvimento**: trabalho em curso.
- `live` — **No ar**: publicado e em operação agora.
- `done` — **Concluído**: entregue e sem trabalho pendente.
- `archived` — **Arquivado**: preservado, sem atividade atual.

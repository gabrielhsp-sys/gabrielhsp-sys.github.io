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
startedAt: "2026-06"
endedAt: "2026-06"
tags: [Java, arquitetura, testes]
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
| `publishedAt` | Data em que o registro entrou no site, ISO-8601 |
| `updatedAt` | Última revisão do registro, ISO-8601. Alimenta feed, sitemap e o "atualizado em" da barra superior |
| `startedAt` | Quando o trabalho **começou**, `YYYY` ou `YYYY-MM`. Obrigatório. Sai de evidência (primeiro commit, semestre do trabalho), nunca da data em que o registro entrou no site |
| `endedAt` | Quando o trabalho **terminou**, mesmo formato. Obrigatório em `done` e `archived`; proibido em `building` e `live`, que continuam. Nunca antes de `startedAt` |
| `tags` | Termos públicos de descoberta |
| `related` | IDs de registros relacionados |
| `github` | URL pública opcional. Ausente quando o repositório é privado |
| `featured` | Vira estudo de caso em destaque na home |
| `featuredRank` | Ordem entre os destaques. Menor vem primeiro; o padrão é 99 |

## Período

O site mostra o período real do trabalho — `JUN 2026`, `MAR – JUL 2025`,
`DESDE AGO 2026` —, não a data em que o registro foi publicado aqui. Isso evita a
impressão de que tudo foi feito no último mês em que o portfólio foi reescrito
(ADR-016). O build falha se o período contradisser o estado.

"Mais recente", no arquivo e na home, é atividade mais recente: o que continua
vem primeiro, depois quem terminou por último.

## Corpo do estudo de caso

O corpo segue problema → o que eu fiz → stack → resultado. O link do código não
entra no corpo: ele vem do campo `github` e aparece uma vez, na ficha do topo
da página. Dois componentes MDX dão prova visual sem imagem exportada:

- `<Flow>` com `<Step title="…">…</Step>` — passos numerados em linha, ou
  camadas empilhadas com `layout="stack"`. Só entra o que o próprio texto afirma.
- `<Excerpt file="…" href="…">` — trecho real de um arquivo **público**, com
  link para a origem. Linha omitida é marcada com `# …`.

## Áreas

Os rótulos públicos usam a língua de quem contrata. Na interface, a área aparece
como nome legível com um quadrado na cor da área; a cor nunca aparece sozinha.

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

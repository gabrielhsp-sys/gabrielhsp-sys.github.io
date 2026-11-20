# Auditoria de segurança do /material/ (`akita-security-audit`, 2026-11-19)

## Escopo e modelo de ameaça

| Campo | Valor |
|---|---|
| Referência | commit `27f1417f6277c1ee1980b9720eebf8371eb36f0f` (branch `site-unificado-2026-11`); correções no commit seguinte |
| Arquivos | `functions/api/material/enviar.ts`, `functions/api/material/verificar.ts`, `lib/material.ts`, `lib/material-function.ts`, `scripts/material-link.mjs`, `app/(nu)/material/`, `public/_headers`, `wrangler.toml`, `.gitignore` |
| Ativos | fotos, logo e textos de clientes (dados pessoais e comerciais); o segredo HMAC; o espaço e o custo do bucket R2 |
| Atores | anônimo na internet; quem recebeu ou achou um link de cliente; página de terceiro tentando CSRF; dependência do npm |
| Entradas | `POST /api/material/verificar` (JSON), `POST /api/material/enviar` (multipart), fragmento da URL da página, argumentos do `material:link` |
| Premissas | Cloudflare Pages + Functions; bucket R2 **privado** (sem domínio público nem `r2.dev`); segredo como *secret* do Pages; nada disso foi criado ainda |

## Evidência automatizada

- `security-surface.sh . --max 15` (somente leitura): nenhum arquivo de credencial rastreado, nenhum
  padrão com forma de segredo, nenhum hook de instalação nos manifestos da raiz.
- Histórico: `git log --all -p -S'MATERIAL_SECRET=' --pickaxe-regex` e `git log --all -- .dev.vars`:
  vazios. `git check-ignore .dev.vars .wrangler/` confirma os dois ignorados; `.dev.vars` com modo 600.
- Teste adversarial sintético contra `wrangler pages dev` com R2 local
  (`scripts/testar-cloudflare.mjs`, 43 verificações) e testes unitários do token e do tipo de
  arquivo (`tests/material.test.mjs`).
- Não cobre: comportamento da Cloudflare em produção (limites reais de corpo, cache de borda),
  configuração do bucket real (não existe ainda).

## Alertas do GitHub (repositório `gabrielhsp-sys/gabrielhsp-sys.github.io`, só GET)

| Fonte | Alerta | Severidade | Situação | Recomendação |
|---|---|---|---|---|
| secret scanning | — | — | lista vazia | — |
| code scanning | — | — | **não enumerado**: nenhuma análise configurada (HTTP 404) | — |
| Dependabot | #26–31 `next` | média | corrigido nesta branch (16.4.5, tarefa 0) | fecha sozinho no merge |
| Dependabot | #24 `zod` (corrigida 4.6.6) | alta | aberto; fora do escopo desta branch (o prompt proíbe mudar outra dependência) | PR próprio subindo `zod`; uso só no build (validação do conteúdo) |
| Dependabot | #5 `sharp` (corrigida 0.35.5) | alta | aberto; idem | PR próprio; uso só em scripts de imagem locais e no build |
| Dependabot | #25 `minimatch` (corrigida 11.0.1) | média | aberto; transitivo de ferramenta de desenvolvimento | PR próprio |

## Findings

| # | Severidade | Fronteira | Onde | Mecanismo | Correção | Regressão |
|---|---|---|---|---|---|---|
| 1 | Média | disponibilidade | `functions/api/material/enviar.ts` (antes da gravação) | um link vazado (encaminhado, print) permitia envios ilimitados de 40 MB até vencer: custo e espaço no R2 | cota por cliente (`LIMITES.cotaClienteBytes`, 300 MB), somada pelo `list` interno do prefixo; acima dela, 507 | `testar-cloudflare`: "cota: envios até o limite passam e o seguinte dá 507" e "cota: é por cliente" — vermelho sem a correção (`201,201,201,201`), verde com ela |
| 2 | Baixa | disponibilidade | `functions/api/material/verificar.ts` | corpo sem `Content-Length` (chunked) passava pelo limite de 1 KB e era lido inteiro | exige `Content-Length` (411) e ≤ 1 KB (413) | "verificar sem Content-Length 411" — vermelho sem a correção (403), verde com ela |

## Fronteiras revisadas

| # | Fronteira | O que foi conferido |
|---|---|---|
| 1 | autenticação | HMAC-SHA256 com segredo ≥ 32 caracteres, mensagem com finalidade e versão, validade com teto de 60 dias; `crypto.subtle.verify` (tempo constante); token de 43 caracteres base64url exato; sem segredo → 503 (falha fechada) |
| 2 | autorização | o prefixo do bucket vem do `c` **assinado**; trocar `c` invalida o token (teste "outro cliente 403") |
| 3 | isolamento | um cliente não escreve no prefixo de outro; a cota é por prefixo (teste "é por cliente") |
| 4 | validação e injeção | campos de arquivo em lista fechada; nome original fora da chave; `respostas` só objeto plano com chaves `[A-Za-z][A-Za-z0-9]*` e valores texto ≤ 5000 ou booleano; teste "campo desconhecido 400" com `../../x` |
| 5 | segredos | só em `.dev.vars` (ignorado, 600) e no secret do Pages; o gerador nunca imprime o segredo; nenhuma resposta ecoa o segredo |
| 6 | execução | upload só PNG/JPG/WEBP/PDF, decidido pelos bytes + extensão + tipo declarado; SVG recusado mesmo com nome `.png` (teste) |
| 7 | persistência | chave `<cliente>/<data>-<aleatório>/<campo>-<n>.<ext>`: sem sobrescrita; respostas gravadas por último; nada gravado quando o envio é recusado (teste) |
| 8 | rede | nenhuma saída da Function |
| 9 | criptografia | Web Crypto; aleatório por `crypto.getRandomValues` |
| 10 | disponibilidade | `Content-Length` obrigatório e ≤ 41 MB antes de ler; 10 MB por arquivo; 20 arquivos; cota por cliente (achado 1); `/verificar` limitado (achado 2) |
| 11 | supply chain | `wrangler` 4.157.0 exato, gate de adoção classe A (`WRANGLER.md`) |
| 12 | código malicioso | nada fora do propósito declarado |
| 13 | CORS e cabeçalhos | sem CORS (só mesma origem); `Origin` diferente → 403; respostas `no-store` + `nosniff`; `/material/` com `Referrer-Policy: no-referrer` (o `!` do `_headers` evita a junção de valores, achada no teste) e `X-Robots-Tag: noindex` |
| 14 | prompt injection | as respostas são texto de cliente: o painel futuro deve tratá-las como dado, nunca como instrução |

## needs-validation

| Pista | Por que não confirmei | Como validar |
|---|---|---|
| limites reais de corpo e de memória da Function em produção | sem conta e sem deploy (fora do escopo) | depois do deploy: enviar 40 MB e 41 MB num link de teste e conferir 201 e 413 |
| bucket realmente privado | o bucket não existe | no painel do R2: sem domínio público e com `r2.dev` desligado |

## Candidatos rejeitados

| Parecia | Por que não é |
|---|---|
| arquivo poliglota (cabeçalho PNG + HTML) vira XSS | o bucket é privado e nada do bucket é servido pelo site |
| travessia de caminho pelo nome do arquivo | o nome original não entra na chave; a extensão vem do tipo detectado |
| IDOR trocando `c` | `c` é parte da mensagem assinada |
| força bruta do token pelo `/verificar` | 256 bits de HMAC; inviável |
| CSRF de outra página | exige o token e o navegador manda `Origin`, recusado |
| token em log de acesso ou Referer | o token vai no fragmento (`#`), que o navegador não envia ao servidor |

## Risco residual

- PDF pode carregar conteúdo ativo: abrir os PDFs recebidos num visualizador atualizado.
- O link fica no histórico do navegador de quem o abriu; a validade padrão é 14 dias.
- `script-src 'unsafe-inline'` na CSP (limitação do export estático do Next, sem servidor para nonce).
- Ações do GitHub sem pin por SHA em `.github/workflows/deploy.yml` (anterior a esta branch).
- Alertas abertos de `zod`, `sharp` e `minimatch` (tabela acima).

Nenhum achado sustentado restante no escopo auditado, depois das correções 1 e 2.

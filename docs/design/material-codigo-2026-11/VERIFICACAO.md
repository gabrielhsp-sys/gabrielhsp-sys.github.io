# /material/ com código por cliente: o que é "pronto" (2026-11-20)

Feito com `akita-verification-planning` antes de qualquer código, depois de ler
`functions/api/material/{verificar,enviar}.ts`, `lib/material.ts`, `lib/material-function.ts`,
`scripts/material-link.mjs`, `scripts/testar-cloudflare.mjs`, `tests/material*.test.mjs` e
`tests/e2e/campos.spec.mjs`. Branch: `codigo-material-2026-11`. O resultado real de cada linha entra
em "Fechamento", com a saída do comando e não com a lembrança dela.

## Objetivo

`https://gabrielsys.com.br/material/` mostra sempre o campo "Código de acesso". Um código
`<apelido>-xxxx-xxxx`, gerado por `npm run material:codigo` (ou, no futuro, pelo painel) a partir do
`MATERIAL_SECRET` que já está no projeto Pages, libera o formulário atual; qualquer outro texto dá a
mesma recusa. O link longo `#c=&e=&t=` continua valendo.

## Fora de escopo

Turnstile ou serviço novo; `/orcamento/`; DNS, configuração do R2, Vercel; conta ou chave nova no
Cloudflare; objetos reais de clientes; qualquer código do painel de gestão.

## Desenho (decidido aqui, antes do código)

- **Formato**: `<apelido>-<4>-<4>`, ex. `ana-k7m2-qxp4`. Alfabeto de 31 símbolos
  `abcdefghjkmnpqrstuvwxyz23456789` (sem `0/o` e `1/l/i`): 31⁸ ≈ 2^39,6.
- **Derivação**: subchave `K = HMAC-SHA256(MATERIAL_SECRET, "gabrielsys:material:codigo:v1")`
  (separação de domínio do token do link); código = 8 dígitos base 31 de
  `HMAC-SHA256(K, "<apelido sem hífen>:<dia de vencimento>")`.
- **Validade sem estado**: o "dia" é o dia corrido em São Paulo (UTC−3, sem horário de verão desde
  2019). O vencimento não vai no código: a Function testa os 61 dias possíveis (hoje até hoje+60,
  o mesmo teto de 60 dias do link) e compara cada candidato em tempo constante, sem sair cedo.
  Custo honesto: um chute vale contra 61 candidatos, então a entropia efetiva por tentativa é
  ≈ 2^33,7.
- **Normalização**: só tira espaços, tira hífens ASCII e passa `A-Z` para minúsculas (ASCII, para
  que `K` de Kelvin ou letra acentuada não vire letra válida). Qualquer outro caractere recusa.
  Consequência: a identidade do cliente no código é o apelido **sem hífens** (`cafe-do-coreto` →
  prefixo `cafedocoreto/` no bucket).
- **Revogação**: objeto privado `_controle/revogados.txt` no mesmo bucket, um apelido por linha. A
  Function lê depois de um código ou link válido; apelido na lista = 403. O prefixo `_controle/`
  nunca colide com cliente (apelido começa com letra ou dígito).
- **Transporte**: o código vai só no corpo do POST (JSON em `/verificar`, campo `codigo` do
  multipart em `/enviar`), resposta `no-store`; na página fica em memória e em `sessionStorage`
  dentro de `try/catch`; o `<form>` é `method="post"` (sem JS, nada vai para a URL).
- **Tentativas**: toda recusa de credencial espera um atraso fixo antes de responder, com o mesmo
  corpo `{"ok":false}`; "apelido inexistente" e "código errado" não se distinguem (não há lista de
  apelidos). Limite de taxa só por código não existe sem estado (ver A9).

## Alegações e caminho de evidência

| # | Alegação | Rota escolhida | Alternativas descartadas |
|---|---|---|---|
| A1 | gerar e validar ficam em funções puras de um módulo próprio (`lib/material-codigo.ts`), sem terminal, Next ou formato de saída; Function e gerador usam o mesmo módulo | `teste` unitário importando o módulo direto no Node + `comando`: `grep -n "material-codigo" functions scripts` mostra os dois usos e `grep -nE "process\.|console\.|next/" lib/material-codigo.ts` não acha nada | revisar à mão (não é verificação) |
| A2 | código certo aceito; errado, de outro cliente, vencido ou revogado → 403 | `teste` no seam do módulo (relógio injetado) e no seam da rota (`onRequestPost` com R2 falso em memória) + `observador` no `wrangler pages dev` | só e2e com rota simulada (não prova a Function) |
| A3 | aceita maiúsculas, espaços e hífens a mais/a menos; nenhuma outra variação | `teste` de tabela no módulo: variações aceitas e recusadas (`0`↔`o`, `–`, `_`, `.`, Kelvin `K`, letra acentuada, caractere a mais) | — |
| A4 | comparação em tempo constante | `teste`: a função de comparação lê todos os bytes mesmo com diferença no primeiro (contador num `Proxy`), e a verificação sempre deriva os 61 candidatos | medir tempo (ruidoso, não determinístico) |
| A5 | o código nunca vai na URL nem em log; trafega no corpo, com `no-store` | `teste` de rota: código na query é ignorado; `cache-control: no-store` em toda resposta; `console.*` espionado não é chamado. `teste` e2e: depois de "Entrar", `page.url()` não contém o código e a requisição o leva no corpo | `grep console` (não prova ausência em runtime) |
| A6 | o link longo continua válido | testes antigos de `tests/material.test.mjs` intactos + `teste` de rota com link + `observador` no `test:cloudflare` | — |
| A7 | 30 dias por padrão, `--dias N` muda; revogação documentada com o limite | `teste` do módulo (dia 30 aceito, dia 31 recusado; `--dias 5`) + `teste` do gerador por processo filho + `teste` de rota da lista de revogação | KV (serviço novo, fora do escopo) |
| A8 | gerador `material:codigo` é casca fina; imprime código e mensagem com `gabrielsys.com.br/material`, código e validade dd/mm; nunca o segredo; valida o apelido; lê o segredo só do arquivo e recusa arquivo legível por outros | `teste` por processo filho com HOME falso e segredo sintético (mesmo padrão de `material-link.test.mjs`) | — |
| A9 | erro tem atraso fixo; inexistente e errado têm resposta idêntica; limite de tentativas | `teste` de rota com `esperar` injetado (chamado com o mesmo valor; corpo e status idênticos para apelido "inexistente" e "errado") + `observador` (`test:cloudflare` mede ≥ atraso). Limite de taxa: `needs-verification` → passo à mão no WAF | contador em memória do isolate (não é global nem durável); contador no R2 por IP (grava a cada erro: vira vetor de custo) |
| A10 | página: sem código mostra título, frase, campo rotulado `autocomplete="off"`, `inputmode`, "Entrar" e "Ainda não tem código? Chame no WhatsApp"; erro anunciado com o texto exato; com código mostra o formulário com o nome do cliente; dois temas, 390 e 1440 | `teste` e2e (`tests/e2e/material.spec.mjs`) + screenshots em `previa/` | — |
| A11 | todo botão e link ≥ 4,5:1 em todos os estados (sem código, erro, formulário, envio, sucesso, link longo) nos dois temas; o botão dentro do aviso deixa de ser vermelho sobre verde | `teste` e2e: cor computada do texto contra o fundo efetivo (compondo ancestrais e `opacity`) + `axe` `color-contrast`, por estado e por tema; deve **falhar antes** da correção na regra compartilhada | só axe (não vê pseudo-elemento nem `opacity` de forma confiável) |
| A12 | nada é gravado sem credencial válida; limites de tamanho e tipo valem para o código | `teste` de rota: R2 falso continua vazio depois de envios com código errado/revogado; `test:cloudflare` (SVG 415, 11 MB 413, 45 MB 413 com código) | — |
| A13 | produção: página, códigos, upload e limpeza | `observador` em `https://gabrielsys.com.br` (tarefa 14) | — |

## Passos

| # | Passo | Arquivos | Tipo | Verificação (comando exato) | Reversão |
|---|---|---|---|---|---|
| 1 | branch a partir da main limpa | — | comando | `git merge-base --is-ancestor main codigo-material-2026-11; echo $?` → 0 | `git switch main && git branch -D codigo-material-2026-11` |
| 2 | este documento | `docs/design/material-codigo-2026-11/VERIFICACAO.md` | arquivo-existe | `test -f docs/design/material-codigo-2026-11/VERIFICACAO.md` | `git revert` |
| 3–4 | módulo + rotas, teste primeiro | `lib/material-codigo.ts`, `lib/material-function.ts`, `functions/api/material/*.ts`, `tests/material-codigo.test.mjs`, `tests/material-rotas.test.mjs` | teste | `npm test; echo $?` → 0 (vermelho visto antes de cada verde) | `git revert` |
| 5 | revogação documentada | `SEGURANCA.md`, `PARA-O-PAINEL.md` | teste | `node --test tests/material-rotas.test.mjs` (casos de revogação) | `git revert` |
| 6 | gerador | `scripts/material-codigo.mjs`, `package.json`, `tests/material-codigo-cli.test.mjs` | teste | `npm test` | `git revert` |
| 7 | atraso e resposta única | `lib/material-function.ts` | teste + observador | `npm test`; `npm run test:cloudflare` | `git revert` |
| 8–9 | página e contraste | `app/(nu)/material/*`, `app/cliente.css`, `tests/e2e/material.spec.mjs` | teste | `npm run build && PW_CHROMIUM_PATH=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome npx playwright test tests/e2e/material.spec.mjs --project=chromium; echo $?` → 0 (falha antes da correção do CSS) | `git revert` |
| 10 | auditoria de segurança | `SEGURANCA.md` | manual (julgamento) + teste | achados corrigidos voltam ao gate do passo 12 | `git revert` |
| 11 | documento para o painel | `PARA-O-PAINEL.md` | arquivo-existe | `test -f docs/design/material-codigo-2026-11/PARA-O-PAINEL.md` | `git revert` |
| 12 | gate | — | build + teste + observador | `npm run check; echo $?`, `npm run test:cloudflare; echo $?`, `PW_CHROMIUM_PATH=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome npx playwright test --project=chromium; echo $?` → 0, 0, 0 | — |
| 12b | screenshots | `docs/design/material-codigo-2026-11/previa/` | arquivo-existe + manual | `ls docs/design/material-codigo-2026-11/previa/*.jpg \| wc -l` (estados × 2 temas × 2 tamanhos) | `git revert` |
| 13 | merge ff + deploy | — | comando | `git fetch origin && git rev-parse origin/main` = `2b13114…`; `git merge --ff-only`; `npm run build`; `npx wrangler pages deploy out --project-name gabrielsys --branch main` | novo deploy da main anterior pelo painel (rollback do Pages) |
| 14 | produção | — | observador | `curl` nas rotas; POST com código certo/errado/outro apelido; envio de PNG sintético; `wrangler r2 object get/delete --remote` só da chave criada | apagar só a chave criada |
| 15 | push + Pages | — | comando | `git push origin main`; `gh run watch`; `curl -sI https://gabrielhsp-sys.github.io/` | — (push não se desfaz sem force; não fazer) |
| 16 | decisão no ecossistema | `~/Dev/ai/ecosystem/docs/decisions/DECISION-LOG.md` | comando | `git -C ~/Dev/ai/ecosystem log -1 --stat` | `git -C ~/Dev/ai/ecosystem revert <sha>` |

## Afordâncias criadas

| Afordância | Permanente ou temporária | Passo de remoção |
|---|---|---|
| relógio (`agora`) e espera (`esperar`) injetáveis nas rotas | permanente | — |
| R2 falso em memória nos testes de rota | permanente (só teste) | — |
| `_controle/revogados.txt` no R2 simulado do `test:cloudflare` | temporária, no diretório de estado apagado no fim do script | `rm -rf .wrangler/teste-*` (o próprio script) |
| objeto PNG sintético no bucket de produção (passo 14) | temporária | `wrangler r2 object delete gabrielsys-material/<chave> --remote` só dessa chave |

## Suposições

- Node 22 lê `.ts` direto (type stripping); importar `.ts` com extensão exige
  `allowImportingTsExtensions` no `tsconfig` (o projeto já é `noEmit`). Se o build do Next ou o
  esbuild do wrangler recusarem, as rotas ficam testadas pela Function real no `test:cloudflare`.
- O `wrangler r2 object put --local --persist-to` grava no mesmo estado que o `pages dev
  --persist-to` usa (`needs-verification` até rodar); se não gravar, a revogação fica provada só no
  teste de rota.
- Limite de taxa nativo para Pages Functions sem serviço novo: `needs-verification`. Sem evidência
  local, não entra código; vira passo à mão no WAF.

## Riscos e irreversíveis

Deploy (13) e push (15) são autorizados pelo pedido, condicionados ao gate verde e à origin/main
sem novidade. Paradas: árvore suja, divergência, gate vermelho, login ou permissão nova no wrangler,
cobrança, qualquer coisa com cara de segredo (só tipo e local, nunca o valor).

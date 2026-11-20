# Unificação do GABRIEL.SYS: o que é "pronto" (2026-11-19)

Feito com `akita-verification-planning` antes de qualquer código. Fonte: o prompt
`prompts/2026-11-19-site-unificado/prompt.md` (vale sobre o plano) e o `PLANO.md` desta pasta.
Branch: `site-unificado-2026-11`. Nada é publicado. O resultado real de cada linha entra na seção
"Fechamento", no fim, com a saída do comando e não com a lembrança dela.

## Objetivo

`npm run build` gera, num único `out/`, o site de serviço (cliente), a área do recrutador, os 7
demos Astro em `/exemplos/sites/<ramo>/`, os demos de lead em `/para/<slug>/` e a página escondida
`/material/`; todo contato de cliente sai para `wa.me/5535998840168`; a prévia local roda com
`wrangler pages dev` (redirecionamentos, cabeçalhos e upload para o R2 simulado).

## Fora de escopo

Publicar, deploy, conta ou bucket no Cloudflare, domínio, DNS, Vercel, Tally, GitHub Pages, o
painel de orçamentos, arquivamento no Drive, bot de WhatsApp, preços, mexer no `demos-nichos`
original.

## Alegações e caminho de evidência

| # | Alegação | Rota escolhida | Alternativas descartadas |
|---|---|---|---|
| A1 | todo `wa.me`/`tel:` na saída aponta para o Business, e nenhum outro telefone aparece | `oráculo` sobre a saída: `scripts/verificar-saida.mjs` varre todo `.html`/`.js` de `out/` e compara cada número com a constante esperada, escrita no próprio script (não importada do código) | `grep` solto (não pega número em formato diferente nem tem oráculo); teste só no código-fonte (não pega o que o Astro gera) |
| A2 | o `/orcamento/` gera a mensagem certa em cada ramo | `teste` unitário test-first da árvore e do montador contra textos escritos à mão + `teste` e2e por ramo que intercepta a navegação para `wa.me` e decodifica o `text` | só e2e (lento, falha sem dizer onde); snapshot gerado pelo próprio código (tautológico) |
| A3 | a mensagem fica compacta | `teste`: o caso mais longo (todos os textos no limite) gera URL ≤ 2000 caracteres | confiar no limite do wa.me (`needs-verification`: não documentado) |
| A4 | o formulário funciona por teclado e leitor de tela e valida | `teste` e2e: percorrer um ramo só com Tab/Espaço/Enter; erro com `aria-invalid`, mensagem ligada por `aria-describedby` e foco no resumo; `axe` 0 violações | leitura de código (não é verificação) |
| A5 | animação de entrada, terminal e Ctrl+K só existem em `/sobre/` e `/projetos/`; Konami em todo o site; som ligado por padrão | `teste` e2e por rota: presença/ausência de `.boot-screen`, resposta à crase e ao Ctrl+K; Konami liga `data-retro` em `/` e em `/sobre/`; `localStorage` vazio ⇒ botão "Desligar som" | teste estático do JSX (não prova o comportamento no navegador) |
| A6 | nenhuma camada engole clique (D-101/ADR-014) | `teste` e2e: um único clique em link durante a animação de entrada navega; o botão fixo de WhatsApp não cobre o campo em foco | — |
| A7 | os 7 demos e o lead saem no build único com o base path certo | `comando`: `scripts/verificar-saida.mjs` confere `out/exemplos/sites/<ramo>/index.html` (7) e `out/para/cafe-do-coreto/index.html`, e que todo `src`/`href` local desses HTML resolve para um arquivo existente em `out/` | rodar o `npm run verificar` do projeto original (usa CDP próprio e a raiz `/`) |
| A8 | a cópia dos demos é rastreável | `arquivo-existe` + `comando`: `exemplos-sites/ORIGEM.md` cita o SHA; `git -C ~/Dev/projects/personal/demos-nichos cat-file -e <sha>` sai 0 | — |
| A9 | o upload do `/material/` só aceita token HMAC válido e dentro da validade, só png/jpg/webp/pdf, com limite por arquivo e por envio, grava no R2 com prefixo do cliente e não lista nada | `teste` unitário do token (assinatura, expiração, adulteração) e da checagem de tipo por assinatura de bytes; `observador`: `scripts/testar-cloudflare.mjs` sobe `wrangler pages dev` com R2 local e faz as requisições (válido 200, inválido 403, expirado 403, SVG 415, grande 413, listagem 404/405) | só teste unitário (não prova o binding do R2 nem o roteamento da Function) |
| A10 | `_redirects` leva os endereços antigos aos novos e `_headers` aplica os cabeçalhos | `observador` no mesmo script: `curl -sI` em `/about/`, `/archive/`, `/projects/<slug>/`, `/area/<area>/` → 301 + `location`; `/` traz `content-security-policy`, `x-content-type-options`, `referrer-policy` | ler o arquivo (existência não prova efeito) |
| A11 | o segredo nunca entra no Git | `comando`: `git check-ignore .dev.vars` sai 0 e `git log -p --all -- .dev.vars` vazio | — |
| A12 | acessibilidade e desempenho nas páginas principais | `observador`: Lighthouse 13.5.0 e axe 4.13.0 (versões já fixadas no `package.json`, D-132) em 390×844 e 1440×900 | auditar à mão |
| A13 | do Instagram ao pedido em ≤ 3 toques | `teste` e2e: de `/` (toque 1 = link da bio), o botão fixo "WhatsApp" (toque 2) é um link `wa.me` com mensagem pronta (toque 3 = enviar no app) | — o teste real no Android/iPhone fica `manual`, com o Gabriel |

## Passos

| # | Passo | Arquivos | Tipo | Verificação (comando exato) | Reversão |
|---|---|---|---|---|---|
| 0 | next 16.4.1 → 16.4.5 | `package.json`, `package-lock.json` | build | `npm run check; echo $?` → 0 | `git revert <sha>` |
| 1 | este documento | `docs/design/unificacao-2026-11/VERIFICACAO.md` | arquivo-existe | `test -f docs/design/unificacao-2026-11/VERIFICACAO.md` | `git revert` |
| 2 | branch a partir da main | — | comando | `git merge-base --is-ancestor main site-unificado-2026-11` | `git branch -D site-unificado-2026-11` (só com OK) |
| 3 | páginas de cliente, cabeçalho, rodapé, botão fixo | `app/`, `components/`, `lib/` | teste + build | `npm run check` e `npx playwright test tests/e2e/cliente.spec.mjs` | `git revert` |
| 4 | `/orcamento/` test-first | `lib/orcamento/*.ts`, `tests/orcamento.test.mjs`, `app/orcamento/` | teste (oráculo) | `npm test` (0 falhas) e `npx playwright test tests/e2e/orcamento.spec.mjs` | `git revert` |
| 5a | demos Astro no repositório | `exemplos-sites/`, `scripts/juntar-exemplos.mjs` | comando | `npm run build && node scripts/verificar-saida.mjs` | `git revert` (remove a pasta) |
| 5b | aplicativos (Carona 70) | `app/exemplos/aplicativos/` | build | `npm run build` + `grep -c "Carona 70" out/exemplos/aplicativos/index.html` ≥ 1 | `git revert` |
| 5c | bots (Telegram Offers) | `app/exemplos/bots/` | teste | e2e: a conversa simulada avança por clique e por teclado | `git revert` |
| 5d | automações e sistemas simulados | `app/exemplos/automacoes/`, `app/exemplos/sistemas/` | teste | e2e: rótulo "Demonstração: exemplo do que posso fazer" visível nas duas; a simulação responde à ação | `git revert` |
| 6 | `/material/` + Function + gerador de link | `app/material/`, `functions/api/material/`, `lib/material/`, `scripts/material-link.mjs` | teste + observador | `npm test`; `npm run test:cloudflare` (exit 0) | `git revert`; apagar `.wrangler/` |
| 7 | área do recrutador | `app/sobre/`, `app/projetos/`, `components/system-chrome.tsx` | teste | `npx playwright test tests/e2e/recrutador.spec.mjs` | `git revert` |
| 8 | marca | `public/marca/`, `app/icon.*`, `scripts/generate-og-image.mjs` | arquivo-existe + manual | `test -f public/marca/logo-horizontal.png`; olhar o screenshot da prévia | `git revert` |
| 9 | `_redirects`, `_headers`, páginas de redirecionamento antigas | `public/_redirects`, `public/_headers`, `docs/design/unificacao-2026-11/redirecionamentos/` | observador | `npm run test:cloudflare` | `git revert` |
| 10 | auditorias de qualidade | `docs/design/unificacao-2026-11/AUDITORIA.md` | observador | `node scripts/lighthouse-previa.mjs` e o e2e de axe | `git revert` |
| 11 | gate final | — | build + teste + observador | `npm run check && npm run e2e && node scripts/verificar-saida.mjs && npm run test:cloudflare` | — |
| 12 | decisões no ecossistema | `~/Dev/ai/ecosystem/docs/decisions/DECISION-LOG.md` | comando | `git -C ~/Dev/ai/ecosystem log -1 --stat` | `git -C ~/Dev/ai/ecosystem revert <sha>` |
| 13 | revisão de código | `docs/design/unificacao-2026-11/REVISAO.md` | manual (julgamento) + teste | defeitos corrigidos voltam ao gate do passo 11 | `git revert` |
| 14 | screenshots e comando da prévia | `docs/design/unificacao-2026-11/previa/` | arquivo-existe | `ls docs/design/unificacao-2026-11/previa/*.png \| wc -l` | `git revert` |

## Afordâncias criadas

| Afordância | Permanente ou temporária | Passo de remoção |
|---|---|---|
| `scripts/verificar-saida.mjs` (oráculo do número, demos, noindex) | permanente, roda no `postbuild` | — |
| `scripts/testar-cloudflare.mjs` (sobe o wrangler, faz as requisições, derruba) | permanente | — |
| R2 simulado em `.wrangler/state` | temporária, ignorada pelo Git | `rm -rf .wrangler` |
| `.dev.vars` com segredo local de teste | temporária, ignorada pelo Git | `rm .dev.vars` (o Gabriel gera o dele) |
| relógio injetável no verificador do token (`agora` como parâmetro) | permanente | — |

## Suposições

- `npm ci` nas dependências já travadas (raiz e `exemplos-sites/`) não é "instalação nova": são as
  versões do lockfile de cada projeto. Se o Gabriel discordar, só o wrangler e o next 16.4.5 entram.
- O limite de tamanho do `?text=` do wa.me é desconhecido (`needs-verification`). Teto adotado:
  URL ≤ 2000 caracteres; textos livres cortados com "(continua na conversa)".
- O `wrangler pages dev` roda sem login e sem conta (a documentação diz que sim; confirmado no
  passo 6 ou registrado como lacuna).

## Riscos e irreversíveis

Nenhum nesta branch: tudo é commit local. O que exige o Gabriel (conta, bucket, segredo, domínio,
DNS, publicar as páginas de redirecionamento) fica no relatório final.

## Fechamento (2026-11-19, branch `site-unificado-2026-11`)

Comandos rodados no fim, nesta ordem, com o código de saída lido:

| Comando | Saída | Exit |
|---|---|---|
| `npm run check` | lint limpo; `# pass 31 # fail 0` (raiz); `# pass 18 # fail 0` (exemplos-sites); build único; `verificar-saida: 165 links wa.me, todos 5535998840168; 8 demos completos` | 0 |
| `PW_CHROMIUM_PATH=<chromium do cache> npx playwright test --project=chromium` | `72 passed` | 0 |
| `npm run test:cloudflare` | `testar-cloudflare: 43/43 passaram` | 0 |

| # | Alegação | Resultado | Evidência |
|---|---|---|---|
| A1 | todo `wa.me`/`tel:`/celular na saída é o Business | PASS | `verificar-saida.mjs` (oráculo à mão); sonda com número falso derrubou o script nos 3 formatos |
| A2 | cada ramo do `/orcamento/` gera a mensagem certa | PASS | `tests/orcamento.test.mjs` (9) + `tests/e2e/orcamento.spec.mjs` (7 ramos + envio) |
| A3 | mensagem compacta | PASS | caso mais longo: link ≤ 2000 caracteres; o limite real do wa.me segue `needs-verification` |
| A4 | formulário por teclado e leitor de tela | PASS (automático) | e2e só teclado; axe 0 no início e no "Confira". Leitor de tela real: **não testado** (manual) |
| A5 | animação, terminal e Ctrl+K só na área do recrutador; Konami em tudo; som ligado | PASS | `cliente.spec.mjs` e `recrutador.spec.mjs` |
| A6 | nenhuma camada engole clique | PASS | um clique durante a animação navega; botão fixo some com campo em foco e não existe no formulário |
| A7 | 7 demos + lead no build único | PASS | `verificar-saida.mjs` (links locais resolvidos) |
| A8 | cópia rastreável | PASS | `exemplos-sites/ORIGEM.md` e `EXEMPLOS.md` com `2e7a9f42…`; `git cat-file -e` sai 0 |
| A9 | upload do `/material/` | PASS | `tests/material.test.mjs` (4) + `test:cloudflare` (token válido/falso/vencido/outro cliente, SVG, 11 MB, 45 MB, cota, sem listagem, R2 local) |
| A10 | `_redirects` e `_headers` | PASS | `test:cloudflare` (6 redirecionamentos 301, cabeçalhos) |
| A11 | segredo fora do Git | PASS | `git check-ignore .dev.vars` = 0; `git log --all -- .dev.vars` vazio |
| A12 | Lighthouse e axe | PASS com pendência | acessibilidade 100 em tudo; CLS 0,22 no demo de alimentação no celular (veio do demos-nichos) |
| A13 | ≤ 3 toques do Instagram ao pedido | PASS (automático) | e2e no celular; o teste real em Android/iPhone é `manual`, com o Gabriel |

Continua incerto: o limite de tamanho do `?text=` do wa.me; o navegador interno do Instagram abrindo o
WhatsApp; Firefox (não está no cache do Playwright e não foi baixado); os limites reais da
Cloudflare em produção.

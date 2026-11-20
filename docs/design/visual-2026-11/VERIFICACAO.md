# Visual 2026-11: o que é "pronto" (2026-11-20)

Feito com `akita-verification-planning` antes de qualquer código. Fonte: o pedido do Gabriel de
2026-11-20 (`prompts/2026-11-20-visual/prompt.md`, local). Branch: `visual-2026-11`, a partir da
`main` (`29f60bc`). Nada é publicado. O resultado real de cada linha entra em "Fechamento", com a
saída do comando, não com a lembrança dela.

## Objetivo

As páginas de cliente (`/`, `/servicos/`, `/exemplos/`, `/como-funciona/` e as filhas) mostram com
prints reais, em molduras feitas em código, o que o Gabriel oferece, com menos texto; o site abre no
tema claro e tem seletor claro/escuro que fica salvo; no celular, logo, "Orçamento" e "Menu" ficam
numa linha só; "robô" vira "bot" em todo o site.

## Fora de escopo

Publicar, deploy, push, Cloudflare/R2/DNS/GitHub Pages/Vercel, a lógica do `/orcamento/` (só visual
e tema), o `/material/` além de visual e tema, atualizar dependências, foto de banco de imagem ou
mockup de terceiros.

**Escopo do tema (decisão desta rodada, vai no relatório):** o seletor e o tema claro valem para as
páginas de cliente, o `/orcamento/` e o `/material/`. A área do recrutador (`/sobre/`, `/projetos/`)
continua escura: ela tem a foto da bancada com véu medido para o escuro, o terminal e o modo retrô,
e o pedido fala do cabeçalho com "Menu", que só existe no chrome de cliente. Estender o claro a ela
fica como sugestão.

## Alegações e caminho de evidência

| # | Alegação | Rota escolhida | Alternativas descartadas |
|---|---|---|---|
| T1 | primeira visita abre no claro, mesmo com o sistema no escuro | `teste` e2e com `colorScheme: "dark"` emulado e `localStorage` vazio: `html[data-theme="light"]` e fundo da página claro (cor calculada) | ler o CSS (não prova a ordem de aplicação) |
| T2 | alternar o tema persiste | `teste` e2e: clicar no seletor → `data-theme="dark"` → recarregar → continua `dark`; `localStorage` com a chave do tema | só unidade da função de leitura (não prova o botão nem o recarregamento) |
| T3 | o tema salvo não pisca | `teste` e2e com **todo JS do Next bloqueado** (`page.route` em `/_next/`): com `dark` salvo, o `<html>` já tem `data-theme="dark"`, ou seja, quem aplicou foi o script inline do `<head>`, antes da hidratação | medir frames (frágil); confiar em `suppressHydrationWarning` |
| T4 | `localStorage` indisponível não quebra a página | `teste` e2e: `addInitScript` que faz `localStorage.getItem` lançar; a página abre no claro, sem erro de console | — |
| T5 | o seletor fica no cabeçalho no desktop e no Menu no celular | `teste` e2e em 1440 (visível no `.c-header`, fora do menu) e 390 (oculto na linha; visível depois de abrir "Menu") | — |
| T6 | contraste AA nos dois temas | `oráculo`: `tests/contraste.test.mjs` lê os tokens dos dois temas no CSS e calcula a razão WCAG com fórmula escrita no teste (texto ≥ 4,5; borda de componente ≥ 3); `observador`: axe `color-contrast` nas rotas de cliente nos dois temas | só axe (não vê estados de hover nem pares que não estão na tela) |
| T7 | o logo é legível nos dois temas | `teste` e2e: no claro, o logo visível é a versão de fundo claro (derivada do arquivo atual, só a cor de "GABRIEL"); `manual`: olhar as capturas | redesenhar (proibido) |
| H1 | logo, "Orçamento" e "Menu" na mesma linha em 320, 360, 375, 390 e 414 px, nos dois temas | `teste` e2e: as três caixas se sobrepõem na vertical (mesma linha), altura do cabeçalho ≤ 72 px, sem `scrollWidth` maior que a janela, e "Orçamento" visível | só 390 px (o teste atual; foi por isso que o defeito escapou) |
| H2 | a linha aguenta texto maior no celular | `teste` e2e: em 360 px com `font-size` raiz a 125% (aproxima o "tamanho da fonte" do Android) a linha continua uma | — (o Android real fica `manual`, com o Gabriel) |
| R1 | nenhum "robô"/"robôs" no site | `comando`: `grep -rli "robô" out` → nada; `teste`: `tests/sem-robo.test.mjs` varre o código-fonte que vira texto (app, components, lib, content, exemplos-sites/src, gerador do og); `verificar-saida.mjs` falha o build se a palavra aparecer em `out/` | só grep manual (não protege a próxima mudança) |
| I1 | toda imagem nova é print do trabalho dele | `oráculo`: `scripts/capturas.mjs` grava `lib/capturas.json` com a rota local de origem de cada imagem; `teste` confere que todo arquivo em `public/capturas/` tem entrada no manifesto e que toda rota do manifesto existe em `out/` | conferir a olho |
| I2 | imagem sem CLS, com alt e lazy fora da primeira dobra | `teste` e2e nas rotas de cliente: todo `<img>` tem `alt`, `width` e `height`; os que começam abaixo da dobra têm `loading="lazy"`; os da primeira dobra não; `observador`: CLS do Lighthouse ≤ 0,1 | — |
| I3 | AVIF/WebP pelo pipeline existente | `comando`: `npm run imagens` gera `public/capturas/*.avif` e `*.webp`; `sharp` continua 0.35.4 (`npm ls sharp`) | `next/image` (export estático, sem otimizador) |
| P1 | início com composição de prints reais em molduras | `teste` e2e: o hero tem moldura de notebook e de celular com `<img>` de captura carregada (`naturalWidth > 0`) | — |
| P2 | serviços: um cartão com imagem por serviço | `teste` e2e: 5 cartões, cada um com `<img>` carregada | — |
| P3 | `/exemplos/`: grade com imagem e filtro por tipo | `teste` e2e: filtrar "Bots" deixa só itens de bot; "Todos" volta; o filtro tem `aria-pressed`; funciona por teclado; cada item tem imagem ou, no Carona 70, texto | — |
| P4 | `/como-funciona/`: passos numerados e curtos | `teste` e2e: `ol` com 4 passos, cada passo ≤ 14 palavras | — |
| P5 | menos texto | `comando`: `scripts/contar-palavras.mjs` conta as palavras do `<main>` de cada página de cliente em `out/`, antes (main) e depois; o número entra no fechamento | julgar a olho |
| K1 | as regras de antes continuam (wa.me só do Business, sem preço, "Demonstração", animação/terminal/Ctrl+K só no recrutador, Konami, som ligado, nenhuma camada engole clique) | `teste`: e2e existentes (`cliente`, `recrutador`, `orcamento`, `hero`, `campos`) e `verificar-saida.mjs`, **sem enfraquecer nenhum** | — |
| Q1 | acessibilidade e desempenho | `observador`: axe 4.13.0 nas rotas de cliente nos dois temas; Lighthouse 13.5.0 em 390×844 e 1440×900 (desempenho, acessibilidade 100, CLS ≤ 0,1) | — |

## Passos

| # | Passo | Arquivos | Tipo | Verificação (comando exato) | Reversão |
|---|---|---|---|---|---|
| 1 | branch e este documento | `docs/design/visual-2026-11/VERIFICACAO.md` | arquivo-existe | `git merge-base --is-ancestor main visual-2026-11 && test -f docs/design/visual-2026-11/VERIFICACAO.md` | `git switch main && git branch -D visual-2026-11` (só com OK) |
| 2 | referências | `docs/design/visual-2026-11/REFERENCIAS.md` | arquivo-existe + manual | `test -f …/REFERENCIAS.md` | `git revert` |
| 3 | capturas, molduras, AVIF/WebP | `scripts/capturas.mjs`, `scripts/imagens.mjs`, `public/capturas/`, `lib/capturas.json`, `components/molduras.tsx` | comando + teste | `node scripts/capturas.mjs && npm run imagens && npm test` | `git revert`; `rm -rf assets-src/capturas` |
| 4 | tema | `app/layout.tsx`, `app/globals.css`, `app/cliente.css`, `components/tema.tsx`, `public/marca/*-claro.png`, `scripts/marca.mjs` | teste | `npx playwright test tests/e2e/tema.spec.mjs` e `npm test` (T6) | `git revert` |
| 5 | páginas mais visuais | `app/(cliente)/**`, `components/cliente-ui.tsx`, `lib/servicos.ts`, `lib/exemplos.ts` | teste | `npx playwright test tests/e2e/visual.spec.mjs` + `node scripts/contar-palavras.mjs out` | `git revert` |
| 6 | cabeçalho numa linha | `app/cliente.css`, `components/client-chrome.tsx` | teste | `npx playwright test tests/e2e/cabecalho.spec.mjs` | `git revert` |
| 7 | robô → bot | texto em todo o site | teste + comando | `npm test` (R1) e `grep -rli "robô" out \| wc -l` → 0 | `git revert` |
| 8 | melhorias criativas | conforme a lista no relatório | teste | gate do passo 10 | `git revert` |
| 9 | auditorias | `docs/design/visual-2026-11/AUDITORIA.md` | observador | `npx playwright test tests/e2e/a11y.spec.mjs` e `node scripts/lighthouse-previa.mjs` | `git revert` |
| 10 | gate | — | build + teste + observador | `npm run check; echo $?`, `npm run test:cloudflare; echo $?`, `PW_CHROMIUM_PATH=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome npx playwright test --project=chromium; echo $?` | — |
| 11 | decisão no ecossistema | `~/Dev/ai/ecosystem/docs/decisions/DECISION-LOG.md`, `PRECEDENCE.md` | comando | `git -C ~/Dev/ai/ecosystem log -1 --stat` | `git -C ~/Dev/ai/ecosystem revert <sha>` |
| 12 | revisão de código | `docs/design/visual-2026-11/REVISAO.md` | manual (julgamento) + teste | defeitos corrigidos voltam ao gate do passo 10 | `git revert` |
| 13 | screenshots antes/depois | `docs/design/visual-2026-11/previa/` | arquivo-existe + manual | `ls docs/design/visual-2026-11/previa/{antes,depois}/*.jpg \| wc -l` | `git revert` |

## Afordâncias criadas

| Afordância | Permanente ou temporária | Passo de remoção |
|---|---|---|
| `scripts/capturas.mjs` + `lib/capturas.json` (origem de cada imagem) | permanente: refaz os prints quando um demo mudar | — |
| `scripts/contar-palavras.mjs` | permanente, pequeno | — |
| `tests/contraste.test.mjs` (oráculo de contraste dos tokens) | permanente | — |
| `out/` do estado da `main` para as capturas "antes" | temporária | o build da branch sobrescreve `out/` |

## Suposições

- "Todo o site" para o tema = chrome de cliente (ver Escopo acima). Se o Gabriel quiser o claro também
  em `/sobre/` e `/projetos/`, é uma rodada própria (foto, véu, terminal e retrô foram medidos no escuro).
- O id interno `robo` do `/orcamento/` (valor do campo, não texto visível) fica: trocá-lo mudaria a
  lógica do formulário, fora do escopo. Todo texto que a pessoa lê, inclusive a mensagem pronta do
  WhatsApp, passa para "bot".
- O Chromium do cache (`chromium-1234`) é o que o Playwright 1.63.0 usa; nada é baixado.
- Os prints dos demos mostram negócios inventados com dados de exemplo: isso já é declarado no site
  ("Demonstração"), e cada imagem leva o mesmo rótulo.

## Riscos e irreversíveis

Nenhum: tudo é commit local. Commit no ecossistema também local, sem push.

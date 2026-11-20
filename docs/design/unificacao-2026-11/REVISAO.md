# Revisão de código da branch (`pocock-code-review`, 2026-11-19)

## Ponto fixo
`main` (merge-base `5a00ef6`) — diff `main...HEAD` — 17 commits até `0db442f` — não rastreados
(`assets-src/marca/`, `assets-src/ref/`, `assets-src/videos/`, `prompt.md`) fora da mudança.
Cópia intacta dos demos (`378021e`) revisada só no que mudou depois. Cada eixo rodou num subagente
próprio, sem ver o outro. Spec: `prompts/2026-11-19-site-unificado/prompt.md` (vence) e `PLANO.md`.

## Padrões

| # | Achado | Tipo | Destino |
|---|---|---|---|
| 1 | rotas e plataforma mudaram sem ADR; `PRODUCT.md` desatualizado (ADR-001, 007, 017) | duro | **corrigido**: ADR-024, 025, 026 em `docs/architecture/DECISIONS.md`; notas em `PRODUCT.md` e `docs/product/PRODUCT.md` |
| 2 | `/exemplos/bots/` com data e link do GitHub escritos à mão (DESIGN "derive datas"; ADR-019) | duro | **corrigido**: vêm de `getContentBySlug("telegram-offers")` |
| 3 | `redirecionamentos/gerar.mjs` com a lista de projetos à mão (AGENTS regra 3) | duro | **corrigido**: lê `content/public` |
| 4 | rótulo âmbar decorativo no 404; selos âmbar/menta não clicáveis (ADR-018) | duro | **corrigido**: rótulo removido; selos neutros, demonstração com borda tracejada |
| 5 | `#0a0908` e `#eef4f8` sem registro | duro | **corrigido**: registradas no `DESIGN.md` |
| 6 | lista de ramos em 3 lugares; limites do `/material/` repetidos no cliente; montagem de `/orcamento/?precisa=…` espalhada; `/l`→`/para` em 4 arquivos; `{c,e,t}` redeclarado; `RecruiterChrome` intermediário; `PreferenceTools` no módulo do recrutador; `split("-")` na cidade; nomes `Contexto`/`LIMITES` repetidos | julgamento | **mantido** (escolha): cada repetição está documentada no próprio arquivo; refatorar fica para depois da revisão do Gabriel |
| 7 | ramo morto em `juntar-exemplos.mjs` | julgamento | **corrigido**: virou erro explícito |
| 8 | `exemplos-sites/README.md` ainda fala de Vercel, mirante, `/l/` | fora da base | **corrigido**: nota no topo |

## Spec

| # | Achado | Linha da spec | Destino |
|---|---|---|---|
| 1 | verificadores dos demos apagados (créditos, OG, texto `[Demo …]`, interação no navegador) | PLANO §5 A e §8 passo 6; prompt 11 "Nunca enfraqueça um teste" | **defeito, corrigido**: os quatro voltaram, adaptados ao base path, e rodam no `npm run check` |
| 2 | `hero.spec` passou a ignorar `#quem-sou` | prompt 11 | **defeito, corrigido**: volta a olhar tudo abaixo do hero e exige que a única imagem seja a foto de perfil |
| 3 | depoimentos fictícios nos demos | prompt 5 "Nenhum cliente, depoimento ou número inventado" | **defeito, corrigido**: a seção saiu dos seis demos que a tinham |
| 4 | árvore: "fidelidade" virou "controle"; "Sistema" virou "Outro programa" | prompt 4 "a árvore … segue o plano" | **defeito, corrigido** |
| 5 | `?precisa=` na URL do `/orcamento/` | PLANO §4 só cita `?origem=` | **escolha**: a página de serviço já sabe o que a pessoa quer; validado por lista fechada |
| 6 | `_redirects` com caminhos do antigo `gabriel-sites.vercel.app` | prompt 9 cita só os do portfólio | **escolha**: inofensivo, cobre quem trocar só o domínio |
| 7 | JSON-LD `ProfessionalService` com telefone | — | **escolha**: o telefone é o Business, já público no rodapé |
| 8 | `PW_CHROMIUM_PATH` no `playwright.config.mjs` | — | **escolha**: o Chromium do cache é de outra versão; nada é baixado |
| 9 | `/orcamento/` com `noindex` | o mapa marca só `/material/` como escondida | **escolha**: o formulário é destino de links (Instagram, serviços); o que deve aparecer no Google é o início. Fácil de trocar |
| 10 | `/area/x/` → `/projetos/area/x/` (o PLANO propunha `/projetos/?area=x`) | PLANO §2 | **escolha**: mantém as páginas de área existentes |
| 11 | testes de `validarEtapa`, `lerParametros`, token e tipo de arquivo fora dos dois seams combinados; `WHATSAPP === BUSINESS` compara constante com literal | prompt 4 | **escolha**: são oráculos à mão de regras do prompt (obrigatório, número único, só png/jpg/webp/pdf) |
| 12 | não dá para provar test-first pelo histórico (árvore, montador e testes no mesmo commit `00604eb`) | prompt 4 | **registrado**: os ciclos vermelho → verde rodaram nesta sessão (7 ciclos; 2 nasceram verdes, por triangulação), mas foram para um commit só |

## Resumo
Padrões: 8 achados, pior: rotas e plataforma sem ADR (corrigido). · Spec: 12 achados, pior:
verificadores dos demos apagados, enfraquecendo a verificação (corrigido).

Depois das correções: `npm run check` exit 0 (agora com os verificadores dos demos), e2e 72/72,
`npm run test:cloudflare` 43/43.

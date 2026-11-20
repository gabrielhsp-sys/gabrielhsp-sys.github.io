# Qualidade das páginas de cliente (tarefa 10, 2026-11-19)

Ambiente: build de produção (`out/`) servido por `scripts/serve-out.mjs` (gzip, como um host
estático); Chromium do cache do Playwright (build 1234, o que já estava na máquina: nada foi
baixado). Firefox não está no cache: o projeto `firefox` do Playwright **não rodou** (lacuna).

## kc1t-ui-audit

| Severidade | Detector | Onde | Achado | O que foi feito |
|---|---|---|---|---|
| média | A2 cor fora do DESIGN.md | `app/cliente.css` | vermelho de erro `#f5a090`, quando o registrado é `#f09c8d` | trocado pelo registrado |
| média | A3 raio fora do DESIGN.md | `app/cliente.css` | raios 6, 10 e 14 px soltos | escala 8 (controle) / 12 (painel) / 999 (pílula), registrada no `DESIGN.md` |
| média | E41 (responsivo) | cabeçalho em 320 px | marca + "Orçamento" + "Menu" quebravam em 2 linhas abaixo de 360 px | abaixo de 360 px fica só o símbolo da marca |
| baixa | C13 rótulo acima do título | início e páginas de serviço | linha em mono acima do H1 | a frase de Areado foi para baixo dos botões; nas páginas de serviço, removida |
| — | B conteúdo inventado | todas | nenhum depoimento, cliente, logo ou número sobre o GABRIEL.SYS | `audit-ui.sh`: 0 |
| — | D contraste | pares novos | todos ≥ 4,5:1 para texto (o menor: branco sobre o verde do WhatsApp, 5,32) e ≥ 3:1 para borda (3,17) | medido |

Crítica (julgamento, declarado como tal): a primeira tela agora diz o que é, para quem e como
pedir, com um CTA principal repetido no fim. As grades de cartões de `/servicos/` e `/exemplos/`
têm cara de índice (detector 37); ficaram porque cada cartão leva a uma página diferente e o selo
"Projeto real"/"Demonstração" distingue os de `/exemplos/`. Os selos acima do título nas
demonstrações (detector 18) ficam: o rótulo visível é exigência do pedido.

## web-quality-skills:accessibility (formulário e navegação)

| Critério | Achado | Correção |
|---|---|---|
| 2.4.11 foco não encoberto | link focado no fim da página podia ficar inteiro atrás do botão fixo de WhatsApp | `scroll-padding-bottom: 96px` (e `top: 88px`) nas páginas de cliente |
| 2.4.3 ordem de foco | Esc dentro do menu móvel aberto fechava o menu e o foco caía no `<body>` | Esc devolve o foco ao botão "Menu" (teste e2e novo) |
| 2.5.3 rótulo no nome | botões "−1"/"+5" da demo de sistema tinham nome acessível sem o texto visível | o nome começa pelo texto visível |

Já cobertos e testados: resumo de erro com foco e `role="alert"`, `aria-invalid` +
`aria-describedby` nos campos, progresso "Passo N de M", opções nativas com rótulo envolvendo o
controle, alvos ≥ 44 px, `prefers-reduced-motion`, link de pular conteúdo, landmarks (o botão fixo
ganhou o próprio `<aside>` depois que o axe acusou `region`).

## web-design-guidelines (Vercel, `command.md` lido em 2026-11-19)

| Arquivo | Regra | Situação |
|---|---|---|
| `app/(nu)/material/material-form.tsx` | avisar antes de sair com mudança não salva | corrigido (`beforeunload` enquanto há resposta ou arquivo não enviado) |
| `app/(nu)/material/page.tsx`, `material-form.tsx` | espaço inseparável em "10 MB" | corrigido |
| `app/cliente.css` | `text-wrap: balance` em títulos; `tabular-nums` em coluna numérica | corrigido |
| `app/(cliente)/orcamento/orcamento-form.tsx` | rótulo de botão específico ("Continuar" é genérico) | mantido: padrão GOV.UK escolhido no PLANO |
| — | Title Case, evitar primeira pessoa | não se aplica: português, voz "eu" decidida (decisão 3) |

## ui-ux-pro-max (só consulta)

`"Hero + Features + CTA" --domain landing`: CTA no herói e no fim — já é o caso.
`"multi-step form progress" --domain ux`: indicador de passo e retorno do envio — já é o caso.
`"service landing cta proof" --domain landing`: **nenhum padrão no banco** (registrado; nada aplicado
por suposição). Identidade não mudou.

## workflows/text-review (passe de fatos, em linha)

Desvio declarado: os checadores do workflow são subagentes; aqui o passe foi feito pela própria
sessão (como no PLANO), e o passe de escrita (HUMANIZER) não se aplica a português.

| Afirmação | Fonte | Veredito | Ação |
|---|---|---|---|
| "Respondo em até 24 horas"; "Areado-MG, atendo online em todo o Brasil" | decisão 3 do prompt | correto | — |
| "estudante de Ciência da Computação na UNIFAL-MG" | `lib/site.ts` `profile` | correto | — |
| sete sites de exemplo; negócios inventados | `lib/exemplos.ts`, `exemplos-sites/` | correto | — |
| robô "no ar desde agosto de 2026", lê canais e avisa a oferta certa | `content/public/telegram-offers.mdx` (`status: live`, `startedAt: 2026-08`) | correto | — |
| sistema acadêmico "com cadastro, notas e permissão" | `academic-system.mdx` só cita autenticação e RBAC | **sem-fonte** ("notas") | cortado |
| Carona 70 "quanto vai para o dono do carro"; "antes ficava na memória de alguém" | README do Carona 70 não sustenta | **sem-fonte** | reescrito com o que o README diz |
| passo 2: "respondo em até 24 horas com o prazo e o valor" | a decisão só fala de responder | **impreciso** | "respondo em até 24 horas; depois, mando o prazo e o valor" |

## Lighthouse 13.5.0 e axe 4.13.0

Lighthouse: `qualidade/lighthouse.md` (comando: `CHROME_PATH=<chrome> node scripts/lighthouse-previa.mjs <saída>`
com o `out/` servido em :4173). Acessibilidade 100 em todas as páginas e larguras. SEO 69 só em
`/orcamento/` e no demo, por causa do `noindex` intencional. Pendência: CLS 0,22 no demo de
alimentação no celular, causado pela troca de fonte (Karla/Lilita) no herói — veio assim do
`demos-nichos` e não foi alterado para não mexer na identidade do demo.

axe: `tests/e2e/a11y.spec.mjs` roda nas 14 páginas principais em 390 e 1440 (28 casos) e no
formulário (início e "Confira e envie"): 0 violações.

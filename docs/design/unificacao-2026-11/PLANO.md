# Unificação do GABRIEL.SYS: plano (2026-11)


> Nota de 2026-11-19 (branch `site-unificado-2026-11`): o histórico foi reescrito (D-217). Onde este
> plano fala do "número pessoal", ele já foi removido; o único número citado aqui é o do WhatsApp
> Business, 5535998840168. Os SHAs citados são anteriores à reescrita e não existem mais.
Estado: **PROPOSTA**, só planejamento. Nenhuma mudança foi feita no site, nos demos, no Tally, em
DNS ou em serviço externo. Pedido de origem: `prompts/2026-11-19-unificacao-plano/prompt.md`.
Decisões já confirmadas pelo Gabriel em 2026-11-19 (site único, marca GABRIEL.SYS, formulário
único que termina no WhatsApp, só o WhatsApp Business para cliente, domínio próprio, exemplos no
mesmo domínio, hospedagem aberta) são tratadas como fato. O resto é proposta e está marcado.

Convenções: `needs-verification` = não deu para confirmar com evidência local ou fonte oficial.
Caminhos de código são relativos à raiz deste repositório, salvo quando indicado.

Screenshots do estado atual, nesta pasta (capturados em 2026-11-19 com o Chromium headless do
cache do Playwright, sem login e sem preencher nada):

| Página | Celular 390×844 | Computador 1440×900 |
|---|---|---|
| Portfólio (`gabrielhsp-sys.github.io/`) | `portfolio-390x844.png` | `portfolio-1440x900.png` |
| Briefing (`/orcamento/`) | `orcamento-390x844.png` | `orcamento-1440x900.png` |
| Tally (`tally.so/r/Eqd2ML`) | `tally-390x844.png` | `tally-1440x900.png` |
| Demo Alimentação (`gabriel-sites.vercel.app/alimentacao/`) | `demo-alimentacao-390x844.png` | `demo-alimentacao-1440x900.png` |

---

## 1. Inventário do que existe

### 1a. O portfólio (este repositório)

Next.js 16.3.5, React 19.3, Tailwind 4, MDX, `output: "export"` (`next.config.ts`). Publicado no
GitHub Pages por `.github/workflows/deploy.yml` (push na `main` → `npm run check` → `out/`).
`node_modules` não está instalado nesta máquina hoje (conferido em 2026-11-19); nada foi instalado.

**Rotas**

| Rota | Arquivo | O que é | No menu? |
|---|---|---|---|
| `/` | `app/page.tsx` | hero "Eu construo software que fica de pé sozinho", painel de estudos de caso, projetos em destaque, "O que eu faço" (3 áreas com stack), arquivo, contato por e-mail | — |
| `/about/` | `app/about/page.tsx` | Sobre ("Gabriel Henrique.") | sim |
| `/archive/` | `app/archive/page.tsx` | arquivo de projetos com filtro | sim ("Projetos") |
| `/area/[area]/` | `app/area/[area]/page.tsx` | `software`, `web`, `academico` | via links |
| `/projects/[slug]/` | `app/projects/[slug]/page.tsx` | 6 estudos de caso de `content/public/*.mdx` (academic-system, banco-de-dados-cpp, faculdade-bcc, fedora-post-install, gabriel-sys-site, telegram-offers) | via links |
| `/orcamento/` | `app/orcamento/` | briefing escondido (abaixo) | não; `noindex`, fora do sitemap e da busca |
| `/feed.xml`, `sitemap.xml`, `robots.txt`, 404 | `app/` | derivados | — |

O contato do portfólio é só e-mail (`components/contact-actions.tsx`, `lib/site.ts`): "Falar
comigo" no hero leva a `#contato`, que abre `mailto:`. Não há WhatsApp em nenhuma página do
portfólio além do briefing.

**`/orcamento` (briefing)** — `app/orcamento/steps.ts` (roteiro, 462 linhas),
`briefing-form.tsx` (434), `page.tsx`.

- Título da página "Briefing de projeto"; H1 "Vamos entender o seu projeto."; "Leva uns 10 minutos".
- Primeira pergunta, obrigatória: **"O que você precisa?"** com 6 opções: Site ou landing page ·
  Automação ou bot · Sistema ou ferramenta sob medida · Análise de dados ou planilha · Script ou
  integração pontual · Outro / não sei.
- Ramificação (campo `when` em `steps.ts`):

  | Escolha | Etapas visíveis |
  |---|---|
  | Site | Tipo de projeto → Sobre você (+ cliente ideal, diferencial) → Objetivo do site → Conteúdo → Visual → Contato (+ redes, Google Maps, domínio) → *Produtos e pedidos, só se o tipo for catálogo ou loja* → Para fechar (7 ou 8 etapas) |
  | Automação ou bot | Tipo → Sobre você → A automação (tarefa, ferramentas, frequência, pessoas, contas) → Contato → Para fechar (5) |
  | Sistema | Tipo → Sobre você → O sistema (função, usuários, login, dados, celular, o que substitui) → Contato → Para fechar (5) |
  | Dados | Tipo → Sobre você → Os dados (fonte, objetivo, atualização, formato, tamanho) → Contato → Para fechar (5) |
  | Script | Tipo → Sobre você → O script (problema, ferramentas, tipo, urgência) → Contato → Para fechar (5) |
  | Outro | Tipo → Sobre você → Seu projeto (descrição, prazo) → Contato → Para fechar (5) |

- Campos obrigatórios marcados com `*`; o campo "Seu WhatsApp" é obrigatório e validado (≥ 10 dígitos).
- Rascunho salvo em `localStorage` (`briefing-form.tsx:29-57`).
- Saída: `buildSummary()` (`steps.ts`, fim) monta "BRIEFING DE PROJETO · GABRIEL.SYS" com as
  etapas visíveis em seções `## ETAPA` e uma linha por campo; o botão abre
  `https://wa.me/${briefingWhatsapp}?text=…` (`briefing-form.tsx:181`) e há botão de copiar.
- **Número usado: `briefingWhatsapp` (`lib/site.ts:16`) = o número pessoal (já removido).**
  Confirmado também no ar: o chunk publicado `/_next/static/chunks/0rscpmr17e-1i.js` contém
  o número pessoal (curl em 2026-11-19).
- Layout "nu" (`components/system-chrome.tsx:76`, `barePaths = ["/orcamento"]`): sem menu, busca,
  terminal nem rodapé. O botão de som continua (`PreferenceTools`).

**Recursos de personalidade**

| Recurso | Onde | Como funciona hoje | Decisão vigente |
|---|---|---|---|
| Animação de entrada | `components/boot-sequence.tsx` | 5 linhas ("GABRIEL.SYS", "Memória ........ 640K OK", "Café ........... CRÍTICO", "Perfil ......... software · web · acadêmico", "Iniciando portfolio.sh"), ~1,9 s, 1 vez por sessão (`sessionStorage` `gsys:booted`), pulável, não roda com `prefers-reduced-motion` | D-091 |
| Som ligado por padrão | `components/personality.tsx:47` (`gsys:sound` ≠ `"0"`) | Web Audio sintetizado, nasce no primeiro gesto; botão na barra superior | D-092 |
| Konami → modo retrô | `components/personality.tsx`, `app/globals.css` | CRT verde, sons chiptune, comando secreto, conquista | D-093 |
| Terminal | `components/system-chrome.tsx` (crase, `:276`) | comandos `help`, `projetos`, `abrir`, `contato`, `cv`, `sudo`, `snake`, `theme`, `som`… ; dica no hero "Prefere linha de comando? Aperte `" | D-093 / DESIGN.md |
| Busca Ctrl/⌘+K | `components/system-chrome.tsx:264` | camada central sobre `public/search-index.json` | DESIGN.md "Search Layer" |
| Conquistas | `components/personality.tsx` (`gsys:achievements`) | discretas | — |

### 1b. O formulário Tally (`https://tally.so/r/Eqd2ML`)

Lido do JSON público embutido na página (`__NEXT_DATA__`), sem login e sem preencher nada (para não
gerar resposta parcial). **Achado importante: este formulário não é de orçamento.** O título é
"Material do seu site" e o texto diz "Aqui você me manda tudo o que vai no seu site: informações,
fotos e textos". É coleta de material **depois** da venda, com envio de arquivo.

| Pág. | Perguntas (obrigatória = *) |
|---|---|
| 1 | Nome do negócio* · Seu nome* · Tipo de negócio* (Alimentação · Beleza e estética · Barbearia ou cabeleireiro · Saúde · Fitness · Loja · Outros serviços) · Endereço · Horário de funcionamento · WhatsApp que vai aparecer no site* · Instagram |
| 2 | Logo (arquivo) · Cores que você usa ou gosta · Sites ou perfis que você acha bonitos |
| 3 | Fotos (até 10 MB cada): Fachada e ambiente · Produtos, pratos ou trabalhos · Equipe |
| 4 | Por ramo (lógica condicional): **Alimentação** → Cardápio com preços, Foto do cardápio, Faz entrega? Qual a taxa? · **Beleza / Barbearia** → Serviços com duração e preço, Profissionais, Já usa algum app de agenda? · **Saúde** → Especialidades, Profissionais e registro (CRM, CRO, CRP…), Convênios aceitos · **Fitness** → Planos e preços, Grade de aulas · **Loja** → Produtos (arquivo), Observações sobre os produtos · **Outros serviços** → Serviços oferecidos, Cidades e bairros atendidos |
| 5 | Conte a história do negócio · O que diferencia vocês? · Depoimentos de clientes (só com autorização) |
| 6 | Autorizações*: uso das fotos e textos; direito de usar logo e fotos |
| 7 | Agradecimento: "Recebi tudo! … te chamo no WhatsApp se faltar alguma coisa." |

Configuração lida: idioma pt-BR, sem redirecionamento ao concluir, `saveForLater` ligado,
respostas parciais desligadas. Nenhum número de telefone aparece no formulário.
Os 7 ramos do Tally são os mesmos 7 nichos dos demos: isso é útil na fusão (seção 4).

### 1c. Os demos (`https://gabriel-sites.vercel.app`)

- Caminho local: **`~/Dev/projects/personal/demos-nichos`** (resolve o `needs-verification` do
  pedido). Não existe `.vercel/project.json` em `~/Dev/projects`: o deploy é feito de uma cópia de
  `dist/` em `/tmp/deploy/gabriel-sites` e o `.vercel/` fica nessa cópia (`RELATORIO.md:213-219`).
  Vercel Hobby, time `gabriel-bcc`, projeto `gabriel-sites` (`RELATORIO.md:158`). **Sem remote Git**
  (`git remote -v` vazio).
- Stack: **Astro 7.3.8** estático, CSS próprio, Fontsource, ícones Phosphor, GSAP só no hero da Arena.
  `linkWhatsApp` é importado da biblioteca local `~/Dev/projects/tools/mirante` por caminho relativo
  (`src/lib/whatsapp.ts:4`), o que importa para mover o projeto.
- Todas as páginas têm `noindex`. Faixa fixa no topo (`src/components/FaixaDemo.astro`): "Site de
  demonstração — feito por Gabriel" + "Quero um assim" (WhatsApp) + "Portfólio" →
  `https://gabrielhsp-sys.github.io/` (`src/data/contato.ts`).

| Rota | Negócio (fictício) | Botão principal | WhatsApp |
|---|---|---|---|
| `/` | home que lista os 7 | — | 5535998840168 |
| `/alimentacao` | Lanchonete Brasa & Pão | Pedir pelo WhatsApp | 5535998840168 |
| `/beleza` | Studio Íris Estética | Agendar horário | 5535998840168 |
| `/cabeleireiro` | Barbearia Navalha Fina | Marcar corte | 5535998840168 |
| `/saude` | Clínica Vida Integrada | Marcar consulta | 5535998840168 |
| `/fitness` | Arena Fit Studio | Agendar aula experimental | 5535998840168 |
| `/loja` | Empório da Praça | Finalizar pedido | 5535998840168 |
| `/servicos` | Prado Serviços Automotivos | Pedir orçamento | 5535998840168 |
| `/l/<slug>` | demo personalizado de lead (ex.: `/l/cafe-do-coreto`) | o do nicho-base | 5535998840168 |

Número único em `src/data/contato.ts` (`WHATSAPP_GABRIEL = '5535998840168'`), mensagem
`[Demo <nicho>] Oi Gabriel, vi o demo e quero um site assim`. No ar, a home tem só
`wa.me/5535998840168` (curl em 2026-11-19).

### 1d. Onde o número pessoal (já removido) aparece para cliente

Busca em `~/Dev/projects` (todos os formatos do número pessoal) e nos sites no ar:

| Onde | Público para cliente? | Estado |
|---|---|---|
| `lib/site.ts:16` → `/orcamento/` (código e bundle publicado) | **sim** | a corrigir |
| histórico Git público deste repositório (desde `aff339d`) | sim, para quem procurar no GitHub | apagar do histórico exige reescrita (decisão 13) |
| `demos-nichos/prompts/…` e `RELATORIO.md:69` | não (fora do deploy por `.vercelignore` e pelo upload só de `dist/`) | histórico, sem ação |
| demos no ar, `src/`, `dist/` | — | já trocado para o Business no commit `2e7a9f4` |
| Tally | — | nenhum número no formulário |
| bio do Instagram, status/perfil do WhatsApp pessoal, Google, cartões, posts antigos | **needs-verification** | só o Gabriel confere (seção 8, à mão) |

### 1e. O portfólio visto por um leigo (auditoria `kc1t-ui-audit`, crítica declarada como julgamento)

Persona: dono de lanchonete que tocou no link da bio do Instagram, no celular.

| # | Impacto | Achado | Evidência |
|---|---|---|---|
| 1 | alto | A primeira tela não diz o que ele faz por um negócio. "Eu construo software que fica de pé sozinho" + "Serviços em Python… sistemas em Java… interfaces web estáticas" é jargão | `app/page.tsx` hero; `portfolio-390x844.png` |
| 2 | alto | Não existe WhatsApp no site. A ação principal ("Falar comigo") abre e-mail, que dono de pequeno negócio raramente usa | `components/contact-actions.tsx` |
| 3 | alto | A primeira linha é "Disponível para estágio": para o cliente, soa como "não é um serviço" | hero |
| 4 | alto | `/orcamento` manda as respostas ao número pessoal | `lib/site.ts:16` |
| 5 | médio | "Prefere linha de comando? Aperte `" não significa nada para o leigo e não funciona sem teclado | hero |
| 6 | médio | Som ligado por padrão: o primeiro toque pode tocar som num lugar público; o leigo não associa o ícone de alto-falante ao site | `personality.tsx:47` |
| 7 | médio | Animação de entrada com "Memória 640K", "Café CRÍTICO", "portfolio.sh": piada de programador, atraso de ~1,9 s no navegador do Instagram | `boot-sequence.tsx` |
| 8 | médio | Etiquetas técnicas nos cards: Telethon, systemd, RBAC, Maven, GitHub Actions, "estudos de caso", "slot" | `app/page.tsx`, MDX |
| 9 | médio | `/orcamento`: "Briefing" é jargão; "10 minutos" afasta; 7–8 etapas para site; pede o WhatsApp da pessoa, que já sai na conversa | `steps.ts` |
| 10 | médio | `/orcamento` sem saída: sem menu, sem link de volta, sem botão de WhatsApp direto para quem desiste do formulário | `system-chrome.tsx:76` |
| 11 | baixo | Dock do celular só com ícones (início, arquivo, info, envelope, lupa, terminal) | `portfolio-390x844.png` |
| 12 | médio | Quem vem de um demo e toca em "Portfólio" cai num portfólio técnico sem WhatsApp: beco sem saída na venda | `demos-nichos/src/data/contato.ts` |

O que funciona e fica: contraste e foco já auditados (DESIGN.md, D-056), alvos de 44 px, respeito a
`prefers-reduced-motion`, a primeira pergunta do briefing ("O que você precisa?") com descrição em
linguagem simples em cada opção, rascunho salvo no navegador.

---

## 2. Mapa do site proposto

Princípio: **uma pergunta por página para o cliente** (o que é, quanto exemplo ele precisa ver,
como pede) e **uma porta separada para o recrutador**. Endereços curtos, em português, sem acento,
no plural para listas.

```
gabrielsys.com.br (nome PENDENTE, decisão 1)
├── /                         Início
├── /servicos/                Serviços (os 5, numa página)
│   ├── /servicos/sites/
│   ├── /servicos/aplicativos/
│   ├── /servicos/bots/
│   ├── /servicos/automacoes/
│   └── /servicos/sistemas/
├── /exemplos/                Exemplos (por serviço)
│   ├── /exemplos/sites/      lista dos 7 demos
│   │   └── /exemplos/sites/<nicho>/   alimentacao, beleza, cabeleireiro, saude, fitness, loja, servicos
│   ├── /exemplos/aplicativos/
│   ├── /exemplos/bots/
│   ├── /exemplos/automacoes/
│   └── /exemplos/sistemas/
├── /para/<slug>/             demo personalizado de um lead (fora do menu, noindex)
├── /como-funciona/           do pedido à entrega, preço e prazo, perguntas frequentes
├── /orcamento/               formulário único → WhatsApp (mesmo endereço de hoje)
└── /sobre/                   Quem sou eu  ← porta do recrutador
    └── /projetos/            projetos técnicos (o arquivo de hoje)
        └── /projetos/<slug>/ estudos de caso de hoje
```

Navegação:

- **Barra de cima** (todas as páginas de cliente): marca GABRIEL.SYS · Serviços · Exemplos · Como
  funciona · botão **Pedir orçamento**. No celular: marca + botão "Pedir orçamento" + menu com
  rótulo escrito "Menu" (não só ícone).
- **Botão de WhatsApp fixo** no canto de baixo, em todas as páginas, com texto visível "WhatsApp"
  (não só o ícone). Não pode cobrir o campo em foco no formulário (WCAG 2.2, 2.4.11) e esconde com
  o teclado aberto. No `/orcamento` ele vira o link "Prefiro conversar direto no WhatsApp".
- **Rodapé**: WhatsApp escrito como texto, (35) 99884-0168; Instagram; link "Quem sou eu e projetos
  (para recrutadores)" → `/sobre/`.
- `/sobre/` e `/projetos/` mantêm a navegação atual (trilho, busca, terminal): é a área técnica.

Do Instagram ao pedido, **no máximo 3 toques**:

| Caminho | Toque 1 | Toque 2 | Toque 3 |
|---|---|---|---|
| direto | link da bio → Início | botão fixo "WhatsApp" | "Enviar" no WhatsApp (mensagem pronta) |
| com exemplo | link da bio → Início | "Ver exemplos" → demo do ramo | "Quero um assim" → WhatsApp (o envio é o 4º; aceitável porque a pessoa escolheu ver antes) |
| formulário | link da bio → `/orcamento/?origem=instagram` | responde | "Enviar pelo WhatsApp" |

`needs-verification`: se o navegador interno do Instagram abre `wa.me` direto no app do WhatsApp
nos aparelhos do público (Android e iPhone). Teste manual no passo 8.

Endereços antigos dentro do site novo (redirecionamento 301): `/about/` → `/sobre/`, `/archive/` →
`/projetos/`, `/projects/<slug>/` → `/projetos/<slug>/`, `/area/<area>/` → `/projetos/?area=<area>`.

### Referências (`kc1t-reference-research`)

```yaml
- reference: https://design-system.service.gov.uk/patterns/question-pages/
  type: fluxo
  use: uma pergunta por tela, título da tela = a pergunta, link "Voltar" sempre, botão "Continuar";
       marcar o que é "(opcional)" em vez de asterisco no obrigatório
  avoid: o visual gov.uk (amarelo de foco, Arial, tom burocrático)
  translation: o /orcamento novo agrupa no máximo 2-3 perguntas curtas por tela, título em pergunta,
               "Voltar" em âmbar de ação do DESIGN.md
  license_checked: não — needs-verification (só princípio extraído; nada copiado)
- reference: https://design-system.service.gov.uk/patterns/check-answers/
  type: fluxo
  use: tela "Confira antes de enviar" com cada resposta e "Mudar" ao lado
  avoid: tabela densa de resumo; aqui o resumo é a própria mensagem do WhatsApp
  translation: a última tela mostra a mensagem exatamente como vai chegar, com "Mudar" por bloco
  license_checked: idem
- reference: https://interfaces.rauno.me/
  type: mecanismo
  use: rótulo que foca o campo; `type`/`inputmode` certos; fonte ≥ 16 px em input (evita zoom no
       iPhone); sem autofoco no celular; hover só com `@media (hover: hover)`
  avoid: nada a evitar; é normativa
  translation: checklist do formulário (seção 4)
  license_checked: licença não declarada na página — só leitura de princípio, nada copiado
- reference: https://faq.whatsapp.com/5913398998672934
  type: mecanismo
  use: formato `https://wa.me/<número só dígitos com DDI>?text=<texto codificado>`
  avoid: os exemplos da própria página têm erros (`wa.me//55…`, `%2s`)
  translation: um gerador só (`linkWhatsApp`), testado, para site, exemplos e formulário
  license_checked: não se aplica (documentação)
- reference: os próprios demos (`gabriel-sites.vercel.app`)
  type: visual
  use: linguagem de cliente que já funciona: "Pedir pelo WhatsApp", horário, endereço, "Monte seu pedido"
  avoid: a identidade de cada nicho (cada demo tem a sua; o site da empresa fica com a GABRIEL.SYS)
  translation: o tom dos botões e frases curtas vira o tom das páginas de serviço
  license_checked: projeto próprio; fotos Unsplash com créditos em CREDITOS.md
```

**O que será feito diferente das referências:** o site continua com a identidade GABRIEL.SYS
(preto quente, marfim, âmbar de ação, Bricolage + IBM Plex Mono) e tom de uma pessoa ("eu"), não de
agência; nenhuma grade de cards iguais; nada de depoimento, logo de cliente ou número que não exista.

Consulta de padrão (`ui-ux-pro-max`, só padrão de site de serviços): não foi rodada nesta sessão; as
duas regras que ela daria e que já entram aqui são CTA único e repetido por página e prova
(exemplo) perto do CTA.

---

## 3. Textos propostos (rascunho)

Regras usadas: frase curta; resultado para o negócio antes de qualquer tecnologia; nenhum número,
prazo, preço, cliente ou depoimento inventado (onde falta dado, há `[colchete]` para o Gabriel
preencher); "eu", porque é uma pessoa. Revisão pelo `workflows/text-review` (passe de fatos) no
fim desta seção.

Glossário de troca (vale para todo o site de cliente):

| Em vez de | Escrever |
|---|---|
| landing page | site de uma página só |
| domínio | endereço do site (como seunegocio.com.br) |
| hospedagem | onde o site fica guardado |
| responsivo | funciona bem no celular |
| deploy / publicar | colocar no ar |
| bot | robô que conversa no Telegram |
| automação | tarefa que passa a se fazer sozinha |
| sistema | um lugar só para controlar [clientes, pedidos, estoque, agenda] |
| briefing | algumas perguntas sobre o que você precisa |
| stack, Python, Java, Next.js… | (não aparece nas páginas de cliente; fica em /projetos) |

### Início (`/`)

> **GABRIEL.SYS**
>
> # Sites, aplicativos e robôs para o seu negócio.
>
> Eu sou o Gabriel. Faço sob encomenda o que o seu negócio precisa: um site que leva o cliente
> direto para o seu WhatsApp, um aplicativo, um robô no Telegram ou uma tarefa repetitiva que passa
> a se fazer sozinha.
>
> [ Pedir orçamento ]   [ Chamar no WhatsApp ]
>
> ## O que eu faço
>
> - **Sites** — para o cliente achar você, ver o que você vende e chamar no WhatsApp. → Ver sites
> - **Aplicativos** — agenda, pedidos, fidelidade: do jeito que o seu negócio funciona. → Ver aplicativos
> - **Robôs no Telegram** — avisam, respondem e lembram, mesmo quando você não está olhando. → Ver robôs
> - **Automações** — aquela planilha ou relatório que toma sua tarde passa a se fazer sozinho. → Ver automações
> - **Sistemas** — um lugar só para controlar clientes, pedidos, estoque ou agenda. → Ver sistemas
>
> ## Veja antes de pedir
>
> Fiz sites de exemplo para sete tipos de negócio. Abra o do seu ramo e mexa à vontade.
> (lanchonete · estética · barbearia · clínica · academia · loja · oficina) → Ver todos os exemplos
>
> ## Como funciona
>
> 1. Você me conta o que precisa, pelo formulário ou pelo WhatsApp.
> 2. Eu respondo com o que vou fazer, o prazo e o preço. [prazo de resposta: Gabriel define]
> 3. Você aprova e me manda o material (fotos, textos, logo).
> 4. Eu entrego, você confere, e só então vai ao ar.
> → Ver detalhes
>
> ## Quem faz
>
> Gabriel Henrique, estudante de Ciência da Computação na UNIFAL-MG. Atendo [cidade/região: Gabriel
> define] e qualquer lugar pelo WhatsApp. → Quem sou eu
>
> [ Pedir orçamento ]

Os passos 2–4 de "Como funciona" são **PROPOSTA**: descrevem um processo que o Gabriel precisa
confirmar que é o dele (decisão 11).

### Serviços (cada página: o que resolve → o que você recebe → exemplo → pedir)

**Sites (`/servicos/sites/`)**

> # Um site para o cliente achar você e chamar no WhatsApp.
>
> Ele mostra o que você vende, o preço se você quiser, o horário e o endereço. Com um toque, o
> cliente abre o WhatsApp com a mensagem pronta para você.
>
> **Você escolhe o tamanho:**
> - Site de uma página só, com tudo o que importa.
> - Site com algumas páginas (serviços, equipe, contato).
> - Catálogo: o cliente monta o pedido no site e fecha pelo WhatsApp.
>
> **Você recebe:** o site no ar, funcionando bem no celular, com o seu endereço próprio
> (como seunegocio.com.br) se você quiser, e ajuda para aparecer no Google Maps. [o que está
> incluído: Gabriel confirma]
>
> → Veja um exemplo do seu ramo · [ Pedir orçamento de site ]

**Aplicativos (`/servicos/aplicativos/`)**

> # Um aplicativo do jeito que o seu negócio funciona.
>
> Agenda de horários, cartão de fidelidade, pedidos, cadastro de clientes: você me diz o que
> precisa e eu faço o aplicativo para isso.
>
> Ele pode abrir pelo navegador do celular e ficar na tela inicial como um app, ou ir para a loja
> de aplicativos (Play Store). Eu te explico a diferença de preço e de prazo antes. [App Store:
> Gabriel confirma se oferece]
>
> → Ver exemplo · [ Pedir orçamento de aplicativo ]

**Robôs no Telegram (`/servicos/bots/`)**

> # Um robô no Telegram que trabalha enquanto você cuida do resto.
>
> Ele pode avisar quando chega um pedido, responder as perguntas de sempre, mandar lembrete para a
> sua equipe ou vigiar algo na internet e só te chamar quando importa.
>
> Exemplo de verdade: fiz um robô que lê canais de promoção o dia inteiro e só me avisa quando
> aparece a oferta que eu procuro. Ele está no ar desde agosto de 2026.
>
> → Ver o robô funcionando · [ Pedir orçamento de robô ]

**Automações (`/servicos/automacoes/`)**

> # A tarefa repetitiva que toma o seu tempo passa a se fazer sozinha.
>
> Copiar pedidos para uma planilha, montar o relatório do fim do dia, conferir o estoque, mandar a
> mesma mensagem toda semana. Se você faz igual toda vez, dá para automatizar.
>
> Você me explica como faz hoje, passo a passo. Eu te digo o que dá para automatizar e quanto tempo
> isso pode economizar, antes de você pagar nada.
>
> → Ver exemplo · [ Pedir orçamento de automação ]

**Sistemas (`/servicos/sistemas/`)**

> # Um lugar só para controlar o seu negócio.
>
> Clientes, pedidos, estoque, agenda ou alunos, num sistema feito para o seu jeito de trabalhar,
> com acesso separado para você e para a sua equipe.
>
> Exemplo: fiz um sistema acadêmico com cadastro, notas e permissão diferente para cada tipo de
> usuário.
>
> → Ver exemplo · [ Pedir orçamento de sistema ]

### Quem sou eu (`/sobre/`, recrutador)

Mantém o conteúdo de hoje de `/about/` e o "Disponível para estágio" (sai da home), com o hero
técnico atual ("Eu construo software que fica de pé sozinho") como abertura desta página, e os
links para `/projetos/`, GitHub, LinkedIn e e-mail. O tom técnico fica aqui.

### Passe de fatos (`workflows/text-review`, feito em linha; sem subagente)

| Afirmação nos rascunhos | Evidência | Veredito |
|---|---|---|
| sete sites de exemplo, sete ramos | `demos-nichos/README.md` (7 rotas) | correto |
| robô de promoções no ar desde agosto de 2026 | `content/public/telegram-offers.mdx` `status: live`; painel "DESDE AGO 2026" (`portfolio-1440x900.png`) | correto |
| sistema acadêmico com permissão por tipo de usuário | `content/public/academic-system.mdx` ("RBAC") | correto |
| estudante de Ciência da Computação na UNIFAL-MG | `lib/site.ts` `profile` | correto |
| Play Store / App Store, prazo de resposta, cidade, o que está incluso no site, ajuda com Google Maps | nenhuma | **sem-fonte**: ficou em `[colchete]` para o Gabriel |
| "quanto tempo isso pode economizar, antes de você pagar nada" | promessa comercial sem evidência | **sem-fonte**: Gabriel confirma ou corta |

Desvio declarado do workflow: o passe de fatos foi feito pela própria sessão, sem subagentes, e o
passe de escrita (HUMANIZER) não rodou; o segundo passe fica para quando o Gabriel aprovar o texto.

---

## 4. Formulário único (`/orcamento/`)

### O que entra, o que sai

Fontes: o briefing atual (`app/orcamento/steps.ts`) e o Tally. Como o Tally é **coleta de material
pós-venda** (1b), o que dele é conteúdo do site (fotos, logo, cardápio, autorizações) **não** entra
no orçamento. Entra só o que ajuda a dar preço. A decisão sobre o que fazer com o Tally é a 4.

| Pergunta | Origem | Destino |
|---|---|---|
| O que você precisa? | briefing | **entra** (1ª pergunta), opções novas |
| Tipo de negócio (7 ramos) | Tally | **entra** (todos os caminhos); no caminho site, mostra o link do demo do ramo |
| Seu nome, nome do negócio, cidade | briefing + Tally | **entra** |
| Resumo do que precisa | briefing | **entra** |
| Objetivo do site (o que o visitante faz) | briefing | **entra** |
| Tipo de site | briefing | **entra**, com nomes leigos |
| Já tem: logo, fotos, Instagram, endereço do site, perfil no Google Maps | briefing + Tally | **entra** como uma pergunta de marcar ("O que você já tem?") |
| Produtos: quantidade, entrega, pagamento | briefing | **entra** só para catálogo/loja |
| Automação: tarefa, ferramentas, frequência | briefing | **entra** |
| Sistema: função, quem usa, login, celular, o que substitui | briefing | **entra** |
| Dados/planilha | briefing | **entra dentro de Automação** (opção "planilha ou relatório") |
| Script pontual | briefing | **entra dentro de "Outra coisa / não sei"** |
| Prazo, faixa de investimento | briefing | **entra**, opcional |
| Seu WhatsApp | briefing | **sai**: a mensagem já chega do WhatsApp da pessoa |
| Cliente ideal, diferencial, sensação, cores, referências, o que evitar, textos, depoimentos, preços, essencial | briefing | **sai** → conversa depois do orçamento / material pós-venda |
| Quem decide, pessoas, contas, onde ficam os dados, tamanho dos dados | briefing | **sai** → conversa |
| Endereço, horário, WhatsApp do site, cardápio, serviços, profissionais, convênios, grade, fotos, logo, história, autorizações | Tally | **sai** → material pós-venda (decisão 4) |

Meta: **cerca de 2 minutos**, no máximo 5 telas em qualquer caminho, a última sendo "Confira e
envie".

### Árvore de ramificação

```
Tela 1  O que você precisa?  (obrigatória)
        ○ Um site                    "para o cliente achar você e chamar no WhatsApp"
        ○ Um aplicativo              "agenda, pedidos, fidelidade, cadastro"
        ○ Um robô no Telegram        "que avisa, responde ou lembra sozinho"
        ○ Uma automação              "tarefa repetitiva, planilha ou relatório"
        ○ Um sistema                 "controle de clientes, pedidos, estoque ou agenda"
        ○ Outra coisa / ainda não sei
        │
Tela 2  Sobre o seu negócio  (todos)
        Seu nome · Nome do negócio (opcional) · Cidade (opcional)
        Tipo de negócio: Alimentação · Beleza e estética · Barbearia ou cabeleireiro · Saúde ·
                         Fitness · Loja · Outros serviços · Não é para um negócio
        │
Tela 3  depende da Tela 1
        ├─ Site
        │    O que o cliente deve fazer no site? (marque) Chamar no WhatsApp · Agendar · Ligar ·
        │       Visitar o local · Comprar · Pedir orçamento
        │    Que tipo de site? Uma página só · Algumas páginas · Catálogo com pedido no WhatsApp ·
        │       Loja com pagamento no site · Não sei, quero uma sugestão
        │    O que você já tem? (marque, opcional) Logo · Fotos boas · Instagram · Endereço de site ·
        │       Perfil no Google Maps
        │    [link: "Veja o exemplo de <ramo>" → /exemplos/sites/<nicho>/, abre em nova aba]
        │    └─ se Catálogo ou Loja → Tela 3b: Quantos produtos? (até 20 · 20 a 100 · mais de 100) ·
        │         Como o cliente recebe? (retirada · entrega local · Correios) ·
        │         Pagamento (Pix · cartão · dinheiro)
        ├─ Aplicativo
        │    Quem vai usar? Meus clientes · Minha equipe · Só eu · Mais de um
        │    O que a pessoa faz no aplicativo? (texto, obrigatório)
        │    Precisa estar na loja de aplicativos? Sim · Pode abrir pelo navegador · Não sei
        │    Precisa de login? Sim · Não · Não sei
        ├─ Robô no Telegram
        │    O que o robô deve fazer? (marque) Avisar de algo · Responder perguntas · Receber pedidos ·
        │       Mandar lembretes · Outra coisa
        │    Explique com um exemplo (texto, obrigatório)
        │    Quem conversa com ele? Clientes · Equipe · Só eu
        ├─ Automação
        │    Que tarefa você quer que se faça sozinha? Conte como faz hoje, passo a passo (obrigatório)
        │    Onde isso acontece? (marque) WhatsApp · Telegram · Planilha · E-mail · Site · Sistema · Papel
        │    Com que frequência? Toda hora · Algumas vezes por dia · Uma vez por dia · Quando eu mandar
        ├─ Sistema
        │    O que o sistema precisa controlar? (texto, obrigatório)
        │    Quem vai usar? Só eu · Minha equipe · Clientes · Mais de um
        │    Cada pessoa precisa de login próprio? Sim · Não · Não sei
        │    Vai usar no celular? Sim · Só no computador · Os dois
        │    Hoje você usa o quê? (opcional: caderno, planilha, outro programa)
        └─ Outra coisa / não sei
             Conte do seu jeito o que você precisa (obrigatório)
        │
Tela 4  Para fechar  (todos, tudo opcional)
        Tem prazo ou data importante? · Faixa de investimento (Até R$ … · … · Prefiro conversar)
        [faixas: Gabriel define; sem faixa, fica só texto livre]
        │
Tela 5  Confira e envie
        A mensagem exatamente como vai chegar, com "Mudar" em cada bloco
        [ Enviar pelo WhatsApp ]   [ Copiar a mensagem ]
        "Prefiro conversar direto no WhatsApp" (link simples, sem a mensagem)
```

Regras de interface (`web-quality-skills:accessibility` e `web-design-guidelines`, aplicadas como
checklist; as skills não foram rodadas sobre código, porque não há código novo ainda):

- título da tela = a pergunta; link "Voltar" no topo de toda tela depois da primeira;
- obrigatório sem asterisco; o que não é obrigatório leva "(opcional)" no rótulo;
- erro escrito ao lado do campo e resumido no topo, com foco movido para ele;
- fonte ≥ 16 px nos campos; sem autofoco no celular; `inputmode` certo;
- opções em botões grandes (≥ 44 px), não em lista suspensa;
- indicador "Passo 2 de 5" só se o teste com 2–3 pessoas mostrar que ajuda (GOV.UK);
- o número de passos não pode mudar de forma surpreendente: o "de N" recalcula na Tela 1 e não muda depois, exceto a Tela 3b;
- rascunho continua salvo no navegador (como hoje), com aviso "Suas respostas ficam só neste aparelho até você enviar";
- `?origem=` (instagram, demo-<nicho>, servicos-<serviço>) é lido da URL e vai na mensagem, sem
  cookie nem rastreador;
- funciona sem JavaScript? Não: o `<noscript>` mostra o WhatsApp como texto e o link direto.

### A mensagem que chega no WhatsApp

Para `wa.me/5535998840168` (único número), texto curto, com negrito do WhatsApp (`*…*`), uma
resposta por linha, só os campos respondidos:

```
Olá, Gabriel! Vim pelo site e quero um orçamento.

*O que preciso:* Um site
*Negócio:* Lanchonete da Maria (Alimentação), Areado
*Nome:* Maria

*No site, o cliente deve:* Chamar no WhatsApp, Comprar
*Tipo de site:* Catálogo com pedido no WhatsApp
*Produtos:* 20 a 100 · Entrega local, Retirada · Pix, Dinheiro
*Já tenho:* Logo, Instagram

*Prazo:* Antes do Natal
*Investimento:* Prefiro conversar

(gabrielsys.com.br/orcamento · origem: instagram)
```

Comparação: hoje sai "BRIEFING DE PROJETO · GABRIEL.SYS", data, seções `## ETAPA` e
"(sem resposta)" em cada campo vazio. O novo corta o vazio e o jargão.

`needs-verification`: limite prático de tamanho do `?text=` do `wa.me` (a página oficial não cita
limite). A implementação testa a maior mensagem possível (todos os campos de texto longos) em
Android e iPhone e, se truncar, corta os textos livres em N caracteres com "(continua na conversa)".

### Como os dois endereços antigos levam ao novo

| Antigo | Para | Como |
|---|---|---|
| `gabrielhsp-sys.github.io/orcamento/` | `<domínio>/orcamento/` (com a query) | página de redirecionamento no GitHub Pages (seção 6: o Pages não faz 301 de verdade): `meta refresh` 0 s + `location.replace` preservando `?…` + `<link rel="canonical">` + link visível |
| `tally.so/r/Eqd2ML` | `<domínio>/orcamento/` ou continua como formulário de material | o Tally não permite redirecionar a URL do formulário. Opções na decisão 4. Qualquer mudança no Tally é feita pelo Gabriel (ou por uma sessão futura com autorização explícita) |

Rascunhos salvos no navegador no domínio antigo não passam para o novo (o `localStorage` é por
origem). Impacto baixo: a página é escondida.

---

## 5. Exemplos por serviço

### Sites: trazer os demos Astro para o domínio

| Opção | Como | Prós | Contras |
|---|---|---|---|
| **A. Mesmo repositório, build junto** (recomendada) | `demos-nichos` vira a pasta `exemplos-sites/` deste repositório (ou é copiado com histórico via `git subtree`); Astro com `base: '/exemplos/sites'` e `SITE_URL` do domínio; o CI roda os dois builds e copia `exemplos-sites/dist/` para `out/exemplos/sites/`; leads em `/para/<slug>/` | um deploy, um domínio, um número; os links da faixa viram links internos; funciona em qualquer hospedagem estática; sem depender do Hobby da Vercel | dois `package.json` no CI (build mais lento); `linkWhatsApp` vem da mirante por caminho relativo e precisa ser copiado para o projeto (com a licença/atribuição da mirante); os testes e verificações dos demos (`npm run verificar`) entram no `check` |
| B. Rewrite/proxy para `gabriel-sites.vercel.app` | `vercel.json` com `rewrites` para a URL externa | não move código | só funciona se o site principal estiver na Vercel; no Cloudflare Pages o `_redirects` **não** faz proxy para domínio externo ("You cannot proxy external domains"); dois deploys; os demos seguem no Hobby (D-173) |
| C. Subdomínio `exemplos.<domínio>` apontando para a Vercel | DNS CNAME | quase nenhum trabalho | não é o mesmo domínio (decisão 6 do Gabriel pede "páginas do mesmo domínio"); continua no Hobby |
| D. Reescrever os demos em Next/React | portar 7 páginas | um stack só | semanas de retrabalho num produto que já funciona e passa nas verificações |

O `demos-nichos` **não tem remote**: a opção A resolve isso de quebra (o código passa a viver num
repositório versionado no GitHub). Os demos continuam com `noindex` (negócios fictícios não devem
aparecer no Google).

### Aplicativos, robôs, automações e sistemas: formato e o que produzir

| Serviço | Formato proposto | Material que já existe | O que precisa ser produzido |
|---|---|---|---|
| Robôs | **vídeo curto vertical** (15–30 s, sem som obrigatório, com legenda) + **conversa simulada** em HTML (balões, sem backend) | Telegram Offers: estudo de caso público, `public/videos/telegram-offers.mp4` e `.webp` | 1) recorte vertical do vídeo existente com legenda leiga; 2) uma conversa simulada de robô para negócio (ex.: "chegou pedido novo" para uma lanchonete fictícia, mesma marca dos demos), com selo "Exemplo" |
| Automações | **antes e depois** em duas colunas + captura de tela (ou vídeo de 20 s) | nenhum de cliente | um caso fictício com dados de exemplo (pedidos de WhatsApp → planilha → resumo diário no Telegram), rotulado "Exemplo com dados fictícios" |
| Aplicativos | **demo navegável** no celular | os demos de agenda (`/beleza`, `/cabeleireiro`, `/fitness`) e carrinho (`/loja`, `/alimentacao`) já se comportam como app | 1) instalar na tela inicial (manifest) num demo, mostrado num vídeo de 15 s; 2) Carona 70: **PENDENTE**, decisão 9 |
| Sistemas | **capturas comentadas** em linguagem leiga + vídeo existente | Academic System: estudo de caso público, `public/videos/academic-system.mp4` | 3–4 capturas com legenda ("cada usuário vê só o que pode mexer") |

Nada de depoimento, logo de cliente ou número de uso. Todo exemplo fictício leva o selo "Exemplo".

---

## 6. Hospedagem

Fontes oficiais lidas em 2026-11-19.

| Critério | GitHub Pages | Vercel Hobby | Vercel Pro | Cloudflare Pages (grátis) |
|---|---|---|---|---|
| Domínio próprio | sim | sim (50 por projeto) | sim | sim; apex (`gabrielsys.com.br` sem `www`) exige o DNS do domínio no Cloudflare — `needs-verification` na doc de domínios do Pages |
| Redirecionamento de verdade (301/308) | **não** (só página com `meta refresh`) | sim, `vercel.json` `redirects` | sim | sim, arquivo `_redirects`: "limited to 2,000 static redirects and 100 dynamic redirects"; 301, 302, 303, 307, 308 ([doc](https://developers.cloudflare.com/pages/configuration/redirects/), atualizada 2026-08-25) |
| Rewrite para os demos | não | sim, inclusive para URL externa | sim | só para caminho do próprio site ("You cannot proxy external domains") — basta com a opção A |
| Custo | 0 | 0 | US$ 20/mês por assento ([doc Hobby](https://vercel.com/docs/plans/hobby), atualizada 2026-11-12) | 0 |
| Site comercial permitido? | **não**: "GitHub Pages is not intended for or allowed to be used as a free web-hosting service to run your online business, e-commerce site, or any other website that is primarily directed at either facilitating commercial transactions…" ([limites do Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)) | **não**: "You shall only use the Services under a Hobby plan for your personal or non-commercial use" ([termos](https://vercel.com/legal/terms), Last Updated 2026-10-19) | sim | **não encontrei restrição** a uso comercial no [Self-Serve Subscription Agreement](https://www.cloudflare.com/terms/) (Last Updated 2025-09-12); a seção de serviços grátis proíbe "process or collect personal or business credit card information on any web property that is receiving Free Services" (o site não cobra cartão). `needs-verification`: os Service-Specific Terms do Developer Platform |
| Encaixe no projeto | atual; CI pronto | os demos já estão lá | idem | build estático (`out/`) sobe igual; CI novo |

Sobre a D-173: ela registra o risco aceito para sites **de clientes** no Hobby. O site do Gabriel
passa a ser o site de um serviço pago, ou seja, uso comercial pelo texto dos termos; a D-173 não
cobre isso e esta sessão não estende a decisão. As "Fair Use Guidelines" da Vercel foram
atualizadas em 2026-11-12 e a lista de exemplos de uso comercial é carregada por JavaScript e não
veio na leitura: `needs-verification` se o texto citado na D-173 ("Receiving payment to create,
update, or host the site") continua igual.

Outro `needs-verification`: o Cloudflare vem empurrando projetos novos para Workers com arquivos
estáticos; confirmar na doc, no dia da implementação, se Pages continua a opção indicada para site
estático novo. Se não, Workers com assets estáticos cumpre os mesmos critérios.

**Recomendação (o Gabriel decide, decisão 2): Cloudflare Pages, plano grátis.** É a única opção
grátis em que os termos lidos não proíbem site comercial, e tem 301 de verdade para os links
antigos. O GitHub Pages continua só para servir as páginas de redirecionamento do endereço antigo.
Se ele preferir ficar na Vercel, o caminho dentro dos termos é o Pro (US$ 20/mês).

---

## 7. Conflitos com decisões vigentes

Nenhum foi resolvido aqui. Cada um vira pergunta na lista final.

| Item | Decisão vigente | Problema num site para leigos | Recomendação |
|---|---|---|---|
| Som ligado por padrão | D-092 | no celular, o primeiro toque pode tocar som em público; o leigo não procura o botão de som | **suavizar**: desligado por padrão em todo o site, botão continua; quem liga, fica ligado (preferência lembrada como hoje) |
| Animação de entrada | D-091 | atraso de ~1,9 s antes do primeiro texto, no navegador do Instagram; texto de piada técnica | **levar para a área de recrutador**: roda só na primeira visita a `/sobre/` ou `/projetos/`, nunca em Início, Serviços, Exemplos, Como funciona ou Orçamento |
| Konami, modo retrô, terminal, conquistas | D-093 | a dica "Aperte `" no hero e o botão de terminal no dock são ruído para cliente | **levar para a área de recrutador**: terminal, dica e busca Ctrl+K só em `/sobre/` e `/projetos/`; o Konami pode continuar no site todo (ninguém digita sem querer, e não atrapalha) |
| Tom técnico ("software que fica de pé sozinho", stack, estudos de caso) | `PRODUCT.md`, `docs/design/HOME.md` | jargão para quem quer vender mais | **levar para `/sobre/`**: o hero atual vira a abertura da página de recrutador; páginas de cliente seguem o glossário da seção 3 |
| Identidade visual escura (bancada, preto quente, âmbar) | `DESIGN.md` | não é jargão, mas é densa (mono pequeno, etiquetas) | **manter** a paleta e as fontes; nas páginas de cliente, texto maior, menos rótulos em mono, sem painel de estudos de caso |

Documentos que mudam se o Gabriel aprovar: `PRODUCT.md`, `docs/product/PRODUCT.md`,
`docs/design/HOME.md`, `DESIGN.md` (Personality Layer), `docs/architecture/DECISIONS.md`, e as
decisões novas no `DECISION-LOG.md` do ecossistema (via `ecosystem-decision-log`, só depois da
aprovação).

---

## 8. Migração

### Objetivo (estado final observável)

`https://<domínio>/` responde com o site novo; todo botão de contato de todas as páginas (site e
demos) aponta para `wa.me/5535998840168`; nenhum arquivo publicado contém o número pessoal; os 4
endereços antigos levam ao endereço novo equivalente.

### Fora de escopo

Loja com pagamento no site; bot de WhatsApp; painel administrativo; reescrever os demos;
qualquer conteúdo de cliente real sem autorização.

### Ordem de implementação

| # | Passo | Quem | Arquivos / onde | Verificação (comando ou tipo) | Reversão |
|---|---|---|---|---|---|
| 0 | Aprovar este plano e responder as decisões; registrar as decisões no ecossistema | Gabriel + sessão (`ecosystem-decision-log`) | `~/Dev/ai/ecosystem/docs/decisions/DECISION-LOG.md` | `manual` (aprovação) | — |
| 1 | Conferir disponibilidade e comprar o domínio | **Gabriel, à mão** (registro.br) | — | `comando`: `whois <domínio>` mostra o titular | não renovar |
| 2 | Número único: `lib/contato.ts` com `WHATSAPP = "5535998840168"`; apagar `briefingWhatsapp` | sessão | `lib/site.ts`, novo `lib/contato.ts` | `teste` novo: todo `wa.me` do `out/` = Business; `comando`: `grep -rE "<número pessoal>" out/ ; test $? -eq 1` | `git revert` |
| 3 | Rotas e páginas de cliente (Início, Serviços ×5, Exemplos, Como funciona) com o texto aprovado; `/about`→`/sobre`, `/archive`→`/projetos`, `/projects`→`/projetos` | sessão | `app/`, `content/` | `build` (`npm run check`, exit 0); `teste` de rotas no `out/` | `git revert` |
| 4 | Personalidade conforme decisões 5–7 | sessão | `components/personality.tsx`, `boot-sequence.tsx`, `system-chrome.tsx` | `teste` e2e (Playwright): sem boot e sem som em `/`, `/servicos/*`, `/orcamento/`; terminal ausente nessas rotas | `git revert` |
| 5 | Formulário único (seção 4), com testes por ramo | sessão | `app/orcamento/` | `teste`: para cada um dos 6 caminhos, a mensagem gerada é igual a um texto esperado (oráculo escrito à mão); `teste` e2e: teclado só, `axe` 0 violações | `git revert` |
| 6 | Demos para dentro (opção A): pasta `exemplos-sites/`, `base`, `linkWhatsApp` copiado, faixa aponta para `/orcamento/?origem=demo-<nicho>` e WhatsApp | sessão | `exemplos-sites/`, CI | `comando`: `npm run verificar` dos demos, exit 0; `arquivo-existe` + `teste`: as 7 rotas e `/para/cafe-do-coreto/` em `out/` | remover a pasta |
| 7 | Exemplos de robô, automação, app e sistema (seção 5) | sessão + Gabriel (gravar vídeos, decidir Carona 70) | `public/`, `app/exemplos/` | `manual` (o Gabriel aprova o material); `teste`: vídeo com `poster` e legenda | remover páginas |
| 8 | Conta e projeto no Cloudflare Pages; prévia em `*.pages.dev` | **Gabriel cria a conta**; sessão prepara CI e `_redirects` | `.github/workflows/`, `public/_redirects` | `comando`: `curl -sI https://<projeto>.pages.dev/about/` → `301` com `location: /sobre/` | apagar o projeto |
| 9 | DNS do domínio no Cloudflare e domínio no projeto | **Gabriel, à mão** (trocar os servidores DNS no registro.br) | — | `comando`: `dig +short NS <domínio>`; `curl -sI https://<domínio>/` → `200` | voltar os NS no registro.br |
| 10 | GitHub Pages passa a publicar só páginas de redirecionamento (`/`, `/orcamento/`, `/about/`, `/archive/`, `/projects/*`, `/area/*` e `404.html` que mapeia o resto) | sessão | `.github/workflows/deploy.yml`, pasta `redirects-ghpages/` | `comando`: `curl -s https://gabrielhsp-sys.github.io/orcamento/ \| grep -c 'http-equiv="refresh"'` ≥ 1 e o destino certo | reverter o workflow |
| 11 | `gabriel-sites.vercel.app` vira só redirecionamento: novo deploy com `vercel.json` `redirects` 308 (`/<nicho>` → `/exemplos/sites/<nicho>/`, `/l/<slug>` → `/para/<slug>/`, `/` → `/exemplos/sites/`) | sessão, com OK explícito do Gabriel (deploy) | cópia temporária fora do projeto | `comando`: `curl -sI https://gabriel-sites.vercel.app/alimentacao` → `308` e `location` certo | redeploy do `dist/` antigo (procedimento do `RELATORIO.md`) |
| 12 | Tally conforme a decisão 4 | **Gabriel, à mão** (ou sessão com autorização para o MCP do Tally) | tally.so | `manual`: abrir `tally.so/r/Eqd2ML` | desfazer a edição no Tally |
| 13 | Instagram (link da bio → `<domínio>/?origem=instagram` ou `/orcamento/?origem=instagram`), WhatsApp Business (nome do perfil "GABRIEL.SYS", campo site, mensagem de saudação), LinkedIn/GitHub (site → `<domínio>/sobre/`), apagar o número pessoal de onde for cliente (1d) | **Gabriel, à mão** | apps | `manual`: teste dos 3 toques num Android e num iPhone, saindo do Instagram | voltar o link |
| 14 | Atualizar `PRODUCT.md`, `DESIGN.md`, `docs/design/HOME.md`, `docs/architecture/DECISIONS.md`, README dos demos | sessão | docs | `comando`: `grep -rn "gabrielhsp-sys.github.io\|gabriel-sites.vercel.app" app components lib content public` vazio (fora as páginas de redirecionamento) | `git revert` |

### Redirecionamentos dos 4 endereços antigos

| Antigo | Novo | Mecanismo | Tipo |
|---|---|---|---|
| `gabrielhsp-sys.github.io/*` (portfólio) | `<domínio>/` e equivalentes (`/about/`→`/sobre/`, `/projects/x/`→`/projetos/x/`…) | páginas estáticas no GitHub Pages | `meta refresh` + JS (não é 301; o Pages não oferece) |
| `gabrielhsp-sys.github.io/orcamento/` | `<domínio>/orcamento/` (com query) | idem | idem |
| `gabriel-sites.vercel.app/*` | `<domínio>/exemplos/sites/*` e `/para/*` | `vercel.json` `redirects` | 308 |
| `tally.so/r/Eqd2ML` | conforme decisão 4 | edição do formulário no Tally | não há redirecionamento de URL |

### "Pronto" (`akita-verification-planning`)

| Alegação | Evidência que a cobre |
|---|---|
| nenhum arquivo publicado tem o número pessoal | `grep -rE "<número pessoal>" out/` sem resultado (exit 1), no CI, a cada build |
| todo contato vai ao Business | teste que extrai todos os `wa.me/…` de `out/` e exige `5535998840168` |
| o formulário gera a mensagem certa nos 6 caminhos | 6 testes contra textos esperados escritos à mão (oráculo) |
| o site é usável sem mouse e sem barreira | e2e com `@axe-core/playwright` 0 violações nas páginas de cliente; navegação por teclado no formulário |
| os endereços antigos levam ao novo | `curl -sI` em cada endereço antigo da tabela acima, conferindo código e `location` (ou o `meta refresh` no GitHub Pages) |
| do Instagram ao pedido em ≤ 3 toques | **manual, bloqueante**: o Gabriel faz o caminho num Android e num iPhone e diz "passou" |
| a mensagem longa não trunca | **manual**: enviar a maior mensagem de teste para o próprio Business |

### Riscos e irreversíveis (exigem OK do Gabriel na hora)

Compra do domínio; troca de servidores DNS; criação de conta no Cloudflare; deploy na Vercel do
redirecionamento; edição do Tally; mudança no Instagram e no WhatsApp Business; reescrita de
histórico Git (decisão 13). Nenhum destes foi feito nesta sessão.

---

## Decisões para o Gabriel

1. **Nome do domínio.** Opções: `gabrielsys.com.br` · `gabrielsys.com` · outro.
   Recomendo **`gabrielsys.com.br`**: o cliente é local e reconhece `.com.br`; o nome é a marca.
   A disponibilidade **não foi conferida** (precisa do registro.br, à mão). O preço anual também é
   `needs-verification`.

2. **Onde o site fica hospedado.** Opções: Cloudflare Pages grátis · Vercel Pro (US$ 20/mês) ·
   Vercel Hobby (contra os termos para site comercial) · GitHub Pages (contra os termos para negócio
   e sem redirecionamento de verdade).
   Recomendo **Cloudflare Pages**: custo zero, os termos lidos não proíbem site comercial e ele faz
   redirecionamento 301 dos endereços antigos.

3. **Como os demos entram no domínio.** Opções: A) mesmo repositório, build junto · B) rewrite na
   Vercel · C) subdomínio · D) reescrever em Next.
   Recomendo **A**: um deploy, um número, funciona em qualquer hospedagem, e o projeto dos demos
   ganha um repositório no GitHub (hoje não tem).

4. **O formulário Tally "Material do seu site".** Ele não é de orçamento: recolhe fotos, logo e
   textos de quem já fechou. Opções: a) manter como formulário pós-venda, enviado só a quem fechou,
   e tirar o link de qualquer lugar público · b) desativar e receber o material pelo WhatsApp ·
   c) refazer no site (precisaria de um serviço para receber arquivos).
   Recomendo **a**: ele faz bem uma coisa que o WhatsApp faz mal (lista por ramo, autorização
   escrita), e o site estático não recebe arquivo.

5. **Som.** Opções: desligado por padrão em todo o site · ligado só na área de recrutador · manter
   ligado (D-092).
   Recomendo **desligado por padrão**, com o botão no lugar: som inesperado no celular afasta.

6. **Animação de entrada.** Opções: só na área de recrutador · remover · manter em tudo (D-091).
   Recomendo **só em `/sobre/` e `/projetos/`**: ela é cartão de visita para quem gosta de
   tecnologia e atraso para quem quer um site.

7. **Terminal, busca Ctrl+K e Konami.** Opções: só na área de recrutador · manter em tudo · remover.
   Recomendo **terminal e busca só na área de recrutador; Konami pode ficar em tudo**: não atrapalha
   ninguém e é a assinatura da marca.

8. **Visual.** Opções: manter o escuro da bancada com textos maiores nas páginas de cliente · fazer
   as páginas de cliente claras.
   Recomendo **manter o escuro**: é a identidade, e o problema para o leigo é o texto, não a cor.

9. **App Carona 70 como exemplo de aplicativo.** Opções: mostrar com capturas · não mostrar e usar
   um demo · mostrar só depois de publicado.
   Sem recomendação: depende de você poder e querer mostrar (é seu, mas pode envolver outras
   pessoas). Enquanto não decidir, a página usa os demos.

10. **Preço no site.** Opções: mostrar "a partir de R$ …" por serviço · não mostrar preço ·
    mostrar só para sites.
    Recomendo **"a partir de" só para sites**, se você já tem esse valor: leigo pergunta preço
    primeiro. Nenhum valor foi inventado neste plano.

11. **O processo "Como funciona".** Os 4 passos da seção 3 (contar → proposta com prazo e preço →
    aprovar e mandar material → entregar e conferir) são uma proposta. Confirme se é assim que você
    trabalha, e diga o prazo de resposta e a cidade que quer mostrar.

12. **Como o site fala.** Opções: "eu" (uma pessoa) · "nós" (empresa).
    Recomendo **"eu"**: é verdade, e para pequeno negócio falar direto com quem faz é vantagem.

13. **Número pessoal no histórico do GitHub.** Ele está nos commits públicos desde `aff339d` (SHA anterior à reescrita de 2026-11-19, que não existe mais).
    Opções: deixar (sai do site, fica no histórico) · reescrever o histórico (irreversível, quebra
    clones e links de commit).
    Recomendo **deixar**: o número sai de tudo o que o cliente vê, e reescrever histórico custa mais
    do que protege.

14. **Robô de WhatsApp.** O briefing atual oferece "bot de Telegram ou WhatsApp"; a marca decidida
    fala em robôs de Telegram. Opções: só Telegram · também WhatsApp.
    Recomendo **só Telegram por enquanto**: robô de WhatsApp depende da plataforma da Meta, com
    custo e regras próprias (`needs-verification`), e isso precisa de estudo antes de virar oferta.

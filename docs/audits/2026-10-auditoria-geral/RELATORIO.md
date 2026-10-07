# Auditoria geral 2026-10 — relatório

Branch `auditoria-geral-2026-10`, criada de `main` em `36669cd` (igual a `origin/main` no
`git fetch` da noite de 2026-10-06). Só commits locais: **sem push, sem merge**. Plano e
critérios de pronto em [`PLANO.md`](PLANO.md); achados um a um em [`ACHADOS.md`](ACHADOS.md);
referências em [`REFERENCIAS.md`](REFERENCIAS.md).

## 1. Resumo

1. Toda página agora sai com cartão de compartilhamento completo; antes, as internas iam sem imagem e com o título da home no Twitter/X.
2. Cada projeto ganhou o próprio cartão (título, área, estado, período), e o cartão do site parou de prometer "homelab e hardware" (fora do público desde D-090).
3. Na home, o estudo de caso nº 1 lidera a seção numa linha inteira; os outros três dividem a linha de baixo. A contagem "Quatro estudos de caso" saiu do texto fixo.
4. No celular, nada fica "preso" depois do toque, os campos não dão zoom no iOS, e dock, terminal e conquista respeitam a área segura.
5. Botões respondem no aperto; a busca por atalho abre sem animação; a seta do card e da linha do arquivo anda no hover.
6. Filtros do arquivo vão para a URL (dá para mandar o recorte e o "voltar" funciona); estudo de caso ganhou índice das seções a partir de 1500 px.
7. Fontes por `next/font`: FCP mobile de 1,95 s para 1,20 s na home.
8. Acessibilidade: axe 3 → 0 (blocos de código roláveis alcançáveis por teclado); ícones decorativos ocultos.
9. Quatro vídeos de 12 s (Hyperframes, render local, 0,7–1,0 MB) nos estudos de caso, depois do texto.
10. Três direções de identidade num seletor isolado em `/prototipos/identidade` — nenhuma aplicada ao site.

**Contagens, conferidas no filesystem:** 6 projetos públicos, **4 em destaque** (Telegram Offers,
GABRIEL.SYS, Academic System, Fedora pós-instalação — o enunciado marcava `needs-verification`);
13 rotas auditadas (home, arquivo, 3 áreas, 6 projetos, sobre, 404); a subpágina de briefing
**existe** (`/orcamento`) e continua fora da navegação, da busca e do sitemap — não foi tocada;
testes 11 → 14; 39 achados + 5 oportunidades de movimento. As decisões D-088 a D-101 continuam
respeitadas: rótulos, áreas e estados iguais, nada de homelab/RESEARCH, a animação de entrada é a
única introdução e não mudou, som ligado por padrão com botão, Konami = retrô, Ctrl/⌘ K é a
busca, `hardware-line` intacto, link do Telegram Offers para o repositório público, e a camada de
personalidade não ganhou nada entre o visitante e um alvo clicável.

O que mais impacta para quem contrata: o cartão de compartilhamento certo (é o que aparece no
LinkedIn e no WhatsApp quando alguém manda o link) e o primeiro estudo de caso liderando a home.

## 2. Achados priorizados e destino

Detalhe, evidência e esforço de cada um em [`ACHADOS.md`](ACHADOS.md). Contagem: **39 achados +
5 oportunidades de movimento**. Destino:

| Destino | Achados |
|---|---|
| **Implementado** (28) | #1–#28 — commits abaixo |
| **Protótipo** (2) | #29 hero com prova na primeira dobra, #30 identidade |
| **Proposta** (1) | #31 "Contato" na navegação principal |
| **Vídeo** (1) | #32 — tarefa 6 |
| **Precisa do Gabriel** (2) | #33 "virou homelab" no texto da home, #34 "uptime desde 2023" no comando secreto |
| **Descartado com motivo** (5) | #35 ouvinte de teclado (risco ADR-014 > ganho), #36 snake dinâmico (2 KB), #37 SEO 66 do 404 (é `noindex`), #38 título de 7 linhas (nenhum registro chega lá), #39 compressão/cache (é o servidor local; o Pages comprime) |
| Movimento a–d | implementados; **e** (fade pôster→vídeo) descartado: o pôster é o último quadro, o vídeo começa no primeiro, um fade pede uma segunda camada e não muda o que se lê |

Por impacto ÷ esforço, os cinco primeiros: #1 (cartão nas páginas internas), #2 (cartão do site
com homelab), #4 (estudo de caso líder), #6–#8 (toque no celular), #12 (fontes).

Mapa achado → commit:

| Commit | Achados |
|---|---|
| `0ce28d8` | #1, #2, #3, #25 |
| `f666609` | #6, #7, #8, #9, #13, #14, #15, #16, #17, #18, #19, #26, #27 |
| `c6093bf` | #10, #11, #22, #28 |
| `2c7dff7` | #4, #5 |
| `522ed2b` | #20, #21, #23, #24 |
| `3c81a75` | #12 |
| `a2dde53` | #29, #30 (protótipo) |
| `0a747fe`, `1f76467` | #32 (vídeos) |
| `10d97c8`, `2e3a3a5`, `1f76467` | correções da revisão em dois eixos, do `review-animations` e da regressão do Lighthouse |

**Duas classificações que a revisão de spec questionou, e o porquê.** #14 (entrada do terminal de
340 para 240 ms) e #16 (a conquista sai pelo mesmo caminho em 200 ms) mexem em movimento de
recursos da camada de personalidade. Tratei como polimento de movimento — implementável pelo
enunciado — porque o recurso continua igual: o terminal abre, a conquista aparece, nada foi
removido nem mudou de comportamento. Se o Gabriel ler "alterar recurso" como "alterar qualquer
detalhe dele", os dois trechos estão isolados em `app/globals.css` (`.terminal-wrap` e
`.achievement-toast[data-leaving]`) e em `components/personality.tsx` (efeito do toast) e voltam
com uma edição pequena. O card líder e o índice do estudo de caso são hierarquia dentro de
páginas que já existiam — nenhuma página nova, nenhum item de navegação novo.

## 3. Commits

| Commit | Lote | Uma linha |
|---|---|---|
| `c03747d` | docs | Plano verificável, achados e as capturas e medidas "antes" |
| `0ce28d8` | SEO | Cartão completo em toda página, cartão por projeto, JSON-LD; `verify-export` cobra `og:image` |
| `f666609` | toque e movimento | Hover só com ponteiro fino, aperto `.97`, campo 16 px no toque, área segura, curva única, microinterações |
| `c6093bf` | acessibilidade | Bloco de código focável, ícones decorativos ocultos, marca com `translate="no"`, atalho ⌘ K no Mac |
| `2c7dff7` | hierarquia | Estudo de caso nº 1 lidera a home; contagem derivada do conteúdo |
| `522ed2b` | usabilidade | Filtros na URL, índice do estudo de caso (≥ 1500 px), saída para os projetos na página Sobre |
| `3c81a75` | desempenho | Fontes por `next/font/local` com preload e fallback com métrica |
| `a628ff2` | docs | `DESIGN.md`, `HOME.md`, ADR-021 e `QUALITY.md` acompanham as mudanças |
| `a2dde53` | protótipo | Três direções de identidade em `/prototipos/identidade`, isoladas e com `noindex` |
| `0a747fe` | vídeos | Quatro vídeos de 12 s nos estudos de caso |
| `10d97c8` | revisão | Correções da revisão em dois eixos (vídeo até 820 px, índice ↔ `h2` no export, JSON-LD de `lib/site.ts`) |
| `2e3a3a5` | movimento | Passada do `review-animations`: busca sem animação, aperto de ícone `.94`, ícone a partir de `.9` |
| `1f76467` | desempenho | Vídeo fora da primeira pintura: depois do texto, player no cliente, pôster WebP lazy |
| (este) | docs | Relatório final e capturas e medidas "depois" |

`npm run check` verde (exit 0) antes de cada commit de código.

### Revisão da branch (`pocock-code-review`, dois eixos em subagentes)

Ponto fixo `main` (`36669cd`), diff `main...HEAD`, 11 commits na hora; não rastreado: só
`prompt.md` (o enunciado, lido como spec).

**Padrões** — pior achado: a rota do protótipo é exportada e iria ao ar num merge (regra 1 do
`AGENTS.md`) → item 2 de "Precisa do Gabriel". Duros corrigidos: texto do vídeo abaixo de 11 px
entre 600 e 1100 px (o vídeo agora some abaixo de 820 px e fica depois do texto). Duros mantidos
com motivo: alvos de 28 px e hover sem gate no seletor do protótipo (é o `PICKER.md` verbatim, só
na rota de rascunho, com teclas 1–4); texto a ~30 % na visão lado a lado (de propósito; a tela
cheia é o julgamento); âmbar como destaque do passo ativo nos vídeos (o ADR-018 vale para a
interface; no vídeo o âmbar faz o papel de "navegação ativa"). Cheiros (julgamento, não aplicados):
duas lojas de URL e duas de reduced-motion parecidas, tese do hero repetida em três lugares,
cores de área repetidas entre CSS, script do cartão e vídeos, chaves de filtro soltas.

**Spec** — pior achado: Lighthouse não tinha sido medido depois de cada lote → medido agora,
por lote e no fim (seção 4), e a única queda real (vídeo no topo) foi corrigida em `1f76467`.
Outros: faltavam as medidas "depois" (feitas), registro do `review-animations` (feito, seção 4) e
do `text-review` (feito, seção 4); as mudanças de movimento em recurso de personalidade (seção 2);
o teste do índice estava num seam fraco (agora o `verify-export` confere o HTML exportado, provado
vermelho → verde).


## 4. Antes × depois

### Lighthouse 13.5.0 (local, `out/` servido por `http.server`, mediana de 3)

| Rota | Mobile antes | Mobile depois | Desktop antes | Desktop depois |
|---|---|---|---|---|
| `/` | 80 · FCP 1,95 s · LCP 5,05 s | **81** · FCP 1,20 s · LCP 5,19 s | 99 · LCP 0,99 s | 99 · LCP 0,99 s |
| `/archive/` | 81 · FCP 1,80 s | **82** · FCP 1,05 s | 99 | 99 |
| `/about/` | 78 · FCP 1,80 s · LCP 5,62 s | **80** · FCP 1,05 s · LCP 5,42 s | 98 | 98 |
| `/area/software/` | 82 · FCP 1,80 s | 82 · FCP 1,05 s | 99 | 99 |
| `/projects/telegram-offers/` | 80 · FCP 1,95 s · LCP 5,04 s | **81** · FCP 1,20 s · LCP 5,19 s | 99 · LCP 0,99 s | 99 · LCP 0,99 s |
| `/404.html` | 82 (mediana de 3) | 81 (mediana de 3) | 99 | 99 |

Acessibilidade 100, boas práticas 100 e SEO 100 em todas, antes e depois (404 com SEO 66 nos dois
lados, por `noindex`). CLS ≤ 0,018 nos dois lados. Brutos: [`medidas/antes/lighthouse.json`](medidas/antes/lighthouse.json),
[`medidas/depois/lighthouse.json`](medidas/depois/lighthouse.json).

Leitura honesta dos números:

- **FCP mobile caiu ~0,75 s em todas as rotas** (fonte com preload).
- **LCP mobile simulado subiu ~0,15 s** na home e no estudo de caso. O Lighthouse local do celular
  é bimodal: no "antes", 1 de cada 3 execuções caiu num modo rápido (87 pontos, LCP 3,8 s); a
  mediana era 80. Depois do lote das fontes o modo rápido sumiu e as três execuções dão 81. A
  mediana subiu; o melhor caso isolado, não.
- **404 mobile, 82 → 81 na mediana de 3.** Refeito com 5 execuções intercaladas: antes 89, 81, 81,
  81, 81; depois 81 × 5. Mediana 81 nos dois lados; o 82 da primeira medida veio do mesmo modo
  rápido. Registro como **empate**, com a ressalva escrita.
- **Estudo de caso desktop:** com o vídeo no topo caiu para 98 (5 execuções intercaladas: média
  98,4 contra 99,0). Movido para depois do texto, com player montado no cliente e pôster lazy, a
  mediana final voltou a 99.

### Lighthouse por lote (mobile, 1 execução, `/` e estudo de caso)

Uma execução por lote (o modo bimodal pesa aqui; a coluna mostra pontuação e LCP):

| Depois do commit | `/` | estudo de caso |
|---|---|---|
| início (`36669cd`) | 87 (LCP 3,83 s) | 80 (LCP 5,06 s) |
| `0ce28d8` SEO | 86 (3,90 s) | 80 (5,05 s) |
| `f666609` toque e movimento | 80 (5,04 s) | 87 (3,90 s) |
| `c6093bf` acessibilidade | 80 (5,05 s) | 87 (3,90 s) |
| `2c7dff7` hierarquia | 86 (3,90 s) | 80 (5,04 s) |
| `522ed2b` usabilidade | 86 (3,90 s) | 79 (5,19 s) |
| `3c81a75` fontes | 81 (5,20 s) | 81 (5,13 s) |
| `a2dde53` protótipo | 81 (5,19 s) | 81 (5,12 s) |
| `0a747fe` vídeos | 81 (5,20 s) | **80 (5,50 s)** |
| `10d97c8` revisão | 81 (5,19 s) | 80 (5,50 s) |
| `2e3a3a5` movimento | 81 (5,20 s) | 80 (5,50 s) |
| `1f76467` vídeo fora da pintura | 81 (5,20 s) | 81 (5,20 s) |

Queda real só no lote dos vídeos (LCP +0,3 s no estudo de caso), corrigida em `1f76467`. A
alternância 80/87 até o lote das fontes é o modo bimodal, não mudança de código.
Brutos em [`medidas/por-lote/`](medidas/por-lote/).

**Lacuna declarada:** o enunciado pede Lighthouse depois de cada lote; durante a implementação só
medi o lote das fontes (e o do vídeo, quando a queda apareceu). A tabela acima foi feita depois,
reconstruindo cada commit numa cópia descartável — os números valem, a ordem do trabalho não foi
a pedida.

### `review-animations` sobre o movimento novo

| Antes | Depois | Por quê |
|---|---|---|
| busca abre com `translateY + scale + blur`, 220 ms | sem animação | aberta por atalho de teclado (Ctrl/⌘ K): atalho não anima |
| terminal entra em 340 ms | 240 ms, `--ease-out` | UI abaixo de 300 ms |
| nenhum `:active` | `scale(.97)` em 140 ms; ícone do trilho/dock `.94` | resposta no aperto, dentro da faixa sutil |
| ícone do copiar troca seco | entra de `scale(.9)` + `blur(2px)` em 180 ms | indicação de estado sem dois ícones sobrepostos |
| conquista some de uma vez | sai pelo mesmo caminho em 200 ms (entrada 280 ms) | consistência espacial, saída mais rápida que a entrada |
| hover em toque fica preso | todo `:hover` sob `(hover: hover) and (pointer: fine)` | toque não tem hover |
| 5 cópias de `cubic-bezier(.16, 1, .3, 1)` | token `--ease-out` | coesão |

Veredito: **aprovado**. Nada em `scale(0)`, nada em `ease-in` na interface, só `transform` e
`opacity` (mais cor e borda) e tudo zera com `prefers-reduced-motion`. Os vídeos são peças
explicativas e ficam fora do teto de 300 ms.

### `text-review` (passe de fatos) nos textos novos

Cada frase nova visível foi conferida contra a fonte: no site, a contagem de estudos de caso
(derivada), "nesta página", "ver os projetos", a legenda do vídeo; no cartão do site, a
disponibilidade, a tese e o lede (os mesmos da home); nos cartões por projeto, só frontmatter;
nos vídeos, cada frase contra o README do projeto (detalhe na tabela de `videos/README.md`). Uma
frase foi corrigida antes do render: "uma seção que desfaz **cada** ajuste" virou "uma seção de
como desfazer os ajustes" — o README não garante "cada". Outra saiu do protótipo: "Estágio,
disponível **agora**" virou "Estágio" (o "agora" não tem fonte). O humanizer não se aplica: os
textos são em português.

### Playwright + axe (13 rotas × 360/768/1280/1920, com e sem reduced-motion)

| | Antes | Depois |
|---|---|---|
| Estouro horizontal | 0 | 0 |
| Erros de console | 0 | 0 |
| Texto < 11 px | 0 | 0 |
| Alvo < 24 px fora de frase | 0 | 0 |
| Violações axe (WCAG 2.2 AA) | 3 nós (`scrollable-region-focusable`) | **0** |
| Animação rodando com reduced-motion | 0 | 0 |
| Links internos com status ≠ 200 | 0 de 12 | 0 de 12 |
| Cliques no menu e no card | ok | ok |
| Busca (abre, filtra, vazio, Esc devolve foco, Enter navega) | ok | ok |
| Terminal (`help`, `projetos`, `abrir`), Konami liga/desliga, som persiste | ok | ok |

Relatórios brutos: [`medidas/antes/report.json`](medidas/antes/report.json),
[`medidas/depois/report.json`](medidas/depois/report.json).

### Contraste (`contrast.py` do ecossistema)

Todos os pares de texto do sistema passam AA antes e depois (pior caso `#9b9487` sobre `#201d19`,
5,58:1). Nenhuma cor do site mudou. Pares novos desta rodada, todos AA: botão de pausa do vídeo e
índice da página (tokens existentes); as paletas dos protótipos foram calculadas antes de usar —
Folha pior caso de texto 5,15:1, Etiqueta 5,06:1 (os tons de estado foram escurecidos depois que
o axe pegou 4,07:1 num deles). Detalhe em [`medidas/depois/contraste.txt`](medidas/depois/contraste.txt).

O único par abaixo de 3:1 da lista (`#6b6459` sobre `#201d19`, 2,87:1) já existia: é a borda do
chip selecionado medida contra o próprio campo; contra a barra onde o chip está, ela dá 3,17:1.

### `audit-ui.sh`

Clichês de IA: zero antes e depois. "glassmorphism" subiu de 4 para 7 porque conta as linhas
`backdrop-filter: none` do bloco `prefers-reduced-transparency` e o seletor do protótipo; não há
vidro novo em card. Animações 22 → 33, todas sob o `prefers-reduced-motion` global.

### Capturas

`capturas/antes/` e `capturas/depois/`: cada página em 360, 768, 1280 e 1920 (primeira tela),
a página inteira em 1280, a versão reduced-motion em 1280, e os estados globais (busca, terminal,
snake, modo retrô, animação de entrada). Mudança visível: compare `home-1280-full.jpg`,
`caso-telegram-offers-1920.jpg` (índice) e `arquivo-*` (seta reta, linha de base).

## 5. Protótipos de identidade

Abrir:

```bash
git switch auditoria-geral-2026-10
npm run dev
# http://localhost:3000/prototipos/identidade/
```

Teclas `1`, `2`, `3` trocam a direção em tela cheia; `4` (ou "Lado a lado") mostra as três juntas;
setas também funcionam. A escolha fica na URL (`?v=2`). Capturas em `capturas/prototipos/`.

| Direção | O que propõe | Quando é a escolha certa | Custo |
|---|---|---|---|
| **Bancada** | O sistema atual polido. A metade direita do hero, vazia hoje, vira um painel com os estudos de caso reais, área, estado e período — prova na primeira dobra (achado #29). | Se a identidade atual já é a dele e os outros projetos já seguem esse visual. | Menor salto; a página continua escura e densa. |
| **Folha** | Folha de dados clara: fundo papel `#fbfbf8`, tinta `#141414`, uma família só (Instrument Sans) e mono só nos dados. Projetos como linhas de uma tabela de especificação. A única cor forte é o marca-texto na disponibilidade. | Se quem contrata é o público principal e a leitura rápida pesa mais que personalidade. | Perde o "terminal à noite"; o modo retrô e o terminal ficariam sem a ponte visual. |
| **Etiqueta** | Equipamento: chassi de alumínio, placas pretas gravadas, laranja de sinalização só na ação, display condensada (Big Shoulders). Cada projeto ganha código de catálogo tirado do próprio registro (TO-26, GS-25…). | Se ele quer uma marca memorável que funcione também em outros projetos dele. | Mais ruidosa; o código de catálogo é invenção de linguagem (derivada de dado real) que ele precisa aceitar. |

**Recomendação:** **Bancada**. O site é a identidade que os outros projetos dele já seguem
(D-124 levou essa paleta para o site da DCE701); trocar a identidade inteira tem custo em tudo que
já foi feito. A Bancada resolve o problema real que a auditoria achou — a primeira dobra sem prova —
sem jogar fora o que funciona. Se a ideia for renovar a marca, a Etiqueta tem mais personalidade
própria que a Folha; a Folha é a mais legível e a menos "dele".

Limites do protótipo: o seletor segue o `PICKER.md` do skill `prototype` (alvos de 28 px, hover
sem gate de ponteiro); a visão "lado a lado" reduz cada direção para ~30 % e o texto fica pequeno
de propósito — o julgamento de detalhe é em tela cheia. Fontes das direções novas são arquivos OFL
copiados para a pasta da rota, com a licença ao lado; nenhuma dependência nova.

## 6. Vídeos

| Vídeo | Arquivo | Tamanho | Duração | Pôster |
|---|---|---|---|---|
| Telegram Offers | `public/videos/telegram-offers.mp4` | 976 KB | 12,0 s | `.webp`, 17 KB |
| GABRIEL.SYS | `public/videos/gabriel-sys-site.mp4` | 882 KB | 12,0 s | `.webp`, 12 KB |
| Academic System | `public/videos/academic-system.mp4` | 709 KB | 12,0 s | `.webp`, 16 KB |
| Fedora pós-instalação | `public/videos/fedora-post-install.mp4` | 723 KB | 12,0 s | `.webp`, 15 KB |

1280 × 720, 30 fps, H.264, **sem trilha de áudio** (conferido com `ffprobe`). Feitos com
Hyperframes 0.8.134 já existente no sandbox do piloto (nada instalado), render local, sem nuvem,
Lambda, Cloud Run ou geração paga. Fontes e checagens de cada um em
[`videos/README.md`](../../../videos/README.md); `hyperframes check` passou nos quatro com 0 erro e
contraste AA em todos os textos. Conteúdo só de README e do estudo de caso; o card do Telegram é o
exemplo do próprio README. Nenhum canal, chat, host, IP ou token.

No site: depois do texto do estudo de caso, sem som, em loop, botão de pausa de teclado, pôster
lazy, arquivo pedido só perto da tela e pausado fora dela, só pôster com reduced-motion, e nada
abaixo de 820 px (o texto do vídeo ficaria abaixo do piso de 11 px). Conferido no navegador:
na carga não há requisição de vídeo; ao rolar até ele vem o pôster e o `.mp4`; com
reduced-motion só o pôster; a 360 px nenhuma requisição.

**Por que não no topo:** no topo o vídeo vira o maior elemento da primeira dobra e o Lighthouse
desktop do estudo de caso caiu de 99 para 98 em 5 execuções intercaladas. A regra de desempenho
venceu a vitrine.

Desvios do fluxo do skill `motion-graphics`, todos por regra da sessão: sem `skills update` nem
`init` (atualizariam skills pela rede); sem a pergunta de aprovação antes do render (o Gabriel
estava dormindo e o enunciado autorizou render local); sem subagentes de diretor/builder (as peças
são curtas e o conteúdo vem só de README).

## 7. Precisa do Gabriel

| # | Decisão | Minha recomendação |
|---|---|---|
| 1 | **Escolher a direção de identidade** (Bancada, Folha ou Etiqueta). | Bancada. |
| 2 | **O que fazer com `/prototipos/identidade` antes de mergear.** A rota é exportada: se a branch entrar na `main`, ela vai ao ar (com `noindex`, fora do sitemap, da busca e sem nenhum link — `verify-export` garante). Isso conflita com a regra 1 do `AGENTS.md` ("o deploy contém apenas conteúdo aprovado como público"). | Escolher a direção e **apagar `app/prototipos/`** (e a checagem dela no `verify-export.mjs`) antes do merge. |
| 3 | **"Contato" na navegação** (achado #31). Hoje o contato está no botão do hero, no fim de cada estudo de caso e no fim da home, mas não no trilho nem no dock. | Adicionar "Contato" ao trilho, apontando para `/#contato`; no dock, trocar o terminal por contato fica para ele decidir (o terminal é personalidade, D-094). |
| 4 | **Texto da home: "virou curso, virou homelab"** (#33). É fato da história dele, mas o homelab não está no público (D-090). | Manter — é história, não vitrine; só remover se ele quiser que nada fale de homelab até o novo existir. |
| 5 | **Comando secreto `kernel`: "uptime ... desde 2023"** (#34). Não achei fonte no repositório. Está na camada de personalidade: mexer é mudança grande. | Ele confirma o ano ou troca a linha. |
| 6 | **Ajustes de movimento em recursos de personalidade** (#14 terminal 240 ms, #16 saída da conquista). Classifiquei como polimento; a revisão de spec perguntou. | Manter. Se ele discordar, os trechos estão listados na seção 2. |
| 7 | **Hero com prova na primeira dobra** (#29) aplicado ao site, mesmo sem trocar a identidade. Contraria `docs/design/HOME.md` ("hero de coluna única"). | Aplicar a versão da Bancada junto com a escolha do item 1. |
| 8 | **Vídeos no celular.** Abaixo de 820 px eles não aparecem. Uma versão vertical (1080 × 1350, texto maior) resolveria. | Fazer numa próxima rodada, se ele quiser os vídeos no celular. |

Nenhuma biblioteca precisou passar pelos 7 gates: nada foi instalado. Lighthouse, Playwright e
axe foram **executados** de `movimente-se-site/node_modules` (instalados lá antes), e o Hyperframes
do sandbox do piloto — sem alterar nenhum dos dois lugares. Fontes OFL copiadas como arquivo
(Bricolage para o gerador do cartão, Instrument Sans, Red Hat Mono, Big Shoulders e DM Mono para
o protótipo) não são dependência de código.

Nenhum segredo apareceu. O número de WhatsApp do briefing (`lib/site.ts`) é conteúdo do
`/orcamento`, já existente e fora desta rodada; não entrou em vídeo, captura nem relatório.

## 8. Decisões a registrar no ecossistema (depois que o Gabriel aprovar)

Não registradas agora — são dele.

1. **Cartão de compartilhamento por página e por projeto** como padrão para os sites dele: o
   `openGraph` do Next substitui sem mesclar, então todo site precisa de um helper de metadata
   e de uma checagem pós-build de `og:image` (aqui: `lib/metadata.ts` e `verify-export.mjs`).
2. **Hover só com ponteiro fino e campo com 16 px no toque** como base de todo site do Gabriel
   (complementa D-119/D-120 no grupo "Sites").
3. **Vídeo de portfólio**: sem som, pausável, pôster, carga perto da tela, reduced-motion = pôster,
   ≤ 5 MB versionado — e fora da primeira dobra quando o Lighthouse cair.
4. **A direção de identidade escolhida**, se ela mudar a paleta ou a tipografia: afeta D-124 e
   os outros projetos que seguem o visual do GABRIEL.SYS.
5. **Uso de ferramentas de medição de outro repositório** (`movimente-se-site/node_modules`) como
   prática aceita, ou a decisão de instalar Lighthouse/Playwright/axe neste repositório pelos gates.

## 9. Como revisar

```bash
git switch auditoria-geral-2026-10
npm run dev
```

- Home: estudo de caso líder; toque no celular (DevTools com toque não reproduz o hover preso —
  conferir num telefone).
- `/archive/?area=web&estado=live`: filtro vindo da URL.
- `/projects/telegram-offers/` a ≥ 1500 px: índice; role até o fim: vídeo.
- `/prototipos/identidade/`: as três direções.
- Cartões: `public/og.png` e `public/og/*.png` (gerados no `predev`/`prebuild`).
- `npm run check` roda lint, 14 testes, build e `verify-export`.

Lacunas de validação declaradas: não testei em telefone real nem com leitor de tela real; o
Lighthouse é local (sem a compressão do GitHub Pages), serve para comparar antes × depois e não
como número absoluto.

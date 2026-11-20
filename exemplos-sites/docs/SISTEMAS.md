# Sistemas visuais por nicho

Base: `ui-ux-pro-max` 2.13.0 (`search.py "<nicho>" --design-system`, 2026-11-14), usado como banco
de paleta e par tipográfico (D-165 item 2). O motor de estilo é a Taste Skill
(`design-taste-frontend`), com a revisão de `frontend-design`. O banco caiu no genérico em quase
todos os nichos (azul de Tailwind, rosa-choque, neumorfismo); cada troca está em "Do banco → o que
mudou".

## Regras comuns

- Contraste conferido com `~/Dev/ai/ecosystem/workflows/ui/contrast.py`; todo par de texto ≥ 4.5:1
  (AA). Saídas no fim.
- Fontes **só OFL-1.1**, auto-hospedadas via Fontsource 5.3.0, subconjunto `latin` (cobre á ã ç é
  õ), sem CDN do Google. Licença lida no campo `license` de
  `https://registry.npmjs.org/@fontsource/<família>` em 2026-11-14: `OFL-1.1` em todas. O LICENSE de
  cada pacote fica em `node_modules/@fontsource/<família>/LICENSE`.
- Cada página carrega só as próprias fontes (2 a 3 arquivos woff2).
- **Tema travado por marca.** Cada nicho tem um tema só (claro ou escuro), porque o tema é parte da
  identidade; não há modo escuro alternativo (desvio consciente da Taste Skill §6.C).
- Sem eyebrow em caixa alta acima de cada seção, sem "·" como separador de tudo, sem "→" nos
  botões, sem numeração 01/02 onde não há sequência real (o passo a passo de agendamento e do
  orçamento é sequência real).
- Movimento: CSS por padrão; um único momento orquestrado por página no máximo. GSAP só na Arena
  (entrada do hero). Tudo desliga com `prefers-reduced-motion: reduce`. `:hover` só dentro de
  `@media (hover: hover) and (pointer: fine)` (D-126). Campo de formulário com 16 px.
- Ícones: Phosphor (MIT), arquivos SVG copiados com o aviso de licença em `src/icons/LICENSE`,
  sem pacote npm.
- A frase da faixa fixa ("Site de demonstração — feito por Gabriel") é texto literal do pedido e
  mantém o travessão; no resto da cópia não há travessão.
- **Assinatura por nicho** (para os 7 não parecerem o mesmo template trocando cor): estrutura do
  hero, forma (raio, borda), ritmo das seções e o "momento" memorável de cada um.

## Alimentação — Lanchonete Brasa & Pão

Tom: letreiro de lanchonete de praça, direto ("Pede que sai quentinho").

| Token | Valor | Uso / contraste |
|---|---|---|
| `--bg` | `#F7C948` | amarelo-mostarda, página inteira |
| `--card` | `#FFF6DA` | cartões do cardápio |
| `--ink` | `#2A140D` | texto (11.13:1 no amarelo, 16.15:1 no cartão) |
| `--muted` | `#5A3A22` / `#6B4A33` | secundário (6.50:1 / 7.33:1) |
| `--primary` | `#A61F17` | vermelho-ketchup: botão (texto `#FFF6DA`, 6.87:1), preço (4.74:1 no amarelo) |
| `--grill` | `#2A140D` | gaveta do pedido (texto amarelo 11.13:1) |
| raio | 18 px cartões, 999 px botões | |

Tipografia: **Lilita One** (títulos, letreiro arredondado) + **Karla** 400/700 (texto).
Momento: o letreiro gigante "Brasa & Pão" no hero, com a foto do lanche cortando a borda direita.

```
┌──────────────────────────┐
│ BRASA & PÃO      [foto ▶ │  hero: letreiro enorme à esquerda, foto sangrando
│ letreiro          lanche]│
│ [Pedir pelo WhatsApp]    │
├──────────────────────────┤
│ Lanches Porções Bebidas  │  abas grudadas no topo
│ ▢ X-Brasa ...... 24 [+]  │  lista com foto pequena e botão + no polegar
├──────────────────────────┤
│ faixa escura: horário,   │
│ delivery, bairros        │
└──────────────────────────┘
 gaveta fixa: 3 itens · R$ 58,00 [Ver pedido] → prévia em balão de WhatsApp
```

Do banco → o que mudou: banco deu fundo rosado `#FEF2F2` + Playfair Display SC (bistrô). A primeira
revisão (carvão + laranja) caiu no default "quase-preto + um acento vivo". Fiquei com o amarelo de
letreiro e vermelho de ketchup, que é o vernáculo de lanchonete de interior.

## Beleza — Studio Íris Estética

Tom: calmo, acolhedor, frases curtas, "você".

| Token | Valor | Uso / contraste |
|---|---|---|
| `--bg` | `#F3F1F5` | branco-lilás frio |
| `--surface` | `#FFFFFF` | tabela de serviços |
| `--ink` | `#2A2230` | texto (13.66:1) |
| `--muted` | `#625869` | duração, legenda (6.00:1) |
| `--primary` | `#5B3B8C` | íris (a flor): botão e links (7.64:1; texto `#FFFFFF` 8.57:1) |
| `--sage` | `#9DB3A2` | folha da íris, só decorativo |
| raio | 2 px nos blocos; fotos com topo em arco | |

Tipografia: **Cormorant** 500/600 (títulos; serifa justificada: beleza e cuidado pedem tom de
luxo calmo; Cormorant está no pool da Taste Skill) + **Jost** 400/500 (texto).
Momento: foto em arco alto ao lado do título, muito respiro.

```
┌──────────────────────────┐
│ Studio Íris     ╭─────╮  │  hero assimétrico, foto em arco
│ título calmo    │foto │  │
│ [Agendar horário]╰─────╯ │
├──────────────────────────┤
│ Rosto                    │  serviços por categoria
│ Limpeza de pele ··· 60min R$ 140 [escolher]
├──────────────────────────┤
│ mosaico de alturas diferentes (galeria)
│ profissionais: 3 retratos de meio corpo (sem close)
└──────────────────────────┘
```

Do banco → o que mudou: banco deu rosa-choque `#EC4899` + Lora/Raleway. A primeira revisão
(areia + argila) caiu na paleta proibida da Taste Skill (creme + argila). Fiquei com o lilás frio e a
cor da íris, ligada ao nome do negócio.

## Cabeleireiro — Barbearia Navalha Fina

Tom: seco, confiante, de bairro ("Corte na régua").

| Token | Valor | Uso / contraste |
|---|---|---|
| `--bg` | `#141516` | grafite |
| `--surface` | `#1E2022` | cartões |
| `--ink` | `#EEE5D1` | creme (14.60:1) |
| `--muted` | `#A9A194` | (7.15:1) |
| `--primary` | `#B5382A` | botão tijolo (texto `#FFFFFF`, 5.89:1) |
| `--brass` | `#C9A15B` | latão: preço, filetes (7.60:1) |
| raio | 0 (cantos retos), filete duplo latão | |

Tipografia: **Bebas Neue** (títulos e preços) + **Archivo** 400/600 (texto).
Momento: a "tabela pintada na parede": preços em numeral grande Bebas, em latão.

```
┌══════════════════════════┐
║   NAVALHA FINA           ║  placa centrada com filete duplo (exceção à regra
║   corte na régua         ║  anti-centro: o letreiro é a mensagem)
║   [Marcar corte]         ║
╠══════════════════════════╣
│ foto P&B │ Degradê   35  │  cortes: foto + preço grande
├──────────┴───────────────┤
│ planos mensais (faixas)  │
│ marcar: corte → barbeiro → dia → período  (sequência real, numerada)
└──────────────────────────┘
```

Do banco → o que mudou: banco deu azul `#2563EB` + Outfit/Work Sans (Swiss genérico). Tirei também a
Instrument Serif da primeira versão (proibida como default pela Taste Skill e mistura de família).

## Saúde — Clínica Vida Integrada

Tom: informativo, sóbrio, sem promessa. Nunca "resultado", "antes e depois", "garantido".

| Token | Valor | Uso / contraste |
|---|---|---|
| `--bg` | `#F3F6F4` | |
| `--surface` | `#FFFFFF` | |
| `--ink` | `#13302C` | (12.98:1) |
| `--muted` | `#4D6661` | (5.70:1) |
| `--primary` | `#0E6B63` | verde-petróleo (5.84:1; texto `#FFFFFF` no botão, 6.36:1) |
| `--tint` | `#DCE9E3` | fundo de chip de convênio |
| raio | 12 px, borda 1 px | |

Tipografia: **Figtree** 400/600/700, família única (o banco sugeriu Figtree; serifa não se
justifica aqui).
Momento: o "painel prático" no hero (horário de hoje, endereço, convênios) que responde em 3
segundos o que quem procura clínica quer saber.

```
┌──────────────────────────┐
│ Clínica Vida Integrada   │  hero em duas colunas (no celular empilha)
│ texto curto              │  ┌ painel ─────────────┐
│ [Marcar consulta]        │  │ Hoje: 7h às 19h     │
│                          │  │ Centro, Areado      │
│                          │  │ Convênios: 6        │
├──────────────────────────┤  └─────────────────────┘
│ especialidades (lista com ícone de linha, 2 colunas)
│ equipe: monograma + registro fictício (sem foto de rosto)
│ convênios em chips · como chegar + mapa
└──────────────────────────┘
```

Do banco → o que mudou: banco deu ciano `#0891B2` + neumorfismo e "Hero + Testimonials".
Neumorfismo tem contraste ruim e depoimento de paciente é proibido no pedido.

## Fitness — Arena Fit Studio

Tom: energia, imperativo curto ("Vem treinar").

| Token | Valor | Uso / contraste |
|---|---|---|
| `--bg` | `#EEF0F5` | branco frio |
| `--ink` | `#0C1233` | (16.02:1) |
| `--muted` | `#4A5170` | (6.82:1) |
| `--primary` | `#2638D9` | cobalto de quadra: blocos e botão (texto `#FFFFFF` 7.92:1; 6.95:1 como texto) |
| `--line` | `#E8FF59` | amarelo-bola: só sobre cobalto (7.12:1) e como fundo de selo (texto `#0C1233` 16.42:1) |
| raio | 6 px; cortes diagonais por `clip-path` no bloco do hero | |

Tipografia: **Barlow Condensed** 700/800 itálico (títulos) + **Barlow** 400/600 (texto), o par do
banco.
Momento: bloco cobalto do hero com o título inclinado entrando linha a linha (GSAP, uma vez).

```
┌──────────────────────────┐
│█████ cobalto ████████████│  hero: bloco cobalto com corte diagonal,
│█ VEM TREINAR NA ARENA ███│  título itálico condensado, foto de treino
│█ [Agendar aula experimental]
├──────────────────────────┤
│ Seg Ter Qua Qui Sex Sáb  │  grade de aulas em abas
│ 06:30 Funcional  · Iara  │
├──────────────────────────┤
│ estrutura: carrossel com scroll-snap
│ planos em faixas horizontais, um destacado
└──────────────────────────┘
```

Do banco → o que mudou: banco deu laranja `#F97316` sobre cinza `#1F2937`. A primeira revisão
(quase-preto + limão) é o default nº 2 da `frontend-design`. Fiquei com o cobalto e o amarelo da
quadra pintada, claro e sem cara de academia de rede.

## Loja — Empório da Praça

Tom: armazém de interior, afeto, produto "da roça" (fictício).

| Token | Valor | Uso / contraste |
|---|---|---|
| `--bg` | `#EEF1E6` | sálvia clara (não creme) |
| `--surface` | `#FFFFFF` | cartão de produto |
| `--ink` | `#1B2A20` | (13.13:1) |
| `--muted` | `#56625A` | (5.58:1) |
| `--primary` | `#1F4D3A` | verde-garrafa: botão (texto `#F4F6EE` 8.83:1) |
| `--tomate` | `#B8321F` | etiqueta de preço (5.22:1) |
| `--fita` | `#E7B53C` | fita de oferta (texto `#1B2A20`, 7.92:1) |
| raio | 10 px; etiqueta de preço com borda tracejada | |

Tipografia: **Young Serif** (títulos; serifa justificada pelo vernáculo de armazém e rótulo antigo)
+ **Instrument Sans** 400/600 (texto).
Momento: a etiqueta de preço "amarrada" em cada produto, como na prateleira.

```
┌──────────────────────────┐
│ Empório da Praça         │  hero curto: título + foto de prateleira larga
│ [Finalizar pedido] (desabilitado até ter item → "Ver catálogo")
├──────────────────────────┤
│ (Todos)(Queijos)(Doces)… │  chips roláveis
│ ┌────┐ ┌────┐            │  grade 2 colunas no celular
│ │foto│ │foto│  etiqueta  │
├──────────────────────────┤
│ Pix (chave fictícia, copiar) · retirada ou entrega
└──────────────────────────┘
 carrinho em gaveta fixa: 4 itens · R$ 73,40 [Finalizar pedido]
```

Do banco → o que mudou: banco deu verde-sucesso `#059669` + Rubik/Nunito (e-commerce genérico). A
primeira revisão (papel creme + terracota) caiu no default nº 1 da `frontend-design`. Troquei o
creme por sálvia e o terracota por tomate.

## Serviços — Prado Serviços Automotivos

Tom: técnico e honesto ("Orçamento antes de mexer").

| Token | Valor | Uso / contraste |
|---|---|---|
| `--bg` | `#ECEFF0` | concreto |
| `--surface` | `#FFFFFF` | |
| `--ink` | `#0E1C22` | (15.04:1) |
| `--muted` | `#4A5A61` | (6.21:1) |
| `--petrol` | `#12434F` | faixas escuras (texto `#ECEFF0` 9.36:1, amarelo 6.58:1) |
| `--primary` | `#F5C400` | amarelo de sinalização: botão (texto `#0E1C22`, 10.58:1) |
| raio | 4 px; faixa zebrada amarelo/petróleo como divisor | |

Tipografia: **Chakra Petch** 600/700 (títulos, técnico) + **Public Sans** 400/600 (texto).
Momento: o formulário de orçamento em etapas visíveis que mostra a mensagem se montando.

```
┌──────────────────────────┐
│ petróleo: PRADO          │  hero com faixa zebrada embaixo
│ Orçamento antes de mexer │
│ [Pedir orçamento]        │
├▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚┤
│ serviços: ficha com ícone e "a partir de"
│ orçamento: serviço → carro → o que acontece → quando (sequência real)
│ área atendida: cidades + mapa
└──────────────────────────┘
```

Do banco → o que mudou: banco deu azul `#1E40AF` + Inter/Playfair. Azul de banco + Inter é a cara
mais genérica possível; troquei por petróleo + amarelo de oficina.

## Home (vitrine do Gabriel)

| Token | Valor |
|---|---|
| `--bg` | `#F7F5F0` |
| `--ink` | `#141414` (16.91:1) |
| `--muted` | `#5E5A52` (6.30:1) |
| `--primary` | `#1D6B45` (5.95:1; texto `#FFFFFF`, 6.48:1) |

Tipografia: **Bricolage Grotesque** 600/800. Cartões com a foto, a cor e a fonte de cada nicho,
para o dono ver os 7 lado a lado.

## Tons auxiliares (registrados na auditoria)

Fora da paleta principal, sem papel de texto (bordas, linhas, fundos de apoio) ou com contraste
já conferido:

| Onde | Valores | Uso |
|---|---|---|
| Faixa de demo (todas) | `#1d1d1b` fundo, `#f2f1ec` texto (14.93:1), `#9fe0b4` link (11.09:1) | neutra de propósito, para não brigar com o nicho |
| Balão de prévia (todas) | `#d9fdd3` fundo, `#111b21` texto, `#54656f` texto-guia | imita o balão do WhatsApp |
| Íris | `#CFC6D9` borda de chip, `#E4DCEE` monograma e selo (texto `#2A2230`, 11.51:1) | |
| Navalha | `#3a3833` linhas, `#5a554c` borda de chip, `#0d0e0f` rodapé | |
| Clínica | `#d5e0db` bordas, `#0E3B37` rodapé (texto `#F3F6F4`, 11.36:1) | |
| Empório | `#9aa69c` borda tracejada e de chip | |
| Prado | `#d3dadc`, `#cfd6d9`, `#b7c2c6` filetes e bordas | |

## Saída do contraste (2026-11-14)

```
brasa   fundo #F7C948: #2A140D 11.13 · #5A3A22 6.50 · #A61F17 4.74
        fundo #A61F17: #FFF6DA 6.87 · fundo #FFF6DA: #2A140D 16.15 · #6B4A33 7.33 · #A61F17 6.87
        fundo #2A140D: #F7C948 11.13 · #FFF6DA 16.15
iris    fundo #F3F1F5: #2A2230 13.66 · #625869 6.00 · #5B3B8C 7.64 · fundo #5B3B8C: #FFFFFF 8.57
navalha fundo #141516: #EEE5D1 14.60 · #A9A194 7.15 · #C9A15B 7.60 · fundo #B5382A: #FFFFFF 5.89
vida    fundo #F3F6F4: #13302C 12.98 · #4D6661 5.70 · #0E6B63 5.84 · fundo #0E6B63: #FFFFFF 6.36
arena   fundo #EEF0F5: #0C1233 16.02 · #4A5170 6.82 · #2638D9 6.95
        fundo #2638D9: #FFFFFF 7.92 · #E8FF59 7.12 · fundo #E8FF59: #0C1233 16.42
emporio fundo #EEF1E6: #1B2A20 13.13 · #56625A 5.58 · #1F4D3A 8.42 · #B8321F 5.22
        fundo #1F4D3A: #F4F6EE 8.83 · fundo #E7B53C: #1B2A20 7.92
prado   fundo #ECEFF0: #0E1C22 15.04 · #4A5A61 6.21 · #12434F 9.36 · fundo #F5C400: #0E1C22 10.58
        fundo #12434F: #ECEFF0 9.36 · #F5C400 6.58
home    fundo #F7F5F0: #141414 16.91 · #5E5A52 6.30 · #1D6B45 5.95 · fundo #1D6B45: #FFFFFF 6.48
```

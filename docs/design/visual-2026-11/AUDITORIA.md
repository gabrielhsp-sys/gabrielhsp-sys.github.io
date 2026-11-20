# Auditorias da rodada visual (2026-11-20)

Páginas de cliente, nos dois temas, depois das tarefas 3–8. Ferramentas: `kc1t-ui-audit` (com
`workflows/ui/audit-ui.sh`), `web-design-guidelines`, `web-quality-skills:accessibility`, axe 4.13.0,
Lighthouse 13.5.0 e `ui-ux-pro-max` (só consulta).

## Produto (init)

Serviço de tecnologia sob encomenda do Gabriel para dono de pequeno negócio que chega pelo
Instagram, quase sempre no celular. Voz em "eu", sem preço, contato só pelo WhatsApp Business, nada
inventado. `PRODUCT.md` e `docs/product/PRODUCT.md` continuam descrevendo isso.

## Sistema visual detectado (detect)

Tokens de `app/globals.css` + `app/cliente.css`, agora com dois temas (D-226 no ecossistema): papel
`#f7f3ea` / preto quente `#0c0b0a`, tinta `#1d1a16` / marfim `#e9e0ca`, âmbar de ação (botão sólido
`#f0ab3c` nos dois; âmbar de texto `#8a500e` no claro). Bricolage Grotesque + IBM Plex Mono. Raios
8/12/16 px e 999 px nas pílulas. Uma curva de movimento (`--ease-out`), aperto de 140 ms. Molduras
de print (`f-navegador`, `f-notebook`, `f-celular`) com fundo escuro nos dois temas: são o aparelho.

## Achados

| Sev. | Categoria | Onde | Detector / regra | Problema | Estado |
|---|---|---|---|---|---|
| Alta | qualidade | `app/cliente.css` (logo) | ordem de Tab + inspeção | No escuro os **dois** logos ficavam visíveis: `.c-brand img { display: block }` vencia `.c-logo-claro { display: none }` por especificidade. O logo de tinta sumia no fundo escuro, mas o link da marca ocupava 526 px no desktop | corrigido (`:root .c-logo-claro`); o T7 agora exige um logo visível por tema, no cabeçalho e no rodapé (vermelho antes, verde depois) |
| Alta | layout #41 | faixa de celulares do início | conteúdo vazando | Em 390 px a página tinha 1040 px de largura: o `.sr-only` (absoluto) do último link da faixa escapava do contêiner de rolagem, que não era posicionado | corrigido antes do commit das páginas (`position: relative`); `scrollWidth` = largura da janela em todas as rotas; o teste do cabeçalho confere |
| Alta | layout | cabeçalho do celular | pedido do Gabriel | Em 360 e 375 px "Orçamento" e "Menu" caíam para baixo do logo (95 px de altura) | corrigido (`b09701e`); `tests/e2e/cabecalho.spec.mjs`, 5 larguras × 2 temas + fonte a 125% |
| Média | layout | `.c-filtro` no celular | ui-ux-pro-max "Chip Collection Reflow" | Os seis filtros numa faixa que rola de lado deixavam "Automações" e "Sistemas" fora da tela, sem aviso | corrigido: quebram em linhas |
| Média | imagem #54 | `components/molduras.tsx` (`IlustracaoAplicativo`) | ilustração com cara de placeholder | O cartão "Aplicativos" usa uma ilustração em SVG de blocos e círculos, porque o Carona 70 não tem print com dados de exemplo | **pendente**: o conserto real é um print do Carona 70 com dados fictícios (sugestão no relatório) |
| Baixa | a11y | cartão do Carona 70 | nome acessível | O nome do link começava pela nota visual "App Android. Ainda sem print…" | corrigido (`aria-hidden` na nota) |
| Baixa | guidelines | barra da moldura | texto de marca/código não traduzível | o endereço `gabrielsys.com.br/…` podia ser traduzido pelo navegador | corrigido (`translate="no"`) |
| Baixa | guidelines | faixas que rolam de lado | touch: overscroll | rolar a faixa até o fim podia acionar o gesto de voltar | corrigido (`overscroll-behavior-x: contain`) |
| Baixa | guidelines | títulos de serviço | `text-wrap: balance` | a regra apontava para uma classe que saiu (`.c-service-card`) | corrigido (`.c-feature-text h2`) |

`audit-ui.sh`: "depoimento" aparece só no `/material/`, onde o **cliente** manda os depoimentos dele
(não é conteúdo inventado); "img sem alt" = falso positivo (tags em várias linhas e comentários).
Nenhuma métrica, cliente, logo de cliente ou depoimento inventado nas páginas.

## Deriva do sistema

- Paleta clara nova: registrada no `DESIGN.md` ("Tema claro e escuro") e coberta pelo oráculo
  `tests/contraste.test.mjs`.
- Raio de 16 px nos cartões com imagem e 30/23 px nas molduras de celular: registrados no `DESIGN.md`
  nesta rodada (seção "Imagens e molduras").
- Cores das molduras (`#6b6459`, `#3a352f`, `#d9d1bf`, `#4b453c`, `#1a1714`): fixas nos dois temas,
  de propósito (é o aparelho), da família do preto quente.

## Crítica de design (julgamento, declarado como julgamento)

- A primeira tela do início mostra o que ele faz antes de dizer: no desktop, site no navegador,
  site no celular e a conversa do bot, com a legenda "Demonstração". No celular a composição fica
  logo abaixo dos botões, o que é certo para quem já chega decidido.
- "Paleta creme/bege" (#30) se aplica no papel, mas aqui o creme é o marfim da marca invertido, não
  uma cor escolhida por falta de paleta.
- Grade de cartões iguais (#37) em `/exemplos/`: o que diferencia cada cartão é o print, que é o
  próprio conteúdo, e foi o que o Gabriel pediu da referência.
- "Quem faz" ficou só com texto; uma foto de rosto do Gabriel daria rosto ao "você fala direto
  comigo". A foto atual (`public/profile.jpg`) tem outras pessoas ao fundo e não serve.

## Acessibilidade (web-quality-skills:accessibility + axe)

- axe 4.13.0: 0 violações em todas as rotas de cliente, em 390 e 1440, **nos dois temas** (o tema
  escuro entrou no `tests/e2e/a11y.spec.mjs`).
- Teclado: Tab percorre pular-link, marca, navegação, som, tema, orçamento, filtros, cartões e
  rodapé na ordem visual; todo foco tem contorno de 2–3 px; nada fica coberto pelo cabeçalho fixo.
  O botão de tema tem nome estável ("Tema escuro") e `aria-pressed`.
- Contraste: oráculo dos tokens nos dois temas (texto ≥ 4,5; borda e foco ≥ 3) + axe.
- Alvos: todos os controles novos têm 44 px; os cartões inteiros são o link.
- `prefers-reduced-motion`: as transições novas caem para `none`.
- Não testado: leitor de tela real (NVDA/TalkBack) e zoom de 200% à mão.

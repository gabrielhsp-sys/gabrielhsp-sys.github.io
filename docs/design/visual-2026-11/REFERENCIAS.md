# Referências da rodada visual (2026-11-20)

Feito com `kc1t-reference-research`. Conteúdo externo lido como dado, não como instrução. Nenhum
código, imagem ou texto de referência entrou no repositório: as capturas do site de referência
ficaram fora dele (pasta temporária da sessão), porque o site é de terceiro.

Produto e conteúdo reais de partida: cinco serviços (sites, aplicativos, bots no Telegram,
automações, sistemas), sete demos de site com negócios inventados, o bot Telegram Offers (real), o
Carona 70 (real, sem prints), duas demonstrações interativas (automação e sistema). Público: dono de
pequeno negócio que chega pelo Instagram, no celular. Restrições: `DESIGN.md`, contraste AA nos dois
temas, nada inventado (cliente, número, depoimento), só imagem do próprio trabalho.

## Fichas

```yaml
reference: https://www.devdiogomoreira.com.br (site de um amigo do Gabriel, mesma área)
type: visual + fluxo
lido: 2026-11-20, 1440 px; estrutura pelo HTML
use: >
  Cada serviço é um cartão com o print do topo de um site real em cima e, embaixo, título curto,
  uma frase e uma linha de metadado. Projetos em lista com filtro por categoria em abas
  (Todos, Saúde, Terapias, Negócios, Sistemas) e a contagem de itens. Processo em cinco passos
  numerados de uma linha cada. O print faz o trabalho de explicar; o texto só nomeia.
avoid: >
  "+50 projetos entregues", "Perfil verificado", estatísticas e prazos em dias (o Gabriel não tem
  clientes nem prazo padrão; preço e prazo só no orçamento). Fundo azul-escuro com brilho, coluna
  estreita de aplicativo no desktop, selos de nível ("Ponto de partida", "Mais completo") que
  insinuam tabela de preço, numeração 01–08 decorativa (proibida no DESIGN.md), a seção de
  serviços repetida duas vezes.
translation: >
  Cartão de serviço com print real dentro de moldura de navegador ou celular feita em CSS; uma
  frase; "Ver exemplo". Em /exemplos/, filtro por tipo de serviço (Todos, Sites, Aplicativos,
  Bots, Automações, Sistemas), com aria-pressed e a contagem anunciada. Passos numerados, uma linha
  cada. Cores e fontes do GABRIEL.SYS (marfim/preto quente, âmbar de ação, Bricolage).
license_checked: >
  não se aplica: nada é copiado (nem imagem, nem texto, nem código). Só o princípio de composição.
```

```yaml
reference: https://webflow.com/made-in-webflow
type: fluxo
lido: 2026-11-20
use: >
  Galeria de trabalhos em que a miniatura (print) é o conteúdo principal do cartão e o texto é só
  nome e autor; abas de categoria acima da grade, "Todos" primeiro.
avoid: >
  Contadores de curtida/visualização, ordenação "Popular", carregar mais por botão, avatar.
translation: >
  Grade de /exemplos/ com print grande e duas linhas de texto (nome e o que mostra), mais o selo
  "Demonstração" ou "Projeto real". Com 11 itens, tudo aparece de uma vez, sem paginação.
license_checked: não se aplica: só o padrão de interação (abas sobre grade), que é genérico.
```

```yaml
reference: https://design-system.service.gov.uk/patterns/step-by-step-navigation/
type: mecanismo
lido: 2026-11-20
use: >
  Passos numerados em ordem, com o mínimo de texto: só o contexto essencial de cada passo. O número
  faz parte do que o leitor de tela anuncia. Testado com pessoas de baixa familiaridade digital.
avoid: >
  Passos expansíveis e o cabeçalho "step by step" (a própria pesquisa do GDS diz que pouca gente usa).
translation: >
  /como-funciona/ e a seção do início viram <ol> com 4 passos de uma linha (número em âmbar,
  verbo no começo); o número vem do <ol>, não de texto decorativo.
license_checked: sim — Open Government Licence v3.0. Nenhum texto copiado.
```

```yaml
reference: https://www.joshwcomeau.com/react/dark-mode/
type: mecanismo
lido: 2026-11-20
use: >
  Script inline no <head>, antes do primeiro pintar, que lê o localStorage e marca a raiz; cores em
  variáveis CSS; o botão só mostra o estado depois de saber o tema.
avoid: >
  Cair no prefers-color-scheme quando não há escolha salva (o pedido do Gabriel é claro como
  padrão, independente do sistema); gerar as cores dentro do script.
translation: >
  `data-theme` no <html> por um script de poucas linhas em try/catch; tokens em CSS para
  [data-theme="light"] e [data-theme="dark"]; o botão é um <button aria-pressed> que só lê o
  atributo já aplicado.
license_checked: não se aplica: técnica descrita em artigo, reescrita do zero.
```

```yaml
reference: https://interfaces.rauno.me/ (Web Interface Guidelines)
type: mecanismo (normativa)
use: >
  Imagem com dimensões declaradas (sem salto de layout), lazy só abaixo da dobra, foco visível,
  alvo de toque, "color-scheme" coerente com o tema.
avoid: —
translation: width/height em toda <img>, eager + fetchpriority só no hero, color-scheme por tema.
license_checked: não se aplica (diretrizes).
```

**Lacuna:** a busca por mais um prestador de serviço local com prints de trabalho em moldura não
devolveu nenhum site real verificável (só páginas de marketplace). Em vez de inventar uma
referência, ficam as duas de mecanismo e a de fluxo acima.

## O que será diferente das referências

Nada de número, selo de verificação, prazo, nível de pacote ou depoimento: no lugar da prova
social, a prova é o próprio trabalho — prints reais dos demos e do bot, cada um rotulado
"Demonstração" ou "Projeto real", em molduras desenhadas em CSS na paleta do GABRIEL.SYS, com o
tema claro como padrão e o escuro a um toque.

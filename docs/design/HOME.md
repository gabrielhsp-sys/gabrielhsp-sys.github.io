# Direção da home

Modo: code-led. A direção foi fixada pelo briefing do proprietário e revista no
ciclo v3 (2026-09-21).

## THESIS

Um portfólio que vende o trabalho em segundos e continua servindo como arquivo
depois disso. Rótulo claro na navegação; personalidade na camada de cima. O site
parece operável e pessoal; não parece um console cenográfico nem uma landing
page de software.

## OWN-WORLD

Fundo preto quente, texto marfim e âmbar queimado como estado de atividade.
Rosa, menta, violeta e azul cumprem papéis de área ou estado. Bricolage
Grotesque traz voz editorial; IBM Plex Mono aparece somente em dados, comandos e
medidas. Linhas finas, encaixes e contatos lembram hardware sem desenhar um
console literal.

## STORY

O visitante entende primeiro o que Gabriel constrói e como falar com ele. Em
seguida lê os estudos de caso — problema, o que ele fez, stack, resultado —,
com o primeiro do `featuredRank` liderando a seção numa linha inteira e os
outros lado a lado, em cards sem numeração decorativa, descobre as três frentes de trabalho, e só então encontra os projetos que não
viraram destaque, numa lista curta que leva ao arquivo completo e filtrável em
página própria. Nenhum projeto ganha card duas vezes (o cartão do hero é índice).
O contato fecha a página. Depois do hero vem direto "Projetos em destaque", como
na main: o "Sobre" curto sobre a imagem saiu da home (decisão do Gabriel,
2026-10-09); a história fica em `/about/`.

## FIRST VIEWPORT

Um trilho de sistema persistente enquadra o hero sobre a imagem da bancada
(`docs/design/home-imagem/`): à esquerda, uma linha de apresentação com a
disponibilidade ("Disponível para estágio", ponto verde parado, sem selo), a
frase de valor, um parágrafo que nomeia a stack real, e dois botões — falar
comigo e ver os projetos; à direita, o cartão "Estudos de caso", um índice de uma
linha por estudo, com área, estado e período. Abaixo dos botões, uma dica
discreta do terminal, que é convite, não requisito, e some em tela de toque. Não
há métrica inventada nem relógio: a barra superior mostra a data da revisão mais
recente do conteúdo.

A imagem fica só atrás do hero, do tamanho dele, e termina num degradê curto
para o fundo do site, sem efeito de rolagem. O resto da home é a página de
sempre, opaca e sem imagem. A versão com vídeo ficou na tag local
`home-video-arquivo-2026-10`.

## BOOT

A animação de entrada voltou no ciclo v3 e é a **única** introdução do site: não
existe outra boot sequence. Ela roda uma vez por sessão, dura ~1,9 s do
carregamento ao conteúdo, é pulável por qualquer tecla ou clique, e não roda com
`prefers-reduced-motion`. A versão anterior deste documento proibia boot na
abertura; a decisão de 2026-09-21 substitui essa regra, com as condições acima.
Em 2026-09-24 o roteiro foi condensado: medido, levava 5,8 s (ADR-017).

## FORM

Seed key corroborado: `a923e92d` — rodada local degradada, sem challengers
externos. A direção do briefing prevalece. Da forma sorteada, "bancada de
teste", entram somente conexões visíveis, sinais de estado honestos e estrutura
modular. A aparência literal de placa ou equipamento foi recusada.

O site usa fluxo editorial denso, cantos pequenos e respostas diretas nos
controles. A camada terminal é opcional, acionada pela crase, e nunca substitui
a navegação. Movimento não essencial desaparece com `prefers-reduced-motion`.

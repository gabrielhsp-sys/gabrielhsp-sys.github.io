# Revisão de código da rodada visual (2026-11-20)

`pocock-code-review`, dois subagentes só-leitura que não viram o raciocínio um do outro.

## Ponto fixo

`main` (`29f60bc`) — diff `main...HEAD` até `ae077a4` (10 commits), sem as imagens binárias
(`public/capturas`, `assets-src`, `previa`, `lib/capturas.json`). Não rastreados fora da revisão:
`assets-src/marca/`, `assets-src/ref/`, `assets-src/videos/`, `prompt.md` (anteriores a esta rodada).
Spec: `prompts/2026-11-20-visual/prompt.md` (fora do Git) e o `VERIFICACAO.md` desta pasta.

## Padrões

Duros (regra do repositório citada):

| Achado | Regra | O que foi feito |
|---|---|---|
| Número dos passos como botão âmbar sólido; ícone do passo, ícone do Carona 70 e "ligado" da chave de tema em âmbar; linha destacada da ilustração em âmbar | `docs/quality/QUALITY.md`: "Âmbar marca ação e foco… seleção é campo neutro (ADR-018)" | corrigido: nó neutro (borda `--line`, campo `--ink-2`), ícones em `--paper-dim`, chave ligada em marfim, ilustração sem âmbar de seleção |
| `DESIGN.md` "Marca" dizia "só o símbolo abaixo de 360 px" | `DESIGN.md` | corrigido: texto descreve o logo que encolhe e a consulta de container |
| Cores das molduras fora do registro | `DESIGN.md` "Cores de função, fora da paleta e registradas" | registradas em "Imagens e molduras" (o comentário `#2a2621 / #201d19` do CSS confere com os tokens; esse sub-item não procedia) |
| Raios 10/22/17/18/14 px fora da escala | `DESIGN.md` "Raios" | nó do passo passou a 8 px; os raios reduzidos da moldura foram registrados |
| Grade de cartões iguais em `/exemplos/` e no início | `DESIGN.md` Don't | mantido: é o pedido do Gabriel (cartão com imagem em grade, da referência); o print diferencia cada cartão. Registrado como julgamento em `AUDITORIA.md` |
| Imagens geradas e tema sem ADR | ADR-006/ADR-022 (`docs/architecture/DECISIONS.md`) | ADR-027 escrito |

Julgamento (base de cheiros):

| Cheiro | Trecho | O que foi feito |
|---|---|---|
| Código duplicado / switch repetido | `exemplos-grade.tsx` repetia a escolha de moldura de `MolduraCaptura` | corrigido: `MolduraCaptura` foi para `components/molduras.tsx` e a grade a usa |
| Duplicado / número mágico | `const host = "gabrielsys.com.br"` | corrigido: o endereço vem de `site.url` (ADR-025) |
| Obsessão por primitivo | rota do print tirada de `nome.split("-")[1]` | corrigido: rota lida de `lib/capturas.json` |
| Generalidade especulativa | `Notebook` e `capturaRota` exportados sem uso | `Notebook` passou a ser usado no hero (o pedido fala em moldura de notebook); `capturaRota` removido |
| Nome misterioso | `cedo` número num lugar e booleano no outro | removido: a única imagem eager é a de prioridade (ver Spec, d) |
| Duplicado | `corDaBarraFonte()` (texto) e `atualizarCorDaBarra()` em `lib/tema.ts` | mantido: o script do `<head>` precisa ser texto, sem o bundle |
| Aglomerado de dados | `{ moldura, captura }` em `lib/servicos.ts`, `lib/exemplos.ts` e nas props | mantido: `lib/` não importa tipo de componente; anotado |
| Cadeia de mensagens | `ramos.find(...)?.exemplo` no início | mantido (uma ocorrência) |

## Spec

| Achado | Linha da spec | O que foi feito |
|---|---|---|
| Tema só no chrome de cliente; recrutador continua escuro | "Seletor de tema claro/escuro, com o CLARO como padrão"; "todos os tokens de cor definidos para os dois temas" | **decisão do Gabriel**: proposta D-227 no ecossistema; sugestão no relatório |
| Moldura de notebook existia sem uso | "monte molduras de celular e notebook em código" | corrigido: hero usa o notebook; o teste P1 exige `.f-notebook` |
| Referências extras não eram de prestador local | "Mais 2 ou 3 referências de prestador de serviço local visual" | corrigido: duas fichas de prestadores reais em `REFERENCIAS.md` |
| Sem rastro da revisão de texto, do Lighthouse e do fechamento | "Revise com workflows/text-review"; "Lighthouse em 390×844 e 1440×900" | Lighthouse em `AUDITORIA.md`; fechamento no `VERIFICACAO.md`; a checagem de fatos fica fora do Git, como manda o workflow, e o resumo vai no relatório |
| Escopo a mais (imagem no hero de cada serviço, Menu como painel, filtro na URL, `/exemplos/sites/` em grade, checagem de prints na saída, `LH_PORTA`, theme-color pelo script) | "Liberdade criativa… Liste cada uma no relatório com o motivo" | listados no relatório, com o motivo |
| Prints de demonstração sem o selo nos cartões de serviço; ilustração sem rótulo | "Toda demo é rotulada 'Demonstração'" | corrigido: selo "Demonstração" (print) ou "Ilustração" (SVG) sobre a imagem |
| I2 só exigia lazy abaixo da dobra em 1440; imagens "cedo" eager abaixo da dobra no celular | "lazy-load fora da primeira dobra" | corrigido: só a imagem LCP é eager; o teste vale em 1440 **e** 390, e exige no máximo uma imagem com prioridade, dentro da dobra |
| Oráculo de contraste sem `--paper-faint`/`--amber` sobre `--ink-3`; acoplado ao seletor no texto do CSS | "Contraste AA (D-095) nos DOIS temas" | pares acrescentados; o acoplamento fica (o axe nos dois temas cobre o renderizado) |
| Nenhum teste enfraquecido | "Nunca enfraqueça um teste" | confirmado pelo revisor |

## Resumo

Padrões: 6 duros + 8 julgamentos; pior: número dos passos em âmbar sólido (ADR-018). · Spec: 9
achados; pior: prints de demonstração sem o selo "Demonstração" nos cartões de serviço.
Correções voltaram ao gate (`VERIFICACAO.md`, Fechamento).

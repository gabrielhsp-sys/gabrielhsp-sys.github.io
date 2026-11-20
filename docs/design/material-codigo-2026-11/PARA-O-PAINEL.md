# Gerar o código do /material/ a partir de outra aplicação (o painel de gestão)

Só documentação. Nada do painel existe ainda; este texto diz o que ele precisa para ter um botão
"gerar código" que produza exatamente o mesmo código que `npm run material:codigo` e que a Function
do `/material/` aceita.

## A regra que não muda

O `MATERIAL_SECRET` nunca chega ao navegador. Quem gera o código é sempre um **servidor** (uma rota
do painel, uma Function, um Worker ou um script), e o navegador do Gabriel recebe só o resultado.
Quem tem o segredo consegue forjar o código e o link de qualquer cliente.

## Entradas, saída e de onde vem o segredo

Fonte única: `lib/material-codigo.ts` deste repositório (TypeScript, só Web Crypto, sem
dependência, sem Node, sem Next). Copie o arquivo (e `CLIENTE`/`LIMITES` de `lib/material.ts`, mais
`SITE_URL` de `lib/site.ts`) ou importe-o.

| | O quê |
|---|---|
| entrada `segredo` | o `MATERIAL_SECRET` do projeto Pages `gabrielsys` (≥ 32 caracteres). No painel, um segredo do próprio servidor do painel (variável de ambiente ou secret do provedor), com o **mesmo valor**. Nunca no código, no Git, no bundle do front nem em log |
| entrada `apelido` | `^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$` (minúsculas, dígitos e hífen; a regra `CLIENTE`) |
| entrada `agora` | segundos Unix do servidor (`Math.floor(Date.now() / 1000)`) |
| entrada `dias` | inteiro de 1 a 60; padrão 30 |
| saída | `{ codigo, cliente, validoAte, expiraEm }`, ex. `{ codigo: "ana-k7m2-qxp4", cliente: "ana", validoAte: "20/12", expiraEm: "2026-12-20" }` |
| texto pronto | `mensagemWhatsApp({ codigo, validoAte })` devolve a mensagem para colar no WhatsApp do cliente |

```ts
import { gerarCodigo, mensagemWhatsApp } from "./material-codigo.ts";

// Dentro de uma rota de servidor do painel, depois de conferir que quem pede é o Gabriel:
const gerado = await gerarCodigo(env.MATERIAL_SECRET, apelido, { agora: Math.floor(Date.now() / 1000), dias: 30 });
return Response.json({ ...gerado, mensagem: mensagemWhatsApp(gerado) }, { headers: { "cache-control": "no-store" } });
```

Erros: `gerarCodigo` lança `Error` com "segredo curto demais", "apelido inválido…" ou "dias
entre 1 e 60". A rota do painel devolve 400 com esse texto (ele nunca contém o segredo).

## Como o código é feito (para outra linguagem)

Se o painel não for TypeScript, reimplemente e confira contra os vetores abaixo.

1. `cliente` = apelido sem hífens.
2. `dia` = `floor((agora − 10800) / 86400) + dias` (dias corridos em São Paulo, UTC−3).
3. `subchave` = HMAC-SHA256(chave = bytes UTF-8 do segredo, mensagem = `gabrielsys:material:codigo:v1`).
4. `mac` = HMAC-SHA256(chave = subchave, mensagem = `"<cliente>:<dia>"`).
5. `n` = os 8 primeiros bytes de `mac` como inteiro sem sinal big-endian.
6. 8 vezes: símbolo = `abcdefghjkmnpqrstuvwxyz23456789`[n mod 31]; n = n div 31 (o primeiro
   símbolo é o resto menos significativo).
7. `codigo` = `<apelido como foi escrito>-<símbolos 1–4>-<símbolos 5–8>`.

Vetores (segredo de teste `segredo-de-teste-com-32-caracteres!!`, `agora` = 1800000000):

| apelido | dias | código | válido até |
|---|---|---|---|
| `ana` | 30 | `ana-u45r-cj4x` | 14/02 |
| `ana` | 5 | `ana-knje-y2yq` | 20/01 |
| `bia` | 30 | `bia-rzbm-xyep` | 14/02 |
| `cafe-do-coreto` | 30 | `cafe-do-coreto-znz4-6a7x` | 14/02 |

## O que o painel precisa saber

- **Identidade**: o cliente é o apelido sem hífens (`ana-b` = `anab`). Mostre a pasta
  (`cliente + "/"`) ao gerar, como o gerador de terminal faz, e não ofereça dois apelidos que só
  diferem por hífen.
- **Validade**: até o fim do dia `validoAte` em São Paulo. Gerar de novo com outro `dias` cria
  outro código válido; os anteriores continuam valendo até o prazo deles.
- **Revogação**: o painel pode escrever o apelido em `_controle/revogados.txt` no bucket privado
  `gabrielsys-material` (um por linha). Isso cancela todos os códigos e links desse apelido.
  Escrever no R2 exige credencial do bucket **no servidor** do painel, nunca no navegador. Detalhe
  e limite em `SEGURANCA.md`, "Validade e revogação".
- **Não guarde o código** se não precisar: ele é derivável a qualquer momento por quem tem o
  segredo. Se o painel guardar, trate como senha do cliente (não em log, não em URL).
- **Mudar o formato** (tamanho, alfabeto, rótulo, fuso) quebra todos os códigos já enviados. Se um
  dia precisar, crie `v2` no rótulo e faça a Function aceitar os dois durante 60 dias.

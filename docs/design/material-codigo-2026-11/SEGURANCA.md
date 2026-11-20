# /material/ com código por cliente: auditoria de segurança (2026-11-20)

Feita com `akita-security-audit`, estática, mais testes adversariais com dados sintéticos. Nenhum
tráfego real e nenhum dado de produção.

## Escopo e modelo de ameaça

| Campo | Valor |
|---|---|
| referência | `667539c4be68ff7d8ec34c5a8b8ee6b9b98af4e2` (branch `codigo-material-2026-11`); correções no commit seguinte |
| arquivos | `functions/api/material/{verificar,enviar}.ts`, `lib/material-codigo.ts`, `lib/material-function.ts`, `lib/material.ts`, `scripts/material-codigo.mjs`, `scripts/segredo-material.mjs` |
| ativos | `MATERIAL_SECRET` (forja códigos e links de qualquer cliente); o bucket privado `gabrielsys-material` (material dos clientes, espaço e custo); a cota diária de requisições das Functions |
| atores | anônimo na internet (sem código); cliente com o próprio código (tenta outro prefixo); quem viu um código vencido ou revogado |
| entradas | `POST /api/material/verificar` (JSON ≤ 1 KB), `POST /api/material/enviar` (multipart ≤ 41 MB), o arquivo de segredo e os argumentos do gerador |
| deploy | Cloudflare Pages (projeto `gabrielsys`), Functions no runtime de Workers; nada na frente além do proxy da Cloudflare (sem regra de WAF até o passo à mão abaixo) |

## Evidência automatizada

- `security-surface.sh . --max 15`: nenhum arquivo de credencial rastreado, nenhum padrão com
  forma de segredo, nenhum hook de instalação. Os pontos de entrada do escopo batem com a lista
  acima.
- Histórico: `git log --all -p -S'MATERIAL_SECRET=' --pickaxe-regex` não mostra nenhuma linha
  adicionada com valor (só commits que citam o nome).
- Testes: `tests/material-codigo.test.mjs` (7), `tests/material-rotas.test.mjs` (8),
  `tests/material-codigo-cli.test.mjs` (5), `tests/e2e/material.spec.mjs` (20) e
  `npm run test:cloudflare` (Function real no `wrangler pages dev`, R2 simulado).
- O que isso **não** cobre: o comportamento da borda da Cloudflare em produção (limites de CPU
  reais, logs da plataforma), que só a tarefa 14 observa.

## Alertas do GitHub (`gh api --method GET`, 2026-11-20)

| Fonte | Nº | Tipo | Severidade | Situação | Recomendação |
|---|---|---|---|---|---|
| secret scanning | — | — | — | 0 abertos | — |
| code scanning | — | — | — | não enumerado: o repositório não tem análise configurada (`404 no analysis found`) | — |
| Dependabot | 41 | astro ≤ 7.4.4 (`exemplos-sites/`) | baixa | aberto, fora do escopo | subir para ≥ 7.4.7 |
| Dependabot | 40 | astro 5.14.3–7.4.6 (`exemplos-sites/`) | média | aberto, fora do escopo | subir para ≥ 7.4.7 |
| Dependabot | 25 | minimatch 7–11.0.0 (dev) | média | aberto, fora do escopo | subir para ≥ 11.0.1 |
| Dependabot | 24 | zod < 4.6.6 | alta | aberto, fora do escopo | subir para ≥ 4.6.6 |
| Dependabot | 5 | sharp < 0.35.5 | alta | aberto, fora do escopo | subir para ≥ 0.35.5 |

Nenhum desses pacotes entra no bundle da Function (ela só importa `lib/material*.ts` e
`lib/site.ts`, sem dependência npm). Dependências estão fora do escopo deste pedido; ficam para o
Gabriel decidir (há PRs do Dependabot abertos para `zod`, `sharp`, `astro` e `next`).

## Findings

| # | Severidade | Fronteira | Arquivo:linha | Mecanismo | Exploração | Correção | Regressão |
|---|---|---|---|---|---|---|---|
| S1 | Média | 10 disponibilidade | `lib/material-codigo.ts` (`derivar`, antes da correção) | cada um dos 61 dias candidatos refazia a subchave e dois `importKey` | uma verificação errada custava ~7,9 ms de CPU no Node (`process.cpuUsage`, média de 50), perto do teto de 10 ms de CPU do plano Free de Workers/Pages: pedidos legítimos podiam cair por limite de CPU | **corrigido**: subchave derivada e importada uma vez por chamada (`chaveDoCodigo`); 3,1 ms medidos depois | os vetores independentes de `tests/material-codigo.test.mjs` continuam passando (mesmo resultado). Tempo não vira teste (não determinístico): medição antes/depois registrada aqui |
| S2 | Média | 10 disponibilidade / 1 autenticação | `functions/api/material/*.ts` | não há limite de tentativas; o atraso fixo de 600 ms segura um chute por conexão, não chutes em paralelo | com apelido conhecido, cada chute acerta com chance 61/31⁸ ≈ 2^−33,7; a ~1000 req/s levaria meses, mas estoura a cota diária de requisições das Functions antes (indisponibilidade) | **passo à mão** (abaixo): regra de rate limiting no WAF. No código não dá sem serviço novo: o wrangler 4.157 recusa `ratelimits` em projeto Pages (`supportedPagesConfigFields`, `node_modules/wrangler/wrangler-dist/cli.js:32459`); contador em memória não é global; contador no R2 grava a cada erro (custo) | — |
| S3 | Baixa | 3 isolamento | `lib/material-codigo.ts` (`normalizarCodigo`, `gerarCodigo`) | a identidade do código é o apelido **sem hífens** (o cliente pode digitar hífens a mais ou a menos) | `ana-b` e `anab` são o mesmo cliente: mesmo código, mesma pasta, mesma revogação; e um link longo antigo de `anab` grava na mesma pasta `anab/`. Não há leitura pela web, então nada vaza; o risco é o Gabriel misturar material de dois clientes | **corrigido**: o gerador imprime `Pasta no bucket: <cliente>/`; este documento e o `PARA-O-PAINEL.md` avisam | `tests/material-codigo-cli.test.mjs` ("shows the bucket folder…") |
| S4 | Baixa (anterior a esta tarefa) | 10 disponibilidade | `functions/api/material/enviar.ts` | a credencial vem dentro do multipart; o corpo (até ~41 MB, limitado pelo `Content-Length`) é lido antes de conferir | sem código, dá para fazer a Function ler 41 MB por requisição | risco residual, mitigado pela regra do WAF; a página só chama `enviar` depois de `verificar` dar 200 | — |
| S5 | Informativa | 1 autenticação | `lib/material-codigo.ts` | recusa por formato inválido não calcula HMAC; recusa por revogação faz um `get` no R2 a mais | o tempo distingue "formato inválido" (público: está na página) e "válido mas revogado" (só quem já tem o código sabe) | nenhuma | — |

## Fronteiras revisadas

| # | Fronteira | O que foi testado |
|---|---|---|
| 1 | autenticação | código certo/errado/de outro cliente/vencido/revogado (módulo e rota); link longo; segredo curto ou ausente → 503/null; tipos estranhos no JSON (`123`, array, objeto, `null`, string solta) → 403 |
| 2 | autorização | o prefixo de gravação sai só da credencial validada (`autorizar`), nunca do formulário |
| 3 | isolamento | código de `ana` com apelido `bia` → 403; S3 |
| 4 | injeção | o apelido só tem `[a-z0-9]`; a chave no R2 é `<cliente>/<data>-<aleatório>/<campo>-<n>.<ext>` sem nada do nome original; `../` em campo de arquivo → 400 |
| 5 | segredos | o gerador nunca imprime o segredo (teste); `--producao` só lê o arquivo, recusa modo além de 600; a Function não loga nada (teste com `console.*` espionado); o código só vai no corpo |
| 6 | execução | upload só PNG/JPG/WEBP/PDF por bytes + nome + tipo; SVG disfarçado → 415 |
| 7 | persistência | nada é gravado sem credencial válida (teste: o R2 falso fica só com a lista de revogação); `_controle/` nunca é prefixo de cliente |
| 8 | rede | a Function não faz requisição de saída |
| 9 | criptografia | HMAC-SHA256 com subchave de rótulo próprio (`gabrielsys:material:codigo:v1`), diferente do texto assinado do link; 8 símbolos base 31 a partir de 64 bits (viés ≈ 31⁸/2⁶⁴, desprezível); comparação que lê os 8 bytes sempre (teste com `Proxy`), em todos os 61 dias, sem sair cedo |
| 10 | disponibilidade | S1, S2, S4; corpo do `verificar` > 1 KB → 413; sem `Content-Length` → 411 |
| 11 | supply chain | Function sem dependência npm; alertas acima |
| 12 | código malicioso | nada fora do propósito declarado nos arquivos do escopo |
| 13 | cabeçalhos | respostas da API: `cache-control: no-store`, `x-content-type-options: nosniff`, JSON; sem CORS; Origin de outro site → 403; `/material/*` com `Referrer-Policy: no-referrer` e `no-store` (`public/_headers`) |
| 14 | prompt injection | não se aplica (nenhum agente lê o conteúdo enviado) |

## Enumeração de apelidos

Não há lista de apelidos em lugar nenhum: o código é derivado, não guardado. "Apelido inexistente"
e "código errado" são o mesmo caso para a Function e recebem a mesma resposta (`403
{"ok":false}`, `no-store`) depois do mesmo atraso (teste "every refusal waits the same fixed
time…"). O custo de CPU é o mesmo para qualquer apelido bem formado.

## Validade e revogação

- Cada código vale até o fim do dia `hoje + N` em São Paulo (`N` = 30 por padrão, `--dias` de 1 a 60).
  O vencimento não vai no código: a Function testa os 61 dias possíveis.
- Revogar antes do prazo: pôr o apelido (com ou sem hífens; `#` comenta) numa linha de
  `_controle/revogados.txt` no bucket privado. Vale para o código **e** para o link longo do mesmo
  apelido, em todas as validades. Para dar um código novo ao mesmo cliente depois de revogar, use
  outro apelido (`ana2`): tirar o apelido da lista reativa os códigos antigos ainda no prazo.

  ```bash
  npx wrangler r2 object get gabrielsys-material/_controle/revogados.txt --remote --file revogados.txt  # se já existir
  echo "ana" >> revogados.txt
  npx wrangler r2 object put gabrielsys-material/_controle/revogados.txt --remote --file revogados.txt --content-type "text/plain; charset=utf-8"
  ```

- **Limite honesto**: sem a lista, não há como cancelar um código antes do prazo, porque nada é
  guardado. Trocar o `MATERIAL_SECRET` cancela **todos** os códigos e links de uma vez.

## Passo à mão: limite de tentativas no WAF

Na Cloudflare, `dash.cloudflare.com` → a conta → o domínio `gabrielsys.com.br` → **Security** →
**WAF** → aba **Rate limiting rules** → **Create rule**. No painel novo, o mesmo lugar aparece como
**Security** → **Security rules** → **Create rule** → **Rate limiting rule**. Os nomes do painel
mudam com o tempo e não foram conferidos nesta sessão (`needs-verification`).

- Nome: `material: tentativas`
- Se a requisição corresponder a: `(http.request.uri.path eq "/api/material/verificar") or (http.request.uri.path eq "/api/material/enviar")`
- Com as mesmas características: IP
- Quando a taxa passar de: 10 requisições em 10 segundos (o período do plano Free)
- Ação: Block, por 10 segundos
- Conferir depois: 11 POSTs seguidos em `/api/material/verificar` com código errado → o 11.º
  responde 429.

## needs-validation

| Pista | Por que não confirmei | Como validar |
|---|---|---|
| CPU real da verificação no runtime da Cloudflare | só medi no Node | painel do projeto Pages → Functions → métricas de CPU depois da tarefa 14; erro 1102 indicaria estouro |
| a regra do WAF existe e responde 429 | é passo à mão do Gabriel | o teste de 11 POSTs acima |

## Candidatos rejeitados

| O que parecia | Por que não é |
|---|---|
| `Content-Length` falso deixa o `verificar` ler mais que 1 KB | só no `Request` montado no Node; na rede, o framing do HTTP/1.1 e do HTTP/2 define o corpo pelo tamanho declarado, e a borda da Cloudflare não entrega bytes além dele |
| `{"__proto__":{"ok":true}}` no JSON | o `JSON.parse` cria uma propriedade própria; a resposta vem de `autorizar`, não do corpo |
| enumerar apelidos pela resposta ou pelo tempo | ver "Enumeração de apelidos" |
| letra Unicode parecida (K de Kelvin, letras de largura total, acento) virar código válido | a normalização só mexe em ASCII; teste de tabela recusa |
| o código no `sessionStorage` vazar entre abas ou sessões | `sessionStorage` é por aba e some ao fechar; recusa de envio apaga (teste e2e) |

## Risco residual

- Sem a regra do WAF, S2 e S4 continuam abertos.
- Quem tem o código do cliente pode mandar material em nome dele até o prazo ou a revogação (é o
  propósito do código); a cota por cliente (300 MB) limita o estrago.
- O XSS no mesmo domínio leria o código (a CSP permite `'unsafe-inline'`); o site não tem entrada
  de usuário renderizada como HTML, e isso é anterior a esta tarefa.
- A conta e o projeto da Cloudflare, o painel de gestão e os alertas do Dependabot ficaram fora do
  escopo.

Não há afirmação de "seguro": **nenhum achado sustentado além de S1–S5 no escopo auditado**, com S1
e S3 corrigidos, S2 e S4 dependendo do passo à mão, e S5 aceito.

# wrangler: ficha de adoção (`ecosystem-tool-adoption`, 2026-11-19)

| | |
|---|---|
| Nome | `wrangler` (npm) |
| Versão | **4.157.0**, exata, `devDependency` (publicada em 2026-11-03; a `latest` do dia era 4.165.0, de 2026-11-18, nova demais) |
| Fonte | registry npm; repositório `github.com/cloudflare/workers-sdk`; publisher `wrangler-publisher <workers-devprod@cloudflare.com>` |
| Licença | `MIT OR Apache-2.0`; dependências que executam: `workerd` Apache-2.0, `esbuild` MIT, `miniflare` MIT |
| Uso | só `wrangler pages dev out` local, com o R2 simulado do miniflare em `.wrangler/state`. Sem login, sem conta, sem deploy |
| Classe | **A — ADOPTED** (instalado e testado localmente) |

## Gates

| # | Gate | Resultado |
|---|---|---|
| 1 | Procedência | nenhuma pesquisa anterior no ecossistema (`grep -ri wrangler` em `docs/knowledge`, `docs/pilots`, `mcp`, `skills/specs`, `context`: vazio) |
| 2 | Identidade | nome `wrangler` conferido caractere a caractere; publisher e repositório oficiais da Cloudflare |
| 3 | Versão | 4.157.0 fixada no `package.json` (sem `^`) e no lockfile, com `dist.integrity` `sha512-HUft0VZi…` |
| 4 | Licença | `MIT OR Apache-2.0`, compatível |
| 5 | Instalação | `wrangler` não tem script de instalação. `workerd` e `esbuild` têm `postinstall: node install.js`: lido o de `workerd@1.20261103.1` (252 linhas): só liga o binário do pacote opcional da plataforma; se faltar, baixa o mesmo pacote de `registry.npmjs.org`. Nada fora do npm |
| 6 | Permissões e telemetria | telemetria de uso ligada por padrão; desligada com `WRANGLER_SEND_METRICS=false` (variável conferida em `wrangler-dist/cli.js`), usada por `scripts/testar-cloudflare.mjs` e no comando da prévia. Há checagem de versão nova (leitura do registry). `pages dev` não pede login |
| 7 | Rollback | `npm uninstall wrangler` — **testado**: depois dele, `git diff package.json package-lock.json` saiu vazio. Também apagar `.wrangler/` (estado local, ignorado pelo Git) |

Efeito no lockfile: 85 pacotes novos; nenhuma versão de pacote já existente mudou (conferido
comparando o `package-lock.json` com o do HEAD).

## Comandos

    npm install --save-dev --save-exact wrangler@4.157.0     # instalação
    npm uninstall wrangler && rm -rf .wrangler               # rollback

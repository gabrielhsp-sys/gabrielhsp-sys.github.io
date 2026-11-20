# Prévia local do site unificado (2026-11-19)

Capturas em 390×844 (celular) e 1440×900 (computador), tiradas do `out/` servido pelo
`wrangler pages dev` (o mesmo runtime da Cloudflare, com `_redirects`, `_headers`, a Function do
`/material/` e o R2 simulado). `*-pagina-inteira-*` é o início rolado até o fim;
`orcamento-confira-*` é a última tela do formulário; `material-*` é o `/material/` aberto por um
link válido gerado na hora (segredo local de teste, cliente fictício).

## Abrir a prévia

    cd ~/Dev/projects/personal/gabrielhsp-sys.github.io
    git switch site-unificado-2026-11
    npm ci && npm run exemplos:instalar   # dependências travadas (raiz e exemplos-sites)
    npm run build                         # Next + Astro + junção em out/
    npm run previa                        # http://127.0.0.1:8788

Para testar o `/material/`, precisa de um `.dev.vars` com `MATERIAL_SECRET=` (32+ caracteres; o
desta máquina já existe e é ignorado pelo Git). Gerar um segredo novo e um link:

    node -e 'console.log("MATERIAL_SECRET="+require("crypto").randomBytes(48).toString("base64url"))' > .dev.vars
    npm run material:link -- cliente-teste --base http://127.0.0.1:8788

O que for enviado na prévia fica no R2 simulado em `.wrangler/` (ignorado pelo Git; apague com
`rm -rf .wrangler`).

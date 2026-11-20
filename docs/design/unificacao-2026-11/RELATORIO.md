# Site unificado: relatório (2026-11-19)

Branch `site-unificado-2026-11` (a partir da `main`), commits locais, **sem push, sem merge, sem
deploy**. Ecossistema: commit local `dd85303`, sem push.

## Prévia

    cd ~/Dev/projects/personal/gabrielhsp-sys.github.io
    git switch site-unificado-2026-11
    npm ci && npm run exemplos:instalar
    npm run build
    npm run previa                  # abre em http://127.0.0.1:8788
    npm run material:link -- cliente-teste --base http://127.0.0.1:8788   # link para testar o /material/

Capturas 390×844 e 1440×900 em `previa/` (o README de lá explica cada uma).

## Pronto, por rota

| Rota | Estado |
|---|---|
| `/` | serviço para cliente leigo; CTA orçamento + WhatsApp; exemplos; como funciona; quem faz |
| `/servicos/`, `/servicos/<sites, aplicativos, bots, automacoes, sistemas>/` | o que resolve, onde ajuda, o que recebe, exemplo, pedir |
| `/exemplos/` e `/exemplos/sites/` | 7 demos Astro no mesmo build, em `/exemplos/sites/<ramo>/`, sem depoimentos |
| `/exemplos/aplicativos/` | Carona 70, só texto (sem prints: pendência) |
| `/exemplos/bots/` | Telegram Offers real (código, vídeo, dados do estudo de caso) + conversa simulada |
| `/exemplos/automacoes/`, `/exemplos/sistemas/` | demonstrações no navegador com o rótulo "Demonstração: exemplo do que posso fazer" |
| `/para/<slug>/` | demo de lead (`/para/cafe-do-coreto/`), fora do menu, noindex |
| `/como-funciona/` | 4 passos e perguntas comuns |
| `/orcamento/` | "O que você precisa?" + árvore do plano, termina no `wa.me/5535998840168` com a mensagem pronta |
| `/material/` | escondida, noindex; perguntas do Tally; upload por Pages Function para o R2; link HMAC com validade |
| `/sobre/`, `/projetos/<slug>/`, `/projetos/area/<area>/` | portfólio técnico; animação de entrada, terminal e Ctrl+K só aqui |
| tudo | WhatsApp fixo (menos no formulário), Konami em todo o site, som ligado por padrão, marca nova no cabeçalho, no cartão e no favicon (só o símbolo) |
| endereços antigos | `public/_redirects` (301) e páginas prontas para o GitHub Pages e a Vercel em `redirecionamentos/` |

## Gate e auditorias

- `npm run check`: exit 0 — lint; 31 testes unitários (raiz) + 18 (demos); build único; oráculo de
  número: 165 links `wa.me`, todos `5535998840168`; verificadores dos demos (créditos 236/236,
  320 px, interação).
- e2e Playwright (Chromium): 72/72, inclusive cada ramo do `/orcamento/` contra o texto esperado.
  **Firefox não rodou** (não está no cache; baixar seria instalação).
- `npm run test:cloudflare` (`wrangler pages dev`, R2 local): 43/43 — redirecionamentos, cabeçalhos,
  token válido/falso/vencido, SVG, 11 MB, 45 MB, cota, sem listagem.
- Segurança do `/material/`: 2 achados, corrigidos (`SEGURANCA-MATERIAL.md`).
- Qualidade (`qualidade/AUDITORIA.md`): UI, acessibilidade (WCAG 2.2), diretrizes, passe de fatos,
  Lighthouse (acessibilidade 100 em tudo) e axe (0 violações).
- Revisão em dois eixos (`REVISAO.md`): 4 defeitos de spec e 5 de padrão corrigidos; o resto é escolha.

## Pendências

- **Carona 70**: o projeto está em `/mnt/c/Users/DarkOS/Dev/projects/personal/carona70` (não em
  `~/Dev/projects`) e não tem prints; obtê-los exige rodar o app. A página é só texto. Para prints:
  gravar no celular com dados fictícios (nenhum nome, valor, chave PIX ou dado do grupo).
- **wrangler**: adotado, classe A, 4.157.0 (`WRANGLER.md`).
- **CLS 0,22** no demo de alimentação no celular (troca de fonte; veio do `demos-nichos`).
- Alertas Dependabot abertos na `main`: `zod` (alta), `sharp` (alta), `minimatch` (média) — PR próprio.
- `needs-verification`: limite do `?text=` do wa.me (teto adotado: link ≤ 2000 caracteres);
  navegador do Instagram abrindo o WhatsApp; teste com leitor de tela real.
- **Atenção:** o workflow do GitHub Pages publica a `main` a cada push. Não fazer merge desta branch
  antes de decidir o passo 2 de `redirecionamentos/README.md`.

### Textos para o Gabriel revisar (rascunhos, sem fonte no plano)

- `lib/servicos.ts`: "onde ajuda" e "o que você recebe" de cada serviço — em especial as promessas
  "Os seus dados guardados com cópia de segurança" (sistemas), "Ele rodando sozinho, sem depender
  do seu computador ligado" (robôs), "Ajuda para colocar em uso" (aplicativos) e "Um aviso quando
  algo der errado" (automações).
- `components/cliente-ui.tsx`: os 4 passos de "Como funciona" (proposta do plano, ajustada).
- `/como-funciona/`: as 5 perguntas comuns e respostas.
- `/`: "Você fala direto comigo, do primeiro contato à entrega."
- `/orcamento/`: "Umas perguntas rápidas, uns 2 minutos" (a meta do plano, não medida) e a pergunta
  aberta "Tem um valor em mente?" (sem faixas de preço).
- Mensagem padrão do WhatsApp: "Olá, Gabriel! Vim pelo site e quero conversar sobre um projeto."
- `/exemplos/*`: textos do Carona 70, do robô, das duas demonstrações e o roteiro da conversa simulada.
- Faixa dos demos: "Site de demonstração, negócio fictício — feito por GABRIEL.SYS".
- `/material/`: "Só eu vejo o que você mandar." e "Fotos ou PDF, com nome e preço de cada produto"
  (o Tally aceitava planilha; aqui só PNG/JPG/WEBP/PDF).

## Decisões registradas no ecossistema (`dd85303`)

D-218 (personalidade só na área do recrutador; sobreposições com D-091, D-093, D-094 em
`PRECEDENCE.md`), D-219 (Cloudflare Pages), D-220 (domínio, compra pendente), D-221 (demos no
repositório), D-222 (`/material/` com R2), D-223 (wrangler, classe A). Pack de contexto regenerado
localmente; o upload para o claude.ai é seu.

## Para publicar (à mão, nesta ordem)

1. Comprar `gabrielsys.com.br` no registro.br (conferir disponibilidade e preço).
2. Criar conta no Cloudflare; criar o projeto Pages ligado ao repositório (build `npm ci && npm run exemplos:instalar && npm run build`, saída `out`, Node 22).
3. Criar o bucket R2 **privado** `gabrielsys-material` (sem domínio público, `r2.dev` desligado) e ligá-lo ao projeto como `MATERIAL_BUCKET`.
4. Gerar um segredo novo (`node -e 'console.log(require("crypto").randomBytes(48).toString("base64url"))'`) e gravá-lo só como secret do Pages: `npx wrangler pages secret put MATERIAL_SECRET`. Guardar uma cópia no `.dev.vars` só se quiser gerar links desta máquina.
5. DNS: apontar o domínio para o Cloudflare (servidores no registro.br) e adicionar o domínio ao projeto.
6. Conferir: `curl -sI https://gabrielsys.com.br/about/` → 301 para `/sobre/`.
7. Redirecionamentos antigos: GitHub Pages e Vercel, pelos passos de `redirecionamentos/README.md`.
8. Instagram (link da bio) e WhatsApp Business (site no perfil); decidir o que fazer com o Tally.

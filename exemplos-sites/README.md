# demos-nichos

Sete sites-demo de comércio para mandar por WhatsApp a donos de negócio em Areado-MG, mais uma
home que lista os sete. Astro estático, CSS próprio, GSAP só na entrada do hero da Arena.
Os negócios são fictícios; todas as páginas têm `noindex`.

No ar: https://gabriel-sites.vercel.app (Vercel Hobby; como publicar em `RELATORIO.md`, seção
"Renomeado para gabriel-sites").

| Rota | Negócio | Botão principal |
|---|---|---|
| `/alimentacao` | Lanchonete Brasa & Pão | Pedir pelo WhatsApp |
| `/beleza` | Studio Íris Estética | Agendar horário |
| `/cabeleireiro` | Barbearia Navalha Fina | Marcar corte |
| `/saude` | Clínica Vida Integrada | Marcar consulta |
| `/fitness` | Arena Fit Studio | Agendar aula experimental |
| `/loja` | Empório da Praça | Finalizar pedido |
| `/servicos` | Prado Serviços Automotivos | Pedir orçamento |
| `/l/<slug>` | demo personalizado de um lead (fora da home) | o do nicho-base |

Todo botão de contato abre `wa.me/5535998840168` com o texto
`[Demo <nicho>] Oi Gabriel, vi o demo e quero um site assim`. O número fica só em
`src/data/contato.ts`.

## Rodar

```bash
npm install          # só na primeira vez
npm run dev          # http://localhost:4321
npm run build        # gera dist/
npm run verificar    # testes + build + todas as verificações
```

Verificações (cada uma sai com código ≠ 0 se falhar):

| Comando | O que prova |
|---|---|
| `npm test` | link wa.me de cada nicho (número e texto) e as mensagens de pedido, agenda e orçamento |
| `npm run verificar:dist` | 7 rotas de nicho + home + lead em `dist/`, `noindex` e cartão de compartilhamento em todas, todo wa.me com o número certo |
| `npm run verificar:creditos` | `CREDITOS.md` cobre 100% das imagens de `public/` |
| `npm run verificar:navegador` | sem rolagem horizontal em 320 px e < 500 KB na primeira carga (Chromium headless) |
| `npm run verificar:interacao` | carrinho, filtro, agenda e orçamento funcionando no navegador |

Os dois últimos usam um Chromium já presente na máquina (variável `CHROME` ou o cache do
Playwright em `~/.cache/ms-playwright`). Nada é instalado; sem navegador, saem com código 2.

## Onde mexer

- Conteúdo de cada nicho: `src/data/nichos/<nicho>.ts` (comentado; cada fato uma vez).
- Formato dos dados: `src/data/tipos.ts`.
- Visual de cada nicho: `src/components/nichos/<Nicho>.astro`; tokens em `docs/SISTEMAS.md`.
- Fotos: `scripts/fotos.json` → `npm run imagens` (baixa, gera AVIF/WebP e reescreve `CREDITOS.md`).

## Demo de um lead (5 passos)

Exemplo pronto: `src/data/leads/cafe-do-coreto.ts` → `/l/cafe-do-coreto`.

1. **Copie o arquivo de exemplo** com o slug do lead, sem acento e com hífen:
   `cp src/data/leads/cafe-do-coreto.ts src/data/leads/padaria-bom-dia.ts`
2. **Escolha o nicho-base** em `nichoBase` (`alimentacao`, `beleza`, `cabeleireiro`, `saude`,
   `fitness`, `loja` ou `servicos`). Os campos seguem o mesmo formato do arquivo do nicho em
   `src/data/nichos/`; o TypeScript aponta campo faltando no `npm run build`. Se o nicho-base não
   for o do exemplo, copie os campos do arquivo do nicho.
3. **Troque os dados**: `rotulo` e `negocio.nome` com o nome do lead (o `rotulo` vai na mensagem:
   `[Demo Padaria Bom Dia] …`), preços, horário, referência do endereço e redes.
4. **Fotos do lead (opcional)**: com autorização do dono, salve as fotos em
   `fotos-leads/<slug>/` e acrescente em `scripts/fotos.json` uma entrada por foto:
   `{ "chave": "leads/<slug>/hero", "arquivoLocal": "fotos-leads/<slug>/fachada.jpg", "credito": "Foto cedida por <negócio> em <data>", "alt": "<descrição>" }`.
   Rode `npm run imagens` e use as chaves nos dados (`hero.foto: 'leads/<slug>/hero'`). Sem foto
   própria, use chaves já existentes (ver `src/data/imagens.json`); a foto do hero precisa terminar
   em `/hero` ou ter `"og": true` para ganhar o cartão de compartilhamento.
5. **Gere e confira**: `npm run verificar`, abra `/l/<slug>` com `npm run dev` e mande o link.
   A rota não aparece na home e tem `noindex`.

## Licenças

- Fotos: Unsplash License, uma a uma em `CREDITOS.md`.
- Fontes: OFL-1.1 (Fontsource 5.3.0), lista em `docs/SISTEMAS.md`.
- Ícones: Phosphor, MIT (`src/icons/LICENSE`).
- `linkWhatsApp` vem da biblioteca própria mirante (`~/Dev/projects/tools/mirante`), importado
  por caminho relativo.
- Mapa: OpenStreetMap (embed sem chave, carregado só quando o rodapé aparece).

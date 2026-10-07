# Vídeos dos estudos de caso

Quatro vídeos de 12 s, 1280 × 720, 30 fps, sem trilha de áudio, um por estudo
de caso em destaque. Feitos com HyperFrames 0.8.134 e renderizados **localmente**
(sem nuvem, sem Lambda, sem geração paga de mídia). O resultado publicado fica em
`public/videos/<id>.mp4` com o pôster `public/videos/<id>.jpg` (quadro de 11,5 s).

| Vídeo | Fonte do conteúdo |
|---|---|
| `telegram-offers` | README público de `gabrielhsp-sys/telegram-offer-monitor` ("Como funciona por dentro", "O que você recebe"); o card é o exemplo do próprio README |
| `gabriel-sys-site` | README deste repositório e `content/public/gabriel-sys-site.mdx`; o frontmatter mostrado é o do próprio registro |
| `academic-system` | README de `gabrielhsp-sys/academic-system` ("Architecture", "Security Model", "About This Fork") |
| `fedora-post-install` | README de `gabrielhsp-sys/fedora-post-install`; cada comando é copiado das seções do guia |

Nenhum vídeo mostra canal, chat, IP, host, token ou e-mail.

## Como refazer

```bash
node videos/make.mjs                 # gera videos/<id>/index.html e copia fontes e GSAP
HF=~/Dev/sandbox/skills-2026-10-05/pilot-hyperframes/node_modules/.bin/hyperframes
(cd videos/telegram-offers && $HF check . && $HF render . -q delivery -o ./renders/video.mp4)
cp videos/telegram-offers/renders/video.mp4 public/videos/telegram-offers.mp4
ffmpeg -ss 11.5 -i public/videos/telegram-offers.mp4 -frames:v 1 -q:v 5 public/videos/telegram-offers.jpg
```

O texto de cada vídeo mora em `videos/src/<id>.html`; a base visual comum (tokens do
`DESIGN.md`, fontes locais, cabeçalho e rodapé), em `videos/src/base.css`. Fontes e
GSAP são copiados na hora (do `node_modules` e do plugin HyperFrames) e não entram no
Git, assim como `renders/` e `snapshots/`.

## No site

`components/case-video.tsx`: sem som, em loop, `preload="none"`, pôster, botão de
pausa de teclado (WCAG 2.2.2), o arquivo só é pedido quando o vídeo chega perto da
tela e pausa ao sair. Com `prefers-reduced-motion` fica só o pôster. Abaixo de 600 px
o vídeo não aparece: o texto dele viraria 6 px. `scripts/verify-export.mjs` falha se
um vídeo passar de ~5 MB, perder o pôster ou sair com `src` no HTML.

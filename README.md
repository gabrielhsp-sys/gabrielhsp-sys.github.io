# Portfólio — Gabriel Henrique

Um portfólio pessoal com cara de computador dos anos 90: sequência de boot, monitor CRT de plástico bege, projetos em cartucho e um terminal de verdade escondido atrás da tecla `~`.

<p align="left">
  <img src="https://img.shields.io/badge/site-online-FFB43B?style=flat-square" alt="Status">
  <img src="https://img.shields.io/badge/dependências-0-7EE787?style=flat-square" alt="Dependências">
  <img src="https://img.shields.io/badge/build-nenhum-D9C9A3?style=flat-square" alt="Build">
  <img src="https://img.shields.io/badge/licença-MIT-B3A793?style=flat-square" alt="Licença">
</p>

**→ [gabriel-bcc.github.io](https://gabriel-bcc.github.io/)**

<!-- Dica: tire um print do herói (1280x800), salve como docs/preview.png e descomente a linha abaixo.
     Um README de portfólio com screenshot converte muito melhor que um sem.
<img src="docs/preview.png" alt="Captura do portfólio" width="100%">
-->

---

## Sobre

HTML, CSS e JavaScript puros. **Nenhuma dependência de runtime** além de três fontes do Google Fonts. Sem framework, sem bundler, sem `node_modules` — o que está no repositório é exatamente o que roda no navegador.

A ideia não era só listar tecnologias — era fazer o visitante querer explorar. O site é apresentado como uma máquina antiga sendo ligada, e quem quiser pode conversar com ela por linha de comando.

---

## Decisões de projeto

As partes que valem discutir num code review:

**O terminal é uma camada, não um pedágio.**
Portfólio-terminal costuma filtrar visitante: se a primeira tela exige digitar um comando, quem não é da área fecha. Aqui o conteúdo inteiro está acessível rolando a página normalmente. O terminal é bônus para quem reconhece o `~`.

**No celular não existe tecla `~`.**
Então o botão `>_` fica no cabeçalho, e o terminal troca digitação por atalhos tocáveis. O Snake ganha setas na tela. Recurso que só funciona no desktop é recurso quebrado para metade dos visitantes.

**A fonte pixel foi trocada por causa do português.**
A escolha óbvia seria Press Start 2P, mas ela **não tem acentos** — "DISPONÍVEL" e "Decisões" caíam para uma fonte de fallback no meio da palavra. Troquei por Pixelify Sans, que é bitmap de verdade e cobre Latin Extended.

**Teclado ABNT2 trata `~` como tecla morta.**
Em teclado brasileiro o til não dispara `event.key === '~'`, e sim `'Dead'`. O atalho escuta os dois casos, mais o `event.code` para layout americano.

**O boot roda uma vez por sessão e sempre pode ser pulado.**
Animação de entrada bonita na primeira visita vira obstáculo na quinta. Estado guardado em `sessionStorage` dentro de `try/catch`, porque navegação anônima e alguns sandboxes bloqueiam o acesso.

**Som desligado por padrão.**
Áudio automático é a forma mais rápida de perder um visitante. Os bipes existem (Web Audio API, ondas quadradas geradas em runtime, zero arquivo de áudio), mas só depois de clique explícito.

**`prefers-reduced-motion` desliga tudo.**
Boot, scanlines, revelações no scroll e o cursor piscando somem para quem configurou o sistema assim.

---

## O terminal

Abre com `~`, com o botão do cabeçalho, ou tocando na dica do herói.

| Comando | O que faz |
|---|---|
| `ajuda` | lista os comandos |
| `sobre` | quem eu sou, versão curta |
| `stack` | linguagens e ferramentas |
| `trajeto` | formação e próximos passos |
| `projetos` | lista os cinco projetos |
| `abrir N` | abre os detalhes do projeto N |
| `cv` | currículo resumido em uma tela |
| `contato` | e-mail, GitHub, LinkedIn |
| `ir X` | rola até a seção X |
| `tema X` | `ambar`, `verde` ou `mono` |
| `som` | liga ou desliga os bipes |
| `limpar` | limpa a tela |
| `sair` | fecha o terminal |

Tem histórico com `↑` e `↓`, autocompletar com `Tab` e sugestão quando você erra (`ls` sugere `projetos`, `resume` sugere `cv`).

<details>
<summary><b>Easter eggs</b> — não abra se quiser procurar sozinho</summary>

<br>

- `sudo` e `sudo rm -rf /` — resposta diferente para cada
- `vim` — o problema clássico
- `hack` — sequência de invasão com desfecho honesto
- `whoami`, `neofetch`
- `snake` — Snake jogável dentro do terminal, com placar
- **Konami Code** (`↑ ↑ ↓ ↓ ← → ← → B A`) — modo arcade
- `eggs` — as pistas, se você desistir

</details>

---

## Acessibilidade

- Link "pular para o conteúdo" como primeiro elemento focável
- Foco visível em todos os controles, navegação completa por teclado
- Modais com `aria-modal`, foco movido na abertura, `Esc` fecha, clique fora fecha
- Saída do terminal como `role="log"` com `aria-live`
- Botões de estado com `aria-pressed`; texto alternativo real na foto
- Contraste conferido nas combinações de texto sobre fundo escuro e sobre bege

## Performance

- Um único request de HTML, sem JS de terceiros
- Ícones em SVG inline — nenhuma biblioteca de ícones
- Foto comprimida de 1,86 MB para ~150 KB (recorte 4:5, JPEG progressivo)
- Canvas e efeitos pesados removidos; as animações usam CSS e `IntersectionObserver`

---

## Rodando localmente

Site estático — não tem build.

```bash
git clone https://github.com/gabriel-bcc/gabriel-bcc.github.io.git
cd gabriel-bcc.github.io
```

Abra o `index.html` no navegador, ou sirva a pasta para evitar restrições de origem:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Estrutura

```
.
├── index.html      # markup e conteúdo
├── estilo.css      # tokens, componentes, seções, responsivo
├── script.js       # boot, navegação, modais, terminal, jogo
├── profile.jpg
└── README.md
```

**Por que o JS é um arquivo só.** Fatiar em módulos exigiria `type="module"`, e módulos ES não carregam pelo protocolo `file://` — abrir o `index.html` clicando duas vezes deixaria de funcionar. Além disso o escopo é compartilhado de propósito: o terminal chama as funções de modal, o jogo escreve na saída do terminal. Separar isso em arquivos com `<script>` clássico significaria expor variáveis globais, o que é pior que manter um arquivo coeso.

**A única exceção** é um script de uma linha inline no `<head>`, que marca `class="js"` no `<html>`. Ele precisa rodar antes da primeira pintura, senão o conteúdo com animação de entrada pisca na tela.

## Tecnologias

| | |
|---|---|
| **HTML5** | estrutura semântica e atributos ARIA |
| **CSS3** | custom properties, Grid, Flexbox, temas trocáveis em runtime |
| **JavaScript** | ES5+ sem dependências: `IntersectionObserver`, Web Audio API, `sessionStorage` |
| **Fontes** | Pixelify Sans, VT323, IBM Plex Mono |

---

## Autor

**Gabriel Henrique Silva Pereira** — Ciência da Computação, UNIFAL-MG

[LinkedIn](https://www.linkedin.com/in/gabrielhsp-dev/) · [GitHub](https://github.com/gabriel-bcc) · gabrielhspereira36@gmail.com

Licenciado sob MIT.

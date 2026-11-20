# Origem desta pasta

Cópia dos sete sites de demonstração do projeto local `~/Dev/projects/personal/demos-nichos`
(Astro 7.3.8, sem remoto), feita em 2026-11-19 a partir do commit:

    2e7a9f42fc72c0eb996110ebbf6e23a90a1aaa71  (chore: WhatsApp dos demos passa ao número Business 5535998840168)

Comando usado (só arquivos versionados daquele commit):

    git -C ~/Dev/projects/personal/demos-nichos archive 2e7a9f42fc72c0eb996110ebbf6e23a90a1aaa71 \
      src public scripts astro.config.mjs package.json package-lock.json tsconfig.json \
      CREDITOS.md README.md .gitignore docs/LICENCAS.md docs/SISTEMAS.md | tar -x -C exemplos-sites

Ficaram de fora, de propósito: `RELATORIO.md`, `prompts/` e os planos em `docs/` (histórico de
trabalho, não fazem parte do site; o relatório cita um número que não é o do WhatsApp Business).
O projeto original não foi alterado. As mudanças feitas aqui depois da cópia estão no histórico
Git deste repositório (`git log -- exemplos-sites`) e resumidas em
`docs/design/unificacao-2026-11/EXEMPLOS.md`.

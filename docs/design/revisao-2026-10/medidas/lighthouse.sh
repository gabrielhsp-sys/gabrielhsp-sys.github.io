#!/usr/bin/env bash
# Lighthouse 13.5 (devDependency do projeto desde a D-129), mediana de 3, no
# out/ servido com gzip por scripts/serve-out.mjs. Rodar da raiz do repositorio.
# Uso: lighthouse.sh <pasta-saida> <nome>=<url> [<nome>=<url>...]
set -euo pipefail
OUT=$1; shift; mkdir -p "$OUT"
LH=node_modules/.bin/lighthouse
export CHROME_PATH=~/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome
for pair in "$@"; do
  name=${pair%%=*}; url=${pair#*=}
  for ff in mobile desktop; do
    for run in 1 2 3; do
      extra=(); [ "$ff" = desktop ] && extra=(--preset=desktop)
      "$LH" "$url" --quiet --no-enable-error-reporting --only-categories=performance,accessibility,best-practices,seo \
        --chrome-flags="--headless=new --no-sandbox" "${extra[@]}" \
        --output=json --output-path="$OUT/$name-$ff-$run.json" >/dev/null 2>&1 || echo "falhou $name $ff $run"
    done
  done
done

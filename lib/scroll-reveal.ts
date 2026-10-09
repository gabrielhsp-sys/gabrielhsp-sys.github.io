// A matematica do "Sobre" ligado a rolagem, para os navegadores sem
// animation-timeline (Firefox ate a 157). Reproduz as faixas do CSS
// (app/globals.css, .bench-about-lines p e .bench-stage) para o efeito ser o
// mesmo com e sem suporte. Puro: recebe numeros, devolve numeros.

/** Curva das duas pontas suaves: velocidade zero no inicio e no fim da faixa,
    entao a frase nao "bate" ao comecar nem ao terminar de acender. E a mesma
    curva do cubic-bezier(1/3, 0, 2/3, 1) usado no CSS. */
export const smoothstep = (t: number) => t * t * (3 - 2 * t);

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** A faixa visivel de uma view-timeline: a tela menos o scroll-padding do
    html (view-timeline-inset: auto). Coordenadas a partir do topo da tela. */
export type ViewRange = { top: number; bottom: number };

/** Frase: "entry 0%" (topo entrando pela base da faixa) ate "cover 38%" (38% do
    caminho entre entrar pela base e sair pelo topo). */
export function lineProgress(scrollY: number, view: ViewRange, top: number, height: number) {
  const start = top - view.bottom;
  const length = 0.38 * (view.bottom - view.top + height);
  return clamp01((scrollY - start) / length);
}

/** Imagem: "exit 0%" (o fim da bancada encosta na base da faixa) ate "exit 70%"
    (o fim da bancada a 30% da faixa). Devolve 0 → 1 enquanto apaga. */
export function benchExitProgress(scrollY: number, view: ViewRange, bottom: number) {
  const start = bottom - view.bottom;
  return clamp01((scrollY - start) / (0.7 * (view.bottom - view.top)));
}

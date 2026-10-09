// A matematica do "Sobre" ligado a rolagem, para os navegadores sem
// animation-timeline (Firefox ate a 157). Reproduz as faixas do CSS
// (app/globals.css, .bench-about-lines p e .bench-stage) para o efeito ser o
// mesmo com e sem suporte. Puro: recebe numeros, devolve numeros.

/** Curva das duas pontas suaves: velocidade zero no inicio e no fim da faixa.
    E a mesma curva do cubic-bezier(1/3, 0, 2/3, 1) (--ease-scroll), usada na
    imagem que apaga. */
export const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** Curva das frases: sai com velocidade (a frase responde assim que entra na
    faixa, sem o trecho de ease-in que o smoothstep tem no comeco) e pousa com
    velocidade zero, sem quina no fim. E o cubic-bezier(1/3, .2, 2/3, 1)
    (--ease-reveal): com x nos tercos o tempo e linear e y vira o polinomio
    0,6t + 1,8t² - 1,4t³. */
export const reveal = (t: number) => t * (0.6 + t * (1.8 - 1.4 * t));

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** A faixa visivel de uma view-timeline: a tela menos o scroll-padding do
    html (view-timeline-inset: auto), em coordenadas a partir do topo da tela,
    e a altura da tela, que da a unidade vh. */
export type ViewRange = { top: number; bottom: number; height: number };

/** Onde a frase acende, em fracao da altura da tela: comeca com o topo dela a
    85% e termina a 50%. No CSS: animation-range: cover 15vh cover 50vh. */
export const LINE_BAND = { from: 0.85, to: 0.5 } as const;

/** Frase: 0 com o topo a 85% da tela (15vh depois de entrar pela base da
    faixa), 1 com o topo a 50% (50vh depois). Fora disso, preso em 0 ou 1. */
export function lineProgress(scrollY: number, view: ViewRange, top: number) {
  const start = top - view.bottom + (1 - LINE_BAND.from) * view.height;
  return clamp01((scrollY - start) / ((LINE_BAND.from - LINE_BAND.to) * view.height));
}

/** Imagem: "exit 0%" (o fim da bancada encosta na base da faixa) ate "exit 70%"
    (o fim da bancada a 30% da faixa). Devolve 0 → 1 enquanto apaga. */
export function benchExitProgress(scrollY: number, view: ViewRange, bottom: number) {
  const start = bottom - view.bottom;
  return clamp01((scrollY - start) / (0.7 * (view.bottom - view.top)));
}

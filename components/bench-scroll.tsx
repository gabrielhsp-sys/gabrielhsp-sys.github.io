"use client";

import { useEffect } from "react";
import { benchExitProgress, lineProgress, reveal, smoothstep } from "@/lib/scroll-reveal";

/* Fallback do "Sobre" ligado a rolagem, so onde o CSS nao alcanca: sem
   animation-timeline (Firefox ate a 157) as frases ficavam paradas e acesas.
   Aqui elas acendem e a bancada apaga com a mesma faixa e a mesma curva do CSS.

   Sem layout por quadro: a geometria e medida uma vez (e de novo so quando a
   bancada ou a janela mudam de tamanho); a cada quadro so le scrollY e escreve
   duas variaveis CSS que viram opacity e transform. O ouvinte de rolagem e
   passivo, coalescido em requestAnimationFrame, e so existe enquanto a bancada
   esta perto da tela. Com movimento reduzido nada liga e o texto fica aceso. */
export function BenchScroll() {
  useEffect(() => {
    if (CSS.supports("animation-timeline: view()")) return;
    const bench = document.querySelector<HTMLElement>(".bench");
    const stage = bench?.querySelector<HTMLElement>(".bench-stage");
    const lines = bench ? [...bench.querySelectorAll<HTMLElement>(".bench-about-lines p")] : [];
    if (!bench || !stage || lines.length === 0) return;

    // Posicao no documento pela cadeia de offsetTop: ignora o transform que o
    // proprio efeito aplica, entao medir no meio da rolagem nao desloca a faixa.
    const documentTop = (element: HTMLElement) => {
      let top = 0;
      for (let node: HTMLElement | null = element; node; node = node.offsetParent as HTMLElement | null) top += node.offsetTop;
      return top;
    };

    let view = { top: 0, bottom: 0, height: 0 };
    let benchBottom = 0;
    let tops: number[] = [];
    let frame = 0;

    const measure = () => {
      // A faixa do CSS desconta o scroll-padding do html (view-timeline-inset:
      // auto); sem isso a imagem apagava uns 35px fora de passo com o Chrome.
      const root = getComputedStyle(document.documentElement);
      const inset = (value: string) => parseFloat(value) || 0;
      view = {
        top: inset(root.scrollPaddingTop),
        bottom: document.documentElement.clientHeight - inset(root.scrollPaddingBottom),
        height: window.innerHeight,
      };
      benchBottom = documentTop(bench) + bench.offsetHeight;
      tops = lines.map(documentTop);
    };
    const paint = () => {
      frame = 0;
      const y = window.scrollY;
      lines.forEach((line, index) => {
        line.style.setProperty("--reveal", reveal(lineProgress(y, view, tops[index])).toFixed(3));
      });
      stage.style.setProperty("--fade", smoothstep(benchExitProgress(y, view, benchBottom)).toFixed(3));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const remeasure = () => {
      measure();
      schedule();
    };

    let listening = false;
    const listen = (on: boolean) => {
      if (on === listening) return;
      listening = on;
      if (on) {
        window.addEventListener("scroll", schedule, { passive: true });
        schedule();
      } else {
        window.removeEventListener("scroll", schedule);
      }
    };
    // Margem de uma tela: o estado ja esta certo quando a bancada aparece.
    const near = new IntersectionObserver(([entry]) => listen(entry.isIntersecting), { rootMargin: "100% 0px" });
    const resize = new ResizeObserver(remeasure);

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const start = () => {
      measure();
      paint();
      bench.setAttribute("data-scroll-fallback", "");
      near.observe(bench);
      resize.observe(bench);
      window.addEventListener("resize", remeasure, { passive: true });
    };
    const stop = () => {
      near.disconnect();
      resize.disconnect();
      listen(false);
      window.removeEventListener("resize", remeasure);
      cancelAnimationFrame(frame);
      frame = 0;
      bench.removeAttribute("data-scroll-fallback");
      lines.forEach((line) => line.style.removeProperty("--reveal"));
      stage.style.removeProperty("--fade");
    };
    const follow = () => (motion.matches ? stop() : start());

    follow();
    motion.addEventListener("change", follow);
    return () => {
      motion.removeEventListener("change", follow);
      stop();
    };
  }, []);

  return null;
}

"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { LINE_BAND, lineProgress } from "@/lib/scroll-reveal";

/* Diagnostico do "Sobre" ligado a rolagem, so com ?debug=reveal na URL: diz
   qual caminho esta ativo (CSS, JS ou movimento reduzido) e, ao vivo, onde
   cada frase esta na tela, o progresso esperado na faixa e a opacidade que o
   navegador de fato aplicou. Duas linhas tracejadas marcam a faixa (85% e 50%).
   Se t muda e a opacidade nao, algo no CSS esta por cima; se o caminho e
   "nenhum", o fallback nao ligou; se o painel nem aparece, o JS da pagina nao
   rodou (ou o navegador serviu uma versao antiga). Sem o parametro, nada. */

const wanted = () => new URLSearchParams(window.location.search).get("debug") === "reveal";
const never = () => () => {};

export function RevealDebug() {
  const on = useSyncExternalStore(never, wanted, () => false);
  const output = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (!on) return;
    const bench = document.querySelector<HTMLElement>(".bench");
    const lines = [...document.querySelectorAll<HTMLElement>(".bench-about-lines p")];
    const documentTop = (element: HTMLElement) => {
      let top = 0;
      for (let node: HTMLElement | null = element; node; node = node.offsetParent as HTMLElement | null) top += node.offsetTop;
      return top;
    };
    // Le a cada quadro, enquanto o painel existe: lendo so no evento de rolagem,
    // a leitura podia cair antes da escrita do fallback no mesmo quadro e
    // mostrar a opacidade velha como se o CSS estivesse por cima.
    let frame = 0;
    const paint = () => {
      frame = requestAnimationFrame(paint);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const css = CSS.supports("animation-timeline: view()");
      const path = reduce ? "reduzido (tudo aceso, de proposito)"
        : css ? "CSS (animation-timeline)"
        : bench?.hasAttribute("data-scroll-fallback") ? "JS (fallback)"
        : "nenhum: o fallback JS nao ligou";
      const root = getComputedStyle(document.documentElement);
      const view = {
        top: parseFloat(root.scrollPaddingTop) || 0,
        bottom: document.documentElement.clientHeight - (parseFloat(root.scrollPaddingBottom) || 0),
        height: window.innerHeight,
      };
      const rows = lines.map((line, index) => {
        const at = (documentTop(line) - window.scrollY) / view.height;
        const t = lineProgress(window.scrollY, view, documentTop(line));
        const opacity = Number(getComputedStyle(line).opacity);
        return `#${index + 1}  topo ${(at * 100).toFixed(0).padStart(4)}%  t ${t.toFixed(2)}  opacidade ${opacity.toFixed(2)}`;
      });
      if (output.current) {
        output.current.textContent = [
          `caminho: ${path}`,
          `faixa: topo da frase de ${LINE_BAND.from * 100}% a ${LINE_BAND.to * 100}% da tela`,
          `${process.env.NODE_ENV} · ${window.innerWidth}×${window.innerHeight}`,
          ...rows,
        ].join("\n");
      }
    };
    paint();
    return () => cancelAnimationFrame(frame);
  }, [on]);

  if (!on) return null;
  return (
    <div className="reveal-debug" aria-hidden="true" data-reveal-debug="">
      <i style={{ top: `${LINE_BAND.from * 100}vh` }} />
      <i style={{ top: `${LINE_BAND.to * 100}vh` }} />
      <pre ref={output} />
    </div>
  );
}

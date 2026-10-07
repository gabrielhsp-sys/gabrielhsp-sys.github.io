"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { Bancada, Etiqueta, Folha, type Facts } from "./directions";
import "./prototype.css";

export type ProtoItem = {
  id: string;
  title: string;
  summary: string;
  area: "software" | "web" | "academico";
  status: "building" | "live" | "done" | "archived";
  period: string;
  startedAt: string;
  tags: string[];
  href: string;
  github: string | null;
};

type Props = { featured: ProtoItem[]; others: ProtoItem[]; facts: Facts };

const variants = [
  { name: "Bancada", render: (p: Props) => <Bancada {...p} /> },
  { name: "Folha", render: (p: Props) => <Folha {...p} /> },
  { name: "Etiqueta", render: (p: Props) => <Etiqueta {...p} /> },
];
// A quarta posicao do seletor mostra as tres de uma vez, em escala.
const SIDE = variants.length;

// A escolha mora na URL (?v=1..4) e sobrevive ao recarregar; o HTML estatico
// sai na primeira direcao e a hidratacao corrige sem divergencia.
const listeners = new Set<() => void>();
const subscribe = (notify: () => void) => {
  listeners.add(notify);
  return () => { listeners.delete(notify); };
};
const readChoice = () => {
  const value = Number(new URLSearchParams(window.location.search).get("v")) - 1;
  return value >= 0 && value <= SIDE ? value : 0;
};

/* Seletor do skill `prototype` (PICKER.md): pilula escura no centro de baixo,
   teclas 1–4 e setas, escolha na URL (?v=). A troca de variante e instantanea;
   so o destaque do seletor desliza. */
export function IdentityPicker(props: Props) {
  const current = useSyncExternalStore(subscribe, readChoice, () => 0);
  const pickerRef = useRef<HTMLElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const moveHighlight = useCallback(() => {
    const el = itemsRef.current[current];
    const highlight = highlightRef.current;
    if (!el || !highlight) return;
    highlight.style.width = `${el.offsetWidth}px`;
    highlight.style.transform = `translateX(${el.offsetLeft}px)`;
  }, [current]);

  const setActive = useCallback((index: number) => {
    if (index < 0 || index > SIDE) return;
    const url = new URL(window.location.href);
    url.searchParams.set("v", String(index + 1));
    window.history.replaceState(window.history.state, "", url);
    listeners.forEach((notify) => notify());
  }, []);

  // O deslize do destaque so liga depois da primeira pintura.
  useEffect(() => {
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => pickerRef.current?.setAttribute("data-ready", "")));
    return () => cancelAnimationFrame(frame);
  }, []);

  useLayoutEffect(() => {
    moveHighlight();
    window.addEventListener("resize", moveHighlight);
    return () => window.removeEventListener("resize", moveHighlight);
  }, [moveHighlight]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const num = Number.parseInt(event.key, 10);
      if (num >= 1 && num <= SIDE + 1) setActive(num - 1);
      else if (event.key === "ArrowRight") setActive((current + 1) % (SIDE + 1));
      else if (event.key === "ArrowLeft") setActive((current - 1 + SIDE + 1) % (SIDE + 1));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [current, setActive]);

  const labels = [...variants.map((variant) => variant.name), "Lado a lado"];

  return (
    <>
      <main id="conteudo" className="proto-stage" key={current}>
        {current === SIDE ? <SideBySide {...props} /> : variants[current].render(props)}
      </main>
      <nav className="proto-picker" aria-label="Direções de identidade" ref={pickerRef}>
        <span className="proto-picker-highlight" aria-hidden="true" ref={highlightRef} />
        {labels.map((label, index) => (
          <button
            key={label}
            type="button"
            className="proto-picker-item"
            ref={(el) => { itemsRef.current[index] = el; }}
            data-active={index === current ? "" : undefined}
            aria-current={index === current ? "true" : undefined}
            onClick={() => setActive(index)}
          >
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}

/* As tres na mesma tela: cada uma desenhada a 1280px e reduzida para caber na
   coluna. Serve para comparar o conjunto; o julgamento de detalhe e em tela
   cheia (teclas 1–3). */
function SideBySide(props: Props) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.3);
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const observer = new ResizeObserver(([entry]) => {
      const column = entry.contentRect.width / (window.innerWidth < 900 ? 1 : 3) - 16;
      setZoom(Math.max(0.2, column / 1280));
    });
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="proto-side" ref={gridRef}>
      {variants.map((variant) => (
        <section key={variant.name} className="proto-side-col" aria-label={variant.name}>
          <h2>{variant.name}</h2>
          <div className="proto-side-frame" style={{ zoom }} inert>
            {variant.render(props)}
          </div>
        </section>
      ))}
    </div>
  );
}

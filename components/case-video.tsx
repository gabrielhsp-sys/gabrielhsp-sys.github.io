"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { PauseIcon as Pause, PlayIcon as Play } from "@phosphor-icons/react";

/* Video curto do estudo de caso. Regras (auditoria 2026-10):
   - sem som, em loop, com poster, `preload="none"`;
   - o arquivo so e pedido quando o video chega perto da tela, e pausa ao sair;
   - botao de pausa visivel e de teclado (WCAG 2.2.2: movimento automatico com
     mais de 5 s precisa poder parar);
   - com prefers-reduced-motion o video nunca carrega: fica so o poster.
   O mesmo conteudo esta no texto da pagina; o video so o mostra em movimento. */

const subscribeMotion = (notify: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const reducedSnapshot = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function CaseVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // No HTML estatico (e sem JS) fica so o poster.
  const reduced = useSyncExternalStore(subscribeMotion, reducedSnapshot, () => true);
  const [loaded, setLoaded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // O arquivo so e pedido na primeira vez que o video chega perto da tela.
        if (entry.isIntersecting && !video.getAttribute("src")) {
          video.src = src;
          setLoaded(true);
        }
        setVisible(entry.isIntersecting);
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduced, src]);

  // Toca enquanto visivel e nao pausado; fora da tela, para.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced || !loaded) return;
    if (visible && !paused) void video.play().catch(() => undefined);
    else video.pause();
  }, [loaded, paused, reduced, visible]);

  return (
    <figure className="case-video" data-loaded={loaded || undefined}>
      <div className="case-video-frame">
        <video
          ref={videoRef}
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          width={1280}
          height={720}
          aria-label={label}
        />
        {!reduced && (
          <button
            type="button"
            className="case-video-toggle"
            onClick={() => setPaused((value) => !value)}
            aria-pressed={paused}
            aria-label={paused ? "Reproduzir vídeo" : "Pausar vídeo"}
          >
            {paused ? <Play size={18} weight="fill" aria-hidden="true" /> : <Pause size={18} weight="fill" aria-hidden="true" />}
            <span aria-hidden="true">{paused ? "reproduzir" : "pausar"}</span>
          </button>
        )}
      </div>
      <figcaption>Em movimento, sem som. O mesmo conteúdo está no texto abaixo.</figcaption>
    </figure>
  );
}

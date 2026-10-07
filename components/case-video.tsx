"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { PauseIcon as Pause, PlayIcon as Play } from "@phosphor-icons/react";

/* Video curto do estudo de caso. Regras (auditoria 2026-10):
   - sem som, em loop, com poster, `preload="none"`;
   - o poster e uma <picture> embaixo do video, e nao o atributo `poster`:
     abaixo de 820px o video nem aparece, e a <source> troca a imagem por um
     pixel embutido, entao nada e baixado; no desktop ela e lazy e chega sem
     esperar o JS;
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
// GIF transparente de 1px: a <source> do celular aponta para ele, sem rede.
const EMPTY_PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

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
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setVisible(false);
          return;
        }
        // O arquivo so e pedido na primeira vez que o video chega perto da
        // tela; com reduced-motion fica so o poster.
        if (reduced) return;
        if (!video.getAttribute("src")) {
          video.src = src;
          setLoaded(true);
        }
        setVisible(true);
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
    <figure className="case-video">
      <div className="case-video-frame">
        <picture>
          <source media="(max-width: 820px)" srcSet={EMPTY_PIXEL} />
          <img className="case-video-poster" src={poster} alt="" width={1280} height={720} decoding="async" loading="lazy" />
        </picture>
        <video
          ref={videoRef}
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
      <figcaption>Em movimento, sem som: o mesmo caminho do texto acima, em 12 segundos.</figcaption>
    </figure>
  );
}

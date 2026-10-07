"use client";

import dynamic from "next/dynamic";

/* O video so baixa o proprio JS depois da hidratacao: no HTML estatico fica
   o poster, e o componente com o player chega sozinho, fora do caminho do
   primeiro desenho (Lighthouse desktop do estudo de caso: 98 -> 99). */
const Player = dynamic(() => import("@/components/case-video").then((mod) => mod.CaseVideo), {
  ssr: false,
  // Reserva a altura do quadro, para o texto de baixo nao pular quando ele chega.
  loading: () => <div className="case-video-placeholder" aria-hidden="true" />,
});

export function CaseVideoLazy(props: { src: string; poster: string; label: string }) {
  return <Player {...props} />;
}

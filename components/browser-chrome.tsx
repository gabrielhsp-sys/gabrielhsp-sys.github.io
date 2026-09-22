"use client";

import { useEffect, useRef } from "react";

/* Cursor piscando no titulo da aba quando ela perde o foco.

   O icone por rota NAO mora mais aqui. Ele e declarado pelo proprio Next,
   com `app/icon.svg` na raiz e `app/archive/icon.svg` e `app/area/icon.svg`
   nas rotas de acervo. Trocar o favicon por DOM removia do <head> as tags
   <link rel="icon"> que o React renderiza; na navegacao seguinte o React
   tentava desmontar um no que ja nao tinha pai e estourava
   "Cannot read properties of null (reading 'removeChild')" no meio da
   transicao de rota. */

export function BrowserChrome() {
  const baseTitle = useRef<string>("");

  useEffect(() => {
    let timer = 0;
    let on = true;

    const stop = () => {
      window.clearInterval(timer);
      timer = 0;
      if (baseTitle.current) document.title = baseTitle.current;
    };

    const onVisibility = () => {
      if (!document.hidden) {
        stop();
        return;
      }
      baseTitle.current = document.title;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.title = `▊ ${baseTitle.current}`;
      if (reduced) return;
      timer = window.setInterval(() => {
        on = !on;
        document.title = `${on ? "▊" : " "} ${baseTitle.current}`;
      }, 620);
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, []);

  return null;
}

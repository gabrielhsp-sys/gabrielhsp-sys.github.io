"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/* Favicon dinamico e cursor piscando no titulo da aba.
   O favicon de terminal e o mesmo pixel art do portfolio de 2025. */

const TERMINAL_ICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">` +
      `<rect width="16" height="16" fill="#0c0b0a"/>` +
      `<rect x="2" y="3" width="12" height="9" fill="#e9e0ca"/>` +
      `<rect x="3" y="4" width="10" height="7" fill="#0c0b0a"/>` +
      `<rect x="4" y="6" width="2" height="1" fill="#f0ab3c"/>` +
      `<rect x="6" y="7" width="2" height="1" fill="#f0ab3c"/>` +
      `<rect x="4" y="8" width="2" height="1" fill="#f0ab3c"/>` +
      `<rect x="9" y="8" width="3" height="1" fill="#f0ab3c"/>` +
      `<rect x="6" y="12" width="4" height="2" fill="#e9e0ca"/>` +
    `</svg>`,
  );

const ARCHIVE_ICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">` +
      `<rect width="16" height="16" fill="#0c0b0a"/>` +
      `<rect x="2" y="3" width="12" height="3" fill="#e9e0ca"/>` +
      `<rect x="3" y="6" width="10" height="7" fill="#f0ab3c"/>` +
      `<rect x="4" y="7" width="8" height="5" fill="#0c0b0a"/>` +
      `<rect x="6" y="9" width="4" height="1" fill="#e9e0ca"/>` +
    `</svg>`,
  );

export function BrowserChrome() {
  const pathname = usePathname();
  const baseTitle = useRef<string>("");

  useEffect(() => {
    const icon = pathname.startsWith("/archive") || pathname.startsWith("/area")
      ? ARCHIVE_ICON
      : TERMINAL_ICON;

    document.querySelectorAll('link[rel~="icon"]').forEach((node) => node.remove());
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.href = icon;
    document.head.appendChild(link);
  }, [pathname]);

  /* Cursor piscando no titulo quando a aba perde o foco. Com reduced-motion o
     cursor fica parado em vez de piscar. */
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
        document.title = `${on ? "▊" : " "} ${baseTitle.current}`;
      }, 620);
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [pathname]);

  return null;
}

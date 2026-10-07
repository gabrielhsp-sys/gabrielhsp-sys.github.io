import localFont from "next/font/local";

/* As fontes saem dos arquivos que o fontsource ja instala, pelo next/font: o
   Next faz o preload da face do texto principal (o h1 do hero e o LCP) e gera
   um fallback com metrica ajustada, para a troca de fonte nao empurrar o texto.
   So o subconjunto latino entra: ele cobre o portugues, as aspas, os tracos e
   as setas usadas no site (conferido em content/, app/ e components/). */

export const display = localFont({
  src: "../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2",
  weight: "200 800",
  variable: "--font-display",
  display: "swap",
  fallback: ["sans-serif"],
});

export const mono = localFont({
  src: [
    { path: "../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2", weight: "400" },
    { path: "../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2", weight: "600" },
  ],
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
  // Fallback com metrica so faz sentido para a face proporcional; a mono cai
  // na mono do sistema, que ja tem a mesma largura de caractere.
  adjustFontFallback: false,
});

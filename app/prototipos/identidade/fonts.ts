import localFont from "next/font/local";

/* Fontes das direcoes novas, so nesta rota. Arquivos OFL copiados para esta
   pasta com a licenca ao lado; nenhuma dependencia nova. A direcao "Bancada"
   usa as fontes do site (app/fonts.ts). */

const folhaSans = localFont({
  src: [
    { path: "./fonts/InstrumentSans-Regular.ttf", weight: "400" },
    { path: "./fonts/InstrumentSans-Bold.ttf", weight: "700" },
  ],
  variable: "--folha-sans",
  display: "swap",
  preload: false,
});
const folhaMono = localFont({ src: "./fonts/RedHatMono-Regular.ttf", weight: "400", variable: "--folha-mono", display: "swap", preload: false });
const etiquetaDisplay = localFont({ src: "./fonts/BigShoulders-Bold.ttf", weight: "700", variable: "--etiqueta-display", display: "swap", preload: false });
const etiquetaMono = localFont({ src: "./fonts/DMMono-Regular.ttf", weight: "400", variable: "--etiqueta-mono", display: "swap", preload: false });

export const bancadaFonts = "";
export const folhaFonts = `${folhaSans.variable} ${folhaMono.variable}`;
// O corpo da Etiqueta e a mesma Instrument Sans da Folha: a diferenca entre as
// duas mora na display, na cor e na estrutura, nao no texto corrido.
export const etiquetaFonts = `${etiquetaDisplay.variable} ${etiquetaMono.variable}`;

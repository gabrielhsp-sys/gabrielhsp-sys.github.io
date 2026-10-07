import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { ImageResponse } from "next/og.js";
// Os dois modulos nao importam nada: o Node le o TypeScript direto.
import { formatPeriod } from "../lib/period.ts";
import { areaLabels, statusLabels } from "../lib/site.ts";

/* Cartoes de compartilhamento (1200 x 630), desenhados com o sistema visual do
   site: um para o site (public/og.png) e um por projeto (public/og/<id>.png).
   PNG explicito porque o GitHub Pages serve arquivo sem extensao como
   application/octet-stream (ADR-008). So texto que o proprio site ja afirma. */

const root = process.cwd();
const ink = "#0c0b0a";
const paper = "#e9e0ca";
const paperDim = "#b8b09f";
const paperFaint = "#9b9487";
const line = "#39342d";
const amber = "#f0ab3c";
const mint = "#72c9a7";
const areaColor = { software: amber, web: "#e76b91", academico: "#a291c6" };
const statusColor = { building: amber, live: mint, done: "#78a9d4", archived: "#a291c6" };
const host = "gabrielhsp-sys.github.io";

// satori conta um array vazio de filhos como varios nos: nenhum filho vira
// undefined, um filho vira o proprio filho, mais de um vira o array.
const h = (type, props, ...children) => {
  const flat = children.flat().filter((child) => child !== null && child !== false);
  const value = flat.length === 0 ? undefined : flat.length === 1 ? flat[0] : flat;
  return { type, props: { ...props, children: value } };
};

const read = (...parts) => fs.readFileSync(path.join(root, ...parts));
// Bricolage em TTF (OFL, scripts/og-fonts): o satori nao le woff2, que e o
// unico formato do pacote variavel usado pelo site.
const fonts = [
  { name: "Bricolage", data: read("scripts/og-fonts/BricolageGrotesque-Bold.ttf"), weight: 700, style: "normal" },
  { name: "Bricolage", data: read("scripts/og-fonts/BricolageGrotesque-Regular.ttf"), weight: 400, style: "normal" },
  { name: "Plex", data: read("node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff"), weight: 400, style: "normal" },
  { name: "Plex", data: read("node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff"), weight: 600, style: "normal" },
];

// O trilho do site, com o monograma G:S no topo.
const rail = h(
  "div",
  {
    style: {
      width: 88,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: 30,
      background: "#0a0908",
      borderRight: `1px solid ${line}`,
    },
  },
  h(
    "div",
    {
      style: {
        width: 46,
        height: 46,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        border: `1px solid ${paperFaint}`,
        borderRadius: "7px 7px 3px 3px",
        color: paper,
        fontFamily: "Plex",
        fontSize: 13,
        fontWeight: 600,
      },
    },
    h("span", {}, "G"),
    h("div", { style: { width: 4, height: 26, display: "flex", flexDirection: "column", justifyContent: "space-between" } },
      [0, 1, 2, 3, 4].map((dot) => h("div", { key: dot, style: { width: 4, height: 3, background: amber } }))),
    h("span", {}, "S"),
  ),
);

const mono = (text, style = {}) =>
  h("div", { style: { display: "flex", fontFamily: "Plex", fontSize: 19, letterSpacing: "0.05em", color: paperFaint, ...style } }, text);

const footer = (left) =>
  h(
    "div",
    { style: { display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${line}`, paddingTop: 26 } },
    mono(left, { fontSize: 17, whiteSpace: "nowrap" }),
    h("div", { style: { display: "flex", fontFamily: "Plex", fontSize: 19, color: paperDim } },
      h("span", {}, "GABRIEL"), h("span", { style: { color: amber } }, ".SYS"), h("span", { style: { color: paperFaint, marginLeft: 16 } }, host)),
  );

const card = (body) =>
  h(
    "div",
    { style: { width: "100%", height: "100%", display: "flex", background: ink, color: paper, fontFamily: "Bricolage" } },
    rail,
    h("div", { style: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px 52px" } }, ...body),
  );

const siteCard = card([
  h(
    "div",
    { style: { display: "flex", flexDirection: "column" } },
    h("div", { style: { display: "flex", alignItems: "center", gap: 14 } },
      h("div", { style: { width: 10, height: 10, borderRadius: 10, background: mint } }),
      mono("DISPONÍVEL PARA ESTÁGIO", { color: mint, fontWeight: 600, whiteSpace: "nowrap" }),
      mono("/  GABRIEL HENRIQUE · UNIFAL-MG", { whiteSpace: "nowrap" })),
    h("div", { style: { display: "flex", flexDirection: "column", marginTop: 40, fontSize: 88, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.035em" } },
      h("span", {}, "Eu construo software"),
      // Ambar e acao no sistema (ADR-018): a tese fica toda em marfim.
      h("span", {}, "que fica de pé sozinho.")),
    h("div", { style: { display: "flex", marginTop: 34, maxWidth: 900, fontSize: 30, lineHeight: 1.35, color: paperDim } },
      "Serviços em Python, sistemas em Java com arquitetura e teste, interfaces web estáticas e acessíveis."),
  ),
  footer("PORTFÓLIO · PROJETOS E ESTUDOS DE CASO"),
]);

const projectCard = (item) => {
  const title = item.title;
  const size = title.length > 46 ? 64 : title.length > 26 ? 78 : 96;
  return card([
    h(
      "div",
      { style: { display: "flex", flexDirection: "column" } },
      h("div", { style: { display: "flex", alignItems: "center", gap: 30 } },
        h("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
          h("div", { style: { width: 12, height: 12, background: areaColor[item.area] } }),
          mono(areaLabels[item.area], { color: paperDim })),
        h("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
          h("div", { style: { width: 10, height: 10, borderRadius: 10, background: statusColor[item.status] } }),
          mono(statusLabels[item.status], { color: statusColor[item.status], fontWeight: 600 })),
        mono(formatPeriod(String(item.startedAt), item.endedAt ? String(item.endedAt) : undefined))),
      h("div", { style: { display: "flex", marginTop: 38, maxWidth: 960, fontSize: size, fontWeight: 700, lineHeight: 1.02, letterSpacing: "-0.035em" } }, title),
      h("div", { style: { display: "flex", marginTop: 30, maxWidth: 940, fontSize: 30, lineHeight: 1.38, color: paperDim } }, item.summary),
    ),
    // Filete de 3px na cor da area, como no topo do estudo de caso.
    h("div", { style: { display: "flex", flexDirection: "column", gap: 26 } },
      h("div", { style: { width: 120, height: 3, background: areaColor[item.area] } }),
      footer(item.featured ? "ESTUDO DE CASO · GABRIEL HENRIQUE" : "PROJETO · GABRIEL HENRIQUE")),
  ]);
};

const render = async (tree, file) => {
  const image = new ImageResponse(tree, { width: 1200, height: 630, fonts });
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(await image.arrayBuffer()));
};

await render(siteCard, path.join(root, "public/og.png"));

const contentDir = path.join(root, "content/public");
const ogDir = path.join(root, "public/og");
fs.rmSync(ogDir, { recursive: true, force: true });
const items = fs
  .readdirSync(contentDir)
  .filter((name) => /\.mdx?$/.test(name))
  .map((name) => matter(fs.readFileSync(path.join(contentDir, name), "utf8")).data);
for (const item of items) await render(projectCard(item), path.join(ogDir, `${item.id}.png`));

console.log(`og-image: public/og.png + ${items.length} em public/og/`);

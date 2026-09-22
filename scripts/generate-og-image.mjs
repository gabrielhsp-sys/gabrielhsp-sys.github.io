import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og.js";

const root = process.cwd();
const output = path.join(root, "public/og.png");

const ink = "#0c0b0a";
const paper = "#e9e0ca";
const paperDim = "#b8b09f";
const paperFaint = "#9b9487";
const line = "#39342d";
const amber = "#f0ab3c";

const areas = ["Software & Automação", "Web & Interfaces", "Acadêmico"];
const description =
  "Projetos, estudos, homelab, hardware e registros de Gabriel Henrique — organizados como um arquivo vivo.";
const host = "gabrielhsp-sys.github.io";

// satori counts an empty children array as several child nodes, so normalize:
// no children -> undefined, one child -> the child itself, otherwise the array.
const h = (type, props, ...children) => {
  const flat = children.flat();
  const value = flat.length === 0 ? undefined : flat.length === 1 ? flat[0] : flat;
  return { type, props: { ...props, children: value } };
};

const font = (weight) =>
  fs.readFileSync(
    path.join(
      root,
      "node_modules/@fontsource/ibm-plex-mono/files",
      `ibm-plex-mono-latin-${weight}-normal.woff`,
    ),
  );

const rail = h(
  "div",
  {
    style: {
      width: 88,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: 34,
      gap: 10,
      background: "#0a0908",
      borderRight: `1px solid ${line}`,
    },
  },
  [0, 1, 2, 3, 4, 5].map((slot) =>
    h("div", { key: slot, style: { width: 22, height: 4, background: slot === 0 ? amber : line } }),
  ),
);

const body = h(
  "div",
  {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "0 78px",
    },
  },
  h(
    "div",
    { style: { display: "flex", fontSize: 18, color: paperFaint, letterSpacing: "0.06em", whiteSpace: "nowrap" } },
    `PROJETOS · ${areas.join("  ·  ")}`,
  ),
  h(
    "div",
    { style: { display: "flex", marginTop: 34, fontSize: 96, fontWeight: 600, letterSpacing: "-0.01em" } },
    h("span", {}, "GABRIEL"),
    h("span", { style: { color: amber } }, ".SYS"),
  ),
  h(
    "div",
    { style: { display: "flex", marginTop: 30, maxWidth: 830, fontSize: 28, lineHeight: 1.45, color: paperDim } },
    description,
  ),
  h(
    "div",
    { style: { display: "flex", alignItems: "center", gap: 26, marginTop: 52 } },
    h(
      "div",
      { style: { display: "flex" } },
      [0, 1, 2, 3, 4, 5, 6, 7, 8].map((dash) =>
        h("div", { key: dash, style: { width: 12, height: 8, marginRight: 6, background: amber } }),
      ),
    ),
    h("div", { style: { display: "flex", fontSize: 21, color: paperFaint } }, host),
  ),
);

const image = new ImageResponse(
  h("div", { style: { width: "100%", height: "100%", display: "flex", background: ink, color: paper } }, rail, body),
  {
    width: 1200,
    height: 630,
    fonts: [
      { name: "IBM Plex Mono", data: font(400), weight: 400, style: "normal" },
      { name: "IBM Plex Mono", data: font(600), weight: 600, style: "normal" },
    ],
  },
);

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, Buffer.from(await image.arrayBuffer()));
console.log(`og-image: public/og.png 1200x630`);

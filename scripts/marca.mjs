// Deriva os arquivos da marca a partir de assets-src/marca/logo.png (2048 x 2048,
// fundo escuro com grade). O original não é versionado; os derivados são:
//   public/marca/simbolo.png           símbolo (janela de terminal), fundo transparente
//   public/marca/logo-horizontal.png   símbolo + GABRIEL.SYS lado a lado (cabeçalho)
//   public/marca/logo-vertical.png     símbolo em cima, nome embaixo (cartão de compartilhamento)
//   app/icon.png, app/apple-icon.png   favicon: SÓ o símbolo
// Rodar à mão quando o logo mudar: `npm run marca`.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const source = path.join(root, "assets-src/marca/logo.png");
if (!fs.existsSync(source)) {
  console.error("marca: assets-src/marca/logo.png não existe; a marca atual fica como está.");
  process.exit(1);
}

// Recortes no original (px), medidos sobre o arquivo de 2048 px. Ficam por dentro
// das cotas e das linhas da grade do desenho.
const BOX = {
  simbolo: { left: 822, top: 683, width: 404, height: 347 },
  nome: { left: 280, top: 1155, width: 1495, height: 213 },
};

// Fundo escuro e grade viram transparência: alfa pela luminância máxima do pixel.
// Abaixo de 70 (a grade fica em ~40–55) some; acima de 130, opaco.
async function transparent(box) {
  const { data, info } = await sharp(source).extract(box).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    data[i + 3] = Math.round(Math.min(1, Math.max(0, (max - 70) / 60)) * 255);
  }
  return sharp(data, { raw: info }).trim({ threshold: 1 }).png().toBuffer();
}

const simbolo = await transparent(BOX.simbolo);
const nome = await transparent(BOX.nome);
const sm = await sharp(simbolo).metadata();
const nm = await sharp(nome).metadata();

const outDir = path.join(root, "public/marca");
fs.mkdirSync(outDir, { recursive: true });
const blank = (width, height) =>
  sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } });

// Horizontal: o símbolo com 1,2x a altura do nome, um respiro de meio nome entre os dois.
{
  const symH = Math.round(nm.height * 1.2);
  const sym = await sharp(simbolo).resize({ height: symH }).toBuffer();
  const symW = (await sharp(sym).metadata()).width;
  const gap = Math.round(nm.height * 0.55);
  const width = symW + gap + nm.width;
  const height = symH;
  const lockup = await blank(width, height)
    .composite([
      { input: sym, left: 0, top: 0 },
      { input: nome, left: symW + gap, top: Math.round((height - nm.height) / 2) },
    ])
    .png()
    .toBuffer();
  // 2x de 40 px de altura no cabeçalho.
  await sharp(lockup).resize({ height: 80 }).png({ compressionLevel: 9 }).toFile(path.join(outDir, "logo-horizontal.png"));
}

// Vertical, para o cartão de compartilhamento.
{
  const width = nm.width;
  const gap = Math.round(nm.height * 0.7);
  const height = sm.height + gap + nm.height;
  // O sharp redimensiona antes de compor: montar primeiro, reduzir depois.
  const stacked = await blank(width, height)
    .composite([
      { input: simbolo, left: Math.round((width - sm.width) / 2), top: 0 },
      { input: nome, left: 0, top: sm.height + gap },
    ])
    .png()
    .toBuffer();
  await sharp(stacked)
    .resize({ width: 640 })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, "logo-vertical.png"));
}

await sharp(simbolo).resize({ width: 256 }).png({ compressionLevel: 9 }).toFile(path.join(outDir, "simbolo.png"));

// Favicon: o símbolo num quadrado preto quente, com margem, legível a 16 px.
const square = async (size, pad) => {
  const inner = size - pad * 2;
  const sym = await sharp(simbolo).resize({ width: inner, height: inner, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: "#0c0b0a" } })
    .composite([{ input: sym, left: pad, top: pad }])
    .png({ compressionLevel: 9 });
};
await (await square(96, 10)).toFile(path.join(root, "app/icon.png"));
await (await square(180, 22)).toFile(path.join(root, "app/apple-icon.png"));

console.log("marca: public/marca/{simbolo,logo-horizontal,logo-vertical}.png, app/icon.png, app/apple-icon.png");

// Versão para fundo claro: o mesmo logo horizontal, só o nome em tinta.
const { marcaClaro } = await import("./marca-claro.mjs");
await marcaClaro();

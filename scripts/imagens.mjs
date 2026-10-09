// Imagem de fundo da home: AVIF + WebP em quatro larguras para o srcset.
// Uso: npm run imagens            (gera public/home/ e lib/hero-image.json)
//      npm run imagens -- --comparar   (tambem salva as comparacoes no escuro)
//
// A fonte ja vem ampliada (Real-ESRGAN, 3840 px): aqui so reduz e codifica.
// O criterio de qualidade e nao ter bloco nem faixa no escuro com zoom de 100%;
// as comparacoes ficam em docs/design/home-imagem/.
// O sharp vem com o Next (dependencia opcional dele); nada foi instalado.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "assets-src/imagens/hero-bancada.png";
const OUT = "public/home";
const MANIFEST = "lib/hero-image.json";
const DOCS = "docs/design/home-imagem";
const WIDTHS = [1280, 1920, 2560, 3840];
// Retrato (celular em pe): so a faixa do notebook (x 1805-2842 na fonte), com
// folga. Em pe a imagem cobre pela altura e so essa faixa aparece; mandar a
// cena inteira seria pagar por pixel escondido.
const PORTRAIT = { left: 1773, top: 0, width: 1100, height: 2143 };
const PORTRAIT_WIDTHS = [550, 825, 1100];
// Qualidade escolhida pelas comparacoes (docs/design/home-imagem/README.md).
const AVIF = { quality: 88, effort: 5, chromaSubsampling: "4:4:4" };
const WEBP = { quality: 95, effort: 6, smartSubsample: true, preset: "photo" };

if (!fs.existsSync(SRC)) {
  console.error(`imagens: falta ${SRC} (a imagem ampliada da bancada).`);
  process.exit(1);
}

const meta = await sharp(SRC).metadata();
fs.mkdirSync(OUT, { recursive: true });
const variants = [];
for (const width of WIDTHS) {
  const height = Math.round((width * meta.height) / meta.width);
  const base = sharp(SRC).resize({ width, kernel: "lanczos3" });
  const avif = await base.clone().avif(AVIF).toFile(path.join(OUT, `bancada-${width}.avif`));
  const webp = await base.clone().webp(WEBP).toFile(path.join(OUT, `bancada-${width}.webp`));
  variants.push({ width, height, avif: avif.size, webp: webp.size });
  console.log(`bancada-${width}: ${width}x${height}  avif ${(avif.size / 1024).toFixed(0)} KB  webp ${(webp.size / 1024).toFixed(0)} KB`);
}
const portrait = [];
for (const width of PORTRAIT_WIDTHS) {
  const height = Math.round((width * PORTRAIT.height) / PORTRAIT.width);
  const base = sharp(SRC).extract(PORTRAIT).resize({ width, kernel: "lanczos3" });
  const avif = await base.clone().avif(AVIF).toFile(path.join(OUT, `bancada-retrato-${width}.avif`));
  const webp = await base.clone().webp(WEBP).toFile(path.join(OUT, `bancada-retrato-${width}.webp`));
  portrait.push({ width, height, avif: avif.size, webp: webp.size });
  console.log(`bancada-retrato-${width}: ${width}x${height}  avif ${(avif.size / 1024).toFixed(0)} KB  webp ${(webp.size / 1024).toFixed(0)} KB`);
}
fs.writeFileSync(MANIFEST, JSON.stringify({ width: meta.width, height: meta.height, variants, portrait }, null, 2) + "\n");

if (process.argv.includes("--comparar")) {
  // Recortes escuros da variante de 1920: referencia sem perda, AVIF e WebP.
  // Ampliados 2x por vizinho mais proximo e com os escuros esticados 4x, o que
  // deixa bloco e faixa visiveis bem antes de o olho achar na tela.
  fs.mkdirSync(DOCS, { recursive: true });
  const width = 1920;
  const ref = await sharp(SRC).resize({ width, kernel: "lanczos3" }).png().toBuffer();
  const files = { referencia: ref, avif: fs.readFileSync(path.join(OUT, `bancada-${width}.avif`)), webp: fs.readFileSync(path.join(OUT, `bancada-${width}.webp`)) };
  const crops = {
    estante: { left: 1560, top: 120, width: 300, height: 260 },
    bancada: { left: 40, top: 780, width: 300, height: 260 },
    parede: { left: 820, top: 300, width: 300, height: 260 },
  };
  const lines = [`Variante ${width} px. Erro medio e maximo por canal (0-255) nos pixels com luma < 40, contra a referencia sem perda.`, ""];
  const refRaw = await sharp(ref).raw().toBuffer({ resolveWithObject: true });
  for (const [name, buf] of Object.entries(files)) {
    if (name === "referencia") continue;
    const raw = await sharp(buf).removeAlpha().raw().toBuffer();
    let n = 0, err = 0, max = 0;
    const d = refRaw.data, c = refRaw.info.channels;
    for (let i = 0; i < d.length; i += c) {
      if (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2] >= 40) continue;
      for (let k = 0; k < 3; k++) { const e = Math.abs(d[i + k] - raw[(i / c) * 3 + k]); err += e; if (e > max) max = e; }
      n += 3;
    }
    lines.push(`${name}: erro medio ${(err / n).toFixed(2)}, maximo ${max}`);
  }
  for (const [crop, area] of Object.entries(crops)) {
    const W = area.width * 2, H = area.height * 2;
    const tiles = [];
    for (const buf of Object.values(files)) {
      tiles.push(await sharp(buf).extract(area).linear(4, 0).resize({ width: W, kernel: "nearest" }).png().toBuffer());
    }
    await sharp({ create: { width: W * 3 + 20, height: H, channels: 3, background: "#ffffff" } })
      .composite(tiles.map((input, i) => ({ input, left: i * (W + 10), top: 0 })))
      .jpeg({ quality: 92 })
      .toFile(path.join(DOCS, `comparacao-${crop}.jpg`));
  }
  fs.writeFileSync(path.join(DOCS, "erro-no-escuro.txt"), lines.join("\n") + "\n");
  console.log(lines.join("\n"));
}

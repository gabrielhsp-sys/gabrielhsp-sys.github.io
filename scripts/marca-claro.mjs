// Logo para fundo claro (tema claro, 2026-11-20). Mesmo desenho do
// public/marca/logo-horizontal.png: só a cor do texto "GABRIEL" muda, de marfim
// para a tinta do tema claro. O símbolo e o ".SYS" (âmbar) ficam iguais.
// Regra por pixel: cor sem saturação (o marfim/cinza do nome) vira tinta; a
// transparência de cada pixel é preservada, então a borda suavizada continua igual.
// Uso: node scripts/marca-claro.mjs (também roda no fim de `npm run marca`).
import path from "node:path";
import sharp from "sharp";

const TINTA = [0x1d, 0x1a, 0x16]; // --paper do tema claro (app/cliente.css)
const dir = path.join(process.cwd(), "public/marca");

export async function marcaClaro() {
  const src = path.join(dir, "logo-horizontal.png");
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let trocados = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    if (max - min > 48) continue; // âmbar: fica
    [data[i], data[i + 1], data[i + 2]] = TINTA;
    trocados += 1;
  }
  // Paleta de 64 cores: o logo tem tres cores e a borda suavizada; o arquivo cai
  // de ~24 KB para poucos KB, e ele e baixado em toda pagina (preload no cabecalho).
  await sharp(data, { raw: info }).png({ compressionLevel: 9, palette: true, colors: 64 }).toFile(path.join(dir, "logo-horizontal-claro.png"));
  console.log(`marca-claro: ${trocados} pixels do nome trocados para a tinta; ${info.width}x${info.height}`);
}

if (import.meta.url === `file://${process.argv[1]}`) await marcaClaro();

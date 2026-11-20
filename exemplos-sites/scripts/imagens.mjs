// Baixa as fotos listadas em scripts/fotos.json, otimiza (AVIF + WebP em larguras responsivas,
// sem metadados), grava em public/img/ e gera src/data/imagens.json e CREDITOS.md.
//
// Uso: npm run imagens
//
// Fonte de cada foto: o link "Download" da página pública da foto no Unsplash
// (https://unsplash.com/photos/<id>/download). O redirecionamento termina em images.unsplash.com
// com dl=<autor>-<id>-unsplash.jpg; o script exige que o id esteja nesse nome, o que amarra o
// arquivo à página creditada.
//
// "og": true gera também o cartão de compartilhamento (JPEG 1200×630) de uma foto que não é
// hero de nicho mas serve de hero a um lead.
//
// Foto própria de um lead: entrada com "arquivoLocal" (caminho relativo à raiz) e "credito"
// (texto livre, por exemplo "Foto cedida por Padaria X em 2026-11-20"). Não baixa nada.
//
// sharp vem como dependência opcional do astro (pipeline de imagem do próprio Astro).
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const RAIZ = new URL('..', import.meta.url).pathname;
const CACHE = join(RAIZ, '.cache/fotos');
const SAIDA = join(RAIZ, 'public/img');
const LARGURAS = [480, 960, 1440];
const LICENCA = 'Unsplash License (https://unsplash.com/license): uso comercial gratuito, sem atribuição obrigatória; não cobre marcas nem pessoas reconhecíveis em uso que sugira endosso.';

const existe = (p) => access(p).then(() => true, () => false);

async function original(foto) {
  if (foto.arquivoLocal) {
    return { caminho: join(RAIZ, foto.arquivoLocal), dl: null, baixadoEm: null };
  }
  const caminho = join(CACHE, `${foto.id}.jpg`);
  const meta = join(CACHE, `${foto.id}.json`);
  if (await existe(caminho) && await existe(meta)) {
    return { caminho, ...JSON.parse(await readFile(meta, 'utf8')) };
  }
  const resp = await fetch(`https://unsplash.com/photos/${foto.id}/download?force=true&w=2000`);
  if (!resp.ok) throw new Error(`${foto.chave}: HTTP ${resp.status}`);
  const final = new URL(resp.url);
  const dl = final.searchParams.get('dl') ?? '';
  if (final.host !== 'images.unsplash.com' || !dl.includes(foto.id)) {
    throw new Error(`${foto.chave}: download não amarrado à página (${resp.url}). Licença sem prova: parar.`);
  }
  await mkdir(CACHE, { recursive: true });
  await writeFile(caminho, Buffer.from(await resp.arrayBuffer()));
  const info = { dl, baixadoEm: new Date().toISOString().slice(0, 10) };
  await writeFile(meta, JSON.stringify(info));
  return { caminho, ...info };
}

async function main() {
  const fotos = JSON.parse(await readFile(join(RAIZ, 'scripts/fotos.json'), 'utf8'));
  const chaves = new Set();
  const indice = {};
  const linhas = [];

  // Este script não apaga nada (regra do projeto: só dist/ e node_modules/ são descartáveis).
  // Arquivo que sobrar em public/img sem crédito é pego por `npm run verificar:creditos`.

  for (const foto of fotos) {
    if (chaves.has(foto.chave)) throw new Error(`chave repetida: ${foto.chave}`);
    chaves.add(foto.chave);
    const { caminho, dl, baixadoEm } = await original(foto);
    const img = sharp(caminho).rotate();
    const { width, height } = await img.metadata();
    const larguras = LARGURAS.filter((w) => w <= width);
    if (larguras.length === 0) larguras.push(width);
    const arquivos = [];
    for (const w of larguras) {
      const base = join(SAIDA, `${foto.chave}-${w}`);
      await mkdir(dirname(base), { recursive: true });
      await sharp(caminho).rotate().resize({ width: w }).avif({ quality: 50, effort: 4 }).toFile(`${base}.avif`);
      await sharp(caminho).rotate().resize({ width: w }).webp({ quality: 72 }).toFile(`${base}.webp`);
      arquivos.push(`img/${foto.chave}-${w}.avif`, `img/${foto.chave}-${w}.webp`);
    }
    // Cartão de compartilhamento (D-125): JPEG 1200×630 a partir da foto do hero de cada nicho.
    if (foto.chave.endsWith('/hero') || foto.og) {
      const nome = foto.chave.replace(/\/hero$/, '').replaceAll('/', '-');
      const og = join(SAIDA, 'og', `${nome}.jpg`);
      await mkdir(dirname(og), { recursive: true });
      await sharp(caminho).rotate().resize({ width: 1200, height: 630, fit: 'cover' }).jpeg({ quality: 78, mozjpeg: true }).toFile(og);
      arquivos.push(`img/og/${nome}.jpg`);
    }
    indice[foto.chave] = {
      alt: foto.alt,
      larguras,
      proporcao: +(width / height).toFixed(4),
    };
    linhas.push({ foto, dl, baixadoEm, arquivos });
    console.log(`ok ${foto.chave} (${larguras.join('/')}) ${dl ?? foto.credito}`);
  }

  await writeFile(join(RAIZ, 'src/data/imagens.json'), JSON.stringify(indice, null, 2) + '\n');

  const md = [
    '# Créditos das imagens',
    '',
    'Gerado por `npm run imagens` a partir de `scripts/fotos.json`. Não editar à mão.',
    '',
    `Licença de todas as fotos do Unsplash: ${LICENCA}`,
    '',
    'Cada foto foi baixada pelo link "Download" da própria página; o nome do arquivo devolvido',
    '(`dl=`) contém o id da página, o que prova que o arquivo é daquela página. Os arquivos em',
    '`public/img/` são derivados (redimensionados, AVIF/WebP, sem metadados).',
    '',
    '| Chave | Página de origem | Autor | Licença | Baixada em | Arquivo original | Arquivos em public/ |',
    '|---|---|---|---|---|---|---|',
    ...linhas.map(({ foto, dl, baixadoEm, arquivos }) => {
      const pagina = foto.arquivoLocal ? foto.credito : `https://unsplash.com/photos/${foto.id}`;
      const licenca = foto.arquivoLocal ? 'cedida pelo negócio (ver crédito)' : 'Unsplash License';
      return `| ${foto.chave} | ${pagina} | ${foto.autor ?? '-'} | ${licenca} | ${baixadoEm ?? '-'} | ${dl ?? foto.arquivoLocal} | ${arquivos.map((a) => '`' + a + '`').join(' ')} |`;
    }),
    '',
  ].join('\n');
  await writeFile(join(RAIZ, 'CREDITOS.md'), md);
  console.log(`${fotos.length} fotos, CREDITOS.md e src/data/imagens.json gravados.`);
}

main().catch((erro) => {
  console.error(erro.message);
  process.exit(1);
});

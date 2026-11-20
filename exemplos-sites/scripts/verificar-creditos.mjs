// Prova que CREDITOS.md cobre 100% das imagens em public/ (alegação A6 de docs/PLANO.md).
// Cada arquivo de imagem em public/ precisa aparecer, com o caminho exato, numa linha de
// CREDITOS.md que tenha página de origem e licença. Sai com 1 se faltar algum.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname;
const PUBLICO = join(RAIZ, 'public');
const EXT = /\.(avif|webp|jpe?g|png|gif|svg)$/i;

async function listar(dir) {
  const itens = await readdir(dir, { withFileTypes: true });
  const saida = [];
  for (const item of itens) {
    const caminho = join(dir, item.name);
    if (item.isDirectory()) saida.push(...(await listar(caminho)));
    else if (EXT.test(item.name)) saida.push(relative(PUBLICO, caminho));
  }
  return saida;
}

const creditos = await readFile(join(RAIZ, 'CREDITOS.md'), 'utf8');
const linhas = creditos.split('\n').filter((l) => l.startsWith('| ') && !l.startsWith('| Chave') && !l.startsWith('|---'));
const imagens = await listar(PUBLICO);
const faltando = [];
const semLicenca = [];

for (const img of imagens) {
  const linha = linhas.find((l) => l.includes('`' + img + '`'));
  if (!linha) faltando.push(img);
  else if (!/https:\/\/unsplash\.com\/photos\/|cedida/.test(linha) || !/License|cedida/.test(linha)) semLicenca.push(img);
}

console.log(`imagens em public/: ${imagens.length}`);
console.log(`cobertas por CREDITOS.md: ${imagens.length - faltando.length}`);
if (faltando.length) console.log('SEM CRÉDITO:\n  ' + faltando.join('\n  '));
if (semLicenca.length) console.log('SEM PÁGINA OU LICENÇA:\n  ' + semLicenca.join('\n  '));
const ok = imagens.length > 0 && faltando.length === 0 && semLicenca.length === 0;
console.log(ok ? 'PASS: 100% das imagens creditadas' : 'FALHOU');
process.exit(ok ? 0 : 1);

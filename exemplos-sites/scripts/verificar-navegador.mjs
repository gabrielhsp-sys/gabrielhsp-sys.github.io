// Prova as alegações A4 (sem rolagem horizontal em 320 px) e A7 (< 500 KB na primeira carga,
// sem as imagens abaixo da dobra) de docs/PLANO.md num Chromium headless real, sem pacote:
// fala com o navegador pelo Chrome DevTools Protocol usando o WebSocket nativo do Node 22.
//
// Navegador: variável CHROME, ou o chrome-headless-shell já presente no cache do Playwright
// (~/.cache/ms-playwright). Nada é instalado. Sem navegador: sai com código 2 (lacuna de
// validação, nunca aprovação).
//
// Uso: npm run verificar:navegador [-- --prints <pasta>] [-- --rota /alimentacao]
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, abrirNavegador, pausa } from './cdp.mjs';

const LIMITE_KB = 500;
const args = process.argv.slice(2);
const pastaPrints = args.includes('--prints') ? args[args.indexOf('--prints') + 1] : null;
const soRota = args.includes('--rota') ? args[args.indexOf('--rota') + 1] : null;

async function rotas() {
  const lista = [];
  async function andar(dir, prefixo) {
    for (const item of await readdir(dir, { withFileTypes: true })) {
      if (item.isDirectory() && !['img', '_astro'].includes(item.name)) await andar(join(dir, item.name), `${prefixo}${item.name}/`);
      else if (item.name === 'index.html') lista.push(prefixo === '' ? '/' : `/${prefixo.replace(/\/$/, '')}`);
    }
  }
  await andar(DIST, '');
  return lista.sort();
}


async function main() {
  if (!existsSync(DIST)) { console.log('Rode npm run build antes.'); process.exit(2); }
  const nav = await abrirNavegador();
  if (!nav) { console.log('LACUNA DE VALIDAÇÃO: nenhum Chromium encontrado ou não abriu (defina CHROME=/caminho).'); process.exit(2); }
  const { cdp, base } = nav;
  await cdp.enviar('Page.enable');
  await cdp.enviar('Network.enable');
  await cdp.enviar('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.enviar('Runtime.enable');
  await cdp.enviar('Page.addScriptToEvaluateOnNewDocument', { source: `window.__lcp = 0; window.__cls = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });` });

  const respostas = new Map();
  cdp.ouvintes.push((m) => {
    if (m.method === 'Network.responseReceived') respostas.set(m.params.requestId, { url: m.params.response.url, tipo: m.params.type, bytes: 0 });
    if (m.method === 'Network.loadingFinished' && respostas.has(m.params.requestId)) respostas.get(m.params.requestId).bytes = m.params.encodedDataLength;
    if (m.method === 'Runtime.exceptionThrown') erros.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') erros.push(m.params.args.map((a) => a.value ?? a.description).join(' '));
  });
  let erros = [];

  const lista = soRota ? [soRota] : await rotas();
  const resultados = [];
  if (pastaPrints) await mkdir(pastaPrints, { recursive: true });

  for (const rota of lista) {
    // 1) peso na primeira carga, celular 360×740, rede "4G lento" (1,6 Mbps, 150 ms) e CPU 4× mais
    //    lenta, perto do celular barato do público. LCP e CLS medidos no próprio navegador.
    await cdp.enviar('Emulation.setDeviceMetricsOverride', { width: 360, height: 740, deviceScaleFactor: 2, mobile: true });
    await cdp.enviar('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200 * 1024, uploadThroughput: 94 * 1024 });
    await cdp.enviar('Emulation.setCPUThrottlingRate', { rate: 4 });
    respostas.clear();
    erros = [];
    const carregou = cdp.esperar('Page.loadEventFired');
    await cdp.enviar('Page.navigate', { url: base + rota });
    await carregou;
    await pausa(1500);
    const { result: vitais } = await cdp.enviar('Runtime.evaluate', { returnByValue: true, expression: '({ lcp: Math.round(window.__lcp), cls: +window.__cls.toFixed(3) })' });
    await cdp.enviar('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await cdp.enviar('Emulation.setCPUThrottlingRate', { rate: 1 });
    // Imagens abaixo da dobra ficam fora da conta (pedido: "sem as imagens abaixo da dobra"),
    // mesmo que o Chrome as antecipe pelo limiar de distância do loading="lazy".
    const { result: acima } = await cdp.enviar('Runtime.evaluate', {
      returnByValue: true,
      expression: `[...document.images].filter((i) => { const r = i.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 && r.left < innerWidth && r.right > 0; }).map((i) => i.currentSrc)`,
    });
    const visiveis = new Set(acima.value);
    const reqs = [...respostas.values()].filter((r) => r.url.startsWith(base) && (r.tipo !== 'Image' || visiveis.has(r.url)));
    const externos = [...respostas.values()].filter((r) => !r.url.startsWith(base) && !r.url.startsWith('data:'));
    const total = reqs.reduce((s, r) => s + r.bytes, 0) + externos.reduce((s, r) => s + r.bytes, 0);
    const imgs = reqs.filter((r) => r.tipo === 'Image').reduce((s, r) => s + r.bytes, 0);

    // 2) rolagem horizontal em 320 px
    await cdp.enviar('Emulation.setDeviceMetricsOverride', { width: 320, height: 740, deviceScaleFactor: 2, mobile: true });
    await pausa(400);
    const { result } = await cdp.enviar('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const cw = document.documentElement.clientWidth;
        const sw = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
        const culpados = [...document.querySelectorAll('body *')].filter((el) => {
          const r = el.getBoundingClientRect();
          if (!r.width) return false;
          let p = el.parentElement; while (p) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') return false; p = p.parentElement; }
          return r.right > cw + 1 || r.left < -1;
        }).slice(0, 5).map((el) => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).join('.') : ''));
        return { cw, sw, culpados };
      })()`,
    });
    const v = result.value;
    const okRolagem = v.sw <= v.cw;
    const okPeso = total / 1024 < LIMITE_KB;

    if (pastaPrints) {
      for (const [w, h] of [[360, 740], [1280, 800]]) {
        await cdp.enviar('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 600 });
        await pausa(500);
        const { cssContentSize } = await cdp.enviar('Page.getLayoutMetrics');
        const altura = Math.min(Math.ceil(cssContentSize.height), 9000);
        await cdp.enviar('Emulation.setDeviceMetricsOverride', { width: w, height: altura, deviceScaleFactor: 1, mobile: w < 600 });
        await cdp.enviar('Runtime.evaluate', { expression: 'document.querySelectorAll("img[loading=lazy]").forEach(i => i.loading = "eager")' });
        await pausa(1200);
        const shot = await cdp.enviar('Page.captureScreenshot', { format: 'jpeg', quality: 60, captureBeyondViewport: true });
        const nome = (rota === '/' ? 'home' : rota.slice(1).replaceAll('/', '-')) + `-${w}.jpg`;
        await writeFile(join(pastaPrints, nome), Buffer.from(shot.data, 'base64'));
      }
    }

    resultados.push({ lcp: vitais.value.lcp, cls: vitais.value.cls, erros: [...erros], rota, kb: +(total / 1024).toFixed(1), imgKb: +(imgs / 1024).toFixed(1), externos: externos.length, sw: v.sw, cw: v.cw, okRolagem, okPeso, culpados: v.culpados });
  }

  nav.fechar();

  console.log('rota                         KB 1ª carga (imagens)  externos  320px        LCP 4G lento    CLS  erros JS');
  for (const r of resultados) {
    console.log(`${r.rota.padEnd(28)} ${String(r.kb).padStart(7)} (${String(r.imgKb).padStart(6)})  ${String(r.externos).padStart(8)}  ${r.sw}/${r.cw} ${r.okRolagem ? 'ok' : 'ROLA ' + r.culpados.join(', ')}  ${String(r.lcp).padStart(7)} ms  ${String(r.cls).padStart(6)}  ${r.erros.length}${r.okPeso ? '' : `  PESO > ${LIMITE_KB} KB`}`);
    for (const e of r.erros) console.log(`    erro: ${e}`);
  }
  console.log('LCP/CLS: laboratório (um carregamento, 4G lento simulado, CPU 4×), não dado de campo.');
  const falhas = resultados.filter((r) => !r.okRolagem || !r.okPeso || r.erros.length > 0);
  console.log(falhas.length ? `FALHOU: ${falhas.length} rota(s)` : `PASS: ${resultados.length} rotas sem rolagem horizontal em 320 px e abaixo de ${LIMITE_KB} KB`);
  process.exit(falhas.length ? 1 : 0);
}

// Vigia: nenhuma rodada passa de 8 minutos.
setTimeout(() => { console.error('timeout geral'); process.exit(1); }, 480000).unref();
main().catch((e) => { console.error(e); process.exit(1); });

// O corte relatado: rolar com a roda do mouse e ver titulo pela metade embaixo
// da barra do topo. Rola cada rota de 100 em 100 px (um entalhe da roda) com
// eventos reais de wheel e, em cada parada, conta os titulos que a borda de
// baixo da barra corta. Tambem confere onde as ancoras da home deixam o titulo.
// Uso: node roda.mjs <base-url> <saida.json> [pasta-capturas] [larguras...]
import fs from "node:fs";
import path from "node:path";
import { context, launch, routes } from "./lib.mjs";

const [base, outFile, shots, ...widthsArg] = process.argv.slice(2);
const widths = (widthsArg.length ? widthsArg : ["1440", "1920", "1366", "390"]).map(Number);
const only = process.env.ROTAS ? process.env.ROTAS.split(",") : null;
const browser = await launch();
const report = {};

// Titulo cortado: a borda de baixo da barra passa por dentro dele.
const probe = () => {
  const bar = document.querySelector(".topbar");
  const r0 = bar?.getBoundingClientRect();
  // A barra pode estar recolhida (fora da tela): entao a linha de corte e o topo.
  const edge = r0 && r0.bottom > 1 ? r0.bottom : 0;
  const cut = [];
  for (const h of document.querySelectorAll("main h1, main h2, main h3")) {
    const s = getComputedStyle(h);
    if (s.display === "none" || s.visibility === "hidden" || !h.getClientRects().length) continue;
    const r = h.getBoundingClientRect();
    // Mais de 6px escondidos e mais de 6px visiveis: "pela metade".
    if (edge > 0 && r.top < edge - 6 && r.bottom > edge + 6) cut.push({ text: h.textContent.trim().slice(0, 40), hidden: Math.round(edge - r.top), height: Math.round(r.height) });
  }
  return { y: Math.round(scrollY), edge: Math.round(edge), cut };
};

for (const width of widths) {
  const { ctx, mobile, size } = await context(browser, width);
  for (const [name, route] of routes) {
    if (only && !only.includes(name)) continue;
    const page = await ctx.newPage();
    await page.goto(base + route, { waitUntil: "load" });
    await page.waitForTimeout(700);
    await page.mouse.move(size.width / 2, size.height / 2);
    const stops = [];
    let last = -1;
    let shot = false;
    for (let i = 0; i < 200; i++) {
      if (mobile) await page.evaluate(() => scrollBy({ top: 100, behavior: "instant" }));
      else await page.mouse.wheel(0, 100);
      await page.waitForTimeout(mobile ? 120 : 260);
      const p = await page.evaluate(probe);
      stops.push(p);
      if (shots && !shot && p.cut.some((c) => c.text.startsWith("Projetos em destaque"))) {
        fs.mkdirSync(shots, { recursive: true });
        await page.screenshot({ path: path.join(shots, `corte-${width}-${name}.jpg`), type: "jpeg", quality: 75 });
        shot = true;
      }
      if (p.y === last) break;
      last = p.y;
    }
    const withCut = stops.filter((s) => s.cut.length);
    const titles = {};
    for (const s of withCut) for (const c of s.cut) titles[c.text] = (titles[c.text] ?? 0) + 1;
    const steps = stops.slice(1).map((s, i) => s.y - stops[i].y).filter((d) => d > 0);
    report[`${width} ${name}`] = { stops: stops.length, withCut: withCut.length, pct: Math.round((withCut.length / Math.max(stops.length, 1)) * 100), titles, step: steps[0] ?? null };
    // Ancoras da home: onde o titulo da secao para depois do clique.
    if (name === "home") {
      const anchors = {};
      for (const href of ["#projetos", "#contato"]) {
        await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
        await page.waitForTimeout(200);
        const link = page.locator(`main a[href="${href}"]`).first();
        if (!(await link.count())) continue;
        await link.click();
        await page.waitForTimeout(1400);
        anchors[href] = await page.evaluate((id) => {
          const bar = document.querySelector(".topbar").getBoundingClientRect();
          const h = document.querySelector(`${id} h2`).getBoundingClientRect();
          return { barBottom: Math.round(bar.bottom), headingTop: Math.round(h.top), gap: Math.round(h.top - Math.max(bar.bottom, 0)) };
        }, href);
      }
      report[`${width} ${name}`].anchors = anchors;
    }
    await page.close();
  }
  await ctx.close();
}
fs.writeFileSync(outFile, JSON.stringify(report, null, 1));
for (const [k, r] of Object.entries(report)) console.log(k, `paradas ${r.stops}, com titulo cortado ${r.withCut} (${r.pct}%), passo ${r.step}px`, JSON.stringify(r.titles), r.anchors ? JSON.stringify(r.anchors) : "");
await browser.close();

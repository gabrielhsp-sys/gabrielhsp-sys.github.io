// Tab por todo o site: cada parada tem foco visivel? Fica embaixo da barra do
// topo ou do dock (WCAG 2.4.11)? Quantos Tabs ate o primeiro link do conteudo?
// Uso: node teclado.mjs <base-url> <saida.json> [larguras...]
// ESPERA=<ms> depois de cada Tab (padrao 650: a rolagem suave precisa chegar).
import fs from "node:fs";
import { context, launch, listen, routes } from "./lib.mjs";

const [base, outFile, ...widthsArg] = process.argv.slice(2);
const only = process.env.ROTAS ? process.env.ROTAS.split(",") : null;
const widths = (widthsArg.length ? widthsArg : ["1440", "390"]).map(Number);
const browser = await launch();
const report = {};
for (const width of widths) {
  const { ctx } = await context(browser, width);
  for (const [name, route] of routes) {
    if (only && !only.includes(name)) continue;
    const page = await ctx.newPage();
    const messages = listen(page);
    await page.goto(base + route, { waitUntil: "load" });
    await page.waitForTimeout(600);
    const stops = [];
    let firstMain = null;
    for (let i = 0; i < 120; i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(Number(process.env.ESPERA ?? 650));
      const s = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const bar = document.querySelector(".topbar")?.getBoundingClientRect();
        const dock = document.querySelector(".mobile-dock");
        const d = dock && getComputedStyle(dock).display !== "none" ? dock.getBoundingClientRect() : null;
        const fixed = el.closest(".topbar, .mobile-dock, .system-rail, .skip-link");
        const ring = (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== "none");
        return {
          label: `${el.tagName.toLowerCase()} "${(el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 30)}"`,
          inMain: !!el.closest("main"),
          ring,
          underBar: !fixed && bar && bar.bottom > 0 && r.top < bar.bottom - 2,
          underDock: !fixed && d && r.bottom > d.top + 2,
          offscreen: r.bottom < 0 || r.top > innerHeight,
        };
      });
      if (!s) continue;
      if (stops.length && stops[0].label === s.label && i > 3) break; // deu a volta
      stops.push(s);
      if (firstMain === null && s.inMain) firstMain = stops.length;
    }
    report[`${width} ${name}`] = {
      stops: stops.length,
      firstMain,
      noRing: stops.filter((s) => !s.ring).map((s) => s.label),
      obscured: stops.filter((s) => s.underBar || s.underDock).map((s) => `${s.label}${s.underBar ? " (barra)" : ""}${s.underDock ? " (dock)" : ""}`),
      offscreen: stops.filter((s) => s.offscreen).map((s) => s.label),
      console: messages,
    };
    await page.close();
  }
  await ctx.close();
}
fs.writeFileSync(outFile, JSON.stringify(report, null, 1));
for (const [k, r] of Object.entries(report)) console.log(k, `paradas ${r.stops}, 1o do conteudo no Tab ${r.firstMain}`, r.noRing.length ? `sem anel: ${r.noRing.join("; ")}` : "", r.obscured.length ? `encoberto: ${r.obscured.join("; ")}` : "", r.offscreen.length ? `fora: ${r.offscreen.join("; ")}` : "");
await browser.close();

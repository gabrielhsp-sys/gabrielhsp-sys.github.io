// Capturas e checagens de layout de todas as rotas nas quatro larguras.
// Uso: node capturas.mjs <base-url> <pasta-saida> [larguras...]
// Gera <pasta>/<largura>/<rota>.jpg (primeira tela), <pasta>/<largura>/<rota>-inteira.jpg
// (pagina inteira, so home e um estudo de caso) e <pasta>/layout.json.
import fs from "node:fs";
import path from "node:path";
import { axeSource, checks, context, launch, listen, routes } from "./lib.mjs";

const [base, out, ...widthsArg] = process.argv.slice(2);
const widths = (widthsArg.length ? widthsArg : ["1440", "1920", "1366", "390"]).map(Number);
const full = new Set(["home", "caso-telegram", "sobre", "arquivo"]);
const browser = await launch();
const report = {};

for (const width of widths) {
  const dir = path.join(out, String(width));
  fs.mkdirSync(dir, { recursive: true });
  const { ctx } = await context(browser, width);
  for (const [name, route] of routes) {
    const page = await ctx.newPage();
    const messages = listen(page);
    await page.goto(base + route, { waitUntil: "load" });
    await page.waitForTimeout(900);
    const layout = await page.evaluate(checks);
    let axe = null;
    if (width === 1440 || width === 390) {
      await page.addScriptTag({ content: axeSource });
      axe = await page.evaluate(async () => {
        const r = await window.axe.run(document, { resultTypes: ["violations"] });
        return r.violations.map((v) => `${v.impact} ${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`);
      });
    }
    await page.screenshot({ path: path.join(dir, `${name}.jpg`), type: "jpeg", quality: 72 });
    if (full.has(name) && (width === 1440 || width === 390)) {
      // Pagina inteira: rola ate o fim antes para as imagens preguicosas carregarem.
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += innerHeight) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } scrollTo(0, 0); });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(dir, `${name}-inteira.jpg`), type: "jpeg", quality: 60, fullPage: true });
    }
    report[`${width} ${name}`] = { ...layout, axe, console: messages };
    await page.close();
  }
  await ctx.close();
}
fs.writeFileSync(path.join(out, "layout.json"), JSON.stringify(report, null, 1));
await browser.close();
const issues = Object.entries(report).filter(([, r]) => r.overflowX > 0 || r.smallText.length || r.clipped.length || r.overlaps.length || r.inversions.length || r.axe?.length || r.console.length);
for (const [k, r] of issues) console.log(k, JSON.stringify({ overflowX: r.overflowX, smallText: r.smallText, clipped: r.clipped, overlaps: r.overlaps, inversions: r.inversions, axe: r.axe, console: r.console }));
console.log(`rotas x larguras: ${Object.keys(report).length}, com achado: ${issues.length}`);

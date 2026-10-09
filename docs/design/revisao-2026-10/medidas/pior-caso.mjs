// break-ui: troca o texto real por dados de pior caso (titulo longo, palavra
// sem quebra, resumo enorme, stack com muitos itens, uma letra) e roda as mesmas
// checagens de layout. Nada e gravado no conteudo: so o DOM da captura muda.
// Uso: node pior-caso.mjs <base-url> <pasta-saida>
import fs from "node:fs";
import path from "node:path";
import { checks, context, launch } from "./lib.mjs";

const [base, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await launch();
const report = {};
const long = "Sistema distribuído de orquestração de configuração e implantação contínua para laboratórios universitários";
const word = "Infraestruturaautomatizadadeimplantaçãocontínuasemsupervisão";
for (const width of [1366, 390]) {
  const { ctx } = await context(browser, width);
  for (const [name, route] of [["home", "/"], ["arquivo", "/archive/"], ["caso", "/projects/telegram-offers/"]]) {
    for (const kind of ["longo", "palavra", "curto"]) {
      const page = await ctx.newPage();
      await page.goto(base + route, { waitUntil: "load" });
      await page.waitForTimeout(500);
      await page.evaluate(({ kind, long, word }) => {
        const text = kind === "longo" ? long : kind === "palavra" ? word : "X";
        for (const el of document.querySelectorAll(".case-card h3 a, .hero-panel strong, .archive-line-title strong, .article-header h1, .relations strong, .case-end-next strong")) el.textContent = text;
        for (const el of document.querySelectorAll(".case-head > p, .archive-line-title small, .article-header > p")) el.textContent = kind === "curto" ? "." : (long + " ").repeat(3);
        for (const ul of document.querySelectorAll(".case-stack, .craft-stack")) for (let i = 0; i < 8; i++) { const li = document.createElement("li"); li.textContent = kind === "palavra" ? word.slice(0, 28) : "PostgreSQL"; ul.append(li); }
        for (const el of document.querySelectorAll(".facts dd a")) el.textContent = kind === "palavra" ? word + "@exemplo.com.br" : el.textContent;
      }, { kind, long, word });
      await page.waitForTimeout(200);
      const r = await page.evaluate(checks);
      report[`${width} ${name} ${kind}`] = { overflowX: r.overflowX, clipped: r.clipped, overlaps: r.overlaps, inversions: r.inversions };
      await page.screenshot({ path: path.join(out, `${width}-${name}-${kind}.jpg`), type: "jpeg", quality: 60, fullPage: name !== "caso" });
      await page.close();
    }
  }
  await ctx.close();
}
fs.writeFileSync(path.join(out, "pior-caso.json"), JSON.stringify(report, null, 1));
for (const [k, r] of Object.entries(report)) console.log(k, JSON.stringify(r));
await browser.close();

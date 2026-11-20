import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// axe nas paginas principais (cliente e recrutador), com a animacao de entrada
// ja vista. Os demos Astro tem verificacao propria (verificar-saida.mjs).
const routes = [
  "/", "/servicos/", "/servicos/sites/", "/servicos/bots/", "/exemplos/", "/exemplos/sites/",
  "/exemplos/aplicativos/", "/exemplos/bots/", "/exemplos/automacoes/", "/exemplos/sistemas/",
  "/como-funciona/", "/sobre/", "/projetos/", "/projetos/telegram-offers/",
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("gsys:booted", "1"));
});

for (const route of routes) for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test(`no axe violations on ${route} at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(route);
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}

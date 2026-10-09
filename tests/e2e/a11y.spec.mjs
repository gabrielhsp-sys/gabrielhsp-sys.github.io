import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// axe nas paginas principais, com a animacao de entrada ja vista: o hero novo
// (e-mail e botao de copiar sobre a imagem) e o "Sobre" entram na conta.
const routes = ["/", "/about/", "/archive/", "/projects/telegram-offers/"];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("gsys:booted", "1"));
});

for (const route of routes) {
  test(`no axe violations on ${route}`, async ({ page }) => {
    await page.goto(route);
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}

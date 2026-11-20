import { expect, test } from "@playwright/test";

// Cabecalho do celular (pedido de 2026-11-20; VERIFICACAO.md H1/H2): logo,
// "Orcamento" e "Menu" na MESMA linha em 320, 360, 375, 390 e 414 px, nos dois
// temas. Antes, so 390 px era testado, e 360/375 quebravam em duas linhas.
const larguras = [320, 360, 375, 390, 414];

const mesmaLinha = async (page) => {
  const caixa = async (sel) => {
    const visivel = page.locator(sel).filter({ visible: true }).first();
    await expect(visivel).toBeVisible();
    return visivel.boundingBox();
  };
  const [marca, orcamento, menu, header] = await Promise.all([
    caixa(".c-header .c-brand img"),
    caixa(".c-header .c-cta"),
    caixa(".c-header .c-menu-button"),
    page.locator(".c-header").boundingBox(),
  ]);
  // Mesma linha: as tres caixas se cruzam na vertical, lado a lado, nessa ordem.
  const centro = (b) => b.y + b.height / 2;
  for (const b of [orcamento, menu]) expect(Math.abs(centro(b) - centro(marca))).toBeLessThan(12);
  expect(marca.x + marca.width).toBeLessThanOrEqual(orcamento.x);
  expect(orcamento.x + orcamento.width).toBeLessThanOrEqual(menu.x);
  expect(header.height).toBeLessThanOrEqual(72);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => window.innerWidth));
};

for (const tema of ["light", "dark"]) for (const largura of larguras) {
  test.describe(`${largura} px, ${tema}`, () => {
    test.use({ viewport: { width: largura, height: 740 } });

    test("logo, Orçamento and Menu share one header line (H1)", async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem("gsys:tema", t), tema);
      await page.goto("/");
      expect(await page.locator(".c-header .c-cta").innerText()).toBe("Orçamento");
      await expect(page.getByRole("button", { name: "Menu" })).toBeVisible();
      await mesmaLinha(page);
      // Abrir o Menu nao empurra a linha: o painel abre por baixo.
      await page.getByRole("button", { name: "Menu" }).click();
      await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Serviços" })).toBeVisible();
      await mesmaLinha(page);
    });
  });
}

test.describe("with a larger system font", () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test("the line still holds at 125% text size (H2)", async ({ page }) => {
    await page.goto("/");
    // Aproxima o "tamanho da fonte" do Android: tudo em rem cresce 25%.
    await page.addStyleTag({ content: "html { font-size: 125% !important; }" });
    await mesmaLinha(page);
  });
});

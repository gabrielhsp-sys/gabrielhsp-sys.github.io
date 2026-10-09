import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("gsys:booted", "1"));
});

// P1 revertido (2026-10-09): o hero volta a ser como no site publicado, sem o
// e-mail entre os botoes e a dica do terminal. O e-mail fica no "Contato".
test("the hero goes from the actions straight to the terminal hint", async ({ page }) => {
  await page.goto("/");
  const next = await page.locator(".hero-actions").evaluate((el) => el.nextElementSibling?.className);
  expect(next).toBe("hero-hint");
  await expect(page.locator(".hero").getByText("gabrielhspereira36@gmail.com")).toHaveCount(0);
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test("the case study index leaves the hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".hero-panel")).toBeHidden();
    await expect(page.locator(".hero-actions .button-solid")).toBeVisible();
    await expect(page.locator("#projetos .case-card").first()).toBeAttached();
  });
});

// O tablet em pe mantem o indice; so o celular o perde.
test.describe("on a tablet", () => {
  test.use({ viewport: { width: 820, height: 1180 } });
  test("the case study index stays in the hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".hero-panel")).toBeVisible();
  });
});

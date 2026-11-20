import { expect, test } from "@playwright/test";

// Area do recrutador (/sobre/, /projetos/): animacao de entrada, terminal e
// busca Ctrl+K moram aqui, e nenhuma camada engole clique (D-101/ADR-014).

test("the entry animation runs on the first visit to /sobre/ and a single click still navigates", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/sobre/");
  await expect(page.locator(".boot-screen")).toBeVisible();
  // Um clique so no link do trilho, durante a animacao: navega.
  await page.locator(".system-rail").getByRole("link", { name: "Projetos" }).click();
  await expect(page).toHaveURL(/\/projetos\/$/);
});

test.describe("after the entry animation", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem("gsys:booted", "1"));
  });

  for (const route of ["/sobre/", "/projetos/"]) {
    test(`${route} opens the terminal with the backtick and search with Ctrl+K`, async ({ page }) => {
      await page.goto(route);
      // Hidratado: o PersonalityProvider grava data-retro ao montar.
      await expect(page.locator("html")).toHaveAttribute("data-retro", "off");
      await page.locator("body").press("`");
      await expect(page.getByRole("dialog", { name: "Terminal GABRIEL.SYS" })).toBeVisible();
      await page.keyboard.press("Escape");
      await page.keyboard.press("Control+k");
      await expect(page.getByRole("dialog", { name: "Busca no arquivo" })).toBeVisible();
    });
  }

  test("the Konami code works in the recruiter area too", async ({ page }) => {
    await page.goto("/projetos/");
    await expect(page.locator("html")).toHaveAttribute("data-retro", "off");
    await page.locator("main").click({ position: { x: 5, y: 5 } });
    for (const key of ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]) await page.keyboard.press(key);
    await expect(page.locator("html")).toHaveAttribute("data-retro", "on");
  });

  test("case studies live under /projetos/ and link back to the archive", async ({ page }) => {
    await page.goto("/projetos/telegram-offers/");
    await expect(page.getByRole("link", { name: "todos os projetos" })).toHaveAttribute("href", "/projetos/");
  });
});

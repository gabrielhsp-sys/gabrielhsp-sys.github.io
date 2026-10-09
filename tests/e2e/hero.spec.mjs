import { expect, test } from "@playwright/test";

const email = "gabrielhspereira36@gmail.com";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("gsys:booted", "1"));
});

test("the hero shows the e-mail right below the contact button", async ({ page }) => {
  await page.goto("/");
  const address = page.locator(".hero-email-address");
  await expect(address).toHaveText(email);
  const button = await page.locator(".hero-actions .button-solid").boundingBox();
  const line = await address.boundingBox();
  expect(line.y).toBeGreaterThan(button.y + button.height);
});

test("without a clipboard the copy button selects the address", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { value: undefined }));
  await page.goto("/");
  const copy = page.locator(".hero-email .copy-email");
  await copy.click();
  await expect(copy.getByRole("status")).toHaveText("e-mail selecionado, é só copiar");
  expect(await page.evaluate(() => String(window.getSelection()))).toBe(email);
});

test.describe("with clipboard access", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "só o Chromium concede a permissão no Playwright");
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });
  test("the copy button copies and says so", async ({ page }) => {
    await page.goto("/");
    const copy = page.locator(".hero-email .copy-email");
    await copy.click();
    await expect(copy.getByRole("status")).toHaveText("e-mail copiado");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(email);
  });
});


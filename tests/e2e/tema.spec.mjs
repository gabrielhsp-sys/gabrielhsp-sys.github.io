import { expect, test } from "@playwright/test";

// Tema claro/escuro (pedido de 2026-11-20; VERIFICACAO.md da rodada visual, T1–T7).
const CLARO = "rgb(247, 243, 234)";
const ESCURO = "rgb(12, 11, 10)";
const fundo = (page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const salvar = (valor) => { try { localStorage.setItem("gsys:tema", valor); } catch { /* sem storage */ } };

test.describe("first visit with the system in dark mode", () => {
  test.use({ colorScheme: "dark" });

  test("opens in the light theme anyway (T1)", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(await fundo(page)).toBe(CLARO);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", CLARO);
  });
});

test("the header switch turns the dark theme on and the choice survives a reload (T2)", async ({ page }) => {
  await page.goto("/servicos/");
  const botao = page.locator(".c-header").getByRole("button", { name: "Tema escuro" });
  await expect(botao).toHaveAttribute("aria-pressed", "false");
  await botao.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(botao).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => localStorage.getItem("gsys:tema"))).toBe("dark");
  expect(await fundo(page)).toBe(ESCURO);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".c-header").getByRole("button", { name: "Tema escuro" })).toHaveAttribute("aria-pressed", "true");
  // E volta ao claro pelo mesmo botao.
  await page.locator(".c-header").getByRole("button", { name: "Tema escuro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await page.evaluate(() => localStorage.getItem("gsys:tema"))).toBe("light");
});

test("the saved theme is applied by the inline head script, before any app JavaScript (T3)", async ({ page }) => {
  await page.addInitScript(salvar, "dark");
  // Sem o JS do Next nada hidrata: se o <html> esta escuro, foi o script do <head>.
  await page.route(/\/_next\/static\/.*\.js$/, (route) => route.abort());
  await page.goto("/exemplos/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await fundo(page)).toBe(ESCURO);
});

test("a blocked localStorage opens the light theme without errors (T4)", async ({ page }) => {
  const erros = [];
  page.on("pageerror", (error) => erros.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new Error("storage bloqueado"); } });
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.locator(".c-header").getByRole("button", { name: "Tema escuro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(erros).toEqual([]);
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the switch lives in the Menu, not in the header line (T5)", async ({ page }) => {
    await page.goto("/");
    const linha = page.locator(".c-header-tools");
    await expect(linha.getByRole("button", { name: "Tema escuro" })).toBeHidden();
    await page.getByRole("button", { name: "Menu" }).click();
    const noMenu = page.getByRole("navigation", { name: "Principal" }).getByRole("button", { name: "Tema escuro" });
    await expect(noMenu).toBeVisible();
    await noMenu.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(noMenu).toHaveAttribute("aria-pressed", "true");
  });
});

test("the logo shown matches the theme (T7)", async ({ page }) => {
  await page.goto("/");
  const visivel = () => page.locator(".c-header .c-brand img:visible").first().getAttribute("src");
  expect(await visivel()).toBe("/marca/logo-horizontal-claro.png");
  await page.locator(".c-header").getByRole("button", { name: "Tema escuro" }).click();
  expect(await visivel()).toBe("/marca/logo-horizontal.png");
});

test("the recruiter area stays dark even with the light theme chosen", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("gsys:booted", "1"));
  await page.addInitScript(salvar, "light");
  await page.goto("/sobre/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await fundo(page)).toBe(ESCURO);
});

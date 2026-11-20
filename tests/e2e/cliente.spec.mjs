import { expect, test } from "@playwright/test";

// Paginas de cliente (decisoes de 2026-11-19): sem animacao de entrada, sem
// terminal e sem busca Ctrl+K; Konami no site todo; som ligado por padrao;
// WhatsApp do Business sempre a vista; do Instagram ao pedido em 3 toques.
const BUSINESS = "5535998840168";
const clientRoutes = ["/", "/servicos/", "/servicos/aplicativos/", "/exemplos/", "/exemplos/sistemas/", "/como-funciona/"];

for (const route of clientRoutes) {
  test(`${route}: no entry animation, terminal or Ctrl+K`, async ({ page }) => {
    await page.goto(route);
    // Hidratado antes de apertar as teclas: sem isso o teste passaria por falta de listener.
    await expect(page.locator("html")).toHaveAttribute("data-retro", "off");
    await expect(page.locator(".boot-screen")).toHaveCount(0);
    await page.locator("body").press("`");
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator(".system-rail, .mobile-dock, .terminal-wrap")).toHaveCount(0);
  });
}

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("three taps from the Instagram link: home, WhatsApp button, send", async ({ page }) => {
    await page.goto("/?origem=instagram"); // toque 1: o link da bio
    const fixo = page.locator(".c-whats-fixo");
    await expect(fixo).toBeVisible(); // toque 2 disponivel sem rolar
    await expect(fixo).toBeInViewport();
    const url = new URL(await fixo.getAttribute("href"));
    expect(url.origin + url.pathname).toBe(`https://wa.me/${BUSINESS}`);
    expect(url.searchParams.get("text")).toMatch(/^Olá, Gabriel!/); // toque 3: enviar no app
  });

  test("the header fits one line and the menu opens with a written label", async ({ page }) => {
    await page.goto("/");
    const header = await page.locator(".c-header").boundingBox();
    expect(header.height).toBeLessThanOrEqual(72);
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Serviços" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
  });

  test("the form replaces the floating button with an inline link", async ({ page }) => {
    await page.goto("/orcamento/");
    await expect(page.locator(".c-whats-fixo")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Prefiro conversar direto no WhatsApp" })).toHaveAttribute("href", new RegExp(`^https://wa\\.me/${BUSINESS}\\?text=`));
  });
});

test("footer shows the WhatsApp number, the Instagram handle and the recruiter door", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator(".c-footer");
  await expect(footer).toContainText("(35) 99884-0168");
  await expect(footer).toContainText("@gabrielhsp.sys");
  await expect(footer.getByRole("link", { name: /para recrutadores/ })).toHaveAttribute("href", "/sobre/");
});

test("sound is on by default and the Konami code works on a client page", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-retro", "off");
  await expect(page.getByRole("button", { name: "Desligar som" }).first()).toHaveAttribute("aria-pressed", "true");
  await page.locator("body").click({ position: { x: 5, y: 300 } });
  for (const key of ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]) await page.keyboard.press(key);
  await expect(page.locator("html")).toHaveAttribute("data-retro", "on");
});

test("every service page explains the result and links to its example and the form", async ({ page }) => {
  for (const slug of ["sites", "aplicativos", "bots", "automacoes", "sistemas"]) {
    await page.goto(`/servicos/${slug}/`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "O que você recebe" })).toBeVisible();
    await expect(page.locator(`a[href^="/exemplos/"]`).first()).toBeVisible();
    await expect(page.locator(`a[href^="/orcamento/?precisa="]`).first()).toBeVisible();
  }
});

test.describe("examples", () => {
  for (const route of ["/exemplos/automacoes/", "/exemplos/sistemas/", "/exemplos/bots/"]) {
    test(`${route} labels the simulation as a demonstration`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByText("Demonstração: exemplo do que posso fazer")).toBeVisible();
    });
  }

  test("the bot conversation answers by keyboard", async ({ page }) => {
    await page.goto("/exemplos/bots/");
    await page.getByRole("button", { name: "Cliente pergunta o horário" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("log")).toContainText("Abrimos de terça a domingo");
  });

  test("the automation turns orders into rows and a summary", async ({ page }) => {
    await page.goto("/exemplos/automacoes/");
    await page.getByRole("button", { name: "Chegou um pedido" }).click();
    await page.getByRole("button", { name: "Chegou um pedido" }).click();
    await expect(page.locator(".d-table tbody tr")).toHaveCount(2);
    await page.getByRole("button", { name: "Fechar o dia" }).click();
    await expect(page.getByText(/Resumo do dia: 2 pedidos/)).toBeVisible();
  });

  test("the system shows the owner what the team does not see", async ({ page }) => {
    await page.goto("/exemplos/sistemas/");
    await expect(page.getByRole("columnheader", { name: "Mínimo" })).toHaveCount(0);
    await page.getByRole("radio", { name: /Dono/ }).check();
    await expect(page.getByRole("columnheader", { name: "Mínimo" })).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "abaixo do mínimo" })).toContainText("Queijo");
  });

  test("the seven demo sites are listed and open from /exemplos/sites/", async ({ page }) => {
    await page.goto("/exemplos/sites/");
    const links = page.locator(".c-exemplos a");
    await expect(links).toHaveCount(7);
    await links.first().click();
    await expect(page).toHaveURL(/\/exemplos\/sites\/alimentacao\/$/);
    await expect(page.locator('[data-faixa="whatsapp"]')).toHaveAttribute("href", new RegExp(`^https://wa\\.me/${BUSINESS}\\?text=`));
    await expect(page.locator('[data-faixa="orcamento"]')).toHaveAttribute("href", "/orcamento/?precisa=site&origem=demo-alimentacao");
  });
});

test.describe("phone menu by keyboard", () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test("Escape inside the open menu closes it and returns focus to the Menu button", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-retro", "off");
    const botao = page.getByRole("button", { name: "Menu" });
    await botao.click();
    await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Serviços" }).focus();
    await page.keyboard.press("Escape");
    await expect(botao).toBeFocused();
    await expect(botao).toHaveAttribute("aria-expanded", "false");
  });
});

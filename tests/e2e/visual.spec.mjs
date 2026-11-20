import { expect, test } from "@playwright/test";

// Paginas de cliente mais visuais (rodada visual 2026-11-20; VERIFICACAO.md P1–P4 e I2).
const carregada = (img) => img.evaluate((el) => el.complete && el.naturalWidth > 0);

test("the home hero shows real captures in a notebook and a phone frame (P1)", async ({ page }) => {
  await page.goto("/");
  const vitrine = page.locator(".c-hero .c-vitrine");
  await expect(vitrine.locator(".f-notebook img")).toHaveCount(1);
  await expect(vitrine.locator(".f-celular img").first()).toBeVisible();
  for (const img of await vitrine.locator("img:visible").all()) {
    await expect.poll(() => carregada(img)).toBe(true);
    expect(await img.getAttribute("src")).toMatch(/^\/capturas\//);
  }
  await expect(vitrine.locator("figcaption")).toContainText("Demonstração");
});

test("every service has a card with its image (P2)", async ({ page }) => {
  await page.goto("/servicos/");
  const cards = page.locator(".c-feature");
  await expect(cards).toHaveCount(5);
  for (const card of await cards.all()) {
    await card.scrollIntoViewIfNeeded();
    const visual = card.locator(".c-visual");
    await expect(visual.locator('img, svg[role="img"]')).toHaveCount(1);
    const img = visual.locator("img");
    if (await img.count()) await expect.poll(() => carregada(img)).toBe(true);
    else await expect(visual.locator('svg[role="img"]')).toHaveAttribute("aria-label", /Ilustração/);
  }
});

test.describe("/exemplos/", () => {
  test("filters by type, keeps the choice in the URL and announces the count (P3)", async ({ page }) => {
    await page.goto("/exemplos/");
    const itens = page.locator(".c-exemplos > li");
    const visiveis = page.locator(".c-exemplos > li:visible");
    await expect(itens).toHaveCount(12);
    await expect(visiveis).toHaveCount(12);
    const filtro = page.getByRole("group", { name: "Filtrar exemplos por tipo" });
    await filtro.getByRole("button", { name: /^Bots/ }).click();
    await expect(filtro.getByRole("button", { name: /^Bots/ })).toHaveAttribute("aria-pressed", "true");
    await expect(filtro.getByRole("button", { name: /^Todos/ })).toHaveAttribute("aria-pressed", "false");
    await expect(visiveis).toHaveCount(2);
    for (const li of await visiveis.all()) await expect(li).toHaveAttribute("data-tipo", "bots");
    await expect(page.getByRole("status").filter({ hasText: "exemplo" })).toHaveText("2 exemplos");
    await expect(page).toHaveURL(/\?tipo=bots$/);
    await page.reload();
    await expect(visiveis).toHaveCount(2);
    // Por teclado: foco no "Todos" e Enter.
    await filtro.getByRole("button", { name: /^Todos/ }).focus();
    await page.keyboard.press("Enter");
    await expect(visiveis).toHaveCount(12);
    await expect(page).toHaveURL(/\/exemplos\/$/);
  });

  test("each card says real or demo and shows an image, except Carona 70 in text", async ({ page }) => {
    await page.goto("/exemplos/");
    for (const li of await page.locator(".c-exemplos > li").all()) {
      await expect(li.locator(".c-badge")).toHaveText(/^(Projeto real|Demonstração)$/);
      const texto = await li.innerText();
      if (/Carona 70/.test(texto)) await expect(li.locator("img")).toHaveCount(0);
      else await expect(li.locator("img")).toHaveCount(1);
    }
  });
});

test("how it works: four numbered steps, each short (P4)", async ({ page }) => {
  await page.goto("/como-funciona/");
  const passos = page.locator("main ol.c-steps > li");
  await expect(passos).toHaveCount(4);
  for (const passo of await passos.all()) {
    const palavras = (await passo.innerText()).split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
    expect(palavras.length).toBeLessThanOrEqual(14);
  }
});

// I2: toda imagem do conteudo tem alt, largura e altura (sem salto de layout) e
// e lazy fora da primeira dobra, em 1440 E em 390. A unica eager e a candidata a
// LCP (fetchpriority=high), que fica dentro da primeira dobra.
const rotas = ["/", "/servicos/", "/servicos/sites/", "/servicos/aplicativos/", "/exemplos/", "/exemplos/sites/", "/como-funciona/"];
for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  for (const rota of rotas) {
    test(`${rota} at ${viewport.width}: images have alt, size and the right loading (I2)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(rota);
      const imgs = await page.locator("main img").evaluateAll((els) =>
        els.map((el) => ({
          src: el.getAttribute("src"),
          alt: el.getAttribute("alt"),
          width: el.getAttribute("width"),
          height: el.getAttribute("height"),
          loading: el.getAttribute("loading"),
          prioridade: el.getAttribute("fetchpriority") === "high",
          visivel: el.getClientRects().length > 0,
          topo: el.getBoundingClientRect().top + window.scrollY,
        })),
      );
      expect(imgs.filter((img) => img.prioridade).length, "no maximo uma imagem com prioridade").toBeLessThanOrEqual(1);
      for (const img of imgs) {
        expect(img.alt, `${img.src} sem alt`).not.toBeNull();
        expect(Number(img.width) > 0 && Number(img.height) > 0, `${img.src} sem width/height`).toBe(true);
        if (img.prioridade) {
          expect(img.loading, `${img.src} com prioridade e lazy`).not.toBe("lazy");
          expect(img.topo, `${img.src} com prioridade fora da primeira dobra`).toBeLessThan(viewport.height);
        } else if (img.visivel && img.topo >= viewport.height) {
          expect(img.loading, `${img.src} abaixo da dobra sem lazy`).toBe("lazy");
        }
      }
    });
  }
}

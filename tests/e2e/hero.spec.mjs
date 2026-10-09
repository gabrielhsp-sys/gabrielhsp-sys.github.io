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

// Decisao do Gabriel (2026-10-09): o "Sobre" sai da home e a bancada fica so
// atras do hero. Depois dele vem "Projetos em destaque", como na main, sem
// imagem de fundo em nada abaixo.
for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test.describe(`at ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });

    test("the bench image stays inside the hero", async ({ page }) => {
      await page.goto("/");
      const box = await page.evaluate(() => {
        const section = document.querySelector(".hero");
        const hero = section.getBoundingClientRect();
        const line = parseFloat(getComputedStyle(section).borderBottomWidth);
        const layer = document.querySelector(".hero-image");
        const image = layer.getBoundingClientRect();
        // Acaba na linha de baixo do hero (a mesma da main), sem passar dela.
        return { position: getComputedStyle(layer).position, top: image.top - hero.top, bottom: hero.bottom - line - image.bottom };
      });
      expect(box).toEqual({ position: "absolute", top: 0, bottom: 0 });
      // Rolando, a imagem sobe com o hero: nada preso na tela.
      await page.evaluate(() => scrollTo({ top: innerHeight * 1.5, behavior: "instant" }));
      expect(await page.locator(".hero-image").evaluate((el) => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
    });

    test("projects come right after the hero, with no background image below it", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("#sobre, .bench-about")).toHaveCount(0);
      const facts = await page.evaluate(() => {
        const hero = document.querySelector(".hero");
        const featured = document.querySelector("#projetos");
        const heading = featured.querySelector("h2").getBoundingClientRect().top;
        const below = [...document.querySelectorAll("body *")].filter((el) => hero.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING && !hero.contains(el));
        return {
          next: hero.nextElementSibling?.id,
          gap: heading - hero.getBoundingClientRect().bottom,
          padding: parseFloat(getComputedStyle(featured).paddingTop),
          images: below.filter((el) => getComputedStyle(el).backgroundImage.includes("url(") || el.matches("img, picture, video")).map((el) => el.className || el.tagName),
        };
      });
      expect(facts.next).toBe("projetos");
      expect(facts.gap).toBeCloseTo(facts.padding, 0);
      expect(facts.images).toEqual([]);
    });
  });
}

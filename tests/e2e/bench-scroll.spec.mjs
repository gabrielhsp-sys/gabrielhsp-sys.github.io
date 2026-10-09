import { expect, test } from "@playwright/test";

// Regressao (2026-10-09): no Firefox, sem animation-timeline, as frases do
// "Sobre" ficavam paradas e totalmente acesas. Em todo motor elas precisam
// comecar apagadas, acender com a rolagem e apagar de novo quando ela volta;
// a bancada apaga no fim do "Sobre".

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("gsys:booted", "1"));
});

// Rola sem animacao (o html tem scroll-behavior: smooth) e espera dois quadros.
const opacityAt = (page, selector, edge, fraction) =>
  page.evaluate(async ({ selector, edge, fraction }) => {
    const element = document.querySelector(selector);
    const anchor = edge === "bottom" ? document.querySelector(".bench") : element;
    const box = anchor.getBoundingClientRect();
    const y = (edge === "bottom" ? box.bottom : box.top) + scrollY;
    scrollTo({ top: y - innerHeight * fraction, behavior: "instant" });
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return Number(getComputedStyle(element).opacity);
  }, { selector, edge, fraction });

const line = ".bench-about-lines p";

test("the about lines light up with the scroll and dim again going back", async ({ page }) => {
  await page.goto("/");
  expect(await opacityAt(page, line, "top", 0.97)).toBeLessThan(0.4);
  expect(await opacityAt(page, line, "top", 0.4)).toBeGreaterThan(0.95);
  expect(await opacityAt(page, line, "top", 0.97)).toBeLessThan(0.4);
});

test("the bench image fades out at the end of the about section", async ({ page }) => {
  await page.goto("/");
  expect(await opacityAt(page, ".bench-stage", "bottom", 1)).toBeGreaterThan(0.95);
  expect(await opacityAt(page, ".bench-stage", "bottom", 0.3)).toBeLessThan(0.05);
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("the about lines stay lit", async ({ page }) => {
    await page.goto("/");
    expect(await opacityAt(page, line, "top", 0.97)).toBe(1);
    expect(await opacityAt(page, ".bench-stage", "bottom", 0.3)).toBe(1);
  });
});

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

// Posiciona o topo da frase `index` a `fraction` da altura da tela e devolve a
// opacidade e o deslocamento dela. O topo vem da cadeia de offsetTop, que nao
// enxerga o transform do proprio efeito.
const lineAt = (page, index, fraction) =>
  page.evaluate(async ({ index, fraction }) => {
    const element = document.querySelectorAll(".bench-about-lines p")[index];
    let top = 0;
    for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
    scrollTo({ top: top - innerHeight * fraction, behavior: "instant" });
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const style = getComputedStyle(element);
    return { opacity: Number(style.opacity), shift: style.transform === "none" ? 0 : new DOMMatrix(style.transform).m42 };
  }, { index, fraction });

// Regressao (2026-10-09, segunda rodada): no PC do Gabriel as frases pareciam
// paradas porque a faixa acabava com a frase a ~60% da tela (cover 38%): na
// metade de baixo ela ja estava quase toda acesa (0,91 a 70%) e so os 15% de
// baixo da tela mostravam o efeito. Agora cada frase acende entre 85% e 50% da
// altura da tela, e isso vale para todas, nao so para a primeira.
test("every about line is dim at 85% of the screen and lit at 50%", async ({ page }) => {
  await page.goto("/");
  const count = await page.locator(line).count();
  expect(count).toBeGreaterThan(1);
  for (let index = 0; index < count; index++) {
    const low = await lineAt(page, index, 0.85);
    expect(low.opacity, `frase ${index} a 85%`).toBeLessThan(0.25);
    expect(low.shift, `frase ${index} a 85%`).toBeGreaterThan(6);
    const middle = await lineAt(page, index, 0.7);
    expect(middle.opacity, `frase ${index} a 70%`).toBeGreaterThan(0.35);
    expect(middle.opacity, `frase ${index} a 70%`).toBeLessThan(0.8);
    const lit = await lineAt(page, index, 0.5);
    expect(lit.opacity, `frase ${index} a 50%`).toBeGreaterThan(0.97);
    expect(Math.abs(lit.shift), `frase ${index} a 50%`).toBeLessThan(0.5);
    // Rolando de volta, apaga de novo.
    expect((await lineAt(page, index, 0.85)).opacity, `frase ${index} de volta a 85%`).toBeLessThan(0.25);
  }
});

// Com a roda do mouse, como o Gabriel rola: com a ultima frase na metade de
// baixo da tela, ela tem de estar visivelmente mais apagada que a primeira.
test("scrolling with the wheel leaves the lower line dimmer than the upper one", async ({ page }) => {
  await page.goto("/");
  await page.mouse.move(700, 450);
  const read = () => page.evaluate(() => [...document.querySelectorAll(".bench-about-lines p")].map((p) => {
    const box = p.getBoundingClientRect();
    return { at: box.top / innerHeight, opacity: Number(getComputedStyle(p).opacity) };
  }));
  let seen = false;
  for (let step = 0; step < 30 && !seen; step++) {
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(250);
    const lines = await read();
    const upper = lines.find((l) => l.at > 0.3 && l.at < 0.5);
    const lower = lines.find((l) => l.at > 0.72 && l.at < 0.84);
    if (upper && lower) {
      expect(upper.opacity).toBeGreaterThan(0.95);
      expect(lower.opacity).toBeLessThan(upper.opacity - 0.3);
      seen = true;
    }
  }
  expect(seen, "uma frase acima e outra abaixo na mesma tela").toBe(true);
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
    expect(await lineAt(page, 0, 0.97)).toEqual({ opacity: 1, shift: 0 });
    expect(await opacityAt(page, ".bench-stage", "bottom", 0.3)).toBe(1);
  });
});

// O painel de diagnostico so existe com ?debug=reveal, diz o caminho de cada
// motor e mostra a opacidade que o navegador aplicou, nao uma leitura atrasada.
test("the reveal debug panel shows only with ?debug=reveal", async ({ page, browserName }) => {
  await page.goto("/");
  await expect(page.locator("[data-reveal-debug]")).toHaveCount(0);
  await page.goto("/?debug=reveal");
  const panel = page.locator("[data-reveal-debug] pre");
  await expect(panel).toContainText(browserName === "chromium" ? "caminho: CSS" : "caminho: JS (fallback)");
  const { opacity } = await lineAt(page, 0, 0.7);
  await expect(panel).toContainText(`#1  topo   70%  t 0.43  opacidade ${opacity.toFixed(2)}`);
});

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// /material/ com código por cliente (docs/design/material-codigo-2026-11/VERIFICACAO.md, A5,
// A10 e A11). A Function tem testes próprios (tests/material-rotas.test.mjs e
// npm run test:cloudflare); aqui só a fronteira de rede é simulada.
const CODIGO = "ana-u45r-cj4x";
const ERRO = "Código inválido ou vencido. Confira ou chame no WhatsApp.";
const WHATS = /^https:\/\/wa\.me\/5535998840168\?/;

const respostaJson = (status, corpo) => ({ status, contentType: "application/json", headers: { "cache-control": "no-store" }, body: JSON.stringify(corpo) });

async function abrir(page, { tema = "light", hash = "", verificar = 200, enviar = 201, segurarEnvio = false } = {}) {
  await page.addInitScript((t) => { try { localStorage.setItem("gsys:tema", t); } catch { /* sem storage */ } }, tema);
  const pedidos = [];
  let soltar;
  const segurado = new Promise((r) => { soltar = r; });
  await page.route("**/api/material/verificar", async (route) => {
    pedidos.push(route.request());
    await route.fulfill(respostaJson(verificar, verificar === 200 ? { ok: true, cliente: "ana" } : { ok: false }));
  });
  await page.route("**/api/material/enviar", async (route) => {
    pedidos.push(route.request());
    if (segurarEnvio) await segurado;
    await route.fulfill(respostaJson(enviar, enviar === 201 ? { ok: true, arquivos: 1 } : { ok: false, erro: "Código inválido ou vencido." }));
  });
  await page.goto(`/material/${hash}`);
  await expect(page.locator("html")).toHaveAttribute("data-theme", tema);
  return { pedidos, soltar: () => soltar() };
}

async function entrar(page, codigo = CODIGO) {
  await page.getByLabel("Código de acesso").fill(codigo);
  await page.getByRole("button", { name: "Entrar" }).click();
}

async function preencherObrigatorios(page) {
  await page.getByLabel("Nome do negócio").fill("Lanchonete da Ana");
  await page.getByLabel("Seu nome").fill("Ana");
  await page.getByRole("radio", { name: "Loja" }).check();
  await page.getByLabel(/WhatsApp que vai aparecer no site/).fill("35 90000-0000");
  await page.getByLabel(/Autorizo o uso/).check();
  await page.getByLabel(/Confirmo que tenho direito/).check();
}

// Cada estado da página, do jeito que a pessoa chega nele.
const ESTADOS = {
  "sem código": async (page, tema) => {
    await abrir(page, { tema });
    await expect(page.getByLabel("Código de acesso")).toBeVisible();
  },
  erro: async (page, tema) => {
    await abrir(page, { tema, verificar: 403 });
    await entrar(page, "ana-errado-xxxx");
    await expect(page.getByRole("main").getByRole("alert")).toHaveText(ERRO);
  },
  formulário: async (page, tema) => {
    await abrir(page, { tema });
    await entrar(page);
    await expect(page.getByLabel("Nome do negócio")).toBeVisible();
  },
  envio: async (page, tema) => {
    await abrir(page, { tema, segurarEnvio: true });
    await entrar(page);
    await preencherObrigatorios(page);
    await page.getByRole("button", { name: /Enviar o material|Enviando/ }).click();
    await expect(page.getByRole("main").getByRole("status")).toContainText("Enviando");
  },
  sucesso: async (page, tema) => {
    await abrir(page, { tema });
    await entrar(page);
    await preencherObrigatorios(page);
    await page.getByRole("button", { name: "Enviar o material" }).click();
    await expect(page.getByRole("heading", { name: "Recebi tudo!" })).toBeVisible();
  },
  "link longo": async (page, tema) => {
    await abrir(page, { tema, hash: "#c=ana&e=4102444800&t=teste" });
    await expect(page.getByLabel("Nome do negócio")).toBeVisible();
  },
  "link vencido": async (page, tema) => {
    await abrir(page, { tema, hash: "#c=ana&e=4102444800&t=teste", verificar: 403 });
    await expect(page.getByRole("heading", { name: "Este link não vale mais" })).toBeVisible();
  },
};

// Contraste do texto de cada botão e link visível contra o fundo efetivo atrás dele:
// compõe os fundos (com alfa) dos ancestrais e aplica a opacidade acumulada.
async function medirBotoesELinks(page) {
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  // Mede o estado assentado: transição de cor no meio do caminho não é o que fica na tela.
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== "running"));
  return page.evaluate(() => {
    const rgba = (s) => {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return { r, g, b, a };
    };
    const sobre = (cima, baixo) => ({ r: cima.r * cima.a + baixo.r * (1 - cima.a), g: cima.g * cima.a + baixo.g * (1 - cima.a), b: cima.b * cima.a + baixo.b * (1 - cima.a), a: 1 });
    const lum = ({ r, g, b }) => {
      const canal = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
    };
    const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
    const opacidade = (el) => { let o = 1; for (let n = el; n; n = n.parentElement) o *= Number(getComputedStyle(n).opacity); return o; };
    // Fundo atrás do texto: o do próprio elemento (ou pseudo) sobre os ancestrais, até um opaco.
    const fundo = (el, proprio) => {
      const camadas = proprio ? [proprio] : [];
      for (let n = el.parentElement; n; n = n.parentElement) {
        const c = rgba(getComputedStyle(n).backgroundColor);
        if (c && c.a > 0) camadas.push(c);
        if (c && c.a === 1) break;
      }
      let cor = { r: 255, g: 255, b: 255, a: 1 };
      for (const c of camadas.reverse()) cor = sobre(c, cor);
      return cor;
    };
    const medir = (el, nome, estilo) => {
      const o = opacidade(el);
      const proprio = rgba(estilo.backgroundColor);
      const atras = fundo(el, null);
      const bg = proprio && proprio.a > 0 ? sobre({ ...proprio, a: proprio.a * o }, atras) : atras;
      const texto = rgba(estilo.color);
      const cor = sobre({ ...texto, a: texto.a * o }, bg);
      return { nome, contraste: Math.round(contraste(cor, bg) * 100) / 100 };
    };
    const visiveis = [...document.querySelectorAll("a[href], button, input[type=file]")].filter((el) => el.checkVisibility() && el.getClientRects().length > 0);
    return visiveis.map((el) => {
      const nome = `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || el.id).trim().replace(/\s+/g, " ").slice(0, 40)}"`;
      if (el.type === "file") return medir(el, `${nome} ::file-selector-button`, getComputedStyle(el, "::file-selector-button"));
      return medir(el, nome, getComputedStyle(el));
    });
  });
}

for (const tema of ["light", "dark"]) {
  for (const [estado, chegar] of Object.entries(ESTADOS)) {
    test(`every button and link has 4.5:1 text contrast in the "${estado}" state, ${tema} theme`, async ({ page }) => {
      await chegar(page, tema);
      const medidas = await medirBotoesELinks(page);
      expect(medidas.length).toBeGreaterThan(0);
      expect(medidas.filter((m) => m.contraste < 4.5).map((m) => `${m.nome}: ${m.contraste}:1`)).toEqual([]);
      const { violations } = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    });
  }
}

for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test(`without a code the page shows the title, a short line, the code field, Entrar and the WhatsApp way out at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await abrir(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Material do seu site/);
    const campo = page.getByLabel("Código de acesso");
    await expect(campo).toBeVisible();
    await expect(campo).toHaveAttribute("autocomplete", "off");
    await expect(campo).toHaveAttribute("inputmode", "text");
    await expect(campo).toHaveAttribute("autocapitalize", "none");
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
    await expect(page.getByText("Ainda não tem código?")).toBeVisible();
    await expect(page.getByRole("link", { name: "Chame no WhatsApp" })).toHaveAttribute("href", WHATS);
    await expect(page.getByLabel("Nome do negócio")).toHaveCount(0);
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}

test("a wrong code is announced with one short message that does not say which part is wrong", async ({ page }) => {
  await abrir(page, { verificar: 403 });
  await entrar(page, "ana-errado-xxxx");
  const alerta = page.getByRole("main").getByRole("alert");
  await expect(alerta).toHaveText(ERRO);
  const campo = page.getByLabel("Código de acesso");
  await expect(campo).toHaveAttribute("aria-invalid", "true");
  const descrito = await campo.getAttribute("aria-describedby");
  expect(descrito?.split(" ")).toContain(await alerta.getAttribute("id"));
  await expect(page.getByLabel("Nome do negócio")).toHaveCount(0);
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});

test("the code goes only in the request body, never in the address, and opens the form with the client's name", async ({ page }) => {
  const { pedidos } = await abrir(page);
  await entrar(page, `  ${CODIGO.toUpperCase()} `);
  await expect(page.getByLabel("Nome do negócio")).toBeVisible();
  await expect(page.getByText("ana", { exact: true })).toBeVisible();
  expect(page.url()).not.toMatch(/u45r|cj4x/i);
  const verificar = pedidos.find((r) => r.url().endsWith("/api/material/verificar"));
  expect(verificar.method()).toBe("POST");
  expect(verificar.url()).not.toMatch(/u45r|cj4x/i);
  expect(JSON.parse(verificar.postData())).toEqual({ codigo: `  ${CODIGO.toUpperCase()} ` });
  // O envio leva o código no corpo multipart, também fora da URL.
  await preencherObrigatorios(page);
  await page.getByRole("button", { name: "Enviar o material" }).click();
  await expect(page.getByRole("heading", { name: "Recebi tudo!" })).toBeVisible();
  const enviar = pedidos.find((r) => r.url().endsWith("/api/material/enviar"));
  expect(enviar.url()).not.toMatch(/u45r|cj4x/i);
  expect(enviar.postDataBuffer().toString("latin1")).toContain(`name="codigo"\r\n\r\n  ${CODIGO.toUpperCase()} `);
  expect(page.url()).not.toMatch(/u45r|cj4x/i);
});

test("the code survives a reload in the same tab only through sessionStorage, and a refused send clears it", async ({ page }) => {
  await abrir(page, { enviar: 403 });
  await entrar(page);
  await expect(page.getByLabel("Nome do negócio")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Nome do negócio")).toBeVisible();
  await preencherObrigatorios(page);
  await page.getByRole("button", { name: "Enviar o material" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(ERRO);
  await expect(page.getByLabel("Código de acesso")).toBeVisible();
  expect(await page.evaluate(() => JSON.stringify(sessionStorage))).not.toMatch(/u45r/);
});

test("the long signed link still opens the form", async ({ page }) => {
  const { pedidos } = await abrir(page, { hash: "#c=ana&e=4102444800&t=teste" });
  await expect(page.getByLabel("Nome do negócio")).toBeVisible();
  expect(JSON.parse(pedidos[0].postData())).toEqual({ c: "ana", e: "4102444800", t: "teste" });
});

import { expect, test } from "@playwright/test";

// WCAG 1.4.11 (contraste de componente): todo campo visivel de /material/ e
// /orcamento/ precisa de uma borda que se veja sem hover e sem foco. Mede a cor
// computada da borda contra o fundo atras do campo e exige 3:1. Nasceu de um
// defeito real: o campo tel do WhatsApp em /material/ ficava sem borda e sem
// fundo, porque a regra compartilhada so cobria input[type="text"].

async function semHoverNemFoco(page) {
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
}

// Devolve, para cada campo visivel, o contraste da borda contra o fundo atras dele.
async function medirCampos(page) {
  return page.evaluate(() => {
    const rgba = (s) => {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return { r, g, b, a };
    };
    const sobre = (cima, baixo) => ({
      r: cima.r * cima.a + baixo.r * (1 - cima.a),
      g: cima.g * cima.a + baixo.g * (1 - cima.a),
      b: cima.b * cima.a + baixo.b * (1 - cima.a),
      a: 1,
    });
    // Fundo efetivo atras do elemento: compoe os ancestrais ate achar um opaco.
    const fundoAtras = (el) => {
      const camadas = [];
      for (let n = el.parentElement; n; n = n.parentElement) {
        const c = rgba(getComputedStyle(n).backgroundColor);
        if (c && c.a > 0) camadas.push(c);
        if (c && c.a === 1) break;
      }
      let cor = { r: 255, g: 255, b: 255, a: 1 }; // tela do navegador
      for (const c of camadas.reverse()) cor = sobre(c, cor);
      return cor;
    };
    const lum = ({ r, g, b }) => {
      const canal = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
    };
    const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

    const campos = [...document.querySelectorAll("main input, main textarea, main select")]
      .filter((el) => el.type !== "hidden" && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden");
    return campos.map((el) => {
      const s = getComputedStyle(el);
      const rotulo = el.labels?.[0]?.textContent?.trim().replace(/\s+/g, " ") || el.name || el.id;
      const nome = `${el.tagName.toLowerCase()}[type=${el.type}] "${rotulo}"`;
      // Radio e checkbox com aparencia nativa: o navegador desenha o contorno
      // (com accent-color); a borda CSS nao e o que aparece. Mede o cartao do rotulo.
      const nativo = (el.type === "radio" || el.type === "checkbox") && s.appearance !== "none";
      const alvo = nativo ? el.closest("label") ?? el : el;
      const sa = getComputedStyle(alvo);
      const largura = parseFloat(sa.borderTopWidth);
      const borda = rgba(sa.borderTopColor);
      const atras = fundoAtras(alvo);
      if (!borda || largura === 0 || sa.borderTopStyle === "none") return { nome, contraste: 0, nativo };
      return { nome, contraste: Math.round(contraste(sobre(borda, atras), atras) * 100) / 100, nativo };
    });
  });
}

async function exigirContraste(page, onde) {
  await semHoverNemFoco(page);
  const campos = await medirCampos(page);
  expect(campos.length, `${onde}: nenhum campo visivel`).toBeGreaterThan(0);
  const fracos = campos.filter((c) => c.contraste < 3).map((c) => `${c.nome}: ${c.contraste}:1`);
  expect(fracos, `${onde}: campos com borda abaixo de 3:1`).toEqual([]);
}

test("/material/: every visible field has a 3:1 border at rest", async ({ page }) => {
  // A Function confere o token; aqui so a fronteira de rede e simulada.
  await page.route("**/api/material/verificar", (route) => route.fulfill({ status: 200, contentType: "application/json", body: "{\"ok\":true}" }));
  await page.goto("/material/#c=teste&e=4102444800&t=teste");
  await expect(page.getByLabel(/WhatsApp que vai aparecer no site/)).toBeVisible();
  await exigirContraste(page, "/material/ (inicio)");
  // Ramos com textos longos e com arquivos mostram campos a mais.
  for (const ramo of ["Alimentação", "Loja", "Saúde"]) {
    await page.getByRole("radio", { name: ramo }).check();
    await exigirContraste(page, `/material/ (${ramo})`);
  }
});

const marcar = (page, nome) => page.getByRole("radio", { name: nome, exact: false }).check();
const caixa = (page, nome) => page.getByRole("checkbox", { name: nome }).check();
const continuar = (page) => page.getByRole("button", { name: "Continuar" }).click();

async function primeirosPassos(page, precisa) {
  await page.addInitScript(() => localStorage.removeItem("gsys:orcamento"));
  await page.goto("/orcamento/?origem=teste");
  await expect(page.getByRole("button", { name: "Continuar" })).toBeVisible();
  await exigirContraste(page, "/orcamento/ passo 1");
  await marcar(page, precisa);
  await continuar(page);
  await expect(page.getByLabel("Seu nome")).toBeVisible();
  await exigirContraste(page, "/orcamento/ passo 2");
  await page.getByLabel("Seu nome").fill("Ana");
  await page.getByLabel(/Nome do negócio/).fill("Studio Ana");
  await page.getByLabel(/Cidade/).fill("Areado");
  await marcar(page, "Beleza e estética");
  await continuar(page);
}

test("/orcamento/ site branch: every visible field has a 3:1 border at rest, step by step", async ({ page }) => {
  await primeirosPassos(page, "Um site");
  await exigirContraste(page, "/orcamento/ site");
  await caixa(page, "Chamar no WhatsApp");
  await marcar(page, "Catálogo com pedido no WhatsApp");
  await continuar(page);
  await expect(page.getByRole("heading", { name: "Sobre os produtos" })).toBeVisible();
  await exigirContraste(page, "/orcamento/ produtos");
  await marcar(page, "20 a 100");
  await continuar(page);
  await expect(page.getByRole("heading", { name: "Para fechar" })).toBeVisible();
  await exigirContraste(page, "/orcamento/ para fechar");
});

test("/orcamento/ app branch: every visible field has a 3:1 border at rest", async ({ page }) => {
  await primeirosPassos(page, "Um aplicativo");
  await expect(page.getByLabel(/O que a pessoa faz/)).toBeVisible();
  await exigirContraste(page, "/orcamento/ aplicativo");
});

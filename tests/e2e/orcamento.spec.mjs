import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Cada ramo do /orcamento/ termina no wa.me do Business com a mensagem certa.
// Oráculo: o texto esperado escrito à mão (mesmo formato de tests/orcamento.test.mjs).
const BUSINESS = "5535998840168";
const ABERTURA = "Olá, Gabriel! Vim pelo site e quero um orçamento.";
const RODAPE = "(gabrielsys.com.br/orcamento · origem: teste)";

const marcar = (page, nome) => page.getByRole("radio", { name: nome, exact: false }).check();
const caixa = (page, nome) => page.getByRole("checkbox", { name: nome }).check();
const continuar = (page) => page.getByRole("button", { name: "Continuar" }).click();

async function inicio(page, precisa) {
  await page.addInitScript(() => localStorage.removeItem("gsys:orcamento"));
  await page.goto("/orcamento/?origem=teste");
  await marcar(page, precisa);
  await continuar(page);
  await page.getByLabel("Seu nome").fill("Ana");
  await page.getByLabel(/Nome do negócio/).fill("Studio Ana");
  await page.getByLabel(/Cidade/).fill("Areado");
  await marcar(page, "Beleza e estética");
  await continuar(page);
}

async function fim(page, { prazo } = {}) {
  await continuar(page);
  await expect(page.getByRole("heading", { name: "Para fechar" })).toBeVisible();
  if (prazo) await page.getByLabel(/Tem prazo/).fill(prazo);
  await continuar(page);
  await expect(page.getByRole("heading", { name: "Confira e envie" })).toBeVisible();
  const href = await page.locator('[data-envio="whatsapp"]').getAttribute("href");
  const url = new URL(href);
  expect(url.origin + url.pathname).toBe(`https://wa.me/${BUSINESS}`);
  return url.searchParams.get("text");
}

const cabeca = (precisa) => [ABERTURA, "", `*O que preciso:* ${precisa}`, "*Negócio:* Studio Ana (Beleza e estética), Areado", "*Nome:* Ana", ""];

test("site branch, one page", async ({ page }) => {
  await inicio(page, "Um site");
  await caixa(page, "Agendar");
  await marcar(page, "Uma página só");
  await caixa(page, "Instagram");
  await expect(page.getByRole("link", { name: /site de exemplo do seu ramo/ })).toHaveAttribute("href", "/exemplos/sites/beleza/");
  expect(await fim(page, { prazo: "Março" })).toBe(
    [...cabeca("Um site"), "*No site, o cliente deve:* Agendar", "*Tipo de site:* Uma página só", "*Já tenho:* Instagram", "", "*Prazo:* Março", "", RODAPE].join("\n"),
  );
});

test("site branch, catalogue adds the products screen", async ({ page }) => {
  await inicio(page, "Um site");
  await caixa(page, "Chamar no WhatsApp");
  await marcar(page, "Catálogo com pedido no WhatsApp");
  await continuar(page);
  await expect(page.getByRole("heading", { name: "Sobre os produtos" })).toBeVisible();
  await expect(page.getByText("Passo 4 de 6")).toBeVisible();
  await marcar(page, "20 a 100");
  await caixa(page, "Retirada");
  await caixa(page, "Pix");
  expect(await fim(page)).toBe(
    [...cabeca("Um site"), "*No site, o cliente deve:* Chamar no WhatsApp", "*Tipo de site:* Catálogo com pedido no WhatsApp", "*Produtos:* 20 a 100 · Retirada · Pix", "", RODAPE].join("\n"),
  );
});

test("app branch", async ({ page }) => {
  await inicio(page, "Um aplicativo");
  await marcar(page, "Meus clientes");
  await page.getByLabel(/O que a pessoa faz/).fill("Marca horário");
  await marcar(page, "Pode abrir pelo navegador");
  await page.getByRole("group", { name: /login e senha/ }).getByRole("radio", { name: "Não sei" }).check();
  expect(await fim(page)).toBe(
    [...cabeca("Um aplicativo"), "*Quem vai usar:* Meus clientes", "*O que faz no aplicativo:* Marca horário", "*Loja de aplicativos:* Pode abrir pelo navegador", "*Login:* Não sei", "", RODAPE].join("\n"),
  );
});

test("Telegram bot branch", async ({ page }) => {
  await inicio(page, "Um robô no Telegram");
  await caixa(page, "Mandar lembretes");
  await page.getByLabel(/Explique com um exemplo/).fill("Lembrar a equipe da escala");
  await page.getByRole("group", { name: /Quem conversa/ }).getByRole("radio", { name: "Equipe" }).check();
  expect(await fim(page)).toBe(
    [...cabeca("Um robô no Telegram"), "*O robô deve:* Mandar lembretes", "*Exemplo:* Lembrar a equipe da escala", "*Conversa com:* Equipe", "", RODAPE].join("\n"),
  );
});

test("automation branch", async ({ page }) => {
  await inicio(page, "Uma automação");
  await page.getByLabel(/Que tarefa/).fill("Copiar a agenda para a planilha");
  await caixa(page, "Planilha");
  await marcar(page, "Uma vez por dia");
  expect(await fim(page)).toBe(
    [...cabeca("Uma automação"), "*Tarefa:* Copiar a agenda para a planilha", "*Onde acontece:* Planilha", "*Frequência:* Uma vez por dia", "", RODAPE].join("\n"),
  );
});

test("system branch", async ({ page }) => {
  await inicio(page, "Um sistema");
  await page.getByLabel(/O que o sistema precisa controlar/).fill("Clientes e pacotes");
  await page.getByRole("group", { name: "Quem vai usar?" }).getByRole("radio", { name: "Minha equipe" }).check();
  await page.getByRole("group", { name: /login próprio/ }).getByRole("radio", { name: "Sim" }).check();
  await marcar(page, "Os dois");
  expect(await fim(page)).toBe(
    [...cabeca("Um sistema"), "*O sistema controla:* Clientes e pacotes", "*Quem vai usar:* Minha equipe", "*Login para cada pessoa:* Sim", "*No celular:* Os dois", "", RODAPE].join("\n"),
  );
});

test("other branch", async ({ page }) => {
  await inicio(page, "Outra coisa");
  await page.getByLabel(/Conte do seu jeito/).fill("Um cardápio na mesa");
  expect(await fim(page)).toBe([...cabeca("Outra coisa ou ainda não sei"), "*Detalhes:* Um cardápio na mesa", "", RODAPE].join("\n"));
});

test("sending opens WhatsApp with the message", async ({ page, context }) => {
  await inicio(page, "Outra coisa");
  await page.getByLabel(/Conte do seu jeito/).fill("Teste");
  await continuar(page);
  await continuar(page);
  await context.route("https://wa.me/**", (route) => route.fulfill({ status: 200, body: "ok" }));
  const [popup] = await Promise.all([page.waitForEvent("popup"), page.getByRole("link", { name: "Enviar pelo WhatsApp" }).click()]);
  expect(popup.url()).toMatch(new RegExp(`^https://wa\\.me/${BUSINESS}\\?text=`));
});

test("keyboard only: errors are announced, focus goes to the summary, then the form moves on", async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem("gsys:orcamento"));
  await page.goto("/orcamento/");
  // Continuar sem escolher: resumo de erro com foco.
  await page.getByRole("button", { name: "Continuar" }).focus();
  await page.keyboard.press("Enter");
  const resumo = page.getByRole("alert", { name: "Falta responder" });
  await expect(resumo).toContainText("Escolha uma opção.");
  await expect(resumo).toBeFocused();
  await expect(page.getByRole("radio", { name: /Um site/ })).toHaveAttribute("aria-invalid", "true");
  // Seta no grupo de opções escolhe; Enter no botão continua.
  await page.getByRole("radio", { name: /Um site/ }).focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Continuar" }).focus();
  await page.keyboard.press("Enter");
  const titulo = page.getByRole("heading", { name: "Sobre você e o seu negócio" });
  await expect(titulo).toBeFocused();
  await expect(page.getByText("Passo 2 de 5")).toBeVisible();
  // O campo com erro fica ligado à mensagem pelo aria-describedby.
  await page.keyboard.press("Tab");
  await page.getByRole("button", { name: "Continuar" }).focus();
  await page.keyboard.press("Enter");
  const nome = page.getByLabel("Seu nome");
  await expect(nome).toHaveAttribute("aria-invalid", "true");
  await expect(nome).toHaveAccessibleDescription(/Escreva uma resposta/);
});

test("the service page preselects the need", async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem("gsys:orcamento"));
  await page.goto("/orcamento/?precisa=robo&origem=servicos-bots");
  await expect(page.getByRole("radio", { name: /Um robô no Telegram/ })).toBeChecked();
});

for (const passo of ["inicio", "confira"]) {
  test(`no axe violations on the form (${passo})`, async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem("gsys:orcamento"));
    await page.goto("/orcamento/");
    if (passo === "confira") {
      await marcar(page, "Outra coisa");
      await continuar(page);
      await page.getByLabel("Seu nome").fill("Ana");
      await marcar(page, "Saúde");
      await continuar(page);
      await page.getByLabel(/Conte do seu jeito/).fill("Teste");
      await continuar(page);
      await continuar(page);
    }
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}

import assert from "node:assert/strict";
import test from "node:test";
import { etapasVisiveis, lerParametros, montarMensagem, validarEtapa } from "../lib/orcamento.ts";
import { linkWhatsApp } from "../lib/whatsapp.ts";

// Oráculo: a árvore da seção 4 do docs/design/unificacao-2026-11/PLANO.md,
// escrita à mão (ids das telas), não derivada do código.

test("a simple site walks five screens, the last one being check and send", () => {
  assert.deepEqual(etapasVisiveis({ precisa: "site", tipoSite: "uma-pagina" }), ["precisa", "negocio", "site", "fechar", "confira"]);
});

test("a catalogue or shop site adds the products screen right after the site screen", () => {
  for (const tipoSite of ["catalogo", "loja"]) {
    assert.deepEqual(etapasVisiveis({ precisa: "site", tipoSite }), ["precisa", "negocio", "site", "site-produtos", "fechar", "confira"]);
  }
});

test("every other need has its own third screen and nothing from the site branch", () => {
  const caminhos = {
    aplicativo: ["precisa", "negocio", "aplicativo", "fechar", "confira"],
    robo: ["precisa", "negocio", "robo", "fechar", "confira"],
    automacao: ["precisa", "negocio", "automacao", "fechar", "confira"],
    sistema: ["precisa", "negocio", "sistema", "fechar", "confira"],
    outro: ["precisa", "negocio", "outro", "fechar", "confira"],
  };
  for (const [precisa, esperado] of Object.entries(caminhos)) {
    assert.deepEqual(etapasVisiveis({ precisa, tipoSite: "catalogo" }), esperado, precisa);
  }
});

const CONTEXTO = { site: "gabrielsys.com.br", origem: "instagram" };

test("the catalogue site message matches the plan example, one answer per line", () => {
  const respostas = {
    precisa: "site",
    nome: "Maria",
    negocio: "Lanchonete da Maria",
    ramo: "alimentacao",
    cidade: "Areado",
    clienteFaz: ["whatsapp", "comprar"],
    tipoSite: "catalogo",
    jaTem: ["logo", "instagram"],
    produtos: "20-100",
    entrega: ["retirada", "entrega-local"],
    pagamento: ["pix", "dinheiro"],
    prazo: "Antes do Natal",
    investimento: "Prefiro conversar",
  };
  assert.equal(
    montarMensagem(respostas, CONTEXTO),
    [
      "Olá, Gabriel! Vim pelo site e quero um orçamento.",
      "",
      "*O que preciso:* Um site",
      "*Negócio:* Lanchonete da Maria (Alimentação), Areado",
      "*Nome:* Maria",
      "",
      "*No site, o cliente deve:* Chamar no WhatsApp, Comprar",
      "*Tipo de site:* Catálogo com pedido no WhatsApp",
      "*Já tenho:* Logo, Instagram",
      "*Produtos:* 20 a 100 · Retirada, Entrega local · Pix, Dinheiro",
      "",
      "*Prazo:* Antes do Natal",
      "*Investimento:* Prefiro conversar",
      "",
      "(gabrielsys.com.br/orcamento · origem: instagram)",
    ].join("\n"),
  );
});

test("answers from an abandoned branch and empty optional fields stay out of the message", () => {
  const respostas = {
    precisa: "robo",
    nome: "  João  ",
    negocio: "",
    ramo: "nao-negocio",
    cidade: "Poços de Caldas",
    // respondido antes de trocar "site" por "robô": não pode aparecer
    tipoSite: "catalogo",
    clienteFaz: ["whatsapp"],
    roboFaz: ["lembretes", "avisar"],
    roboExemplo: "Lembrar o grupo da pelada toda quinta às 18h.",
    roboConversa: "so-eu",
    prazo: "   ",
  };
  assert.equal(
    montarMensagem(respostas, { site: "gabrielsys.com.br" }),
    [
      "Olá, Gabriel! Vim pelo site e quero um orçamento.",
      "",
      "*O que preciso:* Um robô no Telegram",
      "*Negócio:* Não é para um negócio, Poços de Caldas",
      "*Nome:* João",
      "",
      "*O robô deve:* Avisar de algo, Mandar lembretes",
      "*Exemplo:* Lembrar o grupo da pelada toda quinta às 18h.",
      "*Conversa com:* Só eu",
      "",
      "(gabrielsys.com.br/orcamento)",
    ].join("\n"),
  );
});

test("the system, app, automation and other branches list their own answers", () => {
  const base = { nome: "Ana", negocio: "Studio Ana", ramo: "beleza" };
  const cabeca = (precisa) => ["Olá, Gabriel! Vim pelo site e quero um orçamento.", "", `*O que preciso:* ${precisa}`, "*Negócio:* Studio Ana (Beleza e estética)", "*Nome:* Ana", ""];
  const pe = ["", "(gabrielsys.com.br/orcamento · origem: instagram)"];
  const casos = [
    [
      { precisa: "sistema", sisControla: "Clientes e pacotes", sisQuem: "equipe", sisLogin: "sim", sisCelular: "os-dois", sisHoje: "Caderno" },
      [...cabeca("Um sistema"), "*O sistema controla:* Clientes e pacotes", "*Quem vai usar:* Minha equipe", "*Login para cada pessoa:* Sim", "*No celular:* Os dois", "*Hoje uso:* Caderno", ...pe],
    ],
    [
      { precisa: "aplicativo", appQuem: "clientes", appFaz: "Marcar horário", appLoja: "navegador", appLogin: "nao-sei" },
      [...cabeca("Um aplicativo"), "*Quem vai usar:* Meus clientes", "*O que faz no aplicativo:* Marcar horário", "*Loja de aplicativos:* Pode abrir pelo navegador", "*Login:* Não sei", ...pe],
    ],
    [
      { precisa: "automacao", autoTarefa: "Passar a agenda para a planilha", autoOnde: ["planilha", "whatsapp"], autoFrequencia: "uma-dia" },
      [...cabeca("Uma automação"), "*Tarefa:* Passar a agenda para a planilha", "*Onde acontece:* WhatsApp, Planilha", "*Frequência:* Uma vez por dia", ...pe],
    ],
    [
      { precisa: "outro", outroDescricao: "Um cardápio digital na mesa" },
      [...cabeca("Outra coisa ou ainda não sei"), "*Detalhes:* Um cardápio digital na mesa", ...pe],
    ],
  ];
  for (const [respostas, esperado] of casos) {
    assert.equal(montarMensagem({ ...base, ...respostas }, CONTEXTO), esperado.join("\n"), respostas.precisa);
  }
});

// needs-verification: o wa.me não documenta limite para ?text=. Teto adotado
// (VERIFICACAO.md): o link inteiro com até 2000 caracteres.
test("the longest possible answers still fit a 2000-character link and say the rest follows in the chat", () => {
  const longo = (n) => "Ação à noção, é só começar: ".repeat(n);
  const respostas = {
    precisa: "sistema",
    nome: longo(10),
    negocio: longo(10),
    cidade: longo(10),
    ramo: "servicos",
    sisControla: longo(200),
    sisQuem: "varios",
    sisLogin: "nao-sei",
    sisCelular: "os-dois",
    sisHoje: longo(200),
    prazo: longo(100),
    investimento: longo(100),
  };
  const mensagem = montarMensagem(respostas, CONTEXTO);
  const link = linkWhatsApp("5535998840168", mensagem);
  assert.ok(link.length <= 2000, `link com ${link.length} caracteres`);
  assert.match(mensagem, /\(continua na conversa\)/);
  // O que não é texto livre nunca é cortado.
  assert.match(mensagem, /\*Login para cada pessoa:\* Não sei/);
  assert.match(mensagem, /\(gabrielsys\.com\.br\/orcamento · origem: instagram\)$/);
});

test("a screen only moves on when its required answers exist, with one message per field", () => {
  assert.deepEqual(validarEtapa("precisa", {}), { precisa: "Escolha uma opção." });
  assert.deepEqual(validarEtapa("negocio", { nome: "   ", negocio: "" }), { nome: "Escreva uma resposta.", ramo: "Escolha uma opção." });
  assert.deepEqual(validarEtapa("site", { clienteFaz: [], tipoSite: "algumas" }), { clienteFaz: "Marque pelo menos uma opção." });
  assert.deepEqual(validarEtapa("negocio", { nome: "Maria", ramo: "saude" }), {});
  // Para fechar: tudo opcional.
  assert.deepEqual(validarEtapa("fechar", {}), {});
});

test("the link can preselect the need and carries a short, plain origin label", () => {
  assert.deepEqual(lerParametros("?precisa=robo&origem=servicos-bots"), { precisa: "robo", origem: "servicos-bots" });
  // Valor que não é opção some; origem só com letras minúsculas, dígitos e hífen, até 40.
  assert.deepEqual(lerParametros("?precisa=bot-whatsapp&origem=*Promo*%0AOi"), { precisa: undefined, origem: undefined });
  assert.deepEqual(lerParametros(`?origem=${"a".repeat(41)}`), { precisa: undefined, origem: undefined });
  assert.deepEqual(lerParametros(""), { precisa: undefined, origem: undefined });
});

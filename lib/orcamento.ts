// Formulário de orçamento (/orcamento/): a árvore de telas e o montador da
// mensagem do WhatsApp. Funções puras, sem import (o Node lê este arquivo direto
// nos testes) e sem React: o mesmo objeto de respostas pode, no futuro, ir
// também para o painel de orçamentos (projeto separado, ainda não existe).
// Fonte: docs/design/unificacao-2026-11/PLANO.md, seção 4.

export type Resposta = string | string[];
export type Respostas = Record<string, Resposta | undefined>;

export type EtapaId = "precisa" | "negocio" | "site" | "site-produtos" | "aplicativo" | "robo" | "automacao" | "sistema" | "outro" | "fechar" | "confira";

export type Opcao = { valor: string; rotulo: string; dica?: string };

export type Campo = {
  id: string;
  tipo: "radio" | "checkbox" | "texto" | "textarea";
  rotulo: string;
  /** Rótulo na mensagem do WhatsApp (sem os asteriscos). */
  naMensagem: string;
  obrigatorio: boolean;
  opcoes?: Opcao[];
  ajuda?: string;
  autocomplete?: string;
};

export type Etapa = { id: EtapaId; titulo: string; descricao?: string; campos: Campo[]; quando?: (r: Respostas) => boolean };

const op = (valor: string, rotulo: string, dica?: string): Opcao => ({ valor, rotulo, dica });

export const PRECISA: Opcao[] = [
  op("site", "Um site", "para o cliente achar você e chamar no WhatsApp"),
  op("aplicativo", "Um aplicativo", "agenda, pedidos, controle, cadastro"),
  op("robo", "Um robô no Telegram", "que avisa, responde ou lembra sozinho"),
  op("automacao", "Uma automação", "tarefa repetitiva, planilha ou relatório"),
  op("sistema", "Um sistema", "controle de clientes, pedidos, estoque ou agenda"),
  op("outro", "Outra coisa ou ainda não sei", "conte do seu jeito"),
];

export const RAMOS: Opcao[] = [
  op("alimentacao", "Alimentação"),
  op("beleza", "Beleza e estética"),
  op("cabeleireiro", "Barbearia ou cabeleireiro"),
  op("saude", "Saúde"),
  op("fitness", "Fitness"),
  op("loja", "Loja"),
  op("servicos", "Outros serviços"),
  op("nao-negocio", "Não é para um negócio"),
];

const quemUsa = [op("clientes", "Meus clientes"), op("equipe", "Minha equipe"), op("so-eu", "Só eu"), op("varios", "Mais de um desses")];
const simNaoSei = [op("sim", "Sim"), op("nao", "Não"), op("nao-sei", "Não sei")];

export const ETAPAS: Etapa[] = [
  {
    id: "precisa",
    titulo: "O que você precisa?",
    campos: [{ id: "precisa", tipo: "radio", rotulo: "O que você precisa?", naMensagem: "O que preciso", obrigatorio: true, opcoes: PRECISA }],
  },
  {
    id: "negocio",
    titulo: "Sobre você e o seu negócio",
    campos: [
      { id: "nome", tipo: "texto", rotulo: "Seu nome", naMensagem: "Nome", obrigatorio: true, autocomplete: "name" },
      { id: "negocio", tipo: "texto", rotulo: "Nome do negócio", naMensagem: "Negócio", obrigatorio: false, autocomplete: "organization" },
      { id: "cidade", tipo: "texto", rotulo: "Cidade", naMensagem: "Cidade", obrigatorio: false, autocomplete: "address-level2" },
      { id: "ramo", tipo: "radio", rotulo: "Tipo de negócio", naMensagem: "Ramo", obrigatorio: true, opcoes: RAMOS },
    ],
  },
  {
    id: "site",
    titulo: "Como vai ser o site?",
    quando: (r) => r.precisa === "site",
    campos: [
      {
        id: "clienteFaz", tipo: "checkbox", rotulo: "O que o cliente deve fazer no site?", naMensagem: "No site, o cliente deve", obrigatorio: true, ajuda: "Marque quantas quiser.",
        opcoes: [op("whatsapp", "Chamar no WhatsApp"), op("agendar", "Agendar"), op("ligar", "Ligar"), op("visitar", "Visitar o local"), op("comprar", "Comprar"), op("orcamento", "Pedir orçamento")],
      },
      {
        id: "tipoSite", tipo: "radio", rotulo: "Que tipo de site?", naMensagem: "Tipo de site", obrigatorio: true,
        opcoes: [op("uma-pagina", "Uma página só"), op("algumas", "Algumas páginas"), op("catalogo", "Catálogo com pedido no WhatsApp"), op("loja", "Loja com pagamento no site"), op("nao-sei", "Não sei, quero uma sugestão")],
      },
      {
        id: "jaTem", tipo: "checkbox", rotulo: "O que você já tem?", naMensagem: "Já tenho", obrigatorio: false, ajuda: "Marque o que já existe.",
        opcoes: [op("logo", "Logo"), op("fotos", "Fotos boas"), op("instagram", "Instagram"), op("endereco", "Endereço de site"), op("maps", "Perfil no Google Maps")],
      },
    ],
  },
  {
    id: "site-produtos",
    titulo: "Sobre os produtos",
    quando: (r) => r.precisa === "site" && (r.tipoSite === "catalogo" || r.tipoSite === "loja"),
    campos: [
      { id: "produtos", tipo: "radio", rotulo: "Quantos produtos?", naMensagem: "Produtos", obrigatorio: true, opcoes: [op("ate-20", "Até 20"), op("20-100", "20 a 100"), op("mais-100", "Mais de 100")] },
      { id: "entrega", tipo: "checkbox", rotulo: "Como o cliente recebe?", naMensagem: "Entrega", obrigatorio: false, opcoes: [op("retirada", "Retirada"), op("entrega-local", "Entrega local"), op("correios", "Correios")] },
      { id: "pagamento", tipo: "checkbox", rotulo: "Como o cliente paga?", naMensagem: "Pagamento", obrigatorio: false, opcoes: [op("pix", "Pix"), op("cartao", "Cartão"), op("dinheiro", "Dinheiro")] },
    ],
  },
  {
    id: "aplicativo",
    titulo: "Como vai ser o aplicativo?",
    quando: (r) => r.precisa === "aplicativo",
    campos: [
      { id: "appQuem", tipo: "radio", rotulo: "Quem vai usar?", naMensagem: "Quem vai usar", obrigatorio: true, opcoes: quemUsa },
      { id: "appFaz", tipo: "textarea", rotulo: "O que a pessoa faz no aplicativo?", naMensagem: "O que faz no aplicativo", obrigatorio: true, ajuda: "Por exemplo: marca horário, vê os pedidos, junta pontos." },
      { id: "appLoja", tipo: "radio", rotulo: "Precisa estar na loja de aplicativos?", naMensagem: "Loja de aplicativos", obrigatorio: true, opcoes: [op("sim", "Sim"), op("navegador", "Pode abrir pelo navegador"), op("nao-sei", "Não sei")] },
      { id: "appLogin", tipo: "radio", rotulo: "Cada pessoa entra com login e senha?", naMensagem: "Login", obrigatorio: true, opcoes: simNaoSei },
    ],
  },
  {
    id: "robo",
    titulo: "Como vai ser o robô?",
    quando: (r) => r.precisa === "robo",
    campos: [
      {
        id: "roboFaz", tipo: "checkbox", rotulo: "O que o robô deve fazer?", naMensagem: "O robô deve", obrigatorio: true, ajuda: "Marque quantas quiser.",
        opcoes: [op("avisar", "Avisar de algo"), op("responder", "Responder perguntas"), op("pedidos", "Receber pedidos"), op("lembretes", "Mandar lembretes"), op("outra", "Outra coisa")],
      },
      { id: "roboExemplo", tipo: "textarea", rotulo: "Explique com um exemplo", naMensagem: "Exemplo", obrigatorio: true, ajuda: "Por exemplo: quando entrar um pedido, avisar a cozinha no grupo." },
      { id: "roboConversa", tipo: "radio", rotulo: "Quem conversa com ele?", naMensagem: "Conversa com", obrigatorio: true, opcoes: [op("clientes", "Clientes"), op("equipe", "Equipe"), op("so-eu", "Só eu")] },
    ],
  },
  {
    id: "automacao",
    titulo: "Qual tarefa vai se fazer sozinha?",
    quando: (r) => r.precisa === "automacao",
    campos: [
      { id: "autoTarefa", tipo: "textarea", rotulo: "Que tarefa você quer que se faça sozinha?", naMensagem: "Tarefa", obrigatorio: true, ajuda: "Conte como você faz hoje, passo a passo." },
      {
        id: "autoOnde", tipo: "checkbox", rotulo: "Onde isso acontece?", naMensagem: "Onde acontece", obrigatorio: false, ajuda: "Marque quantas quiser.",
        opcoes: [op("whatsapp", "WhatsApp"), op("telegram", "Telegram"), op("planilha", "Planilha"), op("email", "E-mail"), op("site", "Site"), op("programa", "Outro programa"), op("papel", "Papel")],
      },
      { id: "autoFrequencia", tipo: "radio", rotulo: "Com que frequência?", naMensagem: "Frequência", obrigatorio: true, opcoes: [op("toda-hora", "Toda hora"), op("algumas-dia", "Algumas vezes por dia"), op("uma-dia", "Uma vez por dia"), op("quando-mandar", "Quando eu mandar")] },
    ],
  },
  {
    id: "sistema",
    titulo: "Como vai ser o sistema?",
    quando: (r) => r.precisa === "sistema",
    campos: [
      { id: "sisControla", tipo: "textarea", rotulo: "O que o sistema precisa controlar?", naMensagem: "O sistema controla", obrigatorio: true, ajuda: "Por exemplo: clientes e pedidos, estoque, agenda, alunos." },
      { id: "sisQuem", tipo: "radio", rotulo: "Quem vai usar?", naMensagem: "Quem vai usar", obrigatorio: true, opcoes: [op("so-eu", "Só eu"), op("equipe", "Minha equipe"), op("clientes", "Clientes"), op("varios", "Mais de um desses")] },
      { id: "sisLogin", tipo: "radio", rotulo: "Cada pessoa precisa de login próprio?", naMensagem: "Login para cada pessoa", obrigatorio: true, opcoes: simNaoSei },
      { id: "sisCelular", tipo: "radio", rotulo: "Vai usar no celular?", naMensagem: "No celular", obrigatorio: true, opcoes: [op("sim", "Sim"), op("computador", "Só no computador"), op("os-dois", "Os dois")] },
      { id: "sisHoje", tipo: "texto", rotulo: "Hoje você usa o quê?", naMensagem: "Hoje uso", obrigatorio: false, ajuda: "Caderno, planilha, outro programa…" },
    ],
  },
  {
    id: "outro",
    titulo: "Conte o que você precisa",
    quando: (r) => r.precisa === "outro",
    campos: [{ id: "outroDescricao", tipo: "textarea", rotulo: "Conte do seu jeito o que você precisa", naMensagem: "Detalhes", obrigatorio: true }],
  },
  {
    id: "fechar",
    titulo: "Para fechar",
    descricao: "As duas perguntas são opcionais.",
    campos: [
      { id: "prazo", tipo: "texto", rotulo: "Tem prazo ou data importante?", naMensagem: "Prazo", obrigatorio: false },
      { id: "investimento", tipo: "texto", rotulo: "Tem um valor em mente?", naMensagem: "Investimento", obrigatorio: false, ajuda: "Se preferir, deixe em branco e a gente conversa." },
    ],
  },
  { id: "confira", titulo: "Confira e envie", campos: [] },
];

/** As telas que a pessoa percorre, na ordem, dadas as respostas até agora. */
export function etapasVisiveis(r: Respostas): EtapaId[] {
  return ETAPAS.filter((e) => !e.quando || e.quando(r)).map((e) => e.id);
}

export const etapaPorId = (id: EtapaId) => ETAPAS.find((e) => e.id === id)!;

/* ───────────────────────── mensagem do WhatsApp ───────────────────────── */

const CONTINUA = "… (continua na conversa)";

/** Texto livre, aparado; acima de `limite` caracteres, cortado com o aviso. */
const cortar = (v: Resposta | undefined, limite = Infinity) => {
  const t = typeof v === "string" ? v.trim().replace(/\s+/g, " ") : "";
  return t.length > limite ? `${t.slice(0, limite).trimEnd()}${CONTINUA}` : t;
};
const lista = (v: Resposta | undefined) => (Array.isArray(v) ? v : []);

/** Rótulos das opções marcadas, na ordem em que aparecem na pergunta. */
function rotulos(campo: Campo, v: Resposta | undefined): string {
  const marcadas = typeof v === "string" ? [v] : lista(v);
  return (campo.opcoes ?? []).filter((o) => marcadas.includes(o.valor)).map((o) => o.rotulo).join(", ");
}

function valorNaMensagem(campo: Campo, r: Respostas, limite: number): string {
  return campo.opcoes ? rotulos(campo, r[campo.id]) : cortar(r[campo.id], limite);
}

const linha = (rotulo: string, valor: string) => (valor ? `*${rotulo}:* ${valor}` : "");

export type Contexto = { site: string; origem?: string };

/* needs-verification: o wa.me não documenta limite para ?text=. Teto adotado:
   o link inteiro com até 2000 caracteres. "https://wa.me/" + 13 dígitos +
   "?text=" ocupam 33; o texto codificado fica com o resto, menos uma folga. */
export const MAX_TEXTO_CODIFICADO = 1960;
const LIMITES = [Infinity, 400, 280, 200, 140, 100, 70, 50, 30];

/**
 * A mensagem que chega no WhatsApp: só o que foi respondido, uma resposta por
 * linha, em blocos (quem é, o pedido, prazo). Só usa as telas visíveis: o que
 * ficou de um caminho abandonado não entra.
 */
export function montarMensagem(r: Respostas, ctx: Contexto): string {
  // Do texto inteiro para cortes cada vez menores, até caber no link.
  let mensagem = "";
  for (const limite of LIMITES) {
    mensagem = compor(r, ctx, limite);
    if (encodeURIComponent(mensagem).length <= MAX_TEXTO_CODIFICADO) break;
  }
  return mensagem;
}

function compor(r: Respostas, ctx: Contexto, limite: number): string {
  const visiveis = etapasVisiveis(r);
  const campo = (etapa: EtapaId, id: string) => etapaPorId(etapa).campos.find((c) => c.id === id)!;

  const precisa = valorNaMensagem(campo("precisa", "precisa"), r, limite);
  const ramo = r.ramo === "nao-negocio" ? "" : rotulos(campo("negocio", "ramo"), r.ramo);
  const negocio = cortar(r.negocio, limite);
  const cidade = cortar(r.cidade, limite);
  const quem = r.ramo === "nao-negocio"
    ? ["Não é para um negócio", cidade].filter(Boolean).join(", ")
    : [negocio && ramo ? `${negocio} (${ramo})` : negocio || ramo, cidade].filter(Boolean).join(", ");

  const blocoQuem = [linha("O que preciso", precisa), linha("Negócio", quem), linha("Nome", cortar(r.nome, limite))];

  const blocoPedido: string[] = [];
  for (const id of visiveis) {
    if (["precisa", "negocio", "fechar", "confira"].includes(id)) continue;
    const etapa = etapaPorId(id);
    if (id === "site-produtos") {
      // Uma linha só para produtos, entrega e pagamento, separados por "·".
      const partes = etapa.campos.map((c) => valorNaMensagem(c, r, limite)).filter(Boolean);
      blocoPedido.push(linha("Produtos", partes.join(" · ")));
      continue;
    }
    for (const c of etapa.campos) blocoPedido.push(linha(c.naMensagem, valorNaMensagem(c, r, limite)));
  }

  const blocoFechar = etapaPorId("fechar").campos.map((c) => linha(c.naMensagem, valorNaMensagem(c, r, limite)));
  const rodape = `(${ctx.site}/orcamento${ctx.origem ? ` · origem: ${ctx.origem}` : ""})`;

  return [
    "Olá, Gabriel! Vim pelo site e quero um orçamento.",
    ...[blocoQuem, blocoPedido, blocoFechar].map((b) => b.filter(Boolean).join("\n")).filter(Boolean),
    rodape,
  ].join("\n\n");
}

/* ───────────────────────────── validação ───────────────────────────── */

const ERRO = { radio: "Escolha uma opção.", checkbox: "Marque pelo menos uma opção.", texto: "Escreva uma resposta.", textarea: "Escreva uma resposta." } as const;

/** Campos obrigatórios sem resposta numa tela: { idDoCampo: mensagem }. */
export function validarEtapa(id: EtapaId, r: Respostas): Record<string, string> {
  const erros: Record<string, string> = {};
  for (const c of etapaPorId(id).campos) {
    if (!c.obrigatorio) continue;
    const v = r[c.id];
    const vazio = Array.isArray(v) ? v.length === 0 : !(typeof v === "string" && v.trim());
    if (vazio) erros[c.id] = ERRO[c.tipo];
  }
  return erros;
}

/** `?precisa=` (uma opção da tela 1) e `?origem=` (rótulo curto) da URL. Sem cookie, sem rastreador. */
export function lerParametros(search: string): { precisa?: string; origem?: string } {
  const p = new URLSearchParams(search);
  const precisa = p.get("precisa") ?? "";
  const origem = p.get("origem") ?? "";
  return {
    precisa: PRECISA.some((o) => o.valor === precisa) ? precisa : undefined,
    origem: /^[a-z0-9-]{1,40}$/.test(origem) ? origem : undefined,
  };
}

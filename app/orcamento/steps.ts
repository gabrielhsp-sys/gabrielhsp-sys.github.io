/* Roteiro do briefing: as etapas, os campos e o resumo que vai para o WhatsApp.
   Tudo aqui e dado puro; o formulario so desenha o que esta descrito. */

export type Answers = Record<string, string | string[]>;

type Base = { id: string; label: string; hint?: string; required?: boolean };

export type TextField = Base & {
  kind: "text";
  multiline?: boolean;
  type?: "text" | "tel";
  autoComplete?: string;
  inputMode?: "text" | "tel";
};

export type ChoiceField = Base & {
  kind: "choice";
  options: readonly string[];
  multiple?: boolean;
  max?: number;
};

export type Field = TextField | ChoiceField;

export type Step = {
  id: string;
  title: string;
  fields: Field[];
  when?: (answers: Answers) => boolean;
};

const MARQUE = "Marque quantas quiser.";

export const TIPO_CATALOGO = "Catálogo com carrinho, com pedido fechado no WhatsApp";
export const TIPO_LOJA = "Loja com pagamento online";

export const steps: Step[] = [
  {
    id: "negocio",
    title: "Sobre o negócio",
    fields: [
      { kind: "text", id: "nome", label: "Seu nome", required: true, autoComplete: "name" },
      { kind: "text", id: "negocio", label: "Nome do negócio", required: true, autoComplete: "organization" },
      { kind: "text", id: "oque", label: "O que você faz, em uma ou duas frases", required: true, multiline: true },
      { kind: "text", id: "cidade", label: "Cidade ou região onde atende", autoComplete: "address-level2" },
      { kind: "choice", id: "atendimento", label: "Como você atende?", options: ["Presencial", "Online", "Os dois"] },
      { kind: "text", id: "cliente", label: "Quem é seu cliente ideal?", multiline: true },
      { kind: "text", id: "diferencial", label: "Por que escolhem você e não o concorrente?", multiline: true },
    ],
  },
  {
    id: "objetivo",
    title: "Objetivo do site",
    fields: [
      {
        kind: "choice",
        id: "acao",
        label: "O que o visitante deve fazer no site?",
        hint: MARQUE,
        required: true,
        multiple: true,
        options: ["Chamar no WhatsApp", "Agendar horário", "Ligar", "Visitar o local", "Comprar produtos", "Pedir orçamento"],
      },
      {
        kind: "choice",
        id: "tipo",
        label: "Que tipo de site você imagina?",
        required: true,
        options: ["Landing page", "Site com algumas páginas", TIPO_CATALOGO, TIPO_LOJA, "Não sei, quero uma recomendação"],
      },
      { kind: "text", id: "prazo", label: "Prazo ou data importante", hint: "Um lançamento, uma data comemorativa, uma campanha." },
    ],
  },
  {
    id: "conteudo",
    title: "Conteúdo",
    fields: [
      { kind: "text", id: "servicos", label: "Seus principais serviços ou produtos", multiline: true },
      { kind: "choice", id: "precos", label: "Mostrar preços no site?", options: ["Sim", "Não", "Só “a partir de”"] },
      { kind: "choice", id: "fotos", label: "Você tem fotos próprias?", options: ["Sim, boas", "Algumas", "Não tenho"] },
      {
        kind: "choice",
        id: "textos",
        label: "Quem escreve os textos?",
        options: ["Eu mando prontos", "Mando o básico e você melhora", "Você escreve tudo"],
      },
      { kind: "choice", id: "depoimentos", label: "Você tem depoimentos de clientes?", options: ["Sim", "Poucos", "Ainda não"] },
      {
        kind: "choice",
        id: "essencial",
        label: "O que não pode faltar?",
        hint: MARQUE,
        multiple: true,
        options: ["Endereço e mapa", "Horário", "Perguntas frequentes", "Equipe", "Planos e pacotes", "Formulário"],
      },
    ],
  },
  {
    id: "visual",
    title: "Visual",
    fields: [
      { kind: "choice", id: "logo", label: "Você tem logo?", options: ["Sim, em boa qualidade", "Só foto ou print", "Não tenho"] },
      { kind: "text", id: "cores", label: "Cores da marca", hint: "Pode ser o nome da cor ou o código, se souber." },
      {
        kind: "choice",
        id: "sensacao",
        label: "Que sensação o site deve passar?",
        hint: "Escolha até 3.",
        multiple: true,
        max: 3,
        options: ["Moderno", "Elegante", "Acolhedor", "Profissional", "Divertido", "Minimalista", "Premium", "Popular e acessível"],
      },
      { kind: "text", id: "referencias", label: "Sites que você gosta e por quê", multiline: true, hint: "Pode colar os links." },
      { kind: "text", id: "evitar", label: "Algo que você não quer", multiline: true },
    ],
  },
  {
    id: "contato",
    title: "Contato",
    fields: [
      {
        kind: "text",
        id: "whatsapp",
        label: "WhatsApp que recebe os contatos",
        hint: "Com DDD.",
        required: true,
        type: "tel",
        inputMode: "tel",
        autoComplete: "tel",
      },
      { kind: "text", id: "redes", label: "Instagram e outras redes", hint: "O @ ou o link." },
      { kind: "choice", id: "maps", label: "Você tem perfil no Google Maps?", options: ["Sim", "Não", "Não sei"] },
      {
        kind: "choice",
        id: "dominio",
        label: "Já tem domínio?",
        hint: "Domínio é o endereço do site, como seunegocio.com.br.",
        options: ["Sim", "Não", "Não sei o que é"],
      },
      { kind: "text", id: "dominioQual", label: "Se já tem, qual é o domínio?" },
    ],
  },
  {
    id: "produtos",
    title: "Produtos e pedidos",
    when: (answers) => answers.tipo === TIPO_CATALOGO || answers.tipo === TIPO_LOJA,
    fields: [
      { kind: "choice", id: "quantidade", label: "Quantos produtos, mais ou menos?", required: true, options: ["Até 20", "20 a 100", "Mais de 100"] },
      { kind: "text", id: "variacoes", label: "Os produtos têm variações?", hint: "Tamanho, cor, sabor, voltagem…" },
      { kind: "text", id: "categorias", label: "Quais são as categorias de produto?", multiline: true },
      {
        kind: "choice",
        id: "entrega",
        label: "Como o cliente recebe o pedido?",
        hint: MARQUE,
        multiple: true,
        options: ["Retirada", "Entrega local", "Correios ou transportadora"],
      },
      { kind: "text", id: "frete", label: "Como funciona o frete?", hint: "Grátis, fixo, por bairro, calculado…" },
      {
        kind: "choice",
        id: "pagamentos",
        label: "Pagamentos aceitos",
        hint: MARQUE,
        multiple: true,
        options: ["Pix", "Cartão", "Dinheiro", "Boleto"],
      },
      {
        kind: "choice",
        id: "atualiza",
        label: "Quem vai atualizar os produtos?",
        options: ["Eu mesmo, preciso de painel", "Eu te mando as mudanças"],
      },
    ],
  },
  {
    id: "fechar",
    title: "Para fechar",
    fields: [
      { kind: "text", id: "aprova", label: "Quem aprova o site?", hint: "Só você, um sócio, a família…" },
      { kind: "text", id: "investimento", label: "Faixa de investimento", hint: "Opcional. Ajuda a propor algo que caiba." },
      { kind: "text", id: "extra", label: "Algo mais que eu deva saber?", multiline: true },
    ],
  },
];

export const visibleSteps = (answers: Answers) => steps.filter((step) => !step.when || step.when(answers));

export const digits = (value: string) => value.replace(/\D/g, "");

/* Devolve a mensagem de erro do campo, ou null. Obrigatorio so onde marcado. */
export function fieldError(field: Field, value: Answers[string] | undefined): string | null {
  if (field.kind === "choice") {
    const picked = Array.isArray(value) ? value : value ? [value] : [];
    if (field.required && picked.length === 0) {
      return field.multiple ? "Marque pelo menos uma opção." : "Escolha uma opção.";
    }
    if (field.max && picked.length > field.max) {
      return `Escolha no máximo ${field.max}. Agora são ${picked.length}.`;
    }
    return null;
  }
  const text = typeof value === "string" ? value.trim() : "";
  if (field.required && !text) return "Este campo é obrigatório.";
  if (field.id === "whatsapp" && text && digits(text).length < 10) {
    return "Confira o número: com DDD, ele tem pelo menos 10 dígitos.";
  }
  return null;
}

const answerText = (value: Answers[string] | undefined) => {
  const text = Array.isArray(value) ? value.join(", ") : (value ?? "").trim();
  // Uma resposta por linha no WhatsApp: quebras viram barra.
  return text ? text.replace(/\s*\n+\s*/g, " / ") : "(sem resposta)";
};

/* O texto que vai para o WhatsApp e para a area de transferencia. So entram as
   etapas visiveis: se o tipo deixou de ser loja, a etapa de produtos sai. */
export function buildSummary(answers: Answers, date: Date) {
  const lines = ["BRIEFING DE SITE · GABRIEL.SYS", date.toLocaleDateString("pt-BR")];
  for (const step of visibleSteps(answers)) {
    lines.push("", `## ${step.title.toUpperCase()}`);
    for (const field of step.fields) {
      // "Pergunta? resposta" e "Rotulo: resposta" — nunca "?:".
      const joint = field.label.endsWith("?") ? " " : ": ";
      lines.push(`- ${field.label}${joint}${answerText(answers[field.id])}`);
    }
  }
  lines.push("", "Logo, fotos e materiais: envio pelo WhatsApp.");
  return lines.join("\n");
}

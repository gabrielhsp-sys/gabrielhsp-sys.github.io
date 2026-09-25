/* Roteiro do briefing: as etapas, os campos e o resumo que vai para o WhatsApp.
   Tudo aqui e dado puro; o formulario so desenha o que esta descrito. */

export type Answers = Record<string, string | string[]>;

type Base = {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  // Campo escondido nao valida e nao entra no resumo; a resposta fica guardada
  // caso a pessoa volte e mude a escolha que o escondeu.
  when?: (answers: Answers) => boolean;
};

export type TextField = Base & {
  kind: "text";
  multiline?: boolean;
  placeholder?: string;
  type?: "text" | "tel";
  autoComplete?: string;
  inputMode?: "text" | "tel";
};

export type ChoiceField = Base & {
  kind: "choice";
  options: readonly string[];
  // Descricao curta exibida abaixo da opcao; o valor gravado e so o rotulo.
  details?: Readonly<Record<string, string>>;
  multiple?: boolean;
  max?: number;
};

export type Field = TextField | ChoiceField;

export type Step = {
  id: string;
  title: string;
  hint?: string;
  fields: Field[];
  when?: (answers: Answers) => boolean;
};

const MARQUE = "Marque quantas quiser.";

export const CATEGORIA_SITE = "Site ou landing page";
export const CATEGORIA_AUTOMACAO = "Automação ou bot";
export const CATEGORIA_SISTEMA = "Sistema ou ferramenta sob medida";
export const CATEGORIA_DADOS = "Análise de dados ou planilha";
export const CATEGORIA_SCRIPT = "Script ou integração pontual";
export const CATEGORIA_OUTRO = "Outro / não sei";

const categoria = (valor: string) => (answers: Answers) => answers.categoria === valor;
const isSite = categoria(CATEGORIA_SITE);

export const TIPO_CATALOGO = "Catálogo com carrinho, com pedido fechado no WhatsApp";
export const TIPO_LOJA = "Loja com pagamento online";

export const steps: Step[] = [
  {
    id: "tipo-projeto",
    title: "Tipo de projeto",
    hint: "Isso decide quais perguntas eu vou fazer a seguir.",
    fields: [
      {
        kind: "choice",
        id: "categoria",
        label: "O que você precisa?",
        required: true,
        options: [CATEGORIA_SITE, CATEGORIA_AUTOMACAO, CATEGORIA_SISTEMA, CATEGORIA_DADOS, CATEGORIA_SCRIPT, CATEGORIA_OUTRO],
        details: {
          [CATEGORIA_SITE]: "Um site, página de vendas ou catálogo online",
          [CATEGORIA_AUTOMACAO]: "Um processo repetitivo rodando sozinho, tipo um bot de Telegram ou WhatsApp",
          [CATEGORIA_SISTEMA]: "Um painel, cadastro, app interno para organizar algo",
          [CATEGORIA_DADOS]: "Organizar, cruzar ou automatizar planilhas e relatórios",
          [CATEGORIA_SCRIPT]: "Uma tarefa técnica específica, menor e mais rápida",
          [CATEGORIA_OUTRO]: "Descreva do seu jeito que a gente encaixa",
        },
      },
    ],
  },
  {
    id: "sobre",
    title: "Sobre você",
    hint: "Quem você é e o contexto do projeto.",
    fields: [
      { kind: "text", id: "nome", label: "Seu nome", required: true, autoComplete: "name" },
      {
        kind: "text",
        id: "negocio",
        label: "Nome do negócio ou projeto",
        hint: "Se for algo pessoal, sem negócio por trás, pode deixar em branco.",
        autoComplete: "organization",
      },
      {
        kind: "text",
        id: "oque",
        label: "Me dê um resumo rápido do que você precisa",
        hint: "Pode ser bem breve — os detalhes vêm nas próximas perguntas.",
        required: true,
        multiline: true,
      },
      { kind: "text", id: "cidade", label: "Cidade ou região", autoComplete: "address-level2" },
      { kind: "text", id: "cliente", label: "Quem é seu cliente ideal?", multiline: true, when: isSite },
      { kind: "text", id: "diferencial", label: "Por que escolhem você e não o concorrente?", multiline: true, when: isSite },
    ],
  },
  {
    id: "objetivo",
    title: "Objetivo do site",
    when: isSite,
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
    when: isSite,
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
    when: isSite,
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
    id: "automacao",
    title: "A automação",
    hint: "O processo que deve rodar sozinho.",
    when: categoria(CATEGORIA_AUTOMACAO),
    fields: [
      {
        kind: "text",
        id: "autoTarefa",
        label: "Que tarefa você quer automatizar?",
        hint: "Descreva o processo de hoje, passo a passo, como se explicasse para alguém que nunca viu.",
        required: true,
        multiline: true,
      },
      {
        kind: "text",
        id: "autoFerramentas",
        label: "Quais ferramentas ou lugares estão envolvidos?",
        multiline: true,
        placeholder: "Ex.: WhatsApp, Telegram, planilha, e-mail, um site…",
      },
      {
        kind: "choice",
        id: "autoFrequencia",
        label: "Com que frequência isso deve rodar?",
        options: ["Em tempo real", "Algumas vezes por dia", "Uma vez por dia", "Só quando eu mandar rodar"],
      },
      { kind: "text", id: "autoPessoas", label: "Quantas pessoas vão usar ou receber o resultado?" },
      {
        kind: "choice",
        id: "autoContas",
        label: "Você já tem acesso ou conta nessas ferramentas?",
        options: ["Já tenho tudo", "Preciso criar algumas contas", "Não sei"],
      },
    ],
  },
  {
    id: "sistema",
    title: "O sistema",
    hint: "O que ele precisa fazer e para quem.",
    when: categoria(CATEGORIA_SISTEMA),
    fields: [
      {
        kind: "text",
        id: "sisFuncao",
        label: "O que o sistema precisa fazer?",
        hint: "A tarefa principal, em poucas frases.",
        required: true,
        multiline: true,
      },
      {
        kind: "choice",
        id: "sisUsuarios",
        label: "Quem vai usar?",
        options: ["Só eu", "Minha equipe", "Clientes externos", "Mais de um desses"],
      },
      { kind: "choice", id: "sisLogin", label: "Precisa de login com usuários diferentes?", options: ["Sim", "Não", "Não sei"] },
      {
        kind: "text",
        id: "sisDados",
        label: "Onde os dados devem ficar guardados?",
        placeholder: "Só nesse sistema, numa planilha que já uso, em outro app…",
      },
      {
        kind: "choice",
        id: "sisCelular",
        label: "Precisa funcionar bem no celular também?",
        options: ["Sim", "Só no computador", "Tanto faz"],
      },
      {
        kind: "text",
        id: "sisAtual",
        label: "Já usa algo parecido hoje que isso vai substituir ou melhorar?",
        multiline: true,
      },
    ],
  },
  {
    id: "dados",
    title: "Os dados",
    hint: "O que você tem e o que quer enxergar.",
    when: categoria(CATEGORIA_DADOS),
    fields: [
      {
        kind: "text",
        id: "dadosFonte",
        label: "Que dado você tem hoje, e em que formato?",
        hint: "Planilha, sistema, arquivo, papel…",
        required: true,
        multiline: true,
      },
      {
        kind: "text",
        id: "dadosObjetivo",
        label: "O que você quer descobrir ou decidir com esses dados?",
        required: true,
        multiline: true,
      },
      {
        kind: "choice",
        id: "dadosAtualiza",
        label: "Isso precisa se atualizar sozinho ou é uma entrega única?",
        options: ["Atualiza sozinho", "Entrega única", "Não sei"],
      },
      {
        kind: "choice",
        id: "dadosFormato",
        label: "Prefere ver isso como…",
        options: ["Gráfico ou painel", "Planilha", "Relatório em texto", "Não sei"],
      },
      {
        kind: "text",
        id: "dadosTamanho",
        label: "Tamanho aproximado dos dados",
        placeholder: "Ex.: 500 linhas, 10 anos de notas fiscais…",
      },
    ],
  },
  {
    id: "script",
    title: "O script",
    hint: "O problema pontual a resolver.",
    when: categoria(CATEGORIA_SCRIPT),
    fields: [
      { kind: "text", id: "scriptProblema", label: "Descreva o problema, em poucas frases", required: true, multiline: true },
      { kind: "text", id: "scriptFerramentas", label: "Quais ferramentas estão envolvidas?" },
      {
        kind: "choice",
        id: "scriptTipo",
        label: "É um ajuste em algo que já existe, ou algo novo?",
        options: ["Corrigir algo que já existe", "Coisa nova, pontual"],
      },
      {
        kind: "choice",
        id: "scriptUrgencia",
        label: "Tem urgência?",
        options: ["Sim, acho que é rápido de resolver", "Não, pode entrar na fila"],
      },
    ],
  },
  {
    id: "outro",
    title: "Seu projeto",
    hint: "Conta com suas palavras.",
    when: categoria(CATEGORIA_OUTRO),
    fields: [
      {
        kind: "text",
        id: "outroDescricao",
        label: "Descreva o que você precisa, do seu jeito",
        hint: "Pode ser bagunçado — a gente organiza depois.",
        required: true,
        multiline: true,
      },
      { kind: "text", id: "outroPrazo", label: "Tem prazo?" },
    ],
  },
  {
    id: "contato",
    title: "Contato",
    hint: "Para onde eu te chamo com a proposta.",
    fields: [
      {
        kind: "text",
        id: "whatsapp",
        label: "Seu WhatsApp",
        hint: "Com DDD.",
        required: true,
        type: "tel",
        inputMode: "tel",
        autoComplete: "tel",
      },
      { kind: "text", id: "redes", label: "Instagram e outras redes", hint: "O @ ou o link.", when: isSite },
      { kind: "choice", id: "maps", label: "Você tem perfil no Google Maps?", options: ["Sim", "Não", "Não sei"], when: isSite },
      {
        kind: "choice",
        id: "dominio",
        when: isSite,
        label: "Já tem domínio?",
        hint: "Domínio é o endereço do site, como seunegocio.com.br.",
        options: ["Sim", "Não", "Não sei o que é"],
      },
      { kind: "text", id: "dominioQual", label: "Se já tem, qual é o domínio?", when: isSite },
    ],
  },
  {
    id: "produtos",
    title: "Produtos e pedidos",
    when: (answers) => isSite(answers) && (answers.tipo === TIPO_CATALOGO || answers.tipo === TIPO_LOJA),
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
      { kind: "text", id: "aprova", label: "Quem decide sobre esse projeto do seu lado?", hint: "Só você, um sócio, a família…" },
      { kind: "text", id: "investimento", label: "Faixa de investimento", hint: "Opcional. Ajuda a propor algo que caiba." },
      { kind: "text", id: "extra", label: "Algo mais que eu deva saber?", multiline: true },
    ],
  },
];

const shown = (item: { when?: (answers: Answers) => boolean }, answers: Answers) => !item.when || item.when(answers);

export const visibleSteps = (answers: Answers) => steps.filter((step) => shown(step, answers));

export const visibleFields = (step: Step, answers: Answers) => step.fields.filter((field) => shown(field, answers));

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
   etapas e os campos visiveis: se a categoria deixou de ser site, ou o tipo
   deixou de ser loja, as perguntas que dependiam disso saem. A categoria vai
   no cabecalho, entao nao se repete no corpo. */
export function buildSummary(answers: Answers, date: Date) {
  const lines = [
    "BRIEFING DE PROJETO · GABRIEL.SYS",
    `Tipo: ${answerText(answers.categoria)}`,
    date.toLocaleDateString("pt-BR"),
  ];
  for (const step of visibleSteps(answers)) {
    const fields = visibleFields(step, answers).filter((field) => field.id !== "categoria");
    if (!fields.length) continue;
    lines.push("", `## ${step.title.toUpperCase()}`);
    for (const field of fields) {
      // "Pergunta? resposta" e "Rotulo: resposta" — nunca "?:" nem "…:".
      const joint = /[?…]$/.test(field.label) ? " " : ": ";
      lines.push(`- ${field.label}${joint}${answerText(answers[field.id])}`);
    }
  }
  lines.push("", "Arquivos, prints e materiais de apoio: envio pelo WhatsApp.");
  return lines.join("\n");
}

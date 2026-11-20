// Os 7 sites de exemplo (exemplos-sites/, Astro). Negócios fictícios; cada
// demo leva a faixa "Site de demonstração". Os ramos são os do formulário de
// material (Tally "Material do seu site") e do /orcamento/.

export const ramos = [
  { id: "alimentacao", ramo: "Alimentação", exemplo: "lanchonete" },
  { id: "beleza", ramo: "Beleza e estética", exemplo: "estúdio de estética" },
  { id: "cabeleireiro", ramo: "Barbearia ou cabeleireiro", exemplo: "barbearia" },
  { id: "saude", ramo: "Saúde", exemplo: "clínica" },
  { id: "fitness", ramo: "Fitness", exemplo: "academia" },
  { id: "loja", ramo: "Loja", exemplo: "empório" },
  { id: "servicos", ramo: "Outros serviços", exemplo: "oficina mecânica" },
] as const;

export type RamoId = (typeof ramos)[number]["id"];

export const demosSites: { id: RamoId; negocio: string; mostra: string }[] = [
  { id: "alimentacao", negocio: "Lanchonete Brasa & Pão", mostra: "Cardápio com preços e pedido montado que chega pronto no WhatsApp." },
  { id: "beleza", negocio: "Studio Íris Estética", mostra: "Tabela de serviços com duração e um pedido de horário pelo WhatsApp." },
  { id: "cabeleireiro", negocio: "Barbearia Navalha Fina", mostra: "Cortes com foto e preço, e o cliente escolhe o horário antes de chamar." },
  { id: "saude", negocio: "Clínica Vida Integrada", mostra: "Especialidades, convênios e como chegar, com marcação de consulta." },
  { id: "fitness", negocio: "Arena Fit Studio", mostra: "Planos, grade de aulas e agendamento da aula experimental." },
  { id: "loja", negocio: "Empório da Praça", mostra: "Catálogo com carrinho: o cliente monta o pedido e fecha pelo WhatsApp." },
  { id: "servicos", negocio: "Prado Serviços Automotivos", mostra: "Serviços com preço inicial e um pedido de orçamento organizado." },
];

export const ramoLabel = (id: string) => ramos.find((r) => r.id === id)?.ramo ?? id;

/** Caminho do demo no build único (base path do Astro). */
export const demoHref = (id: RamoId) => `/exemplos/sites/${id}/`;

/* Catálogo da página /exemplos/ (rodada visual 2026-11-20): grade com imagem e
   filtro por tipo de serviço. Cada item diz se é projeto real ou demonstração.
   Imagens: prints deste site (lib/capturas.json), o quadro do vídeo do Telegram
   Offers (feito por ele, public/videos/) ou, no Carona 70, só texto (não há
   print com dados de exemplo). */
export const tiposExemplo = [
  { id: "sites", nome: "Sites" },
  { id: "aplicativos", nome: "Aplicativos" },
  { id: "bots", nome: "Bots" },
  { id: "automacoes", nome: "Automações" },
  { id: "sistemas", nome: "Sistemas" },
] as const;
export type TipoExemplo = (typeof tiposExemplo)[number]["id"];

export type ImagemExemplo =
  | { moldura: "navegador" | "celular" | "conversa"; captura: string }
  | { moldura: "video"; src: string; width: number; height: number; alt: string }
  | { moldura: "texto" };

export type Exemplo = {
  id: string;
  tipo: TipoExemplo;
  natureza: "real" | "demo";
  titulo: string;
  mostra: string;
  href: string;
  /** Página Astro do mesmo build: <a> comum, fora do roteador do Next. */
  demoAstro?: boolean;
  imagem: ImagemExemplo;
};

export const exemplos: Exemplo[] = [
  ...demosSites.map((d) => ({
    id: `site-${d.id}`,
    tipo: "sites" as const,
    natureza: "demo" as const,
    titulo: d.negocio,
    // O print mostra o que o site faz; o texto so diz o ramo.
    mostra: ramoLabel(d.id),
    href: demoHref(d.id),
    demoAstro: true,
    imagem: { moldura: "navegador" as const, captura: `site-${d.id}-desktop` },
  })),
  {
    id: "carona-70",
    tipo: "aplicativos",
    natureza: "real",
    titulo: "Carona 70",
    mostra: "App Android que divide as contas da carona entre o grupo.",
    href: "/exemplos/aplicativos/",
    imagem: { moldura: "texto" },
  },
  {
    id: "telegram-offers",
    tipo: "bots",
    natureza: "real",
    titulo: "Telegram Offers",
    mostra: "Bot no ar: lê canais de promoção e só avisa quando vale.",
    href: "/exemplos/bots/",
    imagem: { moldura: "video", src: "/videos/telegram-offers.webp", width: 960, height: 540, alt: "Quadro do vídeo do Telegram Offers: o card de uma oferta encontrada, com produto, preço, cupom e loja." },
  },
  {
    id: "bot-lanchonete",
    tipo: "bots",
    natureza: "demo",
    titulo: "Bot de uma lanchonete",
    mostra: "Avisa pedido novo e responde o horário. Teste a conversa.",
    href: "/exemplos/bots/#sim-titulo",
    imagem: { moldura: "conversa", captura: "bot-conversa" },
  },
  {
    id: "automacao",
    tipo: "automacoes",
    natureza: "demo",
    titulo: "Pedidos viram planilha",
    mostra: "Pedido do WhatsApp vira linha na planilha, sem digitar.",
    href: "/exemplos/automacoes/",
    imagem: { moldura: "celular", captura: "automacao" },
  },
  {
    id: "sistema",
    tipo: "sistemas",
    natureza: "demo",
    titulo: "Controle de estoque",
    mostra: "Equipe registra entrada e saída; só o dono vê os alertas.",
    href: "/exemplos/sistemas/",
    imagem: { moldura: "celular", captura: "sistema" },
  },
];

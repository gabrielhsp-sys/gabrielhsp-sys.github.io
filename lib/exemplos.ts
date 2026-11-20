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

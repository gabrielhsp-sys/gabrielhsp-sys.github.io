export const site = {
  name: "GABRIEL.SYS",
  owner: "Gabriel Henrique",
  title: "Gabriel Henrique — software, automação e interfaces",
  description:
    "Gabriel Henrique constrói serviços que rodam sozinhos, sistemas com arquitetura e teste, e interfaces web rápidas. Projetos, estudos de caso e contato.",
  url: "https://gabrielhsp-sys.github.io",
  github: "https://github.com/gabrielhsp-sys",
  linkedin: "https://www.linkedin.com/in/gabrielhsp-dev/",
  email: "gabrielhspereira36@gmail.com",
} as const;

// Destino das respostas do briefing em /orcamento, so em digitos (formato do
// wa.me). Fica fora de `site` porque nao e contato publico do portfolio, que
// continua sendo so o e-mail: nenhuma pagina alem do briefing o mostra.
export const briefingWhatsapp = "5535998586626";

// As areas usam a lingua de quem contrata. O prefixo em mono e decoracao ao
// lado do nome legivel, nunca o rotulo principal.
export const areas = ["software", "web", "academico"] as const;

export const areaLabels: Record<(typeof areas)[number], string> = {
  software: "Software & Automação",
  web: "Web & Interfaces",
  academico: "Acadêmico",
};

export const areaDescriptions: Record<(typeof areas)[number], string> = {
  software: "Serviços que rodam sozinhos, sistemas com arquitetura e teste, Linux e automação.",
  web: "Sites e interfaces: acessibilidade, performance e conteúdo versionado.",
  academico: "Ciência da Computação na UNIFAL-MG: disciplinas, trabalhos e fundamentos.",
};

export const statuses = ["building", "live", "done", "archived"] as const;

export const statusLabels: Record<(typeof statuses)[number], string> = {
  building: "Em desenvolvimento",
  live: "No ar",
  done: "Concluído",
  archived: "Arquivado",
};

export const statusDescriptions: Record<(typeof statuses)[number], string> = {
  building: "trabalho em curso",
  live: "publicado e em operação agora",
  done: "entregue e sem trabalho pendente",
  archived: "preservado, sem atividade atual",
};

export const types = ["project", "log", "note"] as const;

// Para valores que chegam como string solta (indice de busca, props de
// componente cliente): devolve o rotulo publico, ou o proprio valor.
export const areaLabel = (value: string) => areaLabels[value as (typeof areas)[number]] ?? value;
export const statusLabel = (value: string) => statusLabels[value as (typeof statuses)[number]] ?? value;

// Ficha publica para quem contrata. So entra fato com evidencia; campo sem
// dado fica de fora em vez de ser adivinhado. O periodo leva o semestre junto
// para continuar verdadeiro depois que o semestre virar.
export const profile = {
  course: "Ciência da Computação (bacharelado)",
  term: "4º período em 2026/2",
  institution: "UNIFAL-MG",
  city: "Alfenas, MG",
  seeking: "Estágio",
} as const;

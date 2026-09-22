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

export const typeLabels: Record<(typeof types)[number], string> = {
  project: "Projeto",
  log: "Registro",
  note: "Nota",
};

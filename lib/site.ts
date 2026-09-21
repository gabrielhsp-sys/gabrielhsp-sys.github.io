export const site = {
  name: "GABRIEL.SYS",
  owner: "Gabriel Henrique",
  title: "GABRIEL.SYS — arquivo vivo de código, sistemas e estudos",
  description:
    "Projetos, estudos, homelab, hardware e registros de Gabriel Henrique — organizados como um arquivo vivo.",
  url: "https://gabrielhsp-sys.github.io",
  github: "https://github.com/gabrielhsp-sys",
  email: "mailto:gabrielhsp.dev@gmail.com",
} as const;

export const channels = [
  "CODE",
  "HOMELAB",
  "COLLEGE",
  "HARDWARE",
  "CREATE",
  "RESEARCH",
] as const;

export const statuses = ["PLAYING", "PAUSED", "CLEARED", "CODEX"] as const;

export const channelDescriptions: Record<(typeof channels)[number], string> = {
  CODE: "Software, arquitetura, automação e ferramentas.",
  HOMELAB: "Servidores, rede doméstica e infraestrutura real.",
  COLLEGE: "Ciência da Computação, disciplinas e trabalhos.",
  HARDWARE: "Máquinas, peças, manutenção e experimentos físicos.",
  CREATE: "Sites, interfaces, jogos e coisas feitas para existir.",
  RESEARCH: "Referências e investigações que alimentam os projetos.",
};

export const statusDescriptions: Record<(typeof statuses)[number], string> = {
  PLAYING: "em construção",
  PAUSED: "preservado",
  CLEARED: "entregue",
  CODEX: "consulta",
};

export const types = ["project", "log", "note", "reference"] as const;

export const typeLabels: Record<(typeof types)[number], string> = {
  project: "PROJETO",
  log: "REGISTRO",
  note: "NOTA",
  reference: "REFERÊNCIA",
};

// URL pública do site: a ÚNICA fonte. Next (metadata, sitemap, feed), demos Astro
// (exemplos-sites/astro.config.mjs) e o gerador de links do /material/ leem daqui.
// Este módulo não importa nada: o Node o lê direto nos scripts e testes.
// PENDENTE DE COMPRA: o domínio gabrielsys.com.br ainda não foi registrado
// (decisão 9 do prompt de 2026-11-19). Até a compra, nenhum link absoluto deste
// domínio funciona fora da prévia local.
export const SITE_URL = "https://gabrielsys.com.br";

export const site = {
  name: "GABRIEL.SYS",
  owner: "Gabriel Henrique",
  title: "GABRIEL.SYS — sites, aplicativos e robôs para o seu negócio",
  description:
    "Sites, aplicativos, robôs no Telegram, automações e sistemas sob encomenda para o seu negócio. Areado-MG, atendo online em todo o Brasil.",
  url: SITE_URL,
  github: "https://github.com/gabrielhsp-sys",
  linkedin: "https://www.linkedin.com/in/gabrielhsp-dev/",
  email: "gabrielhspereira36@gmail.com",
} as const;

// O WhatsApp de cliente mora em lib/contato.ts (so o Business). O e-mail acima
// e o contato da area do recrutador.

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

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(date)
    .replace(" de ", " ")
    .replace(" de ", " ")
    .toUpperCase();

// Acento, caixa e pontuacao de nome tecnico nao podem separar a busca da tag:
// "automacao" acha "automação", "cpp" acha "C++" e "nextjs" acha "Next.js".
export const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\+/g, "p")
    .replace(/(?<=[a-z0-9])\.(?=[a-z0-9])/g, "");

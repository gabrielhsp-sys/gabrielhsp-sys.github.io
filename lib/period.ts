// Periodo real de um projeto: quando o trabalho aconteceu, e nao quando o
// registro entrou no site. `YYYY` ou `YYYY-MM`; sem fim, o trabalho continua.
// Sem imports de proposito: os testes importam este arquivo direto no Node.

const MONTHS = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

export const PERIOD_POINT = /^\d{4}(-(0[1-9]|1[0-2]))?$/;

type Point = { year: number; month?: number };

const parse = (value: string): Point => {
  const [year, month] = value.split("-").map(Number);
  return { year, month };
};

const label = ({ year, month }: Point) => (month ? `${MONTHS[month - 1]} ${year}` : String(year));

// Um ano sem mes comeca em janeiro e termina em dezembro.
const monthIndex = ({ year, month }: Point, edge: "start" | "end") =>
  year * 12 + (month ?? (edge === "start" ? 1 : 12));

export function formatPeriod(startedAt: string, endedAt?: string) {
  const start = parse(startedAt);
  if (!endedAt) return `DESDE ${label(start)}`;

  const end = parse(endedAt);
  if (startedAt === endedAt) return label(start);
  // "MAR – JUL 2025": o ano so aparece uma vez quando os dois pontos tem mes.
  if (start.year === end.year && start.month && end.month) {
    return `${MONTHS[start.month - 1]} – ${label(end)}`;
  }
  return `${label(start)} – ${label(end)}`;
}

// O fim nunca vem antes do comeco.
export const isOrderedPeriod = (startedAt: string, endedAt: string) =>
  monthIndex(parse(endedAt), "end") >= monthIndex(parse(startedAt), "start");

// "Mais recente" = atividade mais recente: o que continua vem primeiro, depois
// quem terminou por ultimo; empate decide pelo comeco mais recente.
export function comparePeriods(
  a: { startedAt: string; endedAt?: string },
  b: { startedAt: string; endedAt?: string },
) {
  const end = (item: { endedAt?: string }) =>
    item.endedAt ? monthIndex(parse(item.endedAt), "end") : Number.POSITIVE_INFINITY;
  const byEnd = end(b) - end(a);
  if (byEnd !== 0 && !Number.isNaN(byEnd)) return byEnd;
  return monthIndex(parse(b.startedAt), "start") - monthIndex(parse(a.startedAt), "start");
}

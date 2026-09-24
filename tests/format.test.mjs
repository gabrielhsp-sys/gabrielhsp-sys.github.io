import assert from "node:assert/strict";
import test from "node:test";
// Os dois modulos nao importam nada: o Node le o TypeScript direto.
import { normalizeSearch } from "../lib/format.ts";
import { comparePeriods, formatPeriod, isOrderedPeriod } from "../lib/period.ts";

// Acento, caixa e pontuacao de nome tecnico nao podem separar a busca da tag.
test("search matches technical names and accents through their aliases", () => {
  const matches = (term, tag) => normalizeSearch(tag).includes(normalizeSearch(term));

  assert.ok(matches("cpp", "C++"));
  assert.ok(matches("c++", "C++"));
  assert.ok(matches("nextjs", "Next.js"));
  assert.ok(matches("next.js", "Next.js"));
  assert.ok(matches("automacao", "automação"));
  assert.ok(matches("DOCUMENTACAO", "documentação"));
  assert.ok(!matches("python", "C++"));
  // O ponto so some entre letras ou numeros: o fim de frase fica.
  assert.equal(normalizeSearch("fim."), "fim.");
});

// Periodo real: quando o trabalho aconteceu, nao quando entrou no site.
test("periods read as the months the work actually happened", () => {
  assert.equal(formatPeriod("2026-08"), "DESDE AGO 2026");
  assert.equal(formatPeriod("2025"), "DESDE 2025");
  assert.equal(formatPeriod("2026-06", "2026-06"), "JUN 2026");
  assert.equal(formatPeriod("2025", "2025"), "2025");
  assert.equal(formatPeriod("2025-03", "2025-07"), "MAR – JUL 2025");
  assert.equal(formatPeriod("2025-11", "2026-02"), "NOV 2025 – FEV 2026");
  assert.equal(formatPeriod("2024", "2025-03"), "2024 – MAR 2025");
});

test("a period never ends before it starts", () => {
  assert.equal(isOrderedPeriod("2026-06", "2026-05"), false);
  assert.equal(isOrderedPeriod("2026-06", "2026-06"), true);
  // Um ano sem mes cobre de janeiro a dezembro.
  assert.equal(isOrderedPeriod("2025", "2025-03"), true);
  assert.equal(isOrderedPeriod("2025-06", "2025"), true);
});

test("most recent means ongoing first, then the latest to finish", () => {
  const items = [
    { id: "cpp", startedAt: "2025", endedAt: "2025" },
    { id: "fedora", startedAt: "2026-08", endedAt: "2026-08" },
    { id: "faculdade", startedAt: "2025" },
    { id: "academic", startedAt: "2026-06", endedAt: "2026-06" },
    { id: "telegram", startedAt: "2026-08" },
    { id: "site", startedAt: "2025-06" },
  ];

  assert.deepEqual(
    [...items].sort(comparePeriods).map((item) => item.id),
    ["telegram", "site", "faculdade", "fedora", "academic", "cpp"],
  );
});

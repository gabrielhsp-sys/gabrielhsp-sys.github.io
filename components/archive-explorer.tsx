"use client";

import { useSyncExternalStore } from "react";
import { FunnelSimpleIcon as FunnelSimple, XIcon as X } from "@phosphor-icons/react";
import { ArchiveLine } from "@/components/archive-line";
import type { ArchiveItem } from "@/lib/content";
import { normalizeSearch } from "@/lib/format";
import { comparePeriods } from "@/lib/period";
import { areaLabel, areas as allAreas, statusLabel, statuses as allStatuses } from "@/lib/site";

type Order = "recent" | "alpha";

/* O filtro mora na URL (?area=web&estado=live&busca=java&ordem=az): da para
   mandar o recorte para alguem, e o voltar do navegador devolve o arquivo como
   estava. A URL e a fonte da verdade e entra por useSyncExternalStore, entao o
   HTML estatico sai sem filtro e a hidratacao nao diverge. */
const urlListeners = new Set<() => void>();
const subscribeUrl = (notify: () => void) => {
  urlListeners.add(notify);
  window.addEventListener("popstate", notify);
  return () => {
    urlListeners.delete(notify);
    window.removeEventListener("popstate", notify);
  };
};
const readSearch = () => window.location.search;

function writeParam(key: string, value: string | null) {
  const url = new URL(window.location.href);
  if (value) url.searchParams.set(key, value);
  else url.searchParams.delete(key);
  window.history.replaceState(window.history.state, "", url);
  urlListeners.forEach((notify) => notify());
}

const pick = (value: string | null, allowed: readonly string[]) =>
  value && allowed.includes(value) ? value : "ALL";

// Keep the canonical order from the schema instead of whatever order the
// content happens to be sorted in.
const inOrder = (canonical: readonly string[], present: string[]) => [
  "ALL",
  ...canonical.filter((value) => present.includes(value)),
];

export function ArchiveExplorer({ items }: { items: ArchiveItem[] }) {
  const search = useSyncExternalStore(subscribeUrl, readSearch, () => "");
  const params = new URLSearchParams(search);
  const area = pick(params.get("area"), allAreas);
  const status = pick(params.get("estado"), allStatuses);
  const term = params.get("busca") ?? "";
  const order: Order = params.get("ordem") === "az" ? "alpha" : "recent";

  const setArea = (value: string) => writeParam("area", value === "ALL" ? null : value);
  const setStatus = (value: string) => writeParam("estado", value === "ALL" ? null : value);
  const setTerm = (value: string) => writeParam("busca", value || null);
  const setOrder = (value: Order) => writeParam("ordem", value === "alpha" ? "az" : null);

  const areas = inOrder(allAreas, items.map((item) => item.area));
  const statuses = inOrder(allStatuses, items.map((item) => item.status));
  const filtered = area !== "ALL" || status !== "ALL" || term.trim() !== "";

  const needle = normalizeSearch(term.trim());
  const matched = items.filter((item) => {
    if (area !== "ALL" && item.area !== area) return false;
    if (status !== "ALL" && item.status !== status) return false;
    if (!needle) return true;
    return normalizeSearch(
      `${item.title} ${item.summary} ${areaLabel(item.area)} ${statusLabel(item.status)} ${item.tags.join(" ")}`,
    ).includes(needle);
  });
  const visible = order === "alpha"
    ? [...matched].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"))
    : [...matched].sort(comparePeriods);

  const clearAll = () => {
    for (const key of ["area", "estado", "busca"]) writeParam(key, null);
  };

  return (
    <div className="archive-explorer">
      <div className="filter-bar">
        <div className="filter-search">
          <label htmlFor="archive-term">
            <FunnelSimple size={18} aria-hidden="true" /> Filtrar
          </label>
          <input
            id="archive-term"
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="título, tecnologia, assunto…"
            autoComplete="off"
          />
          {term && (
            <button type="button" onClick={() => setTerm("")} aria-label="Limpar termo">
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="filter-group" role="group" aria-label="Filtrar por área">
          {areas.map((value) => (
            <button key={value} type="button" aria-pressed={area === value} data-active={area === value} onClick={() => setArea(value)}>
              {value === "ALL" ? "Todas as áreas" : areaLabel(value)}
            </button>
          ))}
        </div>
        <div className="filter-group" role="group" aria-label="Filtrar por estado">
          {statuses.map((value) => (
            <button key={value} type="button" aria-pressed={status === value} data-active={status === value} onClick={() => setStatus(value)}>
              {value === "ALL" ? "Qualquer estado" : statusLabel(value)}
            </button>
          ))}
        </div>
      </div>

      <div className="archive-status">
        <p className="result-count" role="status">
          <b>{visible.length}</b> de {items.length} projetos visíveis
          {filtered && (
            <button type="button" className="clear-all" onClick={clearAll}>
              limpar filtros
            </button>
          )}
        </p>
        <div className="order-group" role="group" aria-label="Ordenar">
          <button type="button" aria-pressed={order === "recent"} data-active={order === "recent"} onClick={() => setOrder("recent")}>
            Mais recente
          </button>
          <button type="button" aria-pressed={order === "alpha"} data-active={order === "alpha"} onClick={() => setOrder("alpha")}>
            A–Z
          </button>
        </div>
      </div>

      <div className="archive-table">
        {visible.map((item, index) => (
          <ArchiveLine item={item} index={index} key={item.id} />
        ))}
        {visible.length === 0 && (
          <div className="empty-state">
            <p>Nenhum projeto combina com esse filtro.</p>
            <button type="button" onClick={clearAll}>Limpar filtros</button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRightIcon as ArrowUpRight, FunnelSimpleIcon as FunnelSimple, XIcon as X } from "@phosphor-icons/react";
import { formatDate, normalizeSearch } from "@/lib/format";
import {
  areaLabels,
  areas as allAreas,
  statusLabels,
  statuses as allStatuses,
} from "@/lib/site";

type ArchiveItem = {
  id: string;
  title: string;
  summary: string;
  href: string;
  area: string;
  status: string;
  updatedAt: string;
  tags: string[];
};

type Order = "recent" | "alpha";

const areaLabel = (value: string) => areaLabels[value as (typeof allAreas)[number]] ?? value;
const statusLabel = (value: string) => statusLabels[value as (typeof allStatuses)[number]] ?? value;

// Keep the canonical order from the schema instead of whatever order the
// content happens to be sorted in.
const inOrder = (canonical: readonly string[], present: string[]) => [
  "ALL",
  ...canonical.filter((value) => present.includes(value)),
];

export function ArchiveExplorer({ items }: { items: ArchiveItem[] }) {
  const [area, setArea] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [term, setTerm] = useState("");
  const [order, setOrder] = useState<Order>("recent");

  const areas = inOrder(allAreas, items.map((item) => item.area));
  const statuses = inOrder(allStatuses, items.map((item) => item.status));
  const filtered = area !== "ALL" || status !== "ALL" || term.trim() !== "";

  const visible = useMemo(() => {
    const needle = normalizeSearch(term.trim());
    const matched = items.filter((item) => {
      if (area !== "ALL" && item.area !== area) return false;
      if (status !== "ALL" && item.status !== status) return false;
      if (!needle) return true;
      return normalizeSearch(
        `${item.title} ${item.summary} ${areaLabel(item.area)} ${statusLabel(item.status)} ${item.tags.join(" ")}`,
      ).includes(needle);
    });

    return order === "alpha"
      ? [...matched].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"))
      : [...matched].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [area, items, order, status, term]);

  const clearAll = () => {
    setArea("ALL");
    setStatus("ALL");
    setTerm("");
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
              <X size={16} />
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
          <Link href={item.href} key={item.id} className="archive-line">
            <span className="archive-line-index">{String(index + 1).padStart(2, "0")}</span>
            <span className="archive-line-title">
              <strong>{item.title}</strong>
              <small>{item.summary}</small>
            </span>
            <span className="archive-line-meta">
              <span className="archive-line-area" data-area={item.area}>{areaLabel(item.area)}</span>
              <span data-status={item.status}>{statusLabel(item.status)}</span>
              <time dateTime={item.updatedAt}>{formatDate(new Date(item.updatedAt))}</time>
            </span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
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

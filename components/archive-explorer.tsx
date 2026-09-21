"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRightIcon as ArrowUpRight, FunnelSimpleIcon as FunnelSimple, XIcon as X } from "@phosphor-icons/react";
import { formatDate, normalizeSearch } from "@/lib/format";
import { typeLabels, type types } from "@/lib/site";

type ArchiveItem = {
  id: string;
  title: string;
  summary: string;
  href: string;
  channel: string;
  status: string;
  type: string;
  updatedAt: string;
  tags: string[];
};

type Order = "recent" | "alpha";

const typeLabel = (value: string) =>
  typeLabels[value as (typeof types)[number]] ?? value.toUpperCase();

export function ArchiveExplorer({ items }: { items: ArchiveItem[] }) {
  const [channel, setChannel] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [term, setTerm] = useState("");
  const [order, setOrder] = useState<Order>("recent");

  const channels = ["ALL", ...new Set(items.map((item) => item.channel))];
  const statuses = ["ALL", ...new Set(items.map((item) => item.status))];
  const itemTypes = ["ALL", ...new Set(items.map((item) => item.type))];
  const filtered = channel !== "ALL" || status !== "ALL" || type !== "ALL" || term.trim() !== "";

  const visible = useMemo(() => {
    const needle = normalizeSearch(term.trim());
    const matched = items.filter((item) => {
      if (channel !== "ALL" && item.channel !== channel) return false;
      if (status !== "ALL" && item.status !== status) return false;
      if (type !== "ALL" && item.type !== type) return false;
      if (!needle) return true;
      return normalizeSearch(
        `${item.title} ${item.summary} ${item.channel} ${item.status} ${item.type} ${item.tags.join(" ")}`,
      ).includes(needle);
    });

    return order === "alpha"
      ? [...matched].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"))
      : [...matched].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [channel, items, order, status, term, type]);

  const clearAll = () => {
    setChannel("ALL");
    setStatus("ALL");
    setType("ALL");
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

        <div className="filter-group" role="group" aria-label="Filtrar por canal">
          {channels.map((value) => (
            <button key={value} type="button" aria-pressed={channel === value} data-active={channel === value} onClick={() => setChannel(value)}>
              {value === "ALL" ? "TODOS OS CANAIS" : `/${value}`}
            </button>
          ))}
        </div>
        <div className="filter-group" role="group" aria-label="Filtrar por estado">
          {statuses.map((value) => (
            <button key={value} type="button" aria-pressed={status === value} data-active={status === value} onClick={() => setStatus(value)}>
              {value === "ALL" ? "QUALQUER ESTADO" : value}
            </button>
          ))}
        </div>
        <div className="filter-group" role="group" aria-label="Filtrar por tipo">
          {itemTypes.map((value) => (
            <button key={value} type="button" aria-pressed={type === value} data-active={type === value} onClick={() => setType(value)}>
              {value === "ALL" ? "QUALQUER TIPO" : typeLabel(value)}
            </button>
          ))}
        </div>
      </div>

      <div className="archive-status">
        <p className="result-count" role="status">
          <b>{visible.length}</b> de {items.length} saves visíveis
          {filtered && (
            <button type="button" className="clear-all" onClick={clearAll}>
              limpar filtros
            </button>
          )}
        </p>
        <div className="order-group" role="group" aria-label="Ordenar">
          <button type="button" aria-pressed={order === "recent"} data-active={order === "recent"} onClick={() => setOrder("recent")}>
            MAIS RECENTE
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
              <span className="archive-line-channel">/{item.channel}</span>
              <span data-status={item.status}>{item.status}</span>
              <span className="archive-line-type">{typeLabel(item.type)}</span>
              <time dateTime={item.updatedAt}>{formatDate(new Date(item.updatedAt))}</time>
            </span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        ))}
        {visible.length === 0 && (
          <div className="empty-state">
            <p>Nenhum save ocupa esse cruzamento.</p>
            <button type="button" onClick={clearAll}>Limpar filtros</button>
          </div>
        )}
      </div>
    </div>
  );
}

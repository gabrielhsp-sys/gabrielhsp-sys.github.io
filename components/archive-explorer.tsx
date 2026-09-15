"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRightIcon as ArrowUpRight, FunnelSimpleIcon as FunnelSimple } from "@phosphor-icons/react";

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

export function ArchiveExplorer({ items }: { items: ArchiveItem[] }) {
  const [channel, setChannel] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const visible = useMemo(
    () => items.filter((item) =>
      (channel === "ALL" || item.channel === channel) &&
      (status === "ALL" || item.status === status),
    ),
    [channel, items, status],
  );

  const channels = ["ALL", ...new Set(items.map((item) => item.channel))];
  const statuses = ["ALL", ...new Set(items.map((item) => item.status))];

  return (
    <div className="archive-explorer">
      <div className="filter-bar">
        <span><FunnelSimple size={18} /> Filtrar</span>
        <div className="filter-group" role="group" aria-label="Filtrar por canal">
          {channels.map((value) => (
            <button key={value} type="button" aria-pressed={channel === value} data-active={channel === value} onClick={() => setChannel(value)}>
              {value === "ALL" ? "TODOS" : `/${value}`}
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
      </div>
      <p className="result-count"><b>{visible.length}</b> de {items.length} saves visíveis</p>
      <div className="archive-table">
        {visible.map((item, index) => (
          <Link href={item.href} key={item.id} className="archive-line">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <span className="archive-line-title"><strong>{item.title}</strong><small>{item.summary}</small></span>
            <span>/{item.channel}</span>
            <span data-status={item.status}>{item.status}</span>
            <ArrowUpRight size={18} />
          </Link>
        ))}
        {visible.length === 0 && (
          <div className="empty-state">
            <p>Nenhum save ocupa esse cruzamento.</p>
            <button type="button" onClick={() => { setChannel("ALL"); setStatus("ALL"); }}>
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

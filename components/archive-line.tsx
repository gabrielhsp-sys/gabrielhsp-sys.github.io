import Link from "next/link";
import { ArrowUpRightIcon as ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { formatDate } from "@/lib/format";
import { areaLabels, areas, statusLabels, statuses } from "@/lib/site";

export type ArchiveItem = {
  id: string;
  title: string;
  summary: string;
  href: string;
  area: string;
  status: string;
  updatedAt: string;
  tags: string[];
};

export const areaLabel = (value: string) => areaLabels[value as (typeof areas)[number]] ?? value;
export const statusLabel = (value: string) => statusLabels[value as (typeof statuses)[number]] ?? value;

// Uma linha do arquivo. A home e o explorador usam a mesma, para o mesmo
// projeto nao ter duas caras.
export function ArchiveLine({ item, index }: { item: ArchiveItem; index: number }) {
  return (
    <Link href={item.href} className="archive-line">
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
  );
}

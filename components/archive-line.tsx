import Link from "next/link";
import { ArrowUpRightIcon as ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { ArchiveItem } from "@/lib/content";
import { formatPeriod } from "@/lib/period";
import { areaLabels, statusLabels } from "@/lib/site";

// Uma linha do arquivo. Home, arquivo e paginas de area usam a mesma, para o
// mesmo projeto nao ter duas caras. `showArea` sai dentro de uma area: repetir
// o nome em cada linha nao informa nada.
export function ArchiveLine({
  item,
  index,
  showArea = true,
}: {
  item: ArchiveItem;
  index: number;
  showArea?: boolean;
}) {
  return (
    <Link href={item.href} className="archive-line">
      <span className="archive-line-index">{String(index + 1).padStart(2, "0")}</span>
      <span className="archive-line-title">
        <strong>{item.title}</strong>
        <small>{item.summary}</small>
      </span>
      <span className="archive-line-meta">
        {showArea && <span className="area-mark" data-area={item.area}>{areaLabels[item.area]}</span>}
        <span data-status={item.status}>{statusLabels[item.status]}</span>
        <span className="archive-line-period">{formatPeriod(item.startedAt, item.endedAt)}</span>
      </span>
      <ArrowUpRight size={18} aria-hidden="true" />
    </Link>
  );
}

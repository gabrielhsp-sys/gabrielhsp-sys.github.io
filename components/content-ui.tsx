import Link from "next/link";
import { ArrowUpRightIcon as ArrowUpRight, GitBranchIcon as GitBranch } from "@phosphor-icons/react/dist/ssr";
import type { ContentItem } from "@/lib/content-schema";
import { areaLabels, statusDescriptions, statusLabels } from "@/lib/site";

// Estado e sempre ponto redondo com o nome; area e sempre quadrado com o nome.
// A forma diz qual das duas coisas a cor esta marcando.
export function Status({ value }: { value: ContentItem["status"] }) {
  return (
    <span className="status" data-status={value} title={statusDescriptions[value]}>
      <i aria-hidden="true" /> {statusLabels[value]}
    </span>
  );
}

export function RelationList({ items }: { items: ContentItem[] }) {
  if (!items.length) return null;
  return (
    <section className="relations" aria-labelledby="relations-heading">
      <h2 id="relations-heading"><GitBranch size={24} aria-hidden="true" /> Projetos relacionados</h2>
      <div>
        {items.map((item) => (
          <Link href={item.href} key={item.id}>
            <span className="area-mark" data-area={item.area}>{areaLabels[item.area]}</span>
            <strong>{item.title}</strong>
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

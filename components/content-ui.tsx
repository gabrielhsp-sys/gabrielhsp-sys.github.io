import Link from "next/link";
import { ArrowUpRightIcon as ArrowUpRight, GitBranchIcon as GitBranch } from "@phosphor-icons/react/dist/ssr";
import type { ContentItem } from "@/lib/content-schema";
import { formatDate } from "@/lib/format";
import { statusDescriptions } from "@/lib/site";

export function Status({ value }: { value: ContentItem["status"] }) {
  return (
    <span className="status" data-status={value} title={statusDescriptions[value]}>
      <i aria-hidden="true" /> {value}
    </span>
  );
}

export function RecordRow({ item, index }: { item: ContentItem; index?: number }) {
  return (
    <article className="record-row">
      <span className="record-index" aria-hidden="true">
        {String((index ?? 0) + 1).padStart(2, "0")}
      </span>
      <div className="record-main">
        <div className="record-meta">
          <Link href={`/channel/${item.channel.toLowerCase()}/`}>/{item.channel}</Link>
          <Status value={item.status} />
          <time dateTime={item.updatedAt.toISOString()}>{formatDate(item.updatedAt)}</time>
        </div>
        <h3><Link href={item.href}>{item.title}</Link></h3>
        <p>{item.summary}</p>
      </div>
      <div className="record-tags" aria-label="Tecnologias e assuntos">
        {item.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      <Link className="record-open" href={item.href} aria-label={`Abrir ${item.title}`}>
        <ArrowUpRight size={22} />
      </Link>
    </article>
  );
}

export function RelationList({ items }: { items: ContentItem[] }) {
  if (!items.length) return null;
  return (
    <section className="relations" aria-labelledby="relations-heading">
      <h2 id="relations-heading"><GitBranch size={24} /> Saves relacionados</h2>
      <div>
        {items.map((item) => (
          <Link href={item.href} key={item.id}>
            <span>/{item.channel}</span>
            <strong>{item.title}</strong>
            <ArrowUpRight size={18} />
          </Link>
        ))}
      </div>
    </section>
  );
}

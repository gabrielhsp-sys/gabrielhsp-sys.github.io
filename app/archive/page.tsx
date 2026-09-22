import type { Metadata } from "next";
import { ArchiveExplorer } from "@/components/archive-explorer";
import { getAllContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projetos",
  description: "Todos os projetos públicos de Gabriel Henrique, filtráveis por área e estado.",
  alternates: { canonical: "/archive/" },
  openGraph: { url: "/archive/" },
};

export default function ArchivePage() {
  const items = getAllContent().map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    href: item.href,
    area: item.area,
    status: item.status,
    updatedAt: item.updatedAt.toISOString(),
    tags: item.tags,
  }));

  return (
    <main id="conteudo" className="inner-page">
      <header className="page-intro">
        <h1>Todos os projetos.<br /><em>Nenhuma gaveta misteriosa.</em></h1>
        <p>O que está público, em uma linha do tempo filtrável por área e por estado.</p>
        <code className="page-path">/projetos --todos</code>
      </header>
      <ArchiveExplorer items={items} />
    </main>
  );
}

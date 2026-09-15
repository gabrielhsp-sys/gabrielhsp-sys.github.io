import type { Metadata } from "next";
import { ArchiveExplorer } from "@/components/archive-explorer";
import { getAllContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Arquivo",
  description: "Todos os registros públicos do GABRIEL.SYS, filtráveis por canal e estado.",
  alternates: { canonical: "/archive/" },
  openGraph: { url: "/archive/" },
};

export default function ArchivePage() {
  const items = getAllContent().map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    href: item.href,
    channel: item.channel,
    status: item.status,
    type: item.type,
    updatedAt: item.updatedAt.toISOString(),
    tags: item.tags,
  }));

  return (
    <main id="conteudo" className="inner-page">
      <header className="page-intro">
        <h1>Todos os saves.<br /><em>Nenhuma gaveta misteriosa.</em></h1>
        <p>Projetos, notas e referências públicas em uma linha do tempo filtrável.</p>
        <code className="page-path">/archive --public</code>
      </header>
      <ArchiveExplorer items={items} />
    </main>
  );
}

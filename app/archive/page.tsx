import type { Metadata } from "next";
import { ArchiveExplorer } from "@/components/archive-explorer";
import { getAllContent, toArchiveItem } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Projetos",
  description: "Todos os projetos públicos de Gabriel Henrique, filtráveis por área e estado.",
  path: "/archive/",
});

export default function ArchivePage() {
  return (
    <main id="conteudo" className="inner-page">
      <header className="page-intro">
        <h1>Todos os projetos.</h1>
        <p>Nenhuma gaveta misteriosa: tudo o que está público, filtrável por área e por estado.</p>
      </header>
      <ArchiveExplorer items={getAllContent().map(toArchiveItem)} />
    </main>
  );
}

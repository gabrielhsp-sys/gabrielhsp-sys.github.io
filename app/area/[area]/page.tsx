import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchiveLine } from "@/components/archive-line";
import { getAllContent, getPublicAreas, toArchiveItem } from "@/lib/content";
import { areaDescriptions, areaLabels } from "@/lib/site";

type Props = { params: Promise<{ area: string }> };

export function generateStaticParams() {
  return getPublicAreas().map((area) => ({ area }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area: slug } = await params;
  const area = getPublicAreas().find((candidate) => candidate === slug);
  if (!area) return {};
  const canonical = `/area/${slug}/`;
  return {
    title: areaLabels[area],
    description: areaDescriptions[area],
    alternates: { canonical },
    openGraph: { url: canonical },
  };
}

export default async function AreaPage({ params }: Props) {
  const { area: slug } = await params;
  const area = getPublicAreas().find((candidate) => candidate === slug);
  if (!area) notFound();
  const items = getAllContent().filter((item) => item.area === area).map(toArchiveItem);

  return (
    <main id="conteudo" className="inner-page area-page" data-area={area}>
      <header className="page-intro">
        <h1>{areaLabels[area]}</h1>
        <p>{areaDescriptions[area]}</p>
      </header>
      {/* A mesma linha do arquivo completo: o mesmo projeto nao muda de cara
          conforme a porta por onde se chega nele. */}
      <section className="archive-table area-list" aria-label={`Projetos de ${areaLabels[area]}`}>
        {items.map((item, index) => (
          <ArchiveLine item={item} index={index} showArea={false} key={item.id} />
        ))}
      </section>
    </main>
  );
}

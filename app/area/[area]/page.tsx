import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecordRow } from "@/components/content-ui";
import { getAllContent, getPublicAreas } from "@/lib/content";
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
  const items = getAllContent().filter((item) => item.area === area);

  return (
    <main id="conteudo" className="inner-page area-page" data-area={area}>
      <header className="page-intro">
        <h1>{areaLabels[area]}</h1>
        <p>{areaDescriptions[area]}</p>
        <code className="page-path">/{area}</code>
      </header>
      <section className="project-group" aria-label={`Projetos de ${areaLabels[area]}`}>
        <div className="record-list">
          {items.map((item, index) => <RecordRow item={item} index={index} key={item.id} />)}
        </div>
      </section>
    </main>
  );
}

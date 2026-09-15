import type { Metadata } from "next";
import { RecordRow } from "@/components/content-ui";
import { getAllContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projetos",
  description: "Software, infraestrutura, estudos e criações públicas de Gabriel Henrique.",
  alternates: { canonical: "/projects/" },
  openGraph: { url: "/projects/" },
};

export default function ProjectsPage() {
  const projects = getAllContent().filter((item) => item.type === "project");
  const active = projects.filter((item) => item.status === "PLAYING");
  const preserved = projects.filter((item) => item.status !== "PLAYING");

  return (
    <main id="conteudo" className="inner-page">
      <header className="page-intro project-intro">
        <h1>Coisas que saíram da cabeça e <em>viraram sistema.</em></h1>
        <p>O resultado importa. As decisões, falhas e conexões que ficaram também.</p>
        <code className="page-path">/projects</code>
      </header>

      <section className="project-group" aria-labelledby="active-projects">
        <div className="section-heading compact">
          <h2 id="active-projects">Em jogo agora</h2>
          <p>{active.length} projetos com save recente.</p>
        </div>
        <div className="record-list">
          {active.map((item, index) => <RecordRow item={item} index={index} key={item.id} />)}
        </div>
      </section>

      {preserved.length > 0 && (
        <section className="project-group" aria-labelledby="preserved-projects">
          <div className="section-heading compact">
            <h2 id="preserved-projects">Entregues ou preservados</h2>
            <p>Saves que continuam explicando uma parte do caminho.</p>
          </div>
          <div className="record-list">
            {preserved.map((item, index) => <RecordRow item={item} index={index} key={item.id} />)}
          </div>
        </section>
      )}
    </main>
  );
}

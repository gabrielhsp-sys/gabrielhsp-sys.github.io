import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon as ArrowLeft,
  ArrowRightIcon as ArrowRight,
  ArrowUpRightIcon as ArrowUpRight,
  EnvelopeSimpleIcon as Envelope,
} from "@phosphor-icons/react/dist/ssr";
import fs from "node:fs";
import path from "node:path";
import { MDXRemote } from "next-mdx-remote/rsc";
import { caseFigures } from "@/components/case-figures";
import { CaseVideo } from "@/components/case-video";
import { CopyEmailButton } from "@/components/contact-actions";
import { RelationList, Status } from "@/components/content-ui";
import { getAllContent, getContentBySlug, getNextContent, getRelatedContent } from "@/lib/content";
import { sectionHeadings } from "@/lib/headings";
import { pageMetadata } from "@/lib/metadata";
import { formatPeriod } from "@/lib/period";
import { areaLabels, site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllContent().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getContentBySlug(slug);
  if (!item) return {};
  return pageMetadata({
    title: item.title,
    description: item.summary,
    path: item.href,
    image: `/og/${item.id}.png`,
    imageAlt: `${item.title} — ${item.featured ? "estudo de caso" : "projeto"} de ${site.owner}`,
    type: "article",
  });
}

export default async function ProjectDetail({ params }: Props) {
  const { slug } = await params;
  const item = getContentBySlug(slug);
  if (!item) notFound();
  const next = getNextContent(item);
  // O proximo ja tem saida propria no fim da pagina; nao repete nos relacionados.
  const related = getRelatedContent(item).filter((other) => other.id !== next?.id);
  // Indice so quando ha secoes bastantes para ele ajudar a escolher.
  const sections = sectionHeadings(item.body);
  const period = formatPeriod(item.startedAt, item.endedAt);
  // Video curto do estudo de caso (videos/README.md): entra quando o arquivo
  // existe em public/videos. Acima de ~5 MB ele nao e versionado e nao aparece.
  const hasVideo = fs.existsSync(path.join(process.cwd(), "public/videos", `${item.id}.mp4`));

  return (
    <main id="conteudo" className="article-page">
      <Link href="/archive/" className="back-link"><ArrowLeft size={17} aria-hidden="true" /> todos os projetos</Link>
      <header className="article-header" data-area={item.area}>
        <h1>{item.title}</h1>
        <p>{item.summary}</p>
        {/* A ficha inteira mora aqui, uma vez: nada dela se repete no corpo. */}
        <dl className="facts">
          <div>
            <dt>área</dt>
            <dd><Link className="area-mark" data-area={item.area} href={`/area/${item.area}/`}>{areaLabels[item.area]}</Link></dd>
          </div>
          <div><dt>estado</dt><dd><Status value={item.status} /></dd></div>
          {/* Um intervalo ("JAN 2024 – SET 2026") ocupa a linha inteira no celular. */}
          <div className={period.includes("–") ? "facts-wide" : undefined}><dt>período</dt><dd>{period}</dd></div>
          <div><dt>leitura</dt><dd>{item.readingTime} min</dd></div>
          <div>
            <dt>código</dt>
            <dd>
              {item.github ? (
                <a href={item.github} target="_blank" rel="noreferrer">
                  GitHub <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              ) : (
                "repositório privado"
              )}
            </dd>
          </div>
        </dl>
      </header>

      {hasVideo && (
        <div className="case-video-wrap">
          <CaseVideo
            src={`/videos/${item.id}.mp4`}
            poster={`/videos/${item.id}.jpg`}
            label={`${item.title}: vídeo de 12 segundos, sem som, que resume o estudo de caso`}
          />
        </div>
      )}

      <div className="article-body" data-toc={sections.length >= 3 || undefined}>
        <article className="prose">
          <MDXRemote source={item.body} components={caseFigures} />
        </article>
        {sections.length >= 3 && (
          <nav className="page-toc" aria-label="Nesta página">
            <p>nesta página</p>
            <ol>
              {sections.map((section) => (
                <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>
              ))}
            </ol>
          </nav>
        )}
      </div>

      <RelationList items={related} />

      <section className="case-end" aria-label="Depois da leitura">
        {next && (
          <Link className="case-end-next" href={next.href}>
            <span>{item.featured ? "próximo estudo de caso" : "próximo projeto"}</span>
            <strong>{next.title}</strong>
            <ArrowRight size={22} aria-hidden="true" />
          </Link>
        )}
        <div className="case-end-contact">
          <p>Quer conversar sobre este projeto ou sobre uma vaga?</p>
          <div>
            <a className="button-solid" href={`mailto:${site.email}`}>
              <Envelope size={19} aria-hidden="true" /> Falar comigo
            </a>
            <CopyEmailButton />
          </div>
        </div>
      </section>
    </main>
  );
}

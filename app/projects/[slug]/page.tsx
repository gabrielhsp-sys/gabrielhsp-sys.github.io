import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon as ArrowLeft, ArrowUpRightIcon as ArrowUpRight, GithubLogoIcon as GithubLogo } from "@phosphor-icons/react/dist/ssr";
import { MDXRemote } from "next-mdx-remote/rsc";
import { RelationList, Status } from "@/components/content-ui";
import { getAllContent, getContentBySlug, getRelatedContent } from "@/lib/content";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllContent().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getContentBySlug(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.summary,
    alternates: { canonical: item.href },
    openGraph: { title: item.title, description: item.summary, type: "article", url: item.href },
  };
}

export default async function ProjectDetail({ params }: Props) {
  const { slug } = await params;
  const item = getContentBySlug(slug);
  if (!item) notFound();
  const related = getRelatedContent(item);

  return (
    <main id="conteudo" className="article-page">
      <Link href="/archive/" className="back-link"><ArrowLeft size={17} /> voltar ao arquivo</Link>
      <header className="article-header" data-channel={item.channel}>
        <h1>{item.title}</h1>
        <p>{item.summary}</p>
        <div className="article-kernel">
          <span>/{item.channel}</span>
          <Status value={item.status} />
        </div>
        <div className="article-facts">
          <span>TIPO <b>{item.type.toUpperCase()}</b></span>
          <span>ATUALIZADO <b>{formatDate(item.updatedAt)}</b></span>
          <span>LEITURA <b>{item.readingTime} MIN</b></span>
        </div>
        {item.github && (
          <a className="github-link" href={item.github} target="_blank" rel="noreferrer">
            <GithubLogo size={20} /> ver repositório <ArrowUpRight size={17} />
          </a>
        )}
      </header>

      <div className="article-layout">
        <article className="prose">
          <MDXRemote source={item.body} />
        </article>
        <aside className="article-aside">
          <p>SAVE DATA</p>
          <dl>
            <div><dt>slot</dt><dd>{item.id}</dd></div>
            <div><dt>canal</dt><dd>/{item.channel}</dd></div>
            <div><dt>estado</dt><dd>{item.status}</dd></div>
            <div><dt>publicado</dt><dd>{formatDate(item.publishedAt)}</dd></div>
          </dl>
          <div className="article-tags">
            {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </aside>
      </div>

      <RelationList items={related} />
    </main>
  );
}

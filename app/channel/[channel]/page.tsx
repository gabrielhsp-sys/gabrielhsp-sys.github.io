import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecordRow } from "@/components/content-ui";
import { getAllContent } from "@/lib/content";
import { channelDescriptions, channels } from "@/lib/site";

type Props = { params: Promise<{ channel: string }> };

export function generateStaticParams() {
  return channels.map((channel) => ({ channel: channel.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { channel: slug } = await params;
  const channel = channels.find((candidate) => candidate.toLowerCase() === slug);
  if (!channel) return {};
  const canonical = `/channel/${slug}/`;
  return {
    title: `/${channel}`,
    description: channelDescriptions[channel],
    alternates: { canonical },
    openGraph: { url: canonical },
  };
}

export default async function ChannelPage({ params }: Props) {
  const { channel: slug } = await params;
  const channel = channels.find((candidate) => candidate.toLowerCase() === slug);
  if (!channel) notFound();
  const items = getAllContent().filter((item) => item.channel === channel);

  return (
    <main id="conteudo" className="inner-page channel-page" data-channel={channel}>
      <header className="page-intro">
        <h1>/{channel}</h1>
        <p>{channelDescriptions[channel]}</p>
        <code className="page-path">/channel/{slug}</code>
      </header>
      <section className="project-group" aria-label={`Registros de ${channel}`}>
        {items.length ? (
          <div className="record-list">
            {items.map((item, index) => <RecordRow item={item} index={index} key={item.id} />)}
          </div>
        ) : (
          <div className="empty-state permanent">
            <p>Este canal está conectado, mas ainda não recebeu um save público.</p>
            <span>Conteúdo privado não é promovido automaticamente.</span>
          </div>
        )}
      </section>
    </main>
  );
}

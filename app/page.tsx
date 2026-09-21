import Link from "next/link";
import { ArrowDownIcon as ArrowDown, ArrowRightIcon as ArrowRight, KeyboardIcon as Keyboard } from "@phosphor-icons/react/dist/ssr";
import { RecordRow, Status } from "@/components/content-ui";
import { getAllContent, getPublicChannels } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { channelDescriptions } from "@/lib/site";

export default function Home() {
  const items = getAllContent();
  const current = items.find((item) => item.featured && item.status === "PLAYING") ?? items[0];
  const recent = items.filter((item) => item.id !== current.id).slice(0, 3);
  const channels = getPublicChannels();

  return (
    <main id="conteudo">
      <section className="home-opening">
        <div className="opening-copy">
          <h1>Eu construo coisas.<br />Este é o lugar onde elas <em>não somem.</em></h1>
          <p className="opening-lede">
            Código, faculdade, servidores, hardware e experimentos — organizados como saves de uma vida em construção.
          </p>
          <button className="command-callout" type="button" data-search-shortcut>
            <Keyboard size={22} />
            <span><b>Encontre qualquer coisa</b><small>projeto, tecnologia, assunto ou conexão</small></span>
            <kbd>Ctrl K</kbd>
          </button>
          <a className="scroll-cue" href="#recentes">
            últimos registros <ArrowDown size={17} />
          </a>
        </div>

        <aside className="now-playing" aria-label="Save atual">
          <div className="save-notch" aria-hidden="true"><i /><i /><i /><i /><i /></div>
          <div className="now-heading">
            <span>NOW PLAYING</span>
            <Status value={current.status} />
          </div>
          <p className="save-slot">SLOT_A / {current.channel}</p>
          <h2><Link href={current.href}>{current.title}</Link></h2>
          <p>{current.summary}</p>
          <div className="save-activity" aria-label="Sinal de gravação ativo">
            <span>WRITE SIGNAL</span><i /><i /><i /><i /><i />
          </div>
          <div className="save-footer">
            <span>último save · {formatDate(current.updatedAt)}</span>
            <Link href={current.href}>abrir <ArrowRight size={17} /></Link>
          </div>
        </aside>
      </section>

      <section className="recent-section" id="recentes" aria-labelledby="recent-heading">
        <div className="section-heading">
          <h2 id="recent-heading">Últimos registros</h2>
          <p>O que foi salvo, atualizado ou conectado recentemente.</p>
          <Link href="/archive/">ver arquivo inteiro <ArrowRight size={17} /></Link>
        </div>
        <div className="record-list">
          {recent.map((item, index) => <RecordRow item={item} index={index} key={item.id} />)}
        </div>
      </section>

      <section className="channel-section" id="canais" aria-labelledby="channel-heading">
        <div className="section-heading compact">
          <h2 id="channel-heading">Canais do arquivo</h2>
          <p>{channels.length} entradas para a mesma história.</p>
        </div>
        <div className="channel-index">
          {channels.map((channel) => {
            const count = items.filter((item) => item.channel === channel).length;
            return (
              <Link href={`/channel/${channel.toLowerCase()}/`} key={channel} data-channel={channel}>
                <span>/{channel}</span>
                <p>{channelDescriptions[channel]}</p>
                <small>{String(count).padStart(2, "0")} saves</small>
                <ArrowRight size={20} />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="public-note">
        <h2>O arquivo cresce sem confundir memória com exposição.</h2>
        <p>
          O que aparece aqui foi escolhido e revisado. Conversas, e-mails e notas privadas não entram no deploy automaticamente.
        </p>
        <Link href="/about/">como este sistema funciona <ArrowRight size={17} /></Link>
      </section>
    </main>
  );
}

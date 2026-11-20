import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon as ArrowLeft, ArrowRightIcon as ArrowRight, ArrowUpRightIcon as ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Ctas, Demonstracao } from "@/components/cliente-ui";
import { ChatSimulado } from "@/components/exemplos-demo";
import { getContentBySlug } from "@/lib/content";
import { whatsappSobre } from "@/lib/contato-links";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Robô no Telegram de exemplo",
  description: "Um robô no Telegram que eu fiz e que está no ar, e uma conversa simulada de robô para um negócio.",
  path: "/exemplos/bots/",
});

// Data, estado e link vem do estudo de caso (content/public/telegram-offers.mdx),
// nunca escritos a mao aqui (DESIGN.md, datas derivadas; ADR-019, link do `github`).
const caso = getContentBySlug("telegram-offers");
const desde = caso
  ? new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${caso.startedAt.slice(0, 7)}-01T12:00:00Z`))
  : null;

export default function BotsExemploPage() {
  return (
    <main id="conteudo" className="c-page">
      <Link className="c-back" href="/exemplos/"><ArrowLeft size={18} aria-hidden="true" /> Todos os exemplos</Link>
      <header className="c-hero c-hero-compact">
        <p className="c-badge" data-kind="real">Projeto real</p>
        <h1>Um robô que lê promoções o dia inteiro e só me chama quando vale.</h1>
        <p className="c-lede">
          O Telegram Offers lê canais de promoção, compara cada anúncio com uma lista do que eu procuro e
          só me avisa quando aparece a peça certa pelo preço certo.
          {caso?.status === "live" && desde && <> Está no ar desde {desde}, rodando sozinho.</>}
        </p>
        <div className="c-ctas">
          {caso?.github && (
            <a className="c-button c-button-ghost" href={caso.github} target="_blank" rel="noopener">
              Ver o código (público) <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          )}
          <Link className="c-button c-button-ghost" href={caso?.href ?? "/projetos/"}>
            Como eu fiz <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </header>
      <section className="c-section" aria-labelledby="video-titulo">
        <h2 id="video-titulo">Ele funcionando</h2>
        {/* O mesmo video do estudo de caso, so que com controles e sem tocar
            sozinho: quem quer ver aperta o play (preload none: nada baixa antes). */}
        <video className="d-video" controls muted playsInline preload="none" poster="/videos/telegram-offers.webp" width={960} height={540}>
          <source src="/videos/telegram-offers.mp4" type="video/mp4" />
        </video>
        <p className="d-muted">Vídeo sem som: o robô lendo os canais e mandando o aviso quando a oferta bate com a lista.</p>
      </section>
      <section className="c-section" aria-labelledby="sim-titulo">
        <Demonstracao />
        <h2 id="sim-titulo">E num negócio? Teste uma conversa</h2>
        <p>Um robô de uma lanchonete inventada. Toque nos botões e veja o que ele faria.</p>
        <ChatSimulado />
      </section>
      <section className="c-section c-final" aria-labelledby="final-titulo">
        <h2 id="final-titulo">Quer um robô assim?</h2>
        <Ctas orcamento="/orcamento/?precisa=robo&origem=exemplos-bots" whatsapp={whatsappSobre("um robô no Telegram")} label="Pedir orçamento de robô" />
      </section>
    </main>
  );
}

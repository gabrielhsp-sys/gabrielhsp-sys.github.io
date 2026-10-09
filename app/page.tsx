import Link from "next/link";
import {
  ArrowRightIcon as ArrowRight,
  ArrowUpRightIcon as ArrowUpRight,
  EnvelopeSimpleIcon as Envelope,
  TerminalWindowIcon as TerminalWindow,
} from "@phosphor-icons/react/dist/ssr";
import { ArchiveLine } from "@/components/archive-line";
import { BenchScroll } from "@/components/bench-scroll";
import { RevealDebug } from "@/components/reveal-debug";
import { ContactSection } from "@/components/contact-actions";
import { Status } from "@/components/content-ui";
import { StructuredData } from "@/components/structured-data";
import { getAllContent, getFeaturedContent, getPublicAreas, toArchiveItem } from "@/lib/content";
import hero from "@/lib/hero-image.json";
import { formatPeriod } from "@/lib/period";
import { areaLabels } from "@/lib/site";

// O que aparece em "O que eu faco". Cada bloco aponta para projetos que
// existem neste repositorio — nada de habilidade sem prova.
const craft = [
  {
    area: "software" as const,
    line: "Serviços que continuam de pé sem ninguém olhando.",
    body:
      "Automação em Python que roda como serviço no Linux, com banco local, deduplicação, log e comandos de operação. Sistemas em Java com arquitetura em camadas, controle de acesso por papel, testes e CI/CD. E documentação técnica que outra pessoa consegue seguir.",
    stack: ["Python", "Telethon", "SQLite", "systemd", "Java", "Maven", "JUnit", "Docker", "GitHub Actions", "Linux"],
  },
  {
    area: "web" as const,
    line: "Interfaces rápidas, acessíveis e sem firula que atrapalhe.",
    body:
      "Sites estáticos em Next.js e TypeScript, conteúdo versionado em Markdown e validado no build. Contraste verificado contra a WCAG, navegação completa por teclado e movimento que respeita quem pediu menos movimento.",
    stack: ["Next.js", "React", "TypeScript", "MDX", "Tailwind", "WCAG", "GitHub Pages"],
  },
  {
    area: "academico" as const,
    line: "A base, feita na mão antes de usar a biblioteca.",
    body:
      "Graduação em Ciência da Computação na UNIFAL-MG. Estruturas de dados e persistência em C e C++, orientação a objetos em Java, lógica em Prolog — com os trabalhos públicos para quem quiser conferir o percurso, e não só o resultado.",
    stack: ["C", "C++", "Java", "Prolog", "SQL"],
  },
];

// O "Sobre" da home, frase por frase: cada uma acende enquanto passa pela
// tela, com a bancada atras. E o mesmo texto de sempre, so dividido.
const about = [
  "Comecei mexendo no registro do Windows para ganhar alguns quadros por segundo.",
  "Quebrei o sistema, consertei,",
  "e descobri que gostava mais de abrir a máquina do que de usar ela.",
  "Isso virou curso e virou este arquivo — que guarda as versões e as decisões, não só o resultado final.",
];

// Fundo da home (scripts/imagens.mjs): deitado, a cena inteira; em pe, a
// faixa do notebook. Sem <link rel=preload>: o Next pre-carrega a rota da home
// a partir do link "Inicio" de toda pagina, e o preload ia junto, baixando a
// imagem no arquivo e nos estudos de caso. O <img> com fetchpriority alta, no
// HTML, ja e achado cedo pelo preload scanner.
const srcset = (prefix: string, list: { width: number }[], ext: string) =>
  list.map(({ width }) => `/home/${prefix}-${width}.${ext} ${width}w`).join(", ");
const wide = { media: "(orientation: landscape)", sizes: `max(100vw, ${(hero.width / hero.height * 100).toFixed(0)}vh)` };
// Em pe a imagem cobre pela altura: a largura desenhada e a altura da tela
// vezes a proporcao do recorte.
const tall = { media: "(orientation: portrait)", sizes: `max(100vw, ${(hero.portrait[0].width / hero.portrait[0].height * 100).toFixed(0)}vh)` };

function BenchImage() {
  const fallback = hero.variants[1];
  return (
    // O trilho tem a altura da bancada; a imagem presa nele para de subir com
    // ele, entao nunca passa do fim do "Sobre".
    <div className="bench-track" aria-hidden="true">
      <div className="bench-stage">
        <picture>
          <source type="image/avif" media={tall.media} srcSet={srcset("bancada-retrato", hero.portrait, "avif")} sizes={tall.sizes} />
          <source type="image/webp" media={tall.media} srcSet={srcset("bancada-retrato", hero.portrait, "webp")} sizes={tall.sizes} />
          <source type="image/avif" srcSet={srcset("bancada", hero.variants, "avif")} sizes={wide.sizes} />
          <source type="image/webp" srcSet={srcset("bancada", hero.variants, "webp")} sizes={wide.sizes} />
          {/* Decorativa: o texto da pagina diz tudo; alt vazio e aria-hidden. */}
          <img src={`/home/bancada-${fallback.width}.webp`} alt="" width={fallback.width} height={fallback.height} fetchPriority="high" decoding="async" />
        </picture>
      </div>
    </div>
  );
}

// "Quatro estudos de caso" vinha escrito a mao; a frase agora conta o conteudo.
const numberWords = ["Nenhum", "Um", "Dois", "Três", "Quatro", "Cinco", "Seis", "Sete", "Oito", "Nove"];
const countCases = (count: number) =>
  `${numberWords[count] ?? count} ${count === 1 ? "estudo de caso" : "estudos de caso"}`;

export default function Home() {
  const featured = getFeaturedContent();
  const areas = getPublicAreas();
  // Os destaques ja estao nos cards; o arquivo da home mostra so o resto.
  const others = getAllContent().filter((item) => !item.featured).map(toArchiveItem);
  const live = featured.filter((item) => item.status === "live").length;

  return (
    <main id="conteudo">
      <StructuredData page="home" />
      {/* ── BANCADA: a imagem fica presa atras do hero e do "Sobre" ── */}
      <div className="bench">
        <BenchImage />

        {/* Hero: tese a esquerda, indice dos estudos de caso a direita. */}
        <section className="hero" aria-labelledby="hero-heading">
          <div className="hero-copy">
            {/* Disponibilidade e dado, nao selo: mesmo ponto verde do estado "No ar". */}
            <p className="hero-kicker">
              <span className="hero-available"><i aria-hidden="true" /> Disponível para estágio</span>
              {/* O nome e a primeira pergunta de quem chega: le-se na fonte do texto,
                  nao em rotulo de 11px. Curso e faculdade seguem como dado. */}
              <span className="hero-name"><strong>Gabriel Henrique</strong> Ciência da Computação · UNIFAL-MG</span>
            </p>
            <h1 id="hero-heading">
              Eu construo software que <em>fica de pé sozinho.</em>
            </h1>
            <p className="hero-lede">
              Serviços em Python que rodam sem supervisão, sistemas em Java com arquitetura e teste,
              interfaces web estáticas e acessíveis. Cada projeto aqui explica o problema que resolve
              antes de listar a tecnologia.
            </p>
            <div className="hero-actions">
              <a className="button-solid" href="#contato">
                <Envelope size={19} aria-hidden="true" /> Falar comigo
              </a>
              <a className="button-ghost" href="#projetos">
                Ver os projetos <ArrowRight size={17} aria-hidden="true" />
              </a>
            </div>
            <button className="hero-hint" type="button" data-terminal-shortcut>
              <TerminalWindow size={17} aria-hidden="true" />
              <span>Prefere linha de comando? Aperte</span> <kbd>`</kbd>
            </button>
          </div>

          {/* O painel e um indice, nao uma vitrine: uma linha por estudo de caso. */}
          {featured.length > 0 && (
            <aside className="hero-panel" aria-label="Estudos de caso">
              <div className="hero-panel-head">
                <span>estudos de caso</span>
                {live > 0 && <span>{live} no ar</span>}
              </div>
              <ol>
                {featured.map((item) => (
                  <li key={item.id}>
                    <Link href={item.href}>
                      <span className="area-mark" data-area={item.area}>{areaLabels[item.area]}</span>
                      <strong>{item.title}</strong>
                      <Status value={item.status} />
                      <span className="hero-period">{formatPeriod(item.startedAt, item.endedAt)}</span>
                    </Link>
                  </li>
                ))}
              </ol>
              {others.length > 0 && (
                <a className="hero-panel-foot" href="#arquivo">
                  + {others.length} {others.length === 1 ? "outro projeto" : "outros projetos"} no arquivo
                </a>
              )}
            </aside>
          )}
        </section>

        {/* Sobre: a bancada aparece inteira enquanto a historia acende. */}
        <section className="bench-about" id="sobre" aria-labelledby="about-heading">
          <div className="bench-about-frame">
            <h2 id="about-heading">Eu gosto do que acontece por baixo da interface.</h2>
            <div className="bench-about-lines">
              {about.map((line) => <p key={line}>{line}</p>)}
            </div>
            <Link className="bench-about-more" href="/about/">a história inteira <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
        </section>
        <BenchScroll />
        <RevealDebug />
      </div>

      {/* ── PROJETOS EM DESTAQUE ─────────────────────────────── */}
      <section className="featured-section" id="projetos" aria-labelledby="featured-heading">
        <div className="section-heading">
          <h2 id="featured-heading">Projetos em destaque</h2>
          <p>{countCases(featured.length)}: o problema, o que eu fiz, a stack e o resultado.</p>
        </div>
        <ol className="case-list">
          {/* O primeiro do featuredRank lidera a secao; os outros vem em linha. */}
          {featured.map((item, index) => (
            <li className="case-card" key={item.id} data-area={item.area} data-lead={index === 0 || undefined}>
              <div className="case-head">
                <div className="case-meta">
                  <span className="area-mark" data-area={item.area}>{areaLabels[item.area]}</span>
                  <Status value={item.status} />
                </div>
                <h3><Link href={item.href}>{item.title}</Link></h3>
                <p>{item.summary}</p>
              </div>
              <ul className="case-stack">
                {item.tags.slice(0, 5).map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
              <div className="case-footer">
                <Link href={item.href}>ler o estudo de caso <ArrowRight size={16} aria-hidden="true" /></Link>
                {item.github ? (
                  <a href={item.github} target="_blank" rel="noreferrer">
                    código <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                ) : (
                  <span className="case-private">repositório privado</span>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── O QUE EU FAÇO ────────────────────────────────────── */}
      <section className="craft-section" id="o-que-eu-faco" aria-labelledby="craft-heading">
        <div className="section-heading compact">
          <h2 id="craft-heading">O que eu faço</h2>
          <p>Três frentes, e o lugar onde cada uma já foi usada de verdade.</p>
        </div>
        <div className="craft-list">
          {craft.map((block) => (
            <article className="craft-block" key={block.area} data-area={block.area}>
              <h3>{areaLabels[block.area]}</h3>
              <p className="craft-line">{block.line}</p>
              <p>{block.body}</p>
              <ul className="craft-stack">
                {block.stack.map((tool) => <li key={tool}>{tool}</li>)}
              </ul>
              {areas.includes(block.area) && (
                <Link href={`/area/${block.area}/`}>
                  ver projetos de {areaLabels[block.area].toLowerCase()} <ArrowRight size={16} aria-hidden="true" />
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* ── ARQUIVO (secundário) ─────────────────────────────── */}
      {others.length > 0 && (
        <section className="archive-section" id="arquivo" aria-labelledby="archive-heading">
          <div className="section-heading compact">
            <h2 id="archive-heading">Outros projetos</h2>
          </div>
          <div className="archive-table">
            {others.map((item, index) => <ArchiveLine item={item} index={index} key={item.id} />)}
          </div>
          <Link className="archive-more" href="/archive/">
            ver o arquivo completo <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      )}

      {/* ── CONTATO ──────────────────────────────────────────── */}
      <ContactSection />
    </main>
  );
}

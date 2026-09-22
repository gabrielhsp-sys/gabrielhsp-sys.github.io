import Link from "next/link";
import {
  ArrowRightIcon as ArrowRight,
  ArrowUpRightIcon as ArrowUpRight,
  EnvelopeSimpleIcon as Envelope,
  TerminalWindowIcon as TerminalWindow,
} from "@phosphor-icons/react/dist/ssr";
import { ArchiveExplorer } from "@/components/archive-explorer";
import { ContactSection } from "@/components/contact-actions";
import { Status } from "@/components/content-ui";
import { getAllContent, getFeaturedContent, getPublicAreas } from "@/lib/content";
import { formatDate } from "@/lib/format";
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

export default function Home() {
  const featured = getFeaturedContent();
  const areas = getPublicAreas();
  const items = getAllContent().map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    href: item.href,
    area: item.area,
    status: item.status,
    updatedAt: item.updatedAt.toISOString(),
    tags: item.tags,
  }));

  return (
    <main id="conteudo">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <p className="hero-badge">
            <i aria-hidden="true" /> Disponível para estágio
          </p>
          <p className="hero-kicker">Gabriel Henrique · Ciência da Computação, UNIFAL-MG</p>
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
              <Envelope size={19} /> Falar comigo
            </a>
            <a className="button-ghost" href="#projetos">
              Ver os projetos <ArrowRight size={17} />
            </a>
          </div>
          <button className="hero-hint" type="button" data-terminal-shortcut>
            <TerminalWindow size={17} />
            <span>Prefere linha de comando? Aperte</span> <kbd>`</kbd>
          </button>
        </div>
      </section>

      {/* ── PROJETOS EM DESTAQUE ─────────────────────────────── */}
      <section className="featured-section" id="projetos" aria-labelledby="featured-heading">
        <div className="section-heading">
          <h2 id="featured-heading">Projetos em destaque</h2>
          <p>Quatro estudos de caso: o problema, o que eu fiz, a stack e o resultado.</p>
        </div>
        <ol className="case-list">
          {featured.map((item, index) => (
            <li className="case-card" key={item.id} data-area={item.area}>
              <span className="case-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div className="case-meta">
                <span className="case-area">{areaLabels[item.area]}</span>
                <Status value={item.status} />
              </div>
              <h3><Link href={item.href}>{item.title}</Link></h3>
              <p>{item.summary}</p>
              <ul className="case-stack">
                {item.tags.slice(0, 5).map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
              <div className="case-footer">
                <Link href={item.href}>ler o estudo de caso <ArrowRight size={16} /></Link>
                {item.github ? (
                  <a href={item.github} target="_blank" rel="noreferrer">
                    código <ArrowUpRight size={15} />
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
              <header>
                <code aria-hidden="true">/{block.area}</code>
                <h3>{areaLabels[block.area]}</h3>
              </header>
              <p className="craft-line">{block.line}</p>
              <p>{block.body}</p>
              <ul className="craft-stack">
                {block.stack.map((tool) => <li key={tool}>{tool}</li>)}
              </ul>
              {areas.includes(block.area) && (
                <Link href={`/area/${block.area}/`}>
                  ver projetos de {areaLabels[block.area].toLowerCase()} <ArrowRight size={16} />
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* ── ARQUIVO COMPLETO (secundário) ────────────────────── */}
      <section className="archive-section" id="arquivo" aria-labelledby="archive-heading">
        <div className="section-heading compact">
          <h2 id="archive-heading">Arquivo completo</h2>
          <p>
            Tudo que é público, inclusive o que não virou destaque. Filtre por área ou estado —
            ou abra <Link href="/archive/">a lista em página inteira</Link>.
          </p>
        </div>
        <ArchiveExplorer items={items} />
      </section>

      {/* ── SOBRE ────────────────────────────────────────────── */}
      <section className="about-teaser" id="sobre" aria-labelledby="about-teaser-heading">
        <h2 id="about-teaser-heading">
          Eu gosto do que acontece <em>por baixo da interface.</em>
        </h2>
        <p>
          Comecei mexendo no registro do Windows para ganhar alguns quadros por segundo, quebrei o
          sistema, consertei, e descobri que gostava mais de abrir a máquina do que de usar ela.
          Isso virou curso, virou homelab e virou este arquivo — que guarda as versões e as decisões,
          não só o resultado final.
        </p>
        <div className="about-teaser-actions">
          <Link href="/about/">a história inteira <ArrowRight size={17} /></Link>
          <span>Último registro atualizado em {formatDate(getAllContent()[0].updatedAt)}</span>
        </div>
      </section>

      {/* ── CONTATO ──────────────────────────────────────────── */}
      <ContactSection />
    </main>
  );
}

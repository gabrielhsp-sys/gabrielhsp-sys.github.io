import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRightIcon as ArrowUpRight, GithubLogoIcon as GithubLogo } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Sobre",
  description: "Gabriel Henrique, estudante de Ciência da Computação, programador e mantenedor deste arquivo vivo.",
  alternates: { canonical: "/about/" },
  openGraph: { url: "/about/" },
};

export default function AboutPage() {
  return (
    <main id="conteudo" className="about-page">
      <header className="about-heading">
        <h1>Eu gosto do que acontece <em>por baixo da interface.</em></h1>
        <code className="page-path">/whoami</code>
      </header>

      <div className="about-grid">
        <aside className="identity-block">
          <div className="identity-screen">
            <Image
              src="/profile.jpg"
              width={900}
              height={1125}
              alt="Gabriel Henrique ao lado de uma mascote amarela em uma feira"
              sizes="(max-width: 820px) 100vw, 32vw"
            />
            <i aria-hidden="true">GH / SYS</i>
          </div>
          <dl>
            <div><dt>nome</dt><dd>Gabriel Henrique</dd></div>
            <div><dt>curso</dt><dd>Ciência da Computação</dd></div>
            <div><dt>instituição</dt><dd>UNIFAL-MG</dd></div>
            <div><dt>modo</dt><dd>aprendendo em público</dd></div>
          </dl>
        </aside>

        <article className="about-copy">
          <p className="big-copy">
            Começou quebrando e consertando o Windows. A curiosidade ficou: entender sistemas, escrever software e montar a infraestrutura onde ele roda.
          </p>
          <p>
            Hoje estudo Ciência da Computação na UNIFAL-MG e mantenho projetos que passam por Java, C++, Linux, Docker, redes e interfaces. Não tenho interesse em fingir que tudo nasceu pronto. Este arquivo existe para guardar as versões, as decisões e os caminhos entre uma coisa e outra.
          </p>
          <h2>Como este site funciona</h2>
          <p>
            Cada registro público é um arquivo Markdown ou MDX versionado no GitHub. Canais organizam áreas; estados mostram o momento; relações criam atalhos entre projetos, estudos e referências.
          </p>
          <p>
            O acervo privado planejado será separado fisicamente deste deploy. Nada de chats, e-mails ou notas pessoais vira página sem seleção e revisão explícitas.
          </p>
          <div className="about-actions">
            <a href="https://github.com/gabrielhsp-sys" target="_blank" rel="noreferrer">
              <GithubLogo size={20} /> GitHub <ArrowUpRight size={17} />
            </a>
            <a href="mailto:gabrielhsp.dev@gmail.com">mandar um e-mail <ArrowUpRight size={17} /></a>
          </div>
        </article>
      </div>
    </main>
  );
}

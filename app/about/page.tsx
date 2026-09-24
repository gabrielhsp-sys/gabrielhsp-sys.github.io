import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRightIcon as ArrowUpRight, GithubLogoIcon as GithubLogo } from "@phosphor-icons/react/dist/ssr";
import { profile, site } from "@/lib/site";

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
        <h1>Gabriel Henrique.</h1>
        {/* O que quem contrata procura primeiro, antes da historia. */}
        <dl className="facts">
          <div><dt>curso</dt><dd>{profile.course}</dd></div>
          <div><dt>período</dt><dd>{profile.term}</dd></div>
          <div><dt>onde</dt><dd>{profile.institution} · {profile.city}</dd></div>
          <div><dt>procura</dt><dd>{profile.seeking}</dd></div>
          <div className="facts-wide"><dt>contato</dt><dd><a href={`mailto:${site.email}`}>{site.email}</a></dd></div>
        </dl>
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
          </div>
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
            Cada projeto público é um arquivo Markdown ou MDX versionado no GitHub e validado no build. Três áreas organizam o acervo, o estado mostra em que ponto cada coisa está, e as relações criam atalhos entre um trabalho e outro.
          </p>
          <p>
            O acervo privado planejado fica fisicamente separado deste deploy. Nada de conversa, e-mail ou nota pessoal vira página sem seleção e revisão explícitas.
          </p>
          <p>
            A camada de personalidade — animação de entrada, sons, terminal, modo retrô — é opcional por princípio: nada essencial depende dela, tudo funciona só com teclado, e o movimento some para quem pediu menos movimento.
          </p>
          <div className="about-actions">
            <a href={site.github} target="_blank" rel="noreferrer">
              <GithubLogo size={20} /> GitHub <ArrowUpRight size={17} />
            </a>
            <a href={`mailto:${site.email}`}>mandar um e-mail <ArrowUpRight size={17} /></a>
            <a href={site.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={17} /></a>
          </div>
        </article>
      </div>
    </main>
  );
}

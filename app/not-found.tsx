import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ClientChrome } from "@/components/client-chrome";

// O Next ja marca esta rota como noindex; aqui so o titulo da aba. O 404 e de
// todo o site: usa o chrome de cliente, com o WhatsApp fixo.
export const metadata: Metadata = {
  title: "Página não encontrada",
};

const suggestions = [
  { href: "/", label: "Início", hint: "o que eu faço e como pedir" },
  { href: "/servicos/", label: "Serviços", hint: "sites, aplicativos, bots, automações e sistemas" },
  { href: "/exemplos/", label: "Exemplos", hint: "veja antes de pedir" },
  { href: "/orcamento/", label: "Pedir orçamento", hint: "algumas perguntas e a mensagem pronta no WhatsApp" },
  { href: "/sobre/", label: "Sobre e projetos", hint: "para recrutadores" },
];

export default function NotFound() {
  return (
    <ClientChrome>
      <main id="conteudo" className="c-page">
        <header className="c-hero c-hero-compact">
          <h1>Esta página não existe.</h1>
          <p className="c-lede">O endereço pode ter mudado. Estes caminhos existem:</p>
        </header>
        <ul className="c-service-list">
          {suggestions.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <strong>{item.label}</strong>
                <span>{item.hint}</span>
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </ClientChrome>
  );
}

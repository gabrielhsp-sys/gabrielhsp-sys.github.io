import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { SearchShortcut } from "@/components/shortcut-key";

// O Next ja marca esta rota como noindex; aqui so o titulo da aba.
export const metadata: Metadata = {
  title: "command not found",
};

const suggestions = [
  { href: "/", label: "início", hint: "quem eu sou e o que eu faço" },
  { href: "/archive/", label: "projetos", hint: "a lista completa, filtrável" },
  { href: "/about/", label: "sobre", hint: "a história mais longa" },
  { href: "/#contato", label: "contato", hint: "e-mail, GitHub e LinkedIn" },
];

export default function NotFound() {
  return (
    <main id="conteudo" className="not-found">
      <div className="not-found-screen">
        <p className="not-found-line">
          <b>guest@gabriel.sys:~$</b> cd essa-pagina
        </p>
        {/* O titulo da pagina: a piada fica na tela, o fato vai junto para o leitor de tela. */}
        <h1 className="not-found-error"><span className="sr-only">Página não encontrada. </span>bash: essa-pagina: command not found</h1>
        <p className="not-found-hint">
          A rota pode ter mudado de nome ou nunca ter sido publicada. Estes caminhos existem:
        </p>
        <ul className="not-found-list">
          {suggestions.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <code>{item.label}</code>
                <span>{item.hint}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
        <p className="not-found-tip">
          Dica: aperte <kbd>`</kbd> em qualquer página para abrir o terminal, ou <SearchShortcut /> para buscar.
        </p>
      </div>
    </main>
  );
}

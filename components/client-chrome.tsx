"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { InstagramLogoIcon as InstagramLogo, ListIcon as List, WhatsappLogoIcon as WhatsappLogo, XIcon as X } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { BrowserChrome } from "@/components/browser-chrome";
import { PreferenceTools } from "@/components/system-chrome";
import { TemaToggle } from "@/components/tema";
import { ATENDIMENTO, INSTAGRAM, INSTAGRAM_URL, WHATSAPP_EXIBICAO } from "@/lib/contato";
import { whatsappContato } from "@/lib/contato-links";

/* Chrome das paginas de cliente (decisoes de 2026-11-19): marca, tres links,
   "Pedir orcamento" e o botao de WhatsApp fixo. Sem trilho, terminal, busca
   Ctrl+K nem animacao de entrada: isso mora em /sobre e /projetos. O Konami e
   o som vem do PersonalityProvider, que vale para o site todo. */

const nav = [
  { href: "/servicos/", label: "Serviços" },
  { href: "/exemplos/", label: "Exemplos" },
  { href: "/como-funciona/", label: "Como funciona" },
];

export function ClientChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  // Navegou, o menu fecha. Ajuste de estado na renderizacao, nao em efeito.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }
  // No formulario o botao fixo vira um link dentro da pagina: la ele cobriria
  // o campo e o botao "Continuar" (WCAG 2.4.11).
  const onForm = pathname.startsWith("/orcamento");

  useEffect(() => {
    if (!menuOpen) return;
    // Esc fecha e devolve o foco ao botao: o menu some (display: none) e o foco
    // que estava num link dele cairia no <body>.
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButton.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  /* Campo em foco (inclusive o teclado aberto no celular): o botao fixo sai da
     frente. So escreve um atributo; o CSS esconde. */
  useEffect(() => {
    const root = document.documentElement;
    const typing = (el: Element | null) => !!el && el.matches("input, textarea, select, [contenteditable='true']");
    const sync = () => { root.dataset.typing = typing(document.activeElement) ? "true" : "false"; };
    const later = () => window.setTimeout(sync, 0);
    document.addEventListener("focusin", sync);
    document.addEventListener("focusout", later);
    return () => {
      document.removeEventListener("focusin", sync);
      document.removeEventListener("focusout", later);
      delete root.dataset.typing;
    };
  }, []);

  const active = (href: string) => pathname.startsWith(href);

  return (
    <div className="c-frame" data-chrome="cliente">
      <BrowserChrome />
      <header className="c-header">
        <Link href="/" className="c-brand" aria-label="GABRIEL.SYS, início">
          {/* Duas versoes do mesmo logo; o CSS mostra a do tema (cliente.css). A do
              escuro e lazy: no tema padrao (claro) ela fica escondida e nem baixa. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- export estatico, sem otimizador */}
          <img className="c-brand-full c-logo-escuro" src="/marca/logo-horizontal.png" alt="" width={328} height={40} loading="lazy" />
          {/* eslint-disable-next-line @next/next/no-img-element -- export estatico, sem otimizador */}
          <img className="c-brand-full c-logo-claro" src="/marca/logo-horizontal-claro.png" alt="" width={328} height={40} />
          {/* eslint-disable-next-line @next/next/no-img-element -- export estatico, sem otimizador */}
          <img className="c-brand-symbol" src="/marca/simbolo.png" alt="" width={30} height={26} loading="lazy" />
        </Link>
        <nav className="c-nav" id="menu-principal" aria-label="Principal" data-open={menuOpen || undefined}>
          {nav.map((item) => (
            <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
          <a className="c-nav-whats" href={whatsappContato} target="_blank" rel="noopener">
            <WhatsappLogo size={20} aria-hidden="true" /> WhatsApp {WHATSAPP_EXIBICAO}
          </a>
          {/* No celular som e tema ficam dentro do menu: no cabecalho so cabem
              marca, "Orcamento" e "Menu" numa linha, de 320 a 414 px. */}
          <div className="c-nav-prefs">
            <span>Som do site</span>
            <PreferenceTools />
          </div>
          <div className="c-nav-prefs">
            <TemaToggle rotulo />
          </div>
        </nav>
        <div className="c-header-tools">
          <span className="c-prefs-desktop"><PreferenceTools /><TemaToggle /></span>
          <Link className="c-cta" href="/orcamento/">
            <span className="c-cta-long">Pedir orçamento</span>
            <span className="c-cta-short">Orçamento</span>
          </Link>
          <button
            ref={menuButton}
            className="c-menu-button"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="menu-principal"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <List size={20} aria-hidden="true" />}
            Menu
          </button>
        </div>
      </header>

      {children}

      <footer className="c-footer">
        <div className="c-footer-main">
          {/* eslint-disable-next-line @next/next/no-img-element -- export estatico, sem otimizador */}
          <img className="c-logo-escuro" src="/marca/logo-horizontal.png" alt="GABRIEL.SYS" width={246} height={30} loading="lazy" />
          {/* eslint-disable-next-line @next/next/no-img-element -- export estatico, sem otimizador */}
          <img className="c-logo-claro" src="/marca/logo-horizontal-claro.png" alt="GABRIEL.SYS" width={246} height={30} loading="lazy" />
          <p>Sites, aplicativos, bots no Telegram, automações e sistemas sob encomenda.</p>
          <p>{ATENDIMENTO.frase} {ATENDIMENTO.resposta}</p>
        </div>
        <ul className="c-footer-contact" aria-label="Contato">
          <li>
            <a href={whatsappContato} target="_blank" rel="noopener">
              <WhatsappLogo size={20} aria-hidden="true" /> WhatsApp {WHATSAPP_EXIBICAO}
            </a>
          </li>
          <li>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener">
              <InstagramLogo size={20} aria-hidden="true" /> Instagram {INSTAGRAM}
            </a>
          </li>
          <li><Link href="/orcamento/">Pedir orçamento</Link></li>
        </ul>
        <p className="c-footer-recruiter">
          <Link href="/sobre/">Quem sou eu e projetos (para recrutadores)</Link>
        </p>
      </footer>

      {!onForm && (
        // Landmark proprio: o botao fixo fica fora do <main> e do rodape (axe "region").
        <aside aria-label="Contato rápido">
          <a className="c-whats-fixo" href={whatsappContato} target="_blank" rel="noopener" aria-label={`WhatsApp ${WHATSAPP_EXIBICAO}`}>
            <WhatsappLogo size={24} weight="fill" aria-hidden="true" />
            <span>WhatsApp</span>
          </a>
        </aside>
      )}
    </div>
  );
}

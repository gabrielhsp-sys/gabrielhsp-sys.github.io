"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArchiveIcon as ArchiveBox,
  ArrowRightIcon as ArrowRight,
  GithubLogoIcon as GithubLogo,
  HouseIcon as House,
  InfoIcon as Info,
  MagnifyingGlassIcon as MagnifyingGlass,
  TerminalWindowIcon as TerminalWindow,
  XIcon as X,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { normalizeSearch } from "@/lib/format";

type SearchRecord = {
  id: string;
  title: string;
  summary: string;
  type: string;
  channel: string;
  status: string;
  tags: string[];
  href: string;
  text: string;
};

const nav = [
  { href: "/", label: "Início", icon: House },
  { href: "/archive/", label: "Arquivo", icon: ArchiveBox },
  { href: "/about/", label: "Sobre", icon: Info },
];

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span>G</span>
      <i />
      <span>S</span>
    </span>
  );
}

export function SystemChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [records, setRecords] = useState<SearchRecord[] | null>(null);
  const [searchError, setSearchError] = useState(false);
  const [clock, setClock] = useState("--:--");
  const inputRef = useRef<HTMLInputElement>(null);
  const searchLayerRef = useRef<HTMLElement>(null);
  const terminalLayerRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const layerWasOpen = useRef(false);

  const closeLayers = useCallback(() => {
    setSearchOpen(false);
    setTerminalOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    const tick = () =>
      setClock(
        new Intl.DateTimeFormat("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    tick();
    const timer = window.setInterval(tick, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setTerminalOpen(false);
        setSearchOpen(true);
      } else if (event.key === "Escape") {
        closeLayers();
      } else if (!isTyping && event.key === "~") {
        event.preventDefault();
        setSearchOpen(false);
        setTerminalOpen((open) => !open);
      }

      if (event.key === "Tab" && (searchOpen || terminalOpen)) {
        const layer = searchOpen ? searchLayerRef.current : terminalLayerRef.current;
        const focusable = layer?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (document.activeElement === layer) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (!layer?.contains(document.activeElement)) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeLayers, searchOpen, terminalOpen]);

  useEffect(() => {
    const openFromPage = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.closest("[data-search-shortcut]")) {
        setTerminalOpen(false);
        setSearchOpen(true);
      }
    };
    document.addEventListener("click", openFromPage);
    return () => document.removeEventListener("click", openFromPage);
  }, []);

  useEffect(() => {
    if (!searchOpen || records || searchError) return;
    fetch("/search-index.json")
      .then((response) => {
        if (!response.ok) throw new Error("search index unavailable");
        return response.json() as Promise<SearchRecord[]>;
      })
      .then(setRecords)
      .catch(() => setSearchError(true));
  }, [records, searchError, searchOpen]);

  useEffect(() => {
    const layerOpen = searchOpen || terminalOpen;
    const background = document.querySelectorAll<HTMLElement>(
      ".site-column, .system-rail, .mobile-dock",
    );

    if (layerOpen && !layerWasOpen.current) {
      openerRef.current = document.activeElement as HTMLElement;
    }
    layerWasOpen.current = layerOpen;
    document.body.dataset.layerOpen = layerOpen ? "true" : "false";
    background.forEach((element) => { element.inert = layerOpen; });

    if (searchOpen) window.setTimeout(() => inputRef.current?.focus(), 40);
    if (terminalOpen) window.setTimeout(() => terminalLayerRef.current?.focus(), 40);

    if (!layerOpen) {
      delete document.body.dataset.layerOpen;
      openerRef.current?.focus();
      openerRef.current = null;
    }

    return () => background.forEach((element) => { element.inert = false; });
  }, [searchOpen, terminalOpen]);

  const results = useMemo(() => {
    if (!records) return [];
    const needle = normalizeSearch(query.trim());
    if (!needle) return records.slice(0, 6);
    return records
      .filter((record) =>
        normalizeSearch(
          `${record.title} ${record.summary} ${record.channel} ${record.status} ${record.tags.join(" ")} ${record.text}`,
        ).includes(needle),
      )
      .slice(0, 8);
  }, [query, records]);

  const openResult = (href: string) => {
    closeLayers();
    router.push(href);
  };

  return (
    <div className="site-frame">
      <aside className="system-rail" aria-label="Navegação principal">
        <Link href="/" className="brand-link" aria-label="GABRIEL.SYS — início">
          <BrandMark />
        </Link>
        <nav className="rail-nav">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                href={item.href}
                key={item.href}
                className="rail-link"
                data-active={active}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={20} weight={active ? "fill" : "regular"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <button
          className="rail-action"
          type="button"
          onClick={() => setTerminalOpen(true)}
          aria-label="Abrir terminal"
        >
          <TerminalWindow size={20} />
          <span>Terminal</span>
        </button>
      </aside>

      <div className="site-column">
        <header className="topbar">
          <Link href="/" className="wordmark">
            GABRIEL<span>.SYS</span>
          </Link>
          <p className="system-state">
            <span aria-hidden="true" /> arquivo online <time>{clock}</time>
          </p>
          <button
            className="search-trigger"
            type="button"
            onClick={() => setSearchOpen(true)}
          >
            <MagnifyingGlass size={18} />
            <span>Procurar no arquivo</span>
            <kbd>Ctrl K</kbd>
          </button>
        </header>

        {children}

        <footer className="site-footer">
          <p>GABRIEL.SYS · salvo em Markdown, servido sem rastrear você.</p>
          <div>
            <a href="/feed.xml">RSS</a>
            <a href="https://github.com/gabrielhsp-sys" target="_blank" rel="noreferrer">
              <GithubLogo size={18} /> GitHub
            </a>
          </div>
        </footer>
      </div>

      <nav className="mobile-dock" aria-label="Navegação móvel">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              href={item.href}
              key={item.href}
              data-active={active}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={22} weight={active ? "fill" : "regular"} />
            </Link>
          );
        })}
        <button type="button" onClick={() => setSearchOpen(true)} aria-label="Buscar">
          <MagnifyingGlass size={22} />
        </button>
      </nav>

      {searchOpen && (
        <div className="layer-backdrop" role="presentation" onMouseDown={closeLayers}>
          <section
            className="search-layer"
            ref={searchLayerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Busca no arquivo"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="search-input-row">
              <MagnifyingGlass size={24} aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Projeto, canal, tecnologia ou ideia…"
                aria-label="Termo de busca"
              />
              <button type="button" onClick={closeLayers} aria-label="Fechar busca">
                <X size={22} />
              </button>
            </div>
            <div className="search-results" aria-live="polite">
              {!records && !searchError && <p className="search-message">Lendo os saves públicos…</p>}
              {searchError && (
                <p className="search-message error-message">
                  O índice não respondeu. Recarregue a página ou use o arquivo completo.
                </p>
              )}
              {records && results.length === 0 && (
                <p className="search-message">Nenhum save combina com “{query}”.</p>
              )}
              {results.map((record) => (
                <button
                  type="button"
                  className="search-result"
                  key={record.id}
                  onClick={() => openResult(record.href)}
                >
                  <span className="result-code">/{record.channel}</span>
                  <span>
                    <strong>{record.title}</strong>
                    <small>{record.summary}</small>
                  </span>
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              ))}
            </div>
            <div className="search-help">
              <span><kbd>Tab</kbd> navegar</span>
              <span><kbd>Esc</kbd> fechar</span>
            </div>
          </section>
        </div>
      )}

      {terminalOpen && (
        <div
          className="terminal-wrap"
          ref={terminalLayerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Terminal GABRIEL.SYS"
          tabIndex={-1}
        >
          <div className="terminal-titlebar">
            <span>gabriel.sys — tty1</span>
            <button type="button" onClick={closeLayers} aria-label="Fechar terminal">
              <X size={20} />
            </button>
          </div>
          <div className="terminal-body">
            <p>GABRIEL.SYS archive shell · public mode</p>
            <p>Comandos rápidos:</p>
            <div className="terminal-links">
              <Link href="/archive/" onClick={closeLayers}><b>$</b> open archive</Link>
              <Link href="/#canais" onClick={closeLayers}><b>$</b> browse channels</Link>
              <Link href="/about/" onClick={closeLayers}><b>$</b> whoami</Link>
              <button type="button" onClick={() => { setTerminalOpen(false); setSearchOpen(true); }}>
                <b>$</b> search --all
              </button>
            </div>
            <p className="terminal-cursor">guest@gabriel.sys:~$ <i /></p>
          </div>
        </div>
      )}
    </div>
  );
}

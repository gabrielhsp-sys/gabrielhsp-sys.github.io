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

type TerminalLine = { kind: "in" | "out" | "err"; text: string };

const nav = [
  { href: "/", label: "Início", icon: House },
  { href: "/archive/", label: "Arquivo", icon: ArchiveBox },
  { href: "/about/", label: "Sobre", icon: Info },
];

const terminalIntro: TerminalLine[] = [
  { kind: "out", text: "GABRIEL.SYS archive shell · public mode" },
  { kind: "out", text: "digite `help` para ver os comandos." },
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
  const [selected, setSelected] = useState(0);
  const [records, setRecords] = useState<SearchRecord[] | null>(null);
  const [searchError, setSearchError] = useState(false);
  const [clock, setClock] = useState("--:--");
  const [lines, setLines] = useState<TerminalLine[]>(terminalIntro);
  const [command, setCommand] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const commandRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchLayerRef = useRef<HTMLElement>(null);
  const terminalLayerRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const layerWasOpen = useRef(false);

  const closeLayers = useCallback(() => {
    setSearchOpen(false);
    setTerminalOpen(false);
    setQuery("");
  }, []);

  const openSearch = useCallback((initial = "") => {
    setTerminalOpen(false);
    setQuery(initial);
    setSelected(0);
    setSearchOpen(true);
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

  const openResult = useCallback(
    (href: string) => {
      closeLayers();
      router.push(href);
    },
    [closeLayers, router],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      const bareKey = !event.ctrlKey && !event.metaKey && !event.altKey;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
        return;
      }

      if (event.key === "Escape") {
        closeLayers();
        return;
      }

      if (!isTyping && bareKey && (event.key === "~" || event.key === "`" || event.code === "Backquote")) {
        event.preventDefault();
        setSearchOpen(false);
        setTerminalOpen((open) => !open);
        return;
      }

      if (searchOpen && ["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(event.key)) {
        if (!results.length) return;
        event.preventDefault();
        if (event.key === "Enter") {
          openResult(results[Math.min(selected, results.length - 1)].href);
          return;
        }
        setSelected((current) => {
          if (event.key === "Home") return 0;
          if (event.key === "End") return results.length - 1;
          const next = event.key === "ArrowDown" ? current + 1 : current - 1;
          return (next + results.length) % results.length;
        });
        return;
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
  }, [closeLayers, openResult, openSearch, results, searchOpen, selected, terminalOpen]);

  useEffect(() => {
    const openFromPage = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.closest("[data-search-shortcut]")) openSearch();
    };
    document.addEventListener("click", openFromPage);
    return () => document.removeEventListener("click", openFromPage);
  }, [openSearch]);

  useEffect(() => {
    if ((!searchOpen && !terminalOpen) || records || searchError) return;
    fetch("/search-index.json")
      .then((response) => {
        if (!response.ok) throw new Error("search index unavailable");
        return response.json() as Promise<SearchRecord[]>;
      })
      .then(setRecords)
      .catch(() => setSearchError(true));
  }, [records, searchError, searchOpen, terminalOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    resultsRef.current
      ?.querySelector<HTMLElement>('[data-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [searchOpen, selected, results]);

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
    if (terminalOpen) window.setTimeout(() => commandRef.current?.focus(), 40);

    if (!layerOpen) {
      delete document.body.dataset.layerOpen;
      openerRef.current?.focus();
      openerRef.current = null;
    }

    return () => background.forEach((element) => { element.inert = false; });
  }, [searchOpen, terminalOpen]);

  const runCommand = (raw: string) => {
    const entry = raw.trim();
    if (!entry) return;
    const [name, ...rest] = entry.split(/\s+/);
    const argument = rest.join(" ");
    const echo: TerminalLine = { kind: "in", text: entry };
    const push = (...output: TerminalLine[]) => setLines((current) => [...current, echo, ...output]);

    switch (name.toLowerCase()) {
      case "help":
      case "?":
        push(
          { kind: "out", text: "ls            lista os saves públicos" },
          { kind: "out", text: "open <slot>   abre um save pelo identificador" },
          { kind: "out", text: "archive       vai para o arquivo completo" },
          { kind: "out", text: "channels      vai para o índice de canais" },
          { kind: "out", text: "search <termo> abre a busca global" },
          { kind: "out", text: "whoami        contexto e contato" },
          { kind: "out", text: "clear         limpa a sessão · exit fecha" },
        );
        return;
      case "ls":
        if (!records) {
          push({ kind: "err", text: searchError ? "índice indisponível." : "índice carregando…" });
          return;
        }
        push(
          ...records.map((record) => ({
            kind: "out" as const,
            text: `${record.id.padEnd(22)} /${record.channel.padEnd(9)} ${record.status}`,
          })),
        );
        return;
      case "open": {
        if (!argument) {
          push({ kind: "err", text: "uso: open <slot>" });
          return;
        }
        const match = records?.find((record) => record.id === argument);
        if (!match) {
          push({ kind: "err", text: `slot "${argument}" não existe. use \`ls\`.` });
          return;
        }
        push({ kind: "out", text: `carregando ${match.id}…` });
        openResult(match.href);
        return;
      }
      case "archive":
        push({ kind: "out", text: "abrindo /archive…" });
        openResult("/archive/");
        return;
      case "channels":
        push({ kind: "out", text: "abrindo índice de canais…" });
        openResult("/#canais");
        return;
      case "whoami":
      case "about":
        push({ kind: "out", text: "gabriel henrique · ciência da computação · unifal-mg" });
        openResult("/about/");
        return;
      case "search":
        openSearch(argument);
        return;
      case "clear":
        setLines(terminalIntro);
        return;
      case "exit":
      case "close":
      case "q":
        closeLayers();
        return;
      default:
        push({ kind: "err", text: `comando não reconhecido: ${name}. tente \`help\`.` });
    }
  };

  const activeResult = results[Math.min(selected, Math.max(results.length - 1, 0))];

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
          onClick={() => { setSearchOpen(false); setTerminalOpen(true); }}
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
          <button className="search-trigger" type="button" onClick={() => openSearch()}>
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
        <button type="button" onClick={() => openSearch()} aria-label="Buscar">
          <MagnifyingGlass size={22} />
        </button>
        <button
          type="button"
          onClick={() => { setSearchOpen(false); setTerminalOpen(true); }}
          aria-label="Abrir terminal"
        >
          <TerminalWindow size={22} />
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
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls="search-results"
                aria-autocomplete="list"
                aria-activedescendant={activeResult ? `search-option-${activeResult.id}` : undefined}
                value={query}
                onChange={(event) => { setQuery(event.target.value); setSelected(0); }}
                placeholder="Projeto, canal, tecnologia ou ideia…"
                aria-label="Termo de busca"
                autoComplete="off"
              />
              <button type="button" onClick={closeLayers} aria-label="Fechar busca">
                <X size={22} />
              </button>
            </div>
            <div className="search-results" id="search-results" role="listbox" aria-label="Resultados" ref={resultsRef}>
              {!records && !searchError && <p className="search-message">Lendo os saves públicos…</p>}
              {searchError && (
                <p className="search-message error-message">
                  O índice não respondeu. Recarregue a página ou use o arquivo completo.
                </p>
              )}
              {records && results.length === 0 && (
                <p className="search-message">Nenhum save combina com “{query}”.</p>
              )}
              {results.map((record, index) => (
                <div
                  role="option"
                  id={`search-option-${record.id}`}
                  aria-selected={index === selected}
                  data-selected={index === selected}
                  className="search-result"
                  key={record.id}
                  onClick={() => openResult(record.href)}
                  onMouseEnter={() => setSelected(index)}
                >
                  <span className="result-code">/{record.channel}</span>
                  <span>
                    <strong>{record.title}</strong>
                    <small>{record.summary}</small>
                  </span>
                  <ArrowRight size={18} aria-hidden="true" />
                </div>
              ))}
            </div>
            <div className="search-help">
              <span role="status">
                {records ? `${results.length} ${results.length === 1 ? "save" : "saves"}` : ""}
              </span>
              <span><kbd>↑</kbd><kbd>↓</kbd> navegar</span>
              <span><kbd>Enter</kbd> abrir</span>
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
        >
          <div className="terminal-titlebar">
            <span>gabriel.sys — tty1</span>
            <button type="button" onClick={closeLayers} aria-label="Fechar terminal">
              <X size={20} />
            </button>
          </div>
          <div className="terminal-body">
            <div className="terminal-log" aria-live="polite">
              {lines.map((line, index) => (
                <p key={`${index}-${line.text}`} data-kind={line.kind}>
                  {line.kind === "in" && <b>guest@gabriel.sys:~$ </b>}
                  {line.text}
                </p>
              ))}
            </div>
            <form
              className="terminal-prompt"
              onSubmit={(event) => {
                event.preventDefault();
                runCommand(command);
                setCommand("");
              }}
            >
              <label htmlFor="terminal-command">guest@gabriel.sys:~$</label>
              <input
                id="terminal-command"
                ref={commandRef}
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                autoComplete="off"
                spellCheck={false}
                placeholder="help"
              />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

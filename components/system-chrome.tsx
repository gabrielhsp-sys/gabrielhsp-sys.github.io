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
  SpeakerHighIcon as SpeakerHigh,
  SpeakerSlashIcon as SpeakerSlash,
  TerminalWindowIcon as TerminalWindow,
  XIcon as X,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BootSequence } from "@/components/boot-sequence";
import { BrowserChrome } from "@/components/browser-chrome";
import { usePersonality } from "@/components/personality";
import { Snake } from "@/components/snake";
import { normalizeSearch } from "@/lib/format";
import { areaLabel, site, statusLabel } from "@/lib/site";

type SearchRecord = {
  id: string;
  title: string;
  summary: string;
  type: string;
  area: string;
  status: string;
  tags: string[];
  href: string;
  text: string;
};

type TerminalLine = { kind: "in" | "out" | "err" | "good"; text: string; href?: string };

const nav = [
  { href: "/", label: "Início", icon: House },
  { href: "/archive/", label: "Projetos", icon: ArchiveBox },
  { href: "/about/", label: "Sobre", icon: Info },
];

const isActive = (href: string, pathname: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

const terminalIntro: TerminalLine[] = [
  { kind: "out", text: "GABRIEL.SYS — terminal do portfólio" },
  { kind: "out", text: "Tudo que está no site também está aqui, em texto." },
  { kind: "out", text: "Digite `help` para ver os comandos." },
];

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a",
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

/* Rotas que so chegam por link direto e ficam fora da navegacao do site. Nelas
   nao ha trilho, dock, busca, terminal nem rodape: um clique perdido nao pode
   tirar a pessoa do formulario, porque nao ha menu para voltar. */
const barePaths = ["/orcamento"];

const isBare = (pathname: string) =>
  barePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

type ChromeProps = {
  updated: { iso: string; label: string };
  children: React.ReactNode;
};

export function SystemChrome(props: ChromeProps) {
  const pathname = usePathname();
  // Componentes separados, nao um `if` dentro do chrome: assim os atalhos de
  // teclado (Ctrl K, crase, konami) nem chegam a ser registrados nessas rotas.
  return isBare(pathname) ? <BareChrome>{props.children}</BareChrome> : <SiteChrome {...props} />;
}

/* Som e retro sao preferencias, nao navegacao: continuam em qualquer rota. */
function PreferenceTools() {
  const { sound, retro } = usePersonality();
  return (
    <>
      {retro.on && (
        <button className="retro-exit" type="button" onClick={retro.toggle}>
          sair do modo retrô
        </button>
      )}
      <button
        className="sound-toggle"
        type="button"
        onClick={sound.toggle}
        aria-pressed={sound.on}
        aria-label={sound.on ? "Desligar som" : "Ligar som"}
        title={sound.on ? "Desligar som" : "Ligar som"}
      >
        {sound.on ? <SpeakerHigh size={18} /> : <SpeakerSlash size={18} />}
      </button>
    </>
  );
}

function BareChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-frame" data-chrome="bare">
      <BrowserChrome />
      <div className="site-column">
        <header className="topbar">
          {/* Marca sem link: aqui ela identifica, nao navega. */}
          <p className="wordmark">
            GABRIEL<span>.SYS</span>
          </p>
          <div className="topbar-tools">
            <PreferenceTools />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

function SiteChrome({ updated, children }: ChromeProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [records, setRecords] = useState<SearchRecord[] | null>(null);
  const [searchError, setSearchError] = useState(false);
  const [lines, setLines] = useState<TerminalLine[]>(terminalIntro);
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyAt, setHistoryAt] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const commandRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const searchLayerRef = useRef<HTMLElement>(null);
  const terminalLayerRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const layerWasOpen = useRef(false);
  const konamiAt = useRef(0);

  const { sound, retro, achievements } = usePersonality();

  const closeLayers = useCallback(() => {
    setSearchOpen(false);
    setTerminalOpen(false);
    setPlaying(false);
    setQuery("");
  }, []);

  const openSearch = useCallback((initial = "") => {
    setTerminalOpen(false);
    setQuery(initial);
    setSelected(0);
    setSearchOpen(true);
  }, []);

  const openTerminal = useCallback(() => {
    setSearchOpen(false);
    setTerminalOpen(true);
    achievements.unlock("terminal");
  }, [achievements]);

  const results = useMemo(() => {
    if (!records) return [];
    const needle = normalizeSearch(query.trim());
    if (!needle) return records.slice(0, 6);
    return records
      .filter((record) =>
        normalizeSearch(
          `${record.title} ${record.summary} ${record.area} ${record.status} ${record.tags.join(" ")} ${record.text}`,
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

  /* ───────── teclado global ───────── */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      const bareKey = !event.ctrlKey && !event.metaKey && !event.altKey;

      /* konami — em qualquer lugar, menos durante o snake */
      if (!playing) {
        const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
        konamiAt.current = key === KONAMI[konamiAt.current]
          ? konamiAt.current + 1
          : (key === KONAMI[0] ? 1 : 0);
        if (konamiAt.current === KONAMI.length) {
          konamiAt.current = 0;
          retro.toggle();
        }
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
        return;
      }

      if (event.key === "Escape" && !playing) {
        closeLayers();
        return;
      }

      /* o terminal abre na crase/til, inclusive com a tecla morta do ABNT2 */
      if (!isTyping && bareKey && (event.key === "~" || event.key === "`" || event.code === "Backquote")) {
        event.preventDefault();
        if (terminalOpen) closeLayers();
        else openTerminal();
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
  }, [closeLayers, openResult, openSearch, openTerminal, playing, results, retro, searchOpen, selected, terminalOpen]);

  useEffect(() => {
    const openFromPage = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.closest("[data-search-shortcut]")) openSearch();
      if (target.closest("[data-terminal-shortcut]")) openTerminal();
    };
    document.addEventListener("click", openFromPage);
    return () => document.removeEventListener("click", openFromPage);
  }, [openSearch, openTerminal]);

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
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [lines, playing]);

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
    if (terminalOpen && !playing) window.setTimeout(() => commandRef.current?.focus(), 40);

    if (!layerOpen) {
      delete document.body.dataset.layerOpen;
      openerRef.current?.focus();
      openerRef.current = null;
    }

    return () => background.forEach((element) => { element.inert = false; });
  }, [playing, searchOpen, terminalOpen]);

  /* ───────── terminal ───────── */

  const runCommand = (raw: string) => {
    const entry = raw.trim();
    if (!entry) return;
    setHistory((current) => [entry, ...current]);
    setHistoryAt(-1);

    const [name, ...rest] = entry.split(/\s+/);
    const argument = rest.join(" ");
    const echo: TerminalLine = { kind: "in", text: entry };
    const push = (...output: TerminalLine[]) => setLines((current) => [...current, echo, ...output]);
    const out = (text: string, href?: string): TerminalLine => ({ kind: "out", text, href });

    switch (name.toLowerCase()) {
      case "help":
      case "ajuda":
      case "?":
        push(
          out("projetos        lista os projetos públicos"),
          out("abrir <slot>    abre um projeto pelo identificador"),
          out("contato         copia o e-mail e abre o contato"),
          out("cv              resumo em uma tela"),
          out("busca <termo>   abre a busca global"),
          out("theme           liga ou desliga o modo retrô"),
          out("som             liga ou desliga os bipes"),
          out("snake           joga snake aqui dentro"),
          out("clear           limpa a sessão · sair fecha"),
          { kind: "out", text: "" },
          { kind: "good", text: "Tem coisa que não está nessa lista. Tente adivinhar." },
        );
        return;
      case "projetos":
      case "ls":
        if (!records) {
          push({ kind: "err", text: searchError ? "índice indisponível." : "índice carregando…" });
          return;
        }
        push(
          ...records.map((record) =>
            out(`${record.id.padEnd(20)} ${areaLabel(record.area).padEnd(22)} ${statusLabel(record.status)}`),
          ),
          { kind: "out", text: "" },
          { kind: "good", text: "Use `abrir <slot>` para ler o estudo de caso." },
        );
        return;
      case "abrir":
      case "open": {
        if (!argument) {
          push({ kind: "err", text: "uso: abrir <slot>" });
          return;
        }
        const match = records?.find((record) => record.id === argument);
        if (!match) {
          push({ kind: "err", text: `slot "${argument}" não existe. use \`projetos\`.` });
          return;
        }
        push(out(`carregando ${match.id}…`));
        openResult(match.href);
        return;
      }
      case "arquivo":
      case "archive":
        push(out("abrindo a lista completa…"));
        openResult("/archive/");
        return;
      case "contato":
        void navigator.clipboard?.writeText(site.email).then(
          () => setLines((current) => [...current, { kind: "good", text: "e-mail copiado para a área de transferência." }]),
          () => undefined,
        );
        push(
          out(site.email, `mailto:${site.email}`),
          out("github.com/gabrielhsp-sys", site.github),
          out("linkedin.com/in/gabrielhsp-dev", site.linkedin),
        );
        sound.play("ok");
        return;
      case "cv":
        push(
          { kind: "good", text: "GABRIEL HENRIQUE" },
          out("Ciência da Computação · UNIFAL-MG · Minas Gerais, BR"),
          { kind: "out", text: "" },
          { kind: "good", text: "SOFTWARE & AUTOMAÇÃO" },
          out("  Python, Telethon, SQLite, systemd — serviço em produção 24/7"),
          out("  Java, Maven, JUnit, Mockito, Docker, GitHub Actions"),
          out("  Linux, dnf5, documentação técnica verificável"),
          { kind: "out", text: "" },
          { kind: "good", text: "WEB & INTERFACES" },
          out("  Next.js, React, TypeScript, MDX, acessibilidade, GitHub Pages"),
          { kind: "out", text: "" },
          { kind: "good", text: "ACADÊMICO" },
          out("  C, C++, Java, Prolog, SQL — graduação em curso na UNIFAL-MG"),
          { kind: "out", text: "" },
          { kind: "good", text: "CONTATO" },
          out(`  ${site.email}`, `mailto:${site.email}`),
        );
        return;
      case "busca":
      case "search":
        openSearch(argument);
        return;
      case "sobre":
      case "whoami":
        push(out("gabriel henrique · ciência da computação · unifal-mg"));
        openResult("/about/");
        return;
      case "theme":
      case "tema":
        retro.toggle();
        push(out(retro.on ? "voltando ao tema normal." : "fósforo verde ligado. `theme` de novo desliga."));
        return;
      case "som":
      case "sound":
        sound.toggle();
        push(out(sound.on ? "som desligado." : "som ligado."));
        return;
      case "snake":
      case "jogo":
        push(out("carregando snake…"));
        setPlaying(true);
        return;
      case "sudo": {
        const target = argument.toLowerCase();
        if (target === "hire gabriel") {
          achievements.unlock("hire");
          push(
            { kind: "good", text: "permissão concedida." },
            out("abrindo o contato. o e-mail está copiado."),
          );
          void navigator.clipboard?.writeText(site.email).catch(() => undefined);
          openResult("/#contato");
          return;
        }
        if (target.startsWith("rm")) {
          push(
            { kind: "err", text: "Boa tentativa." },
            out("Este site é estático e versionado no Git. Volta com um comando."),
          );
          sound.play("error");
          return;
        }
        push(
          { kind: "err", text: "visitante não está no arquivo sudoers." },
          out("Mas `sudo hire gabriel` funciona."),
        );
        sound.play("error");
        return;
      }
      case "kernel":
        if (!retro.on) break;
        achievements.unlock("kernel");
        push(
          { kind: "good", text: "GHSP-KERNEL · fósforo verde" },
          out("uptime ......... desde 2023, quebrando e consertando"),
          out("hobby .......... abrir a máquina antes de usar a máquina"),
          out("primeiro bug ... o registro do Windows, por vontade própria"),
          out("disponível ..... para conversar sobre vaga ou projeto"),
          { kind: "out", text: "" },
          { kind: "good", text: "Você achou o comando secreto. É o último." },
        );
        return;
      case "clear":
      case "limpar":
        setLines(terminalIntro);
        return;
      case "sair":
      case "exit":
      case "close":
      case "q":
        closeLayers();
        return;
      default:
        break;
    }

    const guesses: Record<string, string> = {
      cat: "sobre", pwd: "projetos", man: "help", cd: "abrir", git: "contato",
      about: "sobre", projects: "projetos", contact: "contato", email: "contato",
      curriculo: "cv", resume: "cv", hire: "sudo hire gabriel",
    };
    const guess = guesses[name.toLowerCase()];
    push(
      { kind: "err", text: `comando não encontrado: ${name}` },
      out(guess ? `Você quis dizer \`${guess}\`?` : "Digite `help`."),
    );
    sound.play("error");
  };

  const endGame = useCallback((score: number) => {
    setPlaying(false);
    setLines((current) => [
      ...current,
      { kind: "good", text: `fim de jogo — ${score} pontos` },
      { kind: "out", text: "Digite `snake` para tentar de novo." },
    ]);
    window.setTimeout(() => commandRef.current?.focus(), 40);
  }, []);

  const onCommandKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (historyAt < history.length - 1) {
        const next = historyAt + 1;
        setHistoryAt(next);
        setCommand(history[next]);
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyAt > 0) {
        const next = historyAt - 1;
        setHistoryAt(next);
        setCommand(history[next]);
      } else {
        setHistoryAt(-1);
        setCommand("");
      }
    }
  };

  const activeResult = results[Math.min(selected, Math.max(results.length - 1, 0))];

  return (
    <div className="site-frame">
      <BootSequence />
      <BrowserChrome />

      <aside className="system-rail" aria-label="Navegação principal">
        <Link href="/" className="brand-link" aria-label="GABRIEL.SYS — início">
          <BrandMark />
        </Link>
        <nav className="rail-nav">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, pathname);
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
        <button className="rail-action" type="button" onClick={openTerminal} aria-label="Abrir terminal">
          <TerminalWindow size={20} />
          <span>Terminal</span>
        </button>
      </aside>

      <div className="site-column">
        <header className="topbar">
          {/* No desktop a marca e o monograma do trilho; o nome por extenso so
              aparece no celular, onde o trilho nao existe. */}
          <Link href="/" className="wordmark">
            GABRIEL<span>.SYS</span>
          </Link>
          <p className="system-state">
            atualizado em <time dateTime={updated.iso}>{updated.label}</time>
          </p>
          <div className="topbar-tools">
            <PreferenceTools />
            <button className="search-trigger" type="button" onClick={() => openSearch()}>
              <MagnifyingGlass size={18} />
              <span>Procurar</span>
              <kbd>Ctrl K</kbd>
            </button>
          </div>
        </header>

        {children}

        <footer className="site-footer">
          <p>GABRIEL.SYS · escrito em Markdown, servido sem rastrear você.</p>
          <div>
            <a href="/feed.xml">RSS</a>
            <a href={site.github} target="_blank" rel="noreferrer">
              <GithubLogo size={18} /> GitHub
            </a>
            <button type="button" onClick={openTerminal}>
              <TerminalWindow size={18} /> terminal <kbd>`</kbd>
            </button>
          </div>
        </footer>
      </div>

      <nav className="mobile-dock" aria-label="Navegação móvel">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, pathname);
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
        <button type="button" onClick={openTerminal} aria-label="Abrir terminal">
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
                placeholder="Projeto, área, tecnologia ou ideia…"
                aria-label="Termo de busca"
                autoComplete="off"
              />
              <button type="button" onClick={closeLayers} aria-label="Fechar busca">
                <X size={22} />
              </button>
            </div>
            <div className="search-results" id="search-results" role="listbox" aria-label="Resultados" ref={resultsRef}>
              {!records && !searchError && <p className="search-message">Lendo os projetos públicos…</p>}
              {searchError && (
                <p className="search-message error-message">
                  O índice não respondeu. Recarregue a página ou use a lista completa.
                </p>
              )}
              {records && results.length === 0 && (
                <p className="search-message">Nenhum projeto combina com “{query}”.</p>
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
                  <span className="result-code area-mark" data-area={record.area}>
                    {areaLabel(record.area)}
                  </span>
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
                {records ? `${results.length} ${results.length === 1 ? "projeto" : "projetos"}` : ""}
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
            <div className="terminal-log" aria-live="polite" ref={logRef}>
              {lines.map((line, index) => (
                <p key={`${index}-${line.text}`} data-kind={line.kind}>
                  {line.kind === "in" && <b>guest@gabriel.sys:~$ </b>}
                  {line.href ? (
                    <a href={line.href} target={line.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                      {line.text}
                    </a>
                  ) : (
                    line.text
                  )}
                </p>
              ))}
              {playing && <Snake onExit={endGame} />}
            </div>
            {!playing && (
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
                  onKeyDown={onCommandKey}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="help"
                />
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

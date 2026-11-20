import capturas from "@/lib/capturas.json";
import { site } from "@/lib/site";

/* Prints do trabalho do Gabriel em molduras desenhadas em CSS (rodada visual
   2026-11-20). Nenhum mockup de terceiro: notebook, celular e navegador sao
   divs com borda e raio (app/cliente.css, prefixo f-). Os prints vem de
   scripts/capturas.mjs + `npm run imagens` (lib/capturas.json: rota de origem,
   alt e larguras). Toda <img> tem alt, largura e altura (sem CLS) e e lazy,
   exceto quando `prioridade` (primeira dobra). */

export type CapturaNome = keyof typeof capturas;
type Info = { rota: string; tipo: string; alt: string; width: number; height: number; variantes: number[] };
const info = (nome: CapturaNome) => capturas[nome] as Info;

// GIF transparente de 1 px: a fonte que o <picture> escolhe abaixo de `aPartirDe`,
// para a imagem escondida pelo CSS nessa largura nao ser baixada.
const VAZIO = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/** `prioridade`: a imagem candidata a LCP da pagina (eager + fetchpriority high),
    uma por pagina, na primeira dobra. Toda outra imagem e lazy: fora da dobra ela
    nao baixa, e na dobra o navegador carrega lazy na hora. `aPartirDe`: largura
    minima da janela em que a imagem aparece (o CSS a esconde abaixo dela); abaixo,
    nada e baixado. */
export function Captura({ nome, sizes, prioridade = false, aPartirDe, alt }: { nome: CapturaNome; sizes: string; prioridade?: boolean; aPartirDe?: number; alt?: string }) {
  const c = info(nome);
  const srcSet = (ext: string) => c.variantes.map((w) => `/capturas/${nome}-${w}.${ext} ${w}w`).join(", ");
  const maior = c.variantes[c.variantes.length - 1];
  return (
    <picture className="f-shot">
      {aPartirDe && <source media={`(max-width: ${aPartirDe - 1}px)`} srcSet={VAZIO} />}
      <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet("webp")} sizes={sizes} />
      <img
        src={`/capturas/${nome}-${maior}.webp`}
        alt={alt ?? c.alt}
        width={maior}
        height={Math.round((c.height * maior) / c.width)}
        loading={prioridade ? "eager" : "lazy"}
        fetchPriority={prioridade ? "high" : undefined}
        decoding="async"
      />
    </picture>
  );
}

/** Janela de navegador com o endereco real do exemplo (decorativo). */
export function Navegador({ endereco, children }: { endereco: string; children: React.ReactNode }) {
  return (
    <div className="f-navegador">
      <div className="f-navegador-barra" aria-hidden="true">
        <i /><i /><i />
        <span translate="no">{endereco}</span>
      </div>
      <div className="f-navegador-tela">{children}</div>
    </div>
  );
}

export function Notebook({ children }: { children: React.ReactNode }) {
  return (
    <div className="f-notebook">
      <div className="f-notebook-tampa"><div className="f-notebook-tela">{children}</div></div>
      <div className="f-notebook-base" aria-hidden="true" />
    </div>
  );
}

export function Celular({ children, tom }: { children: React.ReactNode; tom?: "conversa" }) {
  return (
    <div className="f-celular" data-tom={tom}>
      <div className="f-celular-tela">{children}</div>
    </div>
  );
}

/** Ilustracao em SVG (nao e print): um aplicativo de celular generico, para o
    servico "Aplicativos", que nao tem print (o Carona 70 nao tem dados de
    exemplo; fica em texto). Desenho abstrato: blocos, sem fingir uma tela real. */
export function IlustracaoAplicativo() {
  return (
    <svg className="f-ilustracao" viewBox="0 0 390 844" role="img" aria-label="Ilustração de um aplicativo de celular: agenda com horários e um botão de confirmar.">
      <rect width="390" height="844" fill="var(--ink-2)" />
      <rect x="24" y="56" width="180" height="22" rx="6" fill="var(--paper)" />
      <rect x="24" y="92" width="250" height="14" rx="5" fill="var(--paper-faint)" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(24 ${150 + i * 104})`}>
          <rect width="342" height="88" rx="14" fill="var(--ink)" stroke="var(--line-soft)" strokeWidth="2" />
          <rect x="18" y="20" width="64" height="48" rx="10" fill={i === 1 ? "var(--line)" : "var(--ink-3)"} />
          <rect x="100" y="26" width={150 - i * 12} height="14" rx="5" fill="var(--paper)" />
          <rect x="100" y="50" width={110 + i * 10} height="12" rx="5" fill="var(--paper-faint)" />
          <circle cx="314" cy="44" r="12" fill="none" stroke={i < 2 ? "var(--mint)" : "var(--line)"} strokeWidth="3" />
        </g>
      ))}
      <rect x="24" y="704" width="342" height="64" rx="14" fill="var(--amber-fill)" />
      <rect x="130" y="728" width="130" height="16" rx="6" fill="var(--on-amber)" />
    </svg>
  );
}

export type Moldura = "navegador" | "notebook" | "celular" | "conversa";

/** Print em moldura. O endereco da barra do navegador e a rota de origem do
    print (lib/capturas.json) no dominio do site (`SITE_URL`, ADR-025). */
export function MolduraCaptura({ moldura, captura, sizes, prioridade = false, aPartirDe }: { moldura: Moldura; captura: string; sizes: string; prioridade?: boolean; aPartirDe?: number }) {
  const nome = captura as CapturaNome;
  const img = <Captura nome={nome} sizes={sizes} prioridade={prioridade} aPartirDe={aPartirDe} />;
  if (moldura === "navegador") return <Navegador endereco={`${new URL(site.url).host}${info(nome).rota}`}>{img}</Navegador>;
  if (moldura === "notebook") return <Notebook>{img}</Notebook>;
  return <Celular tom={moldura === "conversa" ? "conversa" : undefined}>{img}</Celular>;
}

"use client";

import Link from "next/link";
import { ArrowRightIcon as ArrowRight, ArrowUpRightIcon as ArrowUpRight, CarProfileIcon as CarProfile } from "@phosphor-icons/react";
import { useSyncExternalStore } from "react";
import { Captura, Celular, Navegador, type CapturaNome } from "@/components/molduras";
import { tiposExemplo, type Exemplo, type TipoExemplo } from "@/lib/exemplos";

/* Grade de /exemplos/ com filtro por tipo (rodada visual 2026-11-20). Sem JS,
   tudo aparece. O filtro fica na URL (?tipo=bots), como o do arquivo: voltar
   no navegador ou mandar o link mantem a escolha. A contagem e anunciada. */

const tipoValido = (valor: string | null): TipoExemplo | null =>
  tiposExemplo.some((t) => t.id === valor) ? (valor as TipoExemplo) : null;

const evento = "gsys:filtro-exemplos";
const subscribe = (notify: () => void) => {
  window.addEventListener("popstate", notify);
  window.addEventListener(evento, notify);
  return () => {
    window.removeEventListener("popstate", notify);
    window.removeEventListener(evento, notify);
  };
};
const snapshot = () => tipoValido(new URLSearchParams(window.location.search).get("tipo"));
const serverSnapshot = () => null;

function escolher(tipo: TipoExemplo | null) {
  const url = new URL(window.location.href);
  if (tipo) url.searchParams.set("tipo", tipo);
  else url.searchParams.delete("tipo");
  window.history.replaceState(window.history.state, "", url);
  window.dispatchEvent(new Event(evento));
}

const host = "gabrielsys.com.br";

function Imagem({ exemplo, cedo, prioridade }: { exemplo: Exemplo; cedo: boolean; prioridade: boolean }) {
  const img = exemplo.imagem;
  if (img.moldura === "texto") {
    return (
      <div className="c-visual" data-moldura="texto">
        <CarProfile size={64} weight="duotone" aria-hidden="true" />
        {/* Nota visual do lugar da imagem; o leitor de tela ja ouve o texto do cartao. */}
        <span aria-hidden="true">App Android. Ainda sem print com dados de exemplo.</span>
      </div>
    );
  }
  if (img.moldura === "video") {
    return (
      <div className="c-visual" data-moldura="video">
        {/* eslint-disable-next-line @next/next/no-img-element -- export estatico, sem otimizador */}
        <img src={img.src} alt={img.alt} width={img.width} height={img.height} loading={cedo ? "eager" : "lazy"} decoding="async" />
      </div>
    );
  }
  // Largura do print, nao do cartao: no navegador ~88% do cartao; no celular, o aparelho (ate 190 px).
  const sizes = img.moldura === "navegador" ? "(min-width: 1100px) 300px, (min-width: 640px) 40vw, 82vw" : "170px";
  const shot = <Captura nome={img.captura as CapturaNome} sizes={sizes} cedo={cedo} prioridade={prioridade} />;
  return (
    <div className="c-visual" data-moldura={img.moldura}>
      {img.moldura === "navegador" ? (
        <Navegador endereco={`${host}${exemplo.href}`}>{shot}</Navegador>
      ) : (
        <Celular tom={img.moldura === "conversa" ? "conversa" : undefined}>{shot}</Celular>
      )}
    </div>
  );
}

/** `cedo`: quantos cartoes, do comeco, cruzam a primeira dobra do desktop e nao sao lazy. */
export function ExemplosGrade({ exemplos, filtro = true, cedo = 3 }: { exemplos: Exemplo[]; filtro?: boolean; cedo?: number }) {
  const tipo = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const visiveis = exemplos.filter((e) => !tipo || e.tipo === tipo).length;
  const contagem = (id: TipoExemplo | null) => exemplos.filter((e) => !id || e.tipo === id).length;
  return (
    <>
      {filtro && (
        <div className="c-filtro" role="group" aria-label="Filtrar exemplos por tipo">
          {[{ id: null, nome: "Todos" }, ...tiposExemplo].map((t) => (
            <button key={t.id ?? "todos"} type="button" aria-pressed={tipo === t.id} onClick={() => escolher(t.id)}>
              {t.nome} <span aria-hidden="true">{contagem(t.id)}</span>
            </button>
          ))}
        </div>
      )}
      {filtro && (
        <p className="c-filtro-total" role="status">
          {visiveis === 1 ? "1 exemplo" : `${visiveis} exemplos`}
        </p>
      )}
      <ul className="c-exemplos">
        {exemplos.map((e, i) => {
          const conteudo = (
            <>
              {/* O primeiro print e o LCP no celular: so ele tem prioridade de rede. */}
              <Imagem exemplo={e} cedo={i < cedo} prioridade={i === 0} />
              <span className="c-badge" data-kind={e.natureza}>{e.natureza === "real" ? "Projeto real" : "Demonstração"}</span>
              <strong>{e.titulo}</strong>
              <span className="c-exemplo-mostra">{e.mostra}</span>
              <span className="c-exemplo-abrir">
                {e.demoAstro ? "Abrir o site" : "Ver o exemplo"}
                {e.demoAstro ? <ArrowUpRight size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
              </span>
            </>
          );
          return (
            <li key={e.id} data-tipo={e.tipo} hidden={!!tipo && e.tipo !== tipo}>
              {e.demoAstro ? <a href={e.href}>{conteudo}</a> : <Link href={e.href}>{conteudo}</Link>}
            </li>
          );
        })}
      </ul>
    </>
  );
}

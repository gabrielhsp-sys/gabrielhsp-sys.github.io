"use client";

import { MoonIcon as Moon, SunIcon as Sun } from "@phosphor-icons/react";
import { useSyncExternalStore } from "react";
import { atualizarCorDaBarra, TEMA_CHAVE, type Tema } from "@/lib/tema";

/* Tema claro/escuro das paginas de cliente (pedido de 2026-11-20): CLARO por
   padrao na primeira visita, independente do sistema; a escolha fica no
   localStorage. Quem aplica o tema antes do primeiro pintar e o script inline
   do <head> (TEMA_SCRIPT, em app/layout.tsx); este botao so le e troca o
   atributo que ja esta no <html>. A area do recrutador (/sobre, /projetos)
   continua escura pelo CSS (app/cliente.css), mesmo com o claro escolhido. */

const listeners = new Set<() => void>();
const subscribe = (notify: () => void) => {
  listeners.add(notify);
  return () => { listeners.delete(notify); };
};
const snapshot = (): Tema => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
// No servidor (e na hidratacao) o tema e desconhecido: o botao nasce neutro.
const serverSnapshot = (): Tema | null => null;

export function setTema(tema: Tema) {
  const root = document.documentElement;
  root.dataset.theme = tema;
  try {
    window.localStorage.setItem(TEMA_CHAVE, tema);
  } catch {
    /* a escolha nao persiste; a pagina continua no tema escolhido ate recarregar */
  }
  atualizarCorDaBarra();
  listeners.forEach((notify) => notify());
}

/** Botao de alternar. `rotulo`: texto visivel (no Menu do celular); sem ele, so o icone. */
export function TemaToggle({ rotulo = false }: { rotulo?: boolean }) {
  const tema = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const escuro = tema === "dark";
  return (
    <button
      className={rotulo ? "c-theme-toggle c-theme-toggle-label" : "c-theme-toggle"}
      type="button"
      aria-pressed={tema === null ? undefined : escuro}
      aria-label={rotulo ? undefined : "Tema escuro"}
      title={escuro ? "Voltar ao tema claro" : "Usar o tema escuro"}
      onClick={() => setTema(escuro ? "light" : "dark")}
    >
      {escuro ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
      {rotulo && <span>Tema escuro</span>}
    </button>
  );
}

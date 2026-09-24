"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePersonality } from "@/components/personality";

/* A animacao de entrada e a UNICA introducao do site. Roda uma vez por sessao,
   e pulavel por tecla ou clique, e nao roda com prefers-reduced-motion.
   O roteiro vem do portfolio de 2025. Ele foi condensado para caber em ~1,9 s
   do carregamento ao conteudo (antes eram 5,8 s medidos): a animacao e cartao
   de visita, nao sala de espera (ADR-017). */

type Line = { text: string; tone?: "ok" | "warn" | "head"; wait: number };

const SCRIPT: Line[] = [
  { text: "GABRIEL.SYS", tone: "head", wait: 180 },
  { text: "Memória ........ 640K  OK", tone: "ok", wait: 195 },
  { text: "Café ........... CRÍTICO", tone: "warn", wait: 220 },
  { text: "Perfil ......... software · web · acadêmico", wait: 245 },
  { text: "Iniciando portfolio.sh", wait: 235 },
];

// Depois da ultima linha: quanto a tela fica parada e quanto dura o desligar.
const HOLD = 340;
const LEAVE = 320;

const SESSION_KEY = "gsys:booted";

/* A decisao vive fora do React: ela e tomada uma unica vez por carregamento e
   entra por useSyncExternalStore, entao o HTML estatico nunca traz a tela de
   boot e a hidratacao nao diverge. */
let pending: boolean | null = null;
const waiting = new Set<() => void>();

function decide() {
  try {
    if (window.sessionStorage.getItem(SESSION_KEY) === "1") return false;
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Sem sessionStorage nao da para saber se ja rodou. Melhor nao rodar do que
    // repetir a cada navegacao interna.
    return false;
  }
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const snapshot = () => {
  if (pending === null) pending = decide();
  return pending;
};

const subscribe = (notify: () => void) => {
  waiting.add(notify);
  return () => { waiting.delete(notify); };
};

const finish = () => {
  pending = false;
  waiting.forEach((notify) => notify());
};

export function BootSequence() {
  const running = useSyncExternalStore(subscribe, snapshot, () => false);
  const [shown, setShown] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const { sound } = usePersonality();

  useEffect(() => {
    if (!running) return;
    document.body.dataset.booting = "true";
    return () => { delete document.body.dataset.booting; };
  }, [running]);

  /* datilografa uma linha por vez */
  useEffect(() => {
    if (!running || leaving || shown >= SCRIPT.length) return;
    const timer = window.setTimeout(() => {
      setShown((current) => current + 1);
      sound.play("boot");
    }, SCRIPT[shown].wait);
    return () => window.clearTimeout(timer);
  }, [leaving, running, shown, sound]);

  /* terminou o roteiro: desliga a tela */
  useEffect(() => {
    if (!running || leaving || shown < SCRIPT.length) return;
    const timer = window.setTimeout(() => setLeaving(true), HOLD);
    return () => window.clearTimeout(timer);
  }, [leaving, running, shown]);

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(finish, LEAVE);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  /* qualquer tecla ou clique pula */
  useEffect(() => {
    if (!running || leaving) return;
    const skip = () => setLeaving(true);
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [leaving, running]);

  if (!running) return null;

  return (
    <div
      className="boot-screen"
      data-leaving={leaving}
      role="status"
      aria-live="polite"
      aria-label="Inicializando GABRIEL.SYS"
    >
      <div className="boot-screen-inner">
        {SCRIPT.slice(0, shown).map((line, index) => (
          <p key={index} data-tone={line.tone}>{line.text || " "}</p>
        ))}
        <p className="boot-cursor" aria-hidden="true">▊</p>
      </div>
      <button className="boot-skip" type="button" onClick={() => setLeaving(true)}>
        pular <kbd>Esc</kbd>
      </button>
    </div>
  );
}

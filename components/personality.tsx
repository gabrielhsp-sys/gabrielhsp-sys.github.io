"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { site } from "@/lib/site";

/* ───────────────────────── preferencias tolerantes a falha ───────────────────
   localStorage pode lancar em modo anonimo ou com cookies bloqueados. Nada
   aqui pode derrubar a pagina por causa disso. As preferencias vivem fora do
   React e entram por useSyncExternalStore: o servidor renderiza o padrao e o
   navegador corrige na hidratacao, sem divergencia. */

const read = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* a preferencia nao persiste; o site continua igual */
  }
};

const listeners = new Set<() => void>();
const subscribe = (notify: () => void) => {
  listeners.add(notify);
  return () => { listeners.delete(notify); };
};
const emit = () => listeners.forEach((notify) => notify());

// Som LIGADO por padrao: so fica mudo quando alguem escolheu desligar.
const soundEnabled = () => read("gsys:sound") !== "0";
const retroEnabled = () => read("gsys:retro") === "1";
const unlockedRaw = () => read("gsys:achievements") ?? "";

const subscribeMotion = (notify: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const motionSnapshot = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ───────────────────────────────── som ───────────────────────────────────────
   Web Audio puro: osciladores e ganho, sem arquivo de audio e sem biblioteca.
   Herdado do portfolio de 2025 (script.js, funcao `bip`). */

export type SoundKind =
  | "click" | "hover" | "move" | "ok" | "error" | "boot" | "eat" | "fanfare";

type Tone = { freq: number; dur: number; wave: OscillatorType; gain: number };

const NORMAL: Record<SoundKind, Tone[]> = {
  click: [{ freq: 880, dur: 0.035, wave: "square", gain: 0.03 }],
  hover: [{ freq: 1320, dur: 0.018, wave: "sine", gain: 0.012 }],
  move: [{ freq: 520, dur: 0.05, wave: "triangle", gain: 0.022 }],
  ok: [
    { freq: 880, dur: 0.06, wave: "square", gain: 0.035 },
    { freq: 1320, dur: 0.09, wave: "square", gain: 0.035 },
  ],
  error: [{ freq: 180, dur: 0.16, wave: "sawtooth", gain: 0.04 }],
  boot: [{ freq: 620, dur: 0.02, wave: "square", gain: 0.02 }],
  eat: [{ freq: 990, dur: 0.05, wave: "square", gain: 0.035 }],
  fanfare: [
    { freq: 523, dur: 0.09, wave: "square", gain: 0.035 },
    { freq: 659, dur: 0.09, wave: "square", gain: 0.035 },
    { freq: 784, dur: 0.09, wave: "square", gain: 0.035 },
    { freq: 1047, dur: 0.14, wave: "square", gain: 0.035 },
  ],
};

// Pacote chiptune do modo retro: onda quadrada em tudo, mais agudo e mais seco.
const RETRO: Record<SoundKind, Tone[]> = {
  click: [{ freq: 1480, dur: 0.028, wave: "square", gain: 0.028 }],
  hover: [{ freq: 1970, dur: 0.014, wave: "square", gain: 0.01 }],
  move: [{ freq: 740, dur: 0.04, wave: "square", gain: 0.022 }],
  ok: [
    { freq: 1047, dur: 0.05, wave: "square", gain: 0.032 },
    { freq: 1568, dur: 0.07, wave: "square", gain: 0.032 },
  ],
  error: [
    { freq: 220, dur: 0.07, wave: "square", gain: 0.04 },
    { freq: 110, dur: 0.14, wave: "square", gain: 0.04 },
  ],
  boot: [{ freq: 880, dur: 0.018, wave: "square", gain: 0.02 }],
  eat: [{ freq: 1320, dur: 0.04, wave: "square", gain: 0.035 }],
  fanfare: [
    { freq: 659, dur: 0.08, wave: "square", gain: 0.035 },
    { freq: 880, dur: 0.08, wave: "square", gain: 0.035 },
    { freq: 1319, dur: 0.08, wave: "square", gain: 0.035 },
    { freq: 1760, dur: 0.16, wave: "square", gain: 0.035 },
  ],
};

/* ──────────────────────────── conquistas ──────────────────────────────────── */

export const ACHIEVEMENTS = {
  terminal: "Terminal encontrado",
  snake: "Primeira fruta no snake",
  retro: "Modo retrô destravado",
  hire: "sudo hire gabriel",
  kernel: "Comando secreto do modo retrô",
} as const;

export type AchievementId = keyof typeof ACHIEVEMENTS;
export const ACHIEVEMENT_TOTAL = Object.keys(ACHIEVEMENTS).length;

/* ──────────────────────────── contexto ────────────────────────────────────── */

type PersonalityValue = {
  soundOn: boolean;
  toggleSound: () => void;
  play: (kind: SoundKind) => void;
  retroOn: boolean;
  toggleRetro: () => void;
  unlocked: AchievementId[];
  unlock: (id: AchievementId) => void;
  reducedMotion: boolean;
};

const PersonalityContext = createContext<PersonalityValue | null>(null);

/* O retorno e memoizado: quem depende de `sound` ou `achievements` num array de
   dependencias precisa de identidade estavel, senao o intervalo do snake e os
   listeners globais seriam recriados a cada render. */
export function usePersonality() {
  const value = useContext(PersonalityContext);
  const view = useMemo(
    () =>
      value && {
        sound: { on: value.soundOn, toggle: value.toggleSound, play: value.play },
        retro: { on: value.retroOn, toggle: value.toggleRetro },
        achievements: { unlocked: value.unlocked, unlock: value.unlock, total: ACHIEVEMENT_TOTAL },
        reducedMotion: value.reducedMotion,
      },
    [value],
  );
  if (!view) throw new Error("usePersonality precisa do PersonalityProvider.");
  return view;
}

export function PersonalityProvider({ children }: { children: React.ReactNode }) {
  const soundOn = useSyncExternalStore(subscribe, soundEnabled, () => true);
  const retroOn = useSyncExternalStore(subscribe, retroEnabled, () => false);
  const unlockedList = useSyncExternalStore(subscribe, unlockedRaw, () => "");
  const reducedMotion = useSyncExternalStore(subscribeMotion, motionSnapshot, () => false);

  const [toast, setToast] = useState<{ id: AchievementId; count: number } | null>(null);
  const [glitching, setGlitching] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const lastHover = useRef(0);
  const firstPath = useRef(true);
  const pathname = usePathname();

  const unlocked = useMemo(
    () => unlockedList.split(",").filter((id): id is AchievementId => id in ACHIEVEMENTS),
    [unlockedList],
  );

  /* O navegador so libera audio depois da primeira interacao. Nada de truque:
     o contexto nasce no primeiro gesto e o som comeca a valer dali. */
  useEffect(() => {
    const wake = () => {
      if (!ctxRef.current) {
        const Ctor = window.AudioContext
          ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        try {
          ctxRef.current = new Ctor();
        } catch {
          return;
        }
      }
      if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    };
    const events: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "touchstart"];
    events.forEach((event) => window.addEventListener(event, wake, { passive: true }));
    return () => events.forEach((event) => window.removeEventListener(event, wake));
  }, []);

  const play = useCallback((kind: SoundKind) => {
    const ctx = ctxRef.current;
    if (!ctx || ctx.state !== "running" || !soundEnabled()) return;
    const tones = (retroEnabled() ? RETRO : NORMAL)[kind];
    tones.forEach((tone, index) => {
      try {
        const start = ctx.currentTime + index * (tone.dur + 0.012);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = tone.wave;
        osc.frequency.setValueAtTime(tone.freq, start);
        gain.gain.setValueAtTime(tone.gain, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + tone.dur + 0.02);
      } catch {
        /* um bipe perdido nao e motivo para quebrar a pagina */
      }
    });
  }, []);

  const unlock = useCallback((id: AchievementId) => {
    const current = unlockedRaw().split(",").filter(Boolean);
    if (current.includes(id)) return;
    const next = [...current, id];
    write("gsys:achievements", next.join(","));
    emit();
    setToast({ id, count: next.length });
    play("fanfare");
  }, [play]);

  const toggleSound = useCallback(() => {
    const next = !soundEnabled();
    write("gsys:sound", next ? "1" : "0");
    emit();
    if (next) play("ok");
  }, [play]);

  const toggleRetro = useCallback(() => {
    const next = !retroEnabled();
    write("gsys:retro", next ? "1" : "0");
    emit();
    if (next) {
      // Com reduced-motion o CRT entra estatico: sem glitch e sem flicker.
      if (!motionSnapshot()) {
        setGlitching(true);
        window.setTimeout(() => setGlitching(false), 900);
      }
      unlock("retro");
    }
    play(next ? "fanfare" : "move");
  }, [play, unlock]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  /* o tema retro vive no <html> para alcancar tudo, inclusive as camadas fixas */
  useEffect(() => {
    document.documentElement.dataset.retro = retroOn ? "on" : "off";
  }, [retroOn]);

  useEffect(() => {
    document.documentElement.dataset.glitch = glitching ? "on" : "off";
  }, [glitching]);

  /* sons de clique, hover e transicao */
  useEffect(() => {
    const interactive = 'a[href], button, input, [role="option"], summary';
    const onClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement | null)?.closest?.(interactive)) play("click");
    };
    const onOver = (event: PointerEvent) => {
      if (!(event.target as HTMLElement | null)?.closest?.(interactive)) return;
      const now = Date.now();
      if (now - lastHover.current < 90) return;
      lastHover.current = now;
      play("hover");
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("pointerover", onOver, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("pointerover", onOver, true);
    };
  }, [play]);

  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    play("move");
  }, [pathname, play]);

  /* recado para quem abre o console */
  useEffect(() => {
    console.log(
      `%c GABRIEL.SYS \n\n Se você chegou até aqui, a gente já tem assunto.\n Aperte \` em qualquer página para abrir o terminal.\n\n ${site.email}\n`,
      "color:#f0ab3c;font-family:monospace;font-size:12px;line-height:1.6",
    );
  }, []);

  const value = useMemo<PersonalityValue>(
    () => ({ soundOn, toggleSound, play, retroOn, toggleRetro, unlocked, unlock, reducedMotion }),
    [play, reducedMotion, retroOn, soundOn, toggleRetro, toggleSound, unlock, unlocked],
  );

  return (
    <PersonalityContext.Provider value={value}>
      {children}
      {retroOn && <div className="crt-overlay" aria-hidden="true" />}
      <div className="achievement-live" role="status" aria-live="polite">
        {toast && (
          <div className="achievement-toast">
            <span>conquista {toast.count}/{ACHIEVEMENT_TOTAL}</span>
            <strong>{ACHIEVEMENTS[toast.id]}</strong>
          </div>
        )}
      </div>
    </PersonalityContext.Provider>
  );
}

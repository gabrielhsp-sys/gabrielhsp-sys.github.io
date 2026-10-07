"use client";

import { useSyncExternalStore } from "react";

/* O atalho da busca escrito como o teclado da pessoa: ⌘ K no Mac, iPhone e
   iPad, Ctrl K no resto. O HTML estatico sai com "Ctrl K" e a hidratacao corrige
   sem divergencia, porque a leitura entra por useSyncExternalStore. */

const noop = () => () => {};
const isApple = () => {
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? navigator.platform;
  return /mac|iphone|ipad|ipod/i.test(platform);
};

export function SearchShortcut() {
  const apple = useSyncExternalStore(noop, isApple, () => false);
  return <kbd>{apple ? "⌘ K" : "Ctrl K"}</kbd>;
}

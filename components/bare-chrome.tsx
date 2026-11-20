"use client";

import { BrowserChrome } from "@/components/browser-chrome";
import { PreferenceTools } from "@/components/system-chrome";

export function BareChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="c-frame" data-chrome="bare">
      <BrowserChrome />
      <header className="c-header c-header-bare">
        {/* Marca sem link: aqui ela identifica, nao navega. */}
        <span className="c-brand">
          {/* eslint-disable-next-line @next/next/no-img-element -- export estatico, sem otimizador */}
          <img className="c-brand-full" src="/marca/logo-horizontal.png" alt="GABRIEL.SYS" width={328} height={40} />
        </span>
        <div className="c-header-tools">
          <PreferenceTools />
        </div>
      </header>
      {children}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { CheckIcon as Check, CopyIcon as Copy, EnvelopeSimpleIcon as Envelope, GithubLogoIcon as GithubLogo, LinkedinLogoIcon as LinkedinLogo } from "@phosphor-icons/react";
import { usePersonality } from "@/components/personality";
import { site } from "@/lib/site";

/** `selectId`: sem area de transferencia (http, permissao negada, navegador
    antigo), seleciona o texto desse elemento para a pessoa copiar na mao, em
    vez de abrir o programa de e-mail. */
export function CopyEmailButton({ label = "copiar e-mail", selectId }: { label?: string; selectId?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "selected">("idle");
  const timer = useRef(0);
  const { sound } = usePersonality();

  const settle = (next: "copied" | "selected") => {
    setState(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), next === "copied" ? 2200 : 4000);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      settle("copied");
      sound.play("ok");
    } catch {
      const target = selectId ? document.getElementById(selectId) : null;
      if (!target) {
        // Sem permissao de area de transferencia: o mailto resolve do mesmo jeito.
        window.location.href = `mailto:${site.email}`;
        return;
      }
      const range = document.createRange();
      range.selectNodeContents(target);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      settle("selected");
    }
  };

  const text = state === "copied" ? "e-mail copiado" : state === "selected" ? "e-mail selecionado, é só copiar" : label;
  return (
    <>
      <button className="copy-email" type="button" onClick={copy}>
        {/* A chave remonta o icone, para ele entrar com o fade de .copy-email-icon. */}
        <span className="copy-email-icon" key={state === "idle" ? "copy" : "ok"} aria-hidden="true">
          {state === "idle" ? <Copy size={18} aria-hidden="true" /> : <Check size={18} weight="bold" aria-hidden="true" />}
        </span>
        <span>{text}</span>
      </button>
      {/* O aviso fica fora do botao: dentro dele o conteudo e apresentacional
          (ARIA) e o leitor de tela pode nao anunciar a troca do texto. */}
      <span className="sr-only" role="status">{state === "idle" ? "" : text}</span>
    </>
  );
}

/** O e-mail a vista no hero: texto selecionavel com um clique e o botao de
    copiar ao lado, para quem prefere escrever do proprio programa. */
export function HeroEmail() {
  return (
    <p className="hero-email">
      <span className="hero-email-address" id="hero-email">{site.email}</span>
      <CopyEmailButton label="copiar" selectId="hero-email" />
    </p>
  );
}

export function ContactSection() {
  return (
    <section className="contact-section" id="contato" aria-labelledby="contact-heading">
      <div className="contact-copy">
        <h2 id="contact-heading">Quer conversar sobre uma vaga ou um projeto?</h2>
        <p>
          Respondo por e-mail. Se preferir ver código antes, o GitHub tem tudo que é público —
          e cada projeto aqui explica o que resolve antes de mostrar a stack.
        </p>
      </div>
      <div className="contact-actions">
        <a className="contact-primary" href={`mailto:${site.email}`}>
          <Envelope size={20} aria-hidden="true" /> {site.email}
        </a>
        <CopyEmailButton />
        <div className="contact-links">
          <a href={site.github} target="_blank" rel="noreferrer">
            <GithubLogo size={18} aria-hidden="true" /> GitHub
          </a>
          <a href={site.linkedin} target="_blank" rel="noreferrer">
            <LinkedinLogo size={18} aria-hidden="true" /> LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}

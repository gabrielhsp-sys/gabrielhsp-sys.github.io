"use client";

import { useState } from "react";
import { CheckIcon as Check, CopyIcon as Copy, EnvelopeSimpleIcon as Envelope, GithubLogoIcon as GithubLogo, LinkedinLogoIcon as LinkedinLogo } from "@phosphor-icons/react";
import { usePersonality } from "@/components/personality";
import { site } from "@/lib/site";

export function CopyEmailButton({ label = "copiar e-mail" }: { label?: string }) {
  const [copied, setCopied] = useState(false);
  const { sound } = usePersonality();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      sound.play("ok");
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Sem permissao de area de transferencia: o mailto resolve do mesmo jeito.
      window.location.href = `mailto:${site.email}`;
    }
  };

  return (
    <button className="copy-email" type="button" onClick={copy}>
      {copied ? <Check size={18} weight="bold" /> : <Copy size={18} />}
      <span role="status">{copied ? "e-mail copiado" : label}</span>
    </button>
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
          <Envelope size={20} /> {site.email}
        </a>
        <CopyEmailButton />
        <div className="contact-links">
          <a href={site.github} target="_blank" rel="noreferrer">
            <GithubLogo size={18} /> GitHub
          </a>
          <a href={site.linkedin} target="_blank" rel="noreferrer">
            <LinkedinLogo size={18} /> LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}

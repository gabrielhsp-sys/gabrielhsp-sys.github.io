import Link from "next/link";
import { ArrowRightIcon as ArrowRight, WhatsappLogoIcon as WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { whatsappContato } from "@/lib/contato-links";

/* Pecas das paginas de cliente. CTA unico e repetido: "Pedir orcamento"
   (formulario) e, ao lado, o WhatsApp direto para quem prefere conversar. */

export function Ctas({ orcamento = "/orcamento/", whatsapp = whatsappContato, label = "Pedir orçamento" }: { orcamento?: string; whatsapp?: string; label?: string }) {
  return (
    <div className="c-ctas">
      <Link className="c-button" href={orcamento}>
        {label} <ArrowRight size={18} aria-hidden="true" />
      </Link>
      <a className="c-button c-button-ghost" href={whatsapp} target="_blank" rel="noopener">
        <WhatsappLogo size={20} aria-hidden="true" /> Chamar no WhatsApp
      </a>
    </div>
  );
}

export function Demonstracao() {
  return <p className="c-badge" data-kind="demo">Demonstração: exemplo do que posso fazer</p>;
}

export function Steps() {
  return (
    <ol className="c-steps">
      <li><strong>Você me conta o que precisa</strong><span>Pelo formulário de orçamento ou direto no WhatsApp.</span></li>
      <li><strong>Eu respondo em até 24 horas</strong><span>Com o que vou fazer, o prazo e o valor.</span></li>
      <li><strong>Você aprova e me manda o material</strong><span>Fotos, textos e logo, por um link só seu.</span></li>
      <li><strong>Eu entrego e você confere</strong><span>Só vai ao ar depois que você aprovar.</span></li>
    </ol>
  );
}

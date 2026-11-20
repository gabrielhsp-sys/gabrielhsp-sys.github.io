import Link from "next/link";
import {
  ArrowRightIcon as ArrowRight,
  ChatCircleTextIcon as ChatCircleText,
  CheckCircleIcon as CheckCircle,
  ClockIcon as Clock,
  ImageSquareIcon as ImageSquare,
  WhatsappLogoIcon as WhatsappLogo,
} from "@phosphor-icons/react/dist/ssr";
import { Celular, IlustracaoAplicativo, MolduraCaptura } from "@/components/molduras";
import { whatsappContato } from "@/lib/contato-links";
import type { Servico } from "@/lib/servicos";

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

/* Passos numerados e curtos (rodada visual 2026-11-20): o numero vem do <ol>,
   o icone ajuda quem nao le tudo. Cada passo tem ate 14 palavras. */
const passos = [
  { Icone: ChatCircleText, titulo: "Você me conta o que precisa", texto: "No formulário ou no WhatsApp." },
  { Icone: Clock, titulo: "Eu respondo em até 24 horas", texto: "Com o plano, o prazo e o valor." },
  { Icone: ImageSquare, titulo: "Você aprova e manda o material", texto: "Fotos, textos e logo, num link só seu." },
  { Icone: CheckCircle, titulo: "Eu entrego e você confere", texto: "Só vai ao ar depois que você aprovar." },
];

export function Steps() {
  return (
    <ol className="c-steps">
      {passos.map(({ Icone, titulo, texto }) => (
        <li key={titulo}>
          <Icone className="c-step-icon" size={28} aria-hidden="true" />
          <strong>{titulo}</strong>
          <span>{texto}</span>
        </li>
      ))}
    </ol>
  );
}

/** Largura exibida do PRINT (nao do cartao), por moldura: no navegador o print
    ocupa quase a area toda; no celular, so o aparelho. Sem isso o celular de
    100 px baixava a variante de 660. */
export type SizesPorMoldura = { navegador: string; celular: string };

/** Imagem do cartao de um servico: print em moldura ou a ilustracao de aplicativo. */
export function ServicoImagem({ servico, sizes: porMoldura, prioridade = false }: { servico: Servico; sizes: SizesPorMoldura; prioridade?: boolean }) {
  const img = servico.imagem;
  const sizes = img.moldura === "navegador" ? porMoldura.navegador : porMoldura.celular;
  // Toda demo e rotulada (regra de 2026-11-19): os prints dos cartoes de servico
  // sao de demonstracoes; a ilustracao diz que e ilustracao.
  return (
    <div className="c-visual" data-moldura={img.moldura}>
      <span className="c-visual-selo" data-kind={img.moldura === "ilustracao" ? "ilustracao" : "demo"}>
        {img.moldura === "ilustracao" ? "Ilustração" : "Demonstração"}
      </span>
      {img.moldura === "ilustracao" ? (
        <Celular><IlustracaoAplicativo /></Celular>
      ) : (
        <MolduraCaptura moldura={img.moldura} captura={img.captura} sizes={sizes} prioridade={prioridade} />
      )}
    </div>
  );
}

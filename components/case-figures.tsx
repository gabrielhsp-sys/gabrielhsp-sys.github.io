import { Children, isValidElement } from "react";
import { ArrowUpRightIcon as ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

/* Figuras dos estudos de caso, escritas no proprio MDX. O diagrama e texto:
   leitor de tela le, a busca do navegador acha, o modo retro recolore e nada
   envelhece como uma imagem exportada. So entra o que o estudo de caso ja
   afirma, e o trecho de codigo vem do repositorio publico, com link. */

export function Flow({
  caption,
  layout = "row",
  children,
}: {
  caption?: string;
  layout?: "row" | "stack";
  children: React.ReactNode;
}) {
  const steps = Children.toArray(children).filter(isValidElement);
  return (
    <figure className="flow" data-layout={layout} data-steps={steps.length}>
      <ol>{steps}</ol>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

export function Step({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <li>
      <strong>{title}</strong>
      {children && <span>{children}</span>}
    </li>
  );
}

export function Excerpt({
  file,
  href,
  caption,
  children,
}: {
  file: string;
  href?: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="excerpt">
      <div className="excerpt-bar">
        <code>{file}</code>
        {href && (
          <a href={href} target="_blank" rel="noreferrer">
            ver no GitHub <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        )}
      </div>
      <div className="excerpt-body">{children}</div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

export const caseFigures = { Flow, Step, Excerpt };

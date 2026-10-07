// Ancoras dos titulos de secao do estudo de caso. A mesma funcao gera o id do
// <h2> no MDX e o link do indice da pagina, para os dois nunca divergirem.
// Sem imports: os testes leem este arquivo direto no Node.

export const headingId = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Os `## ` do corpo, fora de bloco de codigo.
export function sectionHeadings(body: string) {
  const withoutCode = body.replace(/```[\s\S]*?```/g, "");
  return [...withoutCode.matchAll(/^## (.+)$/gm)].map(([, text]) => {
    const title = text.trim();
    return { title, id: headingId(title) };
  });
}

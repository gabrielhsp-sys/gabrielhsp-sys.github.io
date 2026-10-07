import { site } from "@/lib/site";

/* Dados estruturados (schema.org em JSON-LD): ligam o nome ao site, ao GitHub e
   ao LinkedIn para o buscador. So entra o que `lib/site.ts` ja afirma — nada de
   cargo, empresa ou numero que o site nao sustente. */

const person = {
  "@type": "Person",
  "@id": `${site.url}/#gabriel`,
  name: site.owner,
  url: `${site.url}/`,
  image: `${site.url}/profile.jpg`,
  email: `mailto:${site.email}`,
  description: "Estudante de Ciência da Computação na UNIFAL-MG. Software, automação e interfaces web.",
  affiliation: { "@type": "CollegeOrUniversity", name: "UNIFAL-MG" },
  sameAs: [site.github, site.linkedin],
};

const graphs = {
  home: [
    person,
    { "@type": "WebSite", "@id": `${site.url}/#site`, url: `${site.url}/`, name: site.name, inLanguage: "pt-BR", author: { "@id": person["@id"] } },
  ],
  about: [{ "@type": "ProfilePage", url: `${site.url}/about/`, inLanguage: "pt-BR", mainEntity: person }],
};

export function StructuredData({ page }: { page: keyof typeof graphs }) {
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graphs[page] });
  // O conteudo vem so de constantes do proprio repositorio; o `<` e escapado
  // mesmo assim, para nenhum texto fechar a tag <script> por acidente.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json.replace(/</g, "\\u003c") }} />;
}

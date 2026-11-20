import { ATENDIMENTO, INSTAGRAM_URL, WHATSAPP } from "@/lib/contato";
import { profile, site } from "@/lib/site";

/* Dados estruturados (schema.org em JSON-LD): ligam o nome ao site, ao GitHub e
   ao LinkedIn para o buscador. So entra o que `lib/site.ts` ja afirma — nada de
   cargo, empresa ou numero que o site nao sustente. */

const person = {
  "@type": "Person",
  "@id": `${site.url}/#gabriel`,
  name: site.owner,
  url: `${site.url}/sobre/`,
  image: `${site.url}/profile.jpg`,
  email: `mailto:${site.email}`,
  description: `Estudante de ${profile.course} na ${profile.institution}. Procura: ${profile.seeking}.`,
  affiliation: { "@type": "CollegeOrUniversity", name: profile.institution },
  sameAs: [site.github, site.linkedin],
};

const business = {
  "@type": "ProfessionalService",
  "@id": `${site.url}/#servico`,
  name: site.name,
  url: `${site.url}/`,
  description: site.description,
  telephone: `+${WHATSAPP}`,
  address: { "@type": "PostalAddress", addressLocality: ATENDIMENTO.cidade.split("-")[0], addressRegion: "MG", addressCountry: "BR" },
  areaServed: { "@type": "Country", name: "Brasil" },
  founder: { "@id": person["@id"] },
  sameAs: [INSTAGRAM_URL],
};

const graphs = {
  home: [
    business,
    { "@type": "WebSite", "@id": `${site.url}/#site`, url: `${site.url}/`, name: site.name, inLanguage: "pt-BR", publisher: { "@id": business["@id"] } },
  ],
  sobre: [person, { "@type": "ProfilePage", url: `${site.url}/sobre/`, inLanguage: "pt-BR", mainEntity: { "@id": person["@id"] } }],
};

export function StructuredData({ page }: { page: keyof typeof graphs }) {
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graphs[page] });
  // O conteudo vem so de constantes do proprio repositorio; o `<` e escapado
  // mesmo assim, para nenhum texto fechar a tag <script> por acidente.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json.replace(/</g, "\\u003c") }} />;
}

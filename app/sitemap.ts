import type { MetadataRoute } from "next";
import { getAllContent, getPublicAreas, latestUpdate } from "@/lib/content";
import { servicos } from "@/lib/servicos";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const items = getAllContent();
  const latest = latestUpdate(items);

  // Paginas de cliente e a area do recrutador. Fora: /orcamento/ e /material/
  // (noindex), /para/ e os demos (noindex: negocios ficticios).
  const fixed = [
    "",
    "/servicos/",
    ...servicos.map((s) => `/servicos/${s.slug}/`),
    "/exemplos/",
    "/exemplos/sites/",
    "/exemplos/aplicativos/",
    "/exemplos/bots/",
    "/exemplos/automacoes/",
    "/exemplos/sistemas/",
    "/como-funciona/",
    "/sobre/",
    "/projetos/",
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: latest,
  }));
  const projects = items.map((item) => ({
    url: `${site.url}${item.href}`,
    lastModified: item.updatedAt,
  }));
  const areaPages = getPublicAreas().map((area) => ({
    url: `${site.url}/projetos/area/${area}/`,
    lastModified: latestUpdate(items.filter((item) => item.area === area)),
  }));

  return [...fixed, ...projects, ...areaPages];
}

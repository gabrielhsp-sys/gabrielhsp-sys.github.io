import type { Metadata } from "next";
import { getAllContent, getFeaturedContent } from "@/lib/content";
import { formatPeriod } from "@/lib/period";
import { profile, site } from "@/lib/site";
import { IdentityPicker, type ProtoItem } from "./picker";
import { bancadaFonts, etiquetaFonts, folhaFonts } from "./fonts";

/* PROTOTIPO — tres direcoes de identidade lado a lado, para o Gabriel escolher.
   Nenhuma delas esta aplicada ao site. Rota isolada: fora do menu, da busca e
   do sitemap, sem indexacao e sem o chrome do site (scripts/verify-export.mjs
   confere). Todo texto vem do conteudo real em content/public e lib/site.ts. */
export const metadata: Metadata = {
  title: "Protótipo de identidade",
  description: "Três direções de identidade visual para comparar. Rascunho, não publicado.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

const toProto = (item: ReturnType<typeof getAllContent>[number]): ProtoItem => ({
  id: item.id,
  title: item.title,
  summary: item.summary,
  area: item.area,
  status: item.status,
  period: formatPeriod(item.startedAt, item.endedAt),
  startedAt: item.startedAt,
  tags: item.tags.slice(0, 5),
  href: item.href,
  github: item.github ?? null,
});

export default function IdentityPrototype() {
  const featured = getFeaturedContent().map(toProto);
  const others = getAllContent().filter((item) => !item.featured).map(toProto);
  return (
    <div className={`${bancadaFonts} ${folhaFonts} ${etiquetaFonts}`}>
      <IdentityPicker
        featured={featured}
        others={others}
        facts={{ ...profile, email: site.email, github: site.github, linkedin: site.linkedin }}
      />
    </div>
  );
}

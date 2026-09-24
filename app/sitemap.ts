import type { MetadataRoute } from "next";
import { getAllContent, getPublicAreas, latestUpdate } from "@/lib/content";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const items = getAllContent();
  const latest = latestUpdate(items);

  const fixed = ["", "/archive/", "/about/"].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: latest,
  }));
  const projects = items.map((item) => ({
    url: `${site.url}${item.href}`,
    lastModified: item.updatedAt,
  }));
  const areaPages = getPublicAreas().map((area) => ({
    url: `${site.url}/area/${area}/`,
    lastModified: latestUpdate(items.filter((item) => item.area === area)),
  }));

  return [...fixed, ...projects, ...areaPages];
}

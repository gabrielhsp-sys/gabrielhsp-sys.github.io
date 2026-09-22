import type { MetadataRoute } from "next";
import { getAllContent, getPublicAreas } from "@/lib/content";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const items = getAllContent();
  const latest = items.reduce(
    (newest, item) => (item.updatedAt > newest ? item.updatedAt : newest),
    items[0].updatedAt,
  );

  const fixed = ["", "/archive/", "/about/"].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: latest,
  }));
  const projects = items.map((item) => ({
    url: `${site.url}${item.href}`,
    lastModified: item.updatedAt,
  }));
  const areaPages = getPublicAreas().map((area) => {
    const inArea = items.filter((item) => item.area === area);
    return {
      url: `${site.url}/area/${area}/`,
      lastModified: inArea.reduce(
        (newest, item) => (item.updatedAt > newest ? item.updatedAt : newest),
        inArea[0].updatedAt,
      ),
    };
  });

  return [...fixed, ...projects, ...areaPages];
}

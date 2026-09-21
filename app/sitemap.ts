import type { MetadataRoute } from "next";
import { getAllContent } from "@/lib/content";
import { channels, site } from "@/lib/site";

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
  const channelPages = channels.map((channel) => {
    const inChannel = items.filter((item) => item.channel === channel);
    return {
      url: `${site.url}/channel/${channel.toLowerCase()}/`,
      lastModified: inChannel.length
        ? inChannel.reduce(
            (newest, item) => (item.updatedAt > newest ? item.updatedAt : newest),
            inChannel[0].updatedAt,
          )
        : latest,
    };
  });

  return [...fixed, ...projects, ...channelPages];
}

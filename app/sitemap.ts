import type { MetadataRoute } from "next";
import { getAllContent } from "@/lib/content";
import { channels, site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const fixed = ["", "/archive/", "/projects/", "/about/"].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date("2026-09-15"),
  }));
  const projects = getAllContent().map((item) => ({
    url: `${site.url}${item.href}`,
    lastModified: item.updatedAt,
  }));
  const channelPages = channels.map((channel) => ({
    url: `${site.url}/channel/${channel.toLowerCase()}/`,
    lastModified: new Date("2026-09-15"),
  }));
  return [...fixed, ...projects, ...channelPages];
}

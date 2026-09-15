import { getAllContent } from "@/lib/content";
import { site } from "@/lib/site";

export const dynamic = "force-static";

const escapeXml = (value: string) =>
  value.replace(/[<>&'\"]/g, (char) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;",
  })[char] ?? char);

export function GET() {
  const items = getAllContent();
  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"><channel>
<title>${site.name}</title><link>${site.url}</link><description>${escapeXml(site.description)}</description><language>pt-BR</language>
${items.map((item) => `<item><title>${escapeXml(item.title)}</title><link>${site.url}${item.href}</link><guid>${site.url}${item.href}</guid><pubDate>${item.updatedAt.toUTCString()}</pubDate><description>${escapeXml(item.summary)}</description></item>`).join("\n")}
</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}

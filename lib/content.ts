import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { contentSchema, type ContentItem } from "@/lib/content-schema";
import { comparePeriods } from "@/lib/period";
import { areas } from "@/lib/site";

const contentDirectory = path.join(process.cwd(), "content/public");

function wordsPerMinute(body: string) {
  return Math.max(1, Math.ceil(body.trim().split(/\s+/).length / 220));
}

export function getAllContent(): ContentItem[] {
  const files = fs
    .readdirSync(contentDirectory)
    .filter((file) => /\.mdx?$/.test(file));

  const items = files.map((file) => {
    const source = fs.readFileSync(path.join(contentDirectory, file), "utf8");
    const { data, content } = matter(source);
    const parsed = contentSchema.parse(data);
    const slug = file.replace(/\.mdx?$/, "");

    if (parsed.id !== slug) {
      throw new Error(`Content id "${parsed.id}" must match filename "${slug}".`);
    }

    return {
      ...parsed,
      body: content,
      slug,
      href: `/projects/${slug}/`,
      readingTime: wordsPerMinute(content),
    };
  });

  const ids = new Set(items.map((item) => item.id));
  if (ids.size !== items.length) throw new Error("Content IDs must be unique.");

  for (const item of items) {
    for (const relatedId of item.related) {
      if (!ids.has(relatedId)) {
        throw new Error(`Unknown related id "${relatedId}" in "${item.id}".`);
      }
    }
  }

  // Mais recente = atividade mais recente no projeto, nao a ultima revisao do
  // texto: o que continua no ar vem antes do que ja terminou.
  return items.sort(comparePeriods);
}

export function getContentBySlug(slug: string) {
  return getAllContent().find((item) => item.slug === slug);
}

export function getRelatedContent(item: ContentItem) {
  const items = getAllContent();
  return item.related
    .map((id) => items.find((candidate) => candidate.id === id))
    .filter((candidate): candidate is ContentItem => Boolean(candidate));
}

// Uma area sem registro publico fica fora da interface. Ela continua no
// esquema e volta sozinha assim que receber um registro.
export function getPublicAreas() {
  const items = getAllContent();
  return areas.filter((area) => items.some((item) => item.area === area));
}

// Os estudos de caso da home, na ordem escolhida em featuredRank.
export function getFeaturedContent() {
  return getAllContent()
    .filter((item) => item.featured)
    .sort((a, b) => a.featuredRank - b.featuredRank);
}

// Data da revisao mais recente de um conjunto de registros.
export const latestUpdate = (items: ContentItem[]) =>
  items.reduce((newest, item) => (item.updatedAt > newest ? item.updatedAt : newest), new Date(0));

export const getLatestUpdate = () => latestUpdate(getAllContent());

// Para onde o estudo de caso leva no fim: o proximo destaque na ordem da home,
// ou o proximo registro do arquivo quando o projeto nao e destaque. Da a volta.
export function getNextContent(item: ContentItem) {
  const sequence = item.featured ? getFeaturedContent() : getAllContent().filter((other) => !other.featured);
  if (sequence.length < 2) return undefined;
  const at = sequence.findIndex((other) => other.id === item.id);
  return sequence[(at + 1) % sequence.length];
}

// O que um componente cliente precisa para desenhar uma linha do arquivo.
export type ArchiveItem = Pick<ContentItem, "id" | "title" | "summary" | "href" | "area" | "status" | "startedAt" | "endedAt" | "tags">;

export const toArchiveItem = ({ id, title, summary, href, area, status, startedAt, endedAt, tags }: ContentItem): ArchiveItem => ({
  id, title, summary, href, area, status, startedAt, endedAt, tags,
});

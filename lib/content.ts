import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { contentSchema, type ContentItem } from "@/lib/content-schema";

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

  return items.sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
  );
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

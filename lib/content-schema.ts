import { z } from "zod";
import { areas, statuses, types } from "@/lib/site";

export const contentSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(2),
  summary: z.string().min(20).max(220),
  type: z.enum(types),
  area: z.enum(areas),
  status: z.enum(statuses),
  visibility: z.literal("public"),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  related: z.array(z.string()).default([]),
  github: z.url().optional(),
  featured: z.boolean().default(false),
  // Ordem dos estudos de caso na home. Menor vem primeiro.
  featuredRank: z.number().int().min(1).default(99),
});

export type ContentMeta = z.infer<typeof contentSchema>;
export type ContentItem = ContentMeta & {
  body: string;
  slug: string;
  href: string;
  readingTime: number;
};

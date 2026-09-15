import { z } from "zod";
import { channels, statuses } from "@/lib/site";

export const contentSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(2),
  summary: z.string().min(20).max(220),
  type: z.enum(["project", "log", "note", "reference"]),
  channel: z.enum(channels),
  status: z.enum(statuses),
  visibility: z.literal("public"),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  related: z.array(z.string()).default([]),
  github: z.url().optional(),
  featured: z.boolean().default(false),
});

export type ContentMeta = z.infer<typeof contentSchema>;
export type ContentItem = ContentMeta & {
  body: string;
  slug: string;
  href: string;
  readingTime: number;
};

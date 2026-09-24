import { z } from "zod";
import { PERIOD_POINT, isOrderedPeriod } from "@/lib/period";
import { areas, statuses, types } from "@/lib/site";

// `2025` chega do YAML como numero; o periodo e sempre texto.
const periodPoint = z.coerce.string().regex(PERIOD_POINT, "use YYYY ou YYYY-MM");

export const contentSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(2),
    summary: z.string().min(20).max(220),
    type: z.enum(types),
    area: z.enum(areas),
    status: z.enum(statuses),
    visibility: z.literal("public"),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    // Quando o trabalho aconteceu — nao quando o registro entrou no site.
    startedAt: periodPoint,
    endedAt: periodPoint.optional(),
    tags: z.array(z.string()).default([]),
    related: z.array(z.string()).default([]),
    github: z.url().optional(),
    featured: z.boolean().default(false),
    // Ordem dos estudos de caso na home. Menor vem primeiro.
    featuredRank: z.number().int().min(1).default(99),
  })
  .superRefine((item, context) => {
    const ongoing = item.status === "building" || item.status === "live";
    if (ongoing && item.endedAt) {
      context.addIssue({ code: "custom", path: ["endedAt"], message: "trabalho em curso ou no ar não tem fim" });
    }
    if (!ongoing && !item.endedAt) {
      context.addIssue({ code: "custom", path: ["endedAt"], message: "concluído ou arquivado precisa de fim" });
    }
    if (item.endedAt && !isOrderedPeriod(item.startedAt, item.endedAt)) {
      context.addIssue({ code: "custom", path: ["endedAt"], message: "o fim vem antes do começo" });
    }
  });

export type ContentMeta = z.infer<typeof contentSchema>;
export type ContentItem = ContentMeta & {
  body: string;
  slug: string;
  href: string;
  readingTime: number;
};

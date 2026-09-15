import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const root = process.cwd();
const input = path.join(root, "content/public");
const output = path.join(root, "public/search-index.json");

const entry = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  type: z.string(),
  channel: z.string(),
  status: z.string(),
  visibility: z.literal("public"),
  tags: z.array(z.string()).default([]),
});

const records = fs
  .readdirSync(input)
  .filter((name) => /\.mdx?$/.test(name))
  .map((name) => {
    const raw = fs.readFileSync(path.join(input, name), "utf8");
    const { data, content } = matter(raw);
    const meta = entry.parse(data);
    return {
      ...meta,
      href: `/projects/${name.replace(/\.mdx?$/, "")}/`,
      text: content
        .replace(/[`#>*_\[\]()]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 900),
    };
  });

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(records, null, 2)}\n`);
console.log(`search-index: ${records.length} public records`);

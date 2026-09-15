import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export function verifyContent(root = process.cwd()) {
  const directory = path.join(root, "content/public");
  const files = fs.readdirSync(directory).filter((file) => /\.mdx?$/.test(file));
  const items = files.map((file) => {
    const raw = fs.readFileSync(path.join(directory, file), "utf8");
    const { data } = matter(raw);
    return { file, data };
  });
  const ids = new Set(items.map(({ data }) => data.id));
  const errors = [];

  for (const { file, data } of items) {
    if (data.visibility !== "public") errors.push(`${file}: visibility must be public`);
    if (data.id !== file.replace(/\.mdx?$/, "")) errors.push(`${file}: id must match filename`);
    for (const related of data.related ?? []) {
      if (!ids.has(related)) errors.push(`${file}: missing relation ${related}`);
    }
  }

  return { count: items.length, errors };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const result = verifyContent();
  if (result.errors.length) {
    console.error(result.errors.join("\n"));
    process.exit(1);
  }
  console.log(`content: ${result.count} records verified`);
}

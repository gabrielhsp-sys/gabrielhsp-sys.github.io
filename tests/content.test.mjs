import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { verifyContent } from "../scripts/verify-content.mjs";

test("all deployable content is public and relations resolve", () => {
  const result = verifyContent();
  assert.ok(result.count >= 4, "expected at least four public records");
  assert.deepEqual(result.errors, []);
});

test("dev and build derive the search index and the share card", () => {
  const packagePath = path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

  for (const hook of ["predev", "prebuild"]) {
    assert.match(packageJson.scripts[hook], /generate-search-index\.mjs/);
    assert.match(packageJson.scripts[hook], /generate-og-image\.mjs/);
  }
});

test("derived artefacts stay out of version control", () => {
  const ignored = fs.readFileSync(path.join(process.cwd(), ".gitignore"), "utf8");

  for (const artefact of ["public/search-index.json", "public/og.png"]) {
    assert.ok(ignored.includes(artefact), `${artefact} must be gitignored`);
  }
});

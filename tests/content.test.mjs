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

test("local development generates the derived search index", () => {
  const packagePath = path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

  assert.equal(
    packageJson.scripts.predev,
    "node scripts/generate-search-index.mjs",
  );
});

import assert from "node:assert/strict";
import test from "node:test";
import { verifyContent } from "../scripts/verify-content.mjs";

test("all deployable content is public and relations resolve", () => {
  const result = verifyContent();
  assert.ok(result.count >= 4, "expected at least four public records");
  assert.deepEqual(result.errors, []);
});

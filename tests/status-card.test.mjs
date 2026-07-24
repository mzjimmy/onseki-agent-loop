import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import test from "node:test";

test("status card omits resolved decision text when its pending counter is zero", () => {
  const root = resolve(import.meta.dirname, "..");
  const result = spawnSync("node", ["scripts/status-card.mjs"], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /需要人工决策：0\n/);
  assert.doesNotMatch(result.stdout, /需要人工决策：0（/);
});

#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const checks = [];
const check = (id, passed, detail) => checks.push({ id, result: passed ? "PASS" : "FAIL", detail });
const testRun = spawnSync("npm", ["run", "check"], { cwd: root, encoding: "utf8" });
check("tests", testRun.status === 0, "npm run check");
const cardRun = spawnSync("node", ["scripts/status-card.mjs"], { cwd: root, encoding: "utf8" });
check("resolved-decision-filter", cardRun.status === 0 && /需要人工决策：0\n/.test(cardRun.stdout) && !/需要人工决策：0（/.test(cardRun.stdout), "resolved decisions are not shown as active");
const failed = checks.filter((entry) => entry.result === "FAIL");
process.stdout.write(`${JSON.stringify({ verdict: failed.length ? "FAIL" : "PASS", gap_id: "gap-status-card-resolved-decision", checks }, null, 2)}\n`);
process.exit(failed.length ? 1 : 0);

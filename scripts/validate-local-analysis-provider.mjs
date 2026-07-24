#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const [app, engine] = await Promise.all([
  readFile(resolve(root, "app.js"), "utf8"),
  readFile(resolve(root, "analysis-engine.js"), "utf8")
]);
const checks = [];
const check = (id, passed, detail) => checks.push({ id, result: passed ? "PASS" : "FAIL", detail });
const testRun = spawnSync("npm", ["run", "check"], { cwd: root, encoding: "utf8" });
check("tests", testRun.status === 0, "npm run check");
const localProvider = engine.slice(
  engine.indexOf("export function createLocalAnalysisProvider"),
  engine.indexOf("export function createLoopbackAnalysisProvider")
);
check("local-boundary", localProvider.includes("{ file, duration, reportProgress }") && !localProvider.includes("fetch("), "provider contract is local and has no network client");
check("progress", engine.includes("reportProgress({ progress: .02") && app.includes("state.analysis.progress") && app.includes("progressCopy"), "progress events update visible analysis copy");
check("schema-gate", engine.includes("normalizeAnalysisResult(await provider") && engine.includes('phase: "unavailable"'), "provider output still passes provenance normalization and absent providers are explicit");
const failed = checks.filter((entry) => entry.result === "FAIL");
process.stdout.write(`${JSON.stringify({ verdict: failed.length ? "FAIL" : "PASS", gap_id: "gap-local-analysis-provider", checks }, null, 2)}\n`);
process.exit(failed.length ? 1 : 0);

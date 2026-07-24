#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const [app, engine, html] = await Promise.all([
  readFile(resolve(root, "app.js"), "utf8"),
  readFile(resolve(root, "analysis-engine.js"), "utf8"),
  readFile(resolve(root, "index.html"), "utf8")
]);
const checks = [];
const check = (id, passed, detail) => checks.push({ id, result: passed ? "PASS" : "FAIL", detail });
const testRun = spawnSync("npm", ["run", "check"], { cwd: root, encoding: "utf8" });
check("tests", testRun.status === 0, "npm run check");
check("provider-boundary", engine.includes("analyzeUploadedAudio") && engine.includes('phase: "unavailable"'), "missing providers remain explicit");
check("provenance-schema", engine.includes('payload.source?.kind !== "ai"') && engine.includes("payload.source.confidence") && engine.includes("REQUIRED_SECTION_FIELDS"), "only complete, confidence-bearing AI results normalize");
check("ui-state-machine", app.includes('phase === "analyzed"') && app.includes("正在识别乐器与章节") && app.includes("AI 分析 /"), "import UI has analyzing and analyzed states");
check("duration-and-labels", app.includes("#section-marks") && app.includes("state.duration") && html.includes('id="section-marks"'), "provider data can update timeline labels and scale");
check("no-stem-claim", app.includes("M/S 控制保持禁用") && app.includes("button.disabled = true"), "analysis does not claim separated stems");
check("volume-persistence", app.includes('localStorage.setItem("onseki-volume"'), "master volume persists locally");
const changed = spawnSync("git", ["diff", "--name-only", "38d71a2"], { cwd: root, encoding: "utf8" }).stdout.split(/\r?\n/).filter(Boolean);
const allowed = new Set(["analysis-engine.js", "player-state.mjs", "app.js", "index.html", "package.json", "tests/analysis-engine.test.mjs", "tests/playback-controls.test.mjs", "loop/gaps/gap-analysis-contract.md", "scripts/validate-analysis-contract.mjs", "loop/state.json", "loop/logs/events.jsonl", "loop/verdicts/verdict-analysis-contract-001.json"]);
check("scope", changed.every((file) => allowed.has(file)), changed.every((file) => allowed.has(file)) ? "all changes are declared in Gap scope" : `unexpected changes: ${changed.filter((file) => !allowed.has(file)).join(", ")}`);
const failed = checks.filter((entry) => entry.result === "FAIL");
process.stdout.write(`${JSON.stringify({ verdict: failed.length ? "FAIL" : "PASS", gap_id: "gap-analysis-contract", checks }, null, 2)}\n`);
process.exit(failed.length ? 1 : 0);

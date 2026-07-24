#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const [app, styles] = await Promise.all([
  readFile(resolve(root, "app.js"), "utf8"),
  readFile(resolve(root, "styles.css"), "utf8")
]);
const checks = [];
const check = (id, passed, detail) => checks.push({ id, result: passed ? "PASS" : "FAIL", detail });
const testRun = spawnSync("npm", ["run", "check"], { cwd: root, encoding: "utf8" });
check("tests", testRun.status === 0, "npm run check");
check("immersive-surface", /\.studio-header.*\.stage-title.*\.analysis-panel.*\.transport.*\.daw.*footer\{display:none\}/.test(styles) && /\.band-stage\{height:100vh/.test(styles), "immersion leaves a full-viewport stage surface");
check("keyboard-return", app.includes('e.key === "Escape"') && app.includes('setListeningMode("observe")'), "Escape returns to observation without altering playback state");
check("section-lighting", ["引子", "发展", "展开", "余韵"].every((section) => styles.includes(`html[data-section="${section}"]`)) && styles.includes(".band-stage:before"), "shared section state drives all four stage washes");
check("no-new-runtime", !styles.includes("url(http") && !app.includes("fetch("), "no external assets or network analysis were added");
const failed = checks.filter((entry) => entry.result === "FAIL");
process.stdout.write(`${JSON.stringify({ verdict: failed.length ? "FAIL" : "PASS", gap_id: "gap-immersive-stage", checks }, null, 2)}\n`);
process.exit(failed.length ? 1 : 0);

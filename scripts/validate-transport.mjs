#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const [app, html, evidence] = await Promise.all([
  readFile(resolve(root, "app.js"), "utf8"),
  readFile(resolve(root, "index.html"), "utf8"),
  readFile(resolve(root, "loop/evidence/run-20260724-transport/browser-probe.json"), "utf8")
]);
const checks = [];
const check = (id, passed, detail) => checks.push({ id, result: passed ? "PASS" : "FAIL", detail });
const testRun = spawnSync("npm", ["run", "check"], { cwd: root, encoding: "utf8" });
check("tests", testRun.status === 0, "npm run check");
check("chapter-controls", ["previous-section-btn", "next-section-btn"].every((id) => html.includes(`id=\"${id}\"`)) && app.includes("function seekSection(direction)"), "chapter navigation is wired");
check("speed-and-volume", html.includes('id="playback-rate"') && html.includes('id="volume"') && app.includes("function setSpeed(speed)") && app.includes("function setVolume(volume)"), "transport settings are wired");
check("uploaded-honesty", app.includes("!analysisReady || view.time <= 0") && app.includes("upload.playbackRate = state.speed"), "imports retain transport settings but not invented chapters");
check("browser-probe", evidence.includes('"previous_section_time": 12') && evidence.includes('"next_section_time": 22') && evidence.includes('"visible_speed": "1.5"'), "browser sample agrees with control state");
const failed = checks.filter((check) => check.result === "FAIL");
process.stdout.write(`${JSON.stringify({ verdict: failed.length ? "FAIL" : "PASS", gap_id: "gap-transport-controls", checks }, null, 2)}\n`);
process.exit(failed.length ? 1 : 0);

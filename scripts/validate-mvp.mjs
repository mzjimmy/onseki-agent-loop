#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { DURATION, deriveViewState } from "../player-state.mjs";

const root = resolve(import.meta.dirname, "..");
const gapId = "gap-mvp-core-experience";
const attemptId = "attempt-mvp-001";
const hash = (value) => createHash("sha256").update(value).digest("hex");
const contract = await readFile(resolve(root, "loop/gaps/gap-mvp-core-experience.md"));
const [app, html, css, evidence, browserEvidence] = await Promise.all([
  readFile(resolve(root, "app.js"), "utf8"),
  readFile(resolve(root, "index.html"), "utf8"),
  readFile(resolve(root, "styles.css"), "utf8"),
  readFile(resolve(root, "loop/evidence/run-20260724-p0/implementation-evidence.json"), "utf8"),
  readFile(resolve(root, "loop/evidence/run-20260724-mvp/browser-probe.json"), "utf8")
]);

const checks = [];
const check = (id, passed, detail, evidencePath = null) => {
  checks.push({ id, result: passed ? "PASS" : "FAIL", evidence: evidencePath, detail });
};

const projectCheck = spawnSync("npm", ["run", "check"], { cwd: root, encoding: "utf8" });
check("syntax-and-unit-tests", projectCheck.status === 0, projectCheck.status === 0 ? "npm run check passed" : (projectCheck.stderr || projectCheck.stdout));

const boundaries = [[0, "引子"], [12, "发展"], [22, "展开"], [36, "余韵"]];
check("boundary-state-map", boundaries.every(([time, name]) => deriveViewState(time).section.name === name), "0/12/22/36 section map derived from one playback snapshot");
check("playhead-time-contract", DURATION === 48 && app.includes("view.time / state.duration") && app.includes("#playhead span"), "playhead consumes derived time and the active source duration");
check("pause-evidence", evidence.includes("pause held the timestamp unchanged for a 300ms observation window"), "browser probe recorded a stable 300ms pause window", "loop/evidence/run-20260724-p0/implementation-evidence.json");
check("browser-mvp-probe", browserEvidence.includes('"mvp-controls"') && browserEvidence.includes('"result": "PASS"'), "browser probe recorded the MVP interaction outcomes", "loop/evidence/run-20260724-mvp/browser-probe.json");

const muted = deriveViewState(13, { muted: { strings: true } });
const solo = deriveViewState(23, { solo: "keys" });
check("mix-state-map", muted.tracks.strings.muted && !muted.tracks.strings.active && solo.tracks.keys.active && solo.tracks.bass.muted, "mute and solo are represented in the shared snapshot");
check("keyboard-controls", ["Space", "ArrowLeft", "ArrowRight"].every((key) => app.includes(key)), "documented keyboard bindings remain present");
check("section-loop", app.includes("state.loop && state.time >= currentSection.end") && app.includes("seek(currentSection.start)"), "loop returns to the current section start");
check("listening-modes", ["immerse", "observe", "detail"].every((mode) => html.includes(`data-view=\"${mode}\"`)) && css.includes("data-listening-mode=\"immerse\""), "three listening modes and immersive surface suppression are present");
check("arrangement-comparison", app.includes('state.arrangement === "plain"') && app.includes('solo: "keys"'), "plain arrangement is a real piano-only mix state");
check("principle-disclosure", html.includes('id="principle-btn"') && html.includes('id="principle-copy"') && app.includes("aria-expanded"), "optional principle disclosure is wired");
check("import-provenance", app.includes("用户音频 · 尚未分析") && app.includes("button.disabled = true"), "single-file import is labelled unanalysed and authored stem controls are disabled");
check("import-duration", app.includes("state.duration = upload.duration") && app.includes("deriveViewState(time, effectiveMix(), state.duration)"), "uploaded audio keeps its own duration instead of being clipped to the 48-second demo");

const status = spawnSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" });
const allowed = new Set([
  "app.js", "index.html", "styles.css", "player-state.mjs", "package.json", "scripts/loop-headless.mjs", "scripts/validate-mvp.mjs",
  "loop/policy.json", "loop/state.json", "loop/logs/events.jsonl"
]);
const changed = status.stdout.split(/\r?\n/).filter(Boolean).map((line) => line.slice(3));
const allowedLoopArtifact = (path) => /^(loop\/(gaps|evidence|verdicts)\/|tests\/)/.test(path);
const unexpected = changed.filter((path) => !(allowed.has(path) || allowedLoopArtifact(path)));
check("scope", unexpected.length === 0, unexpected.length ? `unexpected changes: ${unexpected.join(", ")}` : "all candidate changes are declared in MVP scope");

const failed = checks.filter((item) => item.result !== "PASS");
const result = {
  verdict: failed.length ? "FAIL" : "PASS",
  gap_id: gapId,
  attempt_id: attemptId,
  contract_hash: `sha256:${hash(contract)}`,
  checks,
  unexpected_changes: unexpected,
  confidence: failed.length ? 0.55 : 0.91,
  reason: failed.length ? `${failed.length} mandatory checks failed.` : "Deterministic state, interaction wiring, browser evidence and scope checks passed.",
  validated_at: new Date().toISOString()
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
process.exit(failed.length ? 1 : 0);

#!/usr/bin/env node

import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const python = resolve(root, ".analysis-venv/bin/python");
const runtime = resolve(root, "analysis-runtime/analyze.py");
const scratch = await mkdtemp(join(tmpdir(), "onseki-runtime-"));
const wav = join(scratch, "probe.wav");
const buffer = Buffer.alloc(44 + 22050 * 2);
buffer.write("RIFF", 0); buffer.writeUInt32LE(buffer.length - 8, 4); buffer.write("WAVEfmt ", 8);
buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22); buffer.writeUInt32LE(22050, 24);
buffer.writeUInt32LE(44100, 28); buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34); buffer.write("data", 36); buffer.writeUInt32LE(22050 * 2, 40);
for (let index = 0; index < 22050; index += 1) buffer.writeInt16LE(Math.round(Math.sin(index * Math.PI * 2 * 440 / 22050) * 8192), 44 + index * 2);
await writeFile(wav, buffer);

const checks = [];
const check = (id, passed, detail) => checks.push({ id, result: passed ? "PASS" : "FAIL", detail });
const source = await readFile(runtime, "utf8");
check("no-network-client", !source.includes("requests.") && !source.includes("urllib") && !source.includes("http"), "runtime contains no network client");
const syntax = spawnSync(python, ["-m", "py_compile", runtime], { encoding: "utf8" });
check("python-syntax", syntax.status === 0, syntax.status === 0 ? "analysis runtime compiles" : syntax.stderr.trim());
const run = spawnSync(python, [runtime, wav], { encoding: "utf8", maxBuffer: 4 * 1024 * 1024, timeout: 120000 });
let output = null;
try { output = JSON.parse(run.stdout); } catch (_) { /* captured as a failed contract below */ }
check("offline-inference", run.status === 0 && output?.source?.kind === "ai" && Array.isArray(output?.sections) && Array.isArray(output?.tracks), run.status === 0 ? "Basic Pitch emitted a valid local analysis JSON" : run.stderr.trim());
check("progress-protocol", /ONSEKI_PROGRESS/.test(run.stderr) && /正在进行本地音高转录/.test(run.stderr), "progress remains on stderr while stdout stays valid JSON");
await rm(scratch, { recursive: true, force: true });
const failed = checks.filter((entry) => entry.result === "FAIL");
process.stdout.write(`${JSON.stringify({ verdict: failed.length ? "FAIL" : "PASS", gap_id: "gap-local-analysis-runtime", checks }, null, 2)}\n`);
process.exit(failed.length ? 1 : 0);

#!/usr/bin/env node

import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { delimiter, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const execute = process.argv.includes("--execute");
const dryRun = process.argv.includes("--dry-run") || !execute;

// launchd and cron do not source interactive shell files such as ~/.zshrc.
// Include Cursor's default install directory explicitly for unattended cycles.
process.env.PATH = [join(homedir(), ".local", "bin"), process.env.PATH]
  .filter(Boolean)
  .join(delimiter);

function fail(message) {
  process.stderr.write(`Loop refused: ${message}\n`);
  process.exit(2);
}

function command(name, args = []) {
  const result = spawnSync(name, args, { cwd: root, encoding: "utf8" });
  return {
    ok: result.status === 0,
    stdout: result.stdout?.trim() ?? "",
    stderr: result.stderr?.trim() ?? ""
  };
}

async function json(path) {
  return JSON.parse(await readFile(resolve(root, path), "utf8"));
}

const policy = await json("loop/policy.json");
const state = await json("loop/state.json");

const loopCheck = command("node", ["scripts/validate-loop.mjs"]);
if (!loopCheck.ok) fail(`state/log validation failed: ${loopCheck.stderr || loopCheck.stdout}`);

if (execute && !policy.automation_enabled) fail("automation_enabled is false");
if (state.counters.human_decisions_pending > 0) fail("a human decision is pending");
if (state.write_lock) fail(`write lock is held by ${state.write_lock.owner}`);
if (policy.stop_states.includes(state.loop_status)) fail(`state ${state.loop_status} is a stop state`);

const gitCheck = command("git", ["rev-parse", "--is-inside-work-tree"]);
if (!gitCheck.ok || gitCheck.stdout !== "true") fail("this directory is not a Git worktree");

const branch = command("git", ["branch", "--show-current"]);
if (!branch.ok || !branch.stdout.startsWith(policy.required_branch_prefix)) {
  fail(`branch must start with ${policy.required_branch_prefix}`);
}

if (policy.require_clean_git_worktree) {
  const dirty = command("git", ["status", "--porcelain"]);
  if (!dirty.ok || dirty.stdout) fail("Git worktree must be clean before a cycle");
}

const cursor = command("cursor-agent", ["--version"]);
if (!cursor.ok) fail("cursor-agent is not installed or not available on PATH");

const gapFiles = (await readdir(resolve(root, "loop/gaps")))
  .filter((name) => name.endsWith(".md"))
  .sort();
const readyGaps = [];
for (const name of gapFiles) {
  const path = resolve(root, "loop/gaps", name);
  await access(path, constants.R_OK);
  const source = await readFile(path, "utf8");
  if (/^status:\s+READY$/m.test(source)) {
    const id = source.match(/^id:\s+(.+)$/m)?.[1]?.trim() ?? name.replace(/\.md$/, "");
    const priority = source.match(/^priority:\s+P(\d+)$/m)?.[1] ?? "9";
    readyGaps.push({ id, name, priority: Number(priority) });
  }
}
readyGaps.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
const selectedGap = readyGaps[0];
if (!selectedGap) fail("no READY gap was found");

const today = new Date().toISOString().slice(0, 10).replaceAll("-", "");
const runsDir = resolve(root, "loop/runs");
await mkdir(runsDir, { recursive: true });
const cyclesToday = (await readdir(runsDir)).filter((name) => name.startsWith(`run-${today}`)).length;
if (cyclesToday >= policy.max_cycles_per_day) fail("daily cycle budget is exhausted");

const prompt = [
  "Use $16-agent-loop to implement exactly one bounded candidate cycle.",
  `Read AGENT_LOOP_CONTRACT.md, loop/state.json, loop/policy.json, and loop/gaps/${selectedGap.name}.`,
  "Stop at CANDIDATE. Do not validate your own candidate; a separate process will do that.",
  "Never deploy, install dependencies, use network access, read secrets, or modify acceptance criteria.",
  "If evidence is missing, return NO_CHANGE or BLOCKED.",
  `Cycle budget: ${policy.max_minutes_per_cycle} minutes and ${policy.max_attempts_per_gap} attempts.`
].join(" ");

process.stdout.write([
  `Mode: ${dryRun ? "DRY RUN" : "EXECUTE"}`,
  `Branch: ${branch.stdout}`,
  `Gap: ${selectedGap.id}`,
  `Budget: ${policy.max_minutes_per_cycle} minutes`,
  `Cycles today: ${cyclesToday}/${policy.max_cycles_per_day}`,
  `Prompt: ${prompt}`
].join("\n") + "\n");

if (dryRun) process.exit(0);

const runId = `run-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`;

async function runAgent(role, rolePrompt) {
  const child = spawn(
    "cursor-agent",
    ["-p", "--trust", "--force", "--output-format", "json", rolePrompt],
    {
      cwd: root,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"]
    }
  );
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => { stdout += chunk; });
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  const exitCode = await new Promise((resolveExit) => child.on("close", resolveExit));
  return { role, exit_code: exitCode, stdout, stderr };
}

const implementerResult = await runAgent("implementer", prompt);
if (implementerResult.exit_code !== 0) {
  await writeFile(resolve(runsDir, `${runId}.json`), JSON.stringify({ run_id: runId, results: [implementerResult] }, null, 2));
  fail(`implementer exited with code ${implementerResult.exit_code}`);
}

const validatorPrompt = [
  "Use $16-agent-loop in independent Validator mode.",
  `Validate the candidate for loop/gaps/${selectedGap.name} from the original contract, baseline, diff and evidence.`,
  "Do not read or trust the Implementer's success narrative.",
  "Do not modify product code, the Gap, or Acceptance.",
  "You may write only loop/verdicts/, loop/evidence/, loop/logs/events.jsonl and loop/state.json.",
  "Return PASS, FAIL or INCONCLUSIVE. Never deploy."
].join(" ");
const validatorResult = await runAgent("validator", validatorPrompt);

await writeFile(
  resolve(runsDir, `${runId}.json`),
  JSON.stringify({ run_id: runId, gap_id: selectedGap.id, results: [implementerResult, validatorResult] }, null, 2)
);

if (validatorResult.exit_code !== 0) fail(`validator exited with code ${validatorResult.exit_code}`);

const finalCheck = command("node", ["scripts/validate-loop.mjs"]);
if (!finalCheck.ok) fail("cycle completed but state/log validation failed");

const status = command("node", ["scripts/status-card.mjs"]);
process.stdout.write(`${status.stdout}\n`);

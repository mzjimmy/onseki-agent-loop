#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const statePath = resolve(root, "loop/state.json");
const logPath = resolve(root, "loop/logs/events.jsonl");

function parseEvents(source) {
  return source
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`Invalid JSONL at line ${index + 1}: ${error.message}`);
      }
    });
}

function systemStatus(state) {
  const values = Object.values(state.health);
  if (values.includes("FAIL")) return "UNHEALTHY";
  if (values.includes("DEGRADED")) return "DEGRADED";
  if (values.includes("UNKNOWN")) return "PARTIALLY KNOWN";
  return "HEALTHY";
}

function latest(events, type) {
  return [...events].reverse().find((event) => event.event_type === type);
}

const [stateSource, logSource] = await Promise.all([
  readFile(statePath, "utf8"),
  readFile(logPath, "utf8")
]);

const state = JSON.parse(stateSource);
const events = parseEvents(logSource);
const validation = latest(events, "VALIDATION_PASSED");
const decision = latest(events, "HUMAN_DECISION_REQUESTED");
const rejected = latest(events, "VALIDATION_FAILED");

const card = [
  `系统状态：${systemStatus(state)} / Loop ${state.loop_status}`,
  `可信状态变化：${validation?.summary ?? "暂无已验证变更"}`,
  `需要人工决策：${state.counters.human_decisions_pending}${decision ? `（${decision.summary}）` : ""}`,
  `失败但有价值的结论：${rejected?.summary ?? "暂无"}`,
  `下一项候选动作：${state.active_gap_id ?? "领取 gap-section-sync 并建立基线"}`
];

process.stdout.write(`${card.join("\n")}\n`);

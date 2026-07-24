#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const allowedLoopStates = new Set([
  "IDLE",
  "SCOPING",
  "BASELINING",
  "IMPLEMENTING",
  "VALIDATING",
  "WAITING_HUMAN",
  "BLOCKED",
  "ROLLING_BACK",
  "COMPLETE"
]);
const allowedHealth = new Set(["PASS", "FAIL", "DEGRADED", "UNKNOWN", "NOT_APPLICABLE"]);
const allowedEvents = new Set([
  "RUN_STARTED",
  "BASELINE_CAPTURED",
  "GAP_CREATED",
  "GAP_CLAIMED",
  "HYPOTHESIS_PROPOSED",
  "CHANGE_APPLIED",
  "CHECK_EXECUTED",
  "VALIDATION_REQUESTED",
  "VALIDATION_PASSED",
  "VALIDATION_FAILED",
  "HUMAN_DECISION_REQUESTED",
  "ROLLBACK_COMPLETED",
  "STATE_TRANSITION",
  "RUN_FINISHED"
]);

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function isDateTime(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function validateState(state) {
  invariant(state.schema_version === "0.1", "state.schema_version must be 0.1");
  invariant(state.project === "onseki", "state.project must be onseki");
  invariant(allowedLoopStates.has(state.loop_status), `invalid loop_status: ${state.loop_status}`);
  invariant(isDateTime(state.updated_at), "state.updated_at must be an ISO date-time");
  invariant(state.health && typeof state.health === "object", "state.health is required");
  for (const [key, value] of Object.entries(state.health)) {
    invariant(allowedHealth.has(value), `invalid health value for ${key}: ${value}`);
  }
  for (const key of ["verified_transitions", "rejected_hypotheses", "human_decisions_pending"]) {
    invariant(Number.isInteger(state.counters?.[key]) && state.counters[key] >= 0, `invalid counter: ${key}`);
  }
  if (state.write_lock) {
    invariant(typeof state.write_lock.owner === "string", "write_lock.owner is required");
    invariant(isDateTime(state.write_lock.acquired_at), "write_lock.acquired_at must be a date-time");
    invariant(isDateTime(state.write_lock.expires_at), "write_lock.expires_at must be a date-time");
    invariant(Date.parse(state.write_lock.expires_at) > Date.parse(state.write_lock.acquired_at), "write lock must expire after acquisition");
  }
}

function validateEvent(event, line) {
  const prefix = `events.jsonl line ${line}`;
  invariant(/^evt-/.test(event.event_id), `${prefix}: invalid event_id`);
  invariant(/^run-/.test(event.run_id), `${prefix}: invalid run_id`);
  invariant(isDateTime(event.timestamp), `${prefix}: invalid timestamp`);
  invariant(allowedEvents.has(event.event_type), `${prefix}: invalid event_type ${event.event_type}`);
  invariant(typeof event.summary === "string" && event.summary.length > 0 && event.summary.length <= 280, `${prefix}: invalid summary`);
  invariant(typeof event.confidence === "number" && event.confidence >= 0 && event.confidence <= 1, `${prefix}: invalid confidence`);
  invariant(typeof event.needs_human === "boolean", `${prefix}: needs_human must be boolean`);
  invariant(Array.isArray(event.evidence), `${prefix}: evidence must be an array`);
}

const [stateText, eventsText, policyText] = await Promise.all([
  readFile(resolve(root, "loop/state.json"), "utf8"),
  readFile(resolve(root, "loop/logs/events.jsonl"), "utf8"),
  readFile(resolve(root, "loop/policy.json"), "utf8")
]);

const state = JSON.parse(stateText);
const policy = JSON.parse(policyText);
const events = eventsText.split(/\r?\n/).filter(Boolean).map((line, index) => {
  try {
    return JSON.parse(line);
  } catch (error) {
    throw new Error(`events.jsonl line ${index + 1}: ${error.message}`);
  }
});

validateState(state);
events.forEach((event, index) => validateEvent(event, index + 1));
invariant(policy.schema_version === "0.1", "policy.schema_version must be 0.1");
invariant(typeof policy.automation_enabled === "boolean", "policy.automation_enabled must be boolean");
invariant(Number.isInteger(policy.max_cycles_per_day) && policy.max_cycles_per_day > 0, "policy.max_cycles_per_day must be positive");
invariant(Number.isInteger(policy.max_attempts_per_gap) && policy.max_attempts_per_gap > 0, "policy.max_attempts_per_gap must be positive");
invariant(Number.isInteger(policy.max_minutes_per_cycle) && policy.max_minutes_per_cycle > 0, "policy.max_minutes_per_cycle must be positive");
invariant(policy.required_branch_prefix && !["main", "master"].includes(policy.required_branch_prefix), "policy requires an isolated branch prefix");
invariant(policy.allow_deploy === false, "unattended deployment must remain disabled");
invariant(policy.allow_secrets === false, "unattended secret access must remain disabled");
invariant(policy.allow_destructive_commands === false, "unattended destructive commands must remain disabled");

const lastEvent = events.at(-1);
invariant(lastEvent, "events.jsonl must contain at least one event");
invariant(
  lastEvent.to_state === state.loop_status,
  `state/log mismatch: state is ${state.loop_status}, last event ends at ${lastEvent.to_state}`
);

process.stdout.write(`Loop validation: PASS (${events.length} events, state ${state.loop_status})\n`);

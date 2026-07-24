---
name: 16-agent-loop
description: Run evidence-gated development loops for ONSEKI. Use when selecting a READY gap, establishing a baseline, implementing a bounded candidate, requesting independent validation, producing a compact status card, or operating the project unattended through Cursor CLI. Also use when a user says loop, autonomous iteration, unattended development, self-evolution, gap execution, orchestrator, validator, or status transition.
---

# ONSEKI Agent Loop

Treat `AGENT_LOOP_CONTRACT.md` as the policy source and `loop/state.json` as the current fact source. Never copy their full contents into another file.

## Choose an operation

- **Inspect only**: read the Contract, state, policy and READY gaps; return `NO_CHANGE`, `BLOCKED`, or one executable Gap.
- **Run one cycle**: claim one Gap, capture baseline, form one falsifiable hypothesis, make a bounded candidate and stop at `CANDIDATE`.
- **Validate**: start a fresh read-only validation context and return only `PASS`, `FAIL`, or `INCONCLUSIVE`.
- **Report**: run `node scripts/validate-loop.mjs` and `node scripts/status-card.mjs`.
- **Unattended**: read `docs/unattended-loop-runbook.md`, check all safety prerequisites, and execute no more than the policy budget.

## Required workflow

1. Read `AGENT_LOOP_CONTRACT.md`.
2. Read `loop/state.json` and `loop/policy.json`.
3. Reject execution when automation is disabled, a human decision is pending, a write lock exists, the branch is unsafe, or no Gap is `READY`.
4. Read exactly one Gap from `loop/gaps/`.
5. Confirm Goal, Fact, Gap, Acceptance, scope, rollback and budget.
6. Capture a baseline before editing.
7. Restrict edits to the Gap allowlist.
8. Save compact evidence under `loop/evidence/<run_id>/`.
9. Ask a fresh Validator context to evaluate the original Contract and evidence.
10. Update state and append logs only after the verdict.
11. Never deploy automatically.

## Dispatch existing Cursor roles

Use existing `.cursor/agents` only as bounded specialists:

- interaction behavior → `interaction-designer`
- component state → `component-state-designer`
- motion semantics → `motion-director`
- usability evidence → `usability-auditor`
- consistency evidence → `consistency-editor`
- implementation handoff → `handoff-producer`

Their output is candidate evidence. None may mark a Gap `VERIFIED`.

## Stop conditions

Stop without further Token use when:

- the Goal or Acceptance is ambiguous;
- evidence is missing or contradictory;
- the same Gap has reached its attempt limit;
- no new evidence was produced;
- product direction, production access, publishing, secrets or copyrighted assets require a decision;
- Validator returns `INCONCLUSIVE`;
- state/log validation fails.

Use `WAITING_HUMAN` for a real decision and `NO_CHANGE` when nothing trustworthy changed.

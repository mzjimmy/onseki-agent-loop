# Scope one ONSEKI Loop cycle

Use `$16-agent-loop` in inspect-only mode.

1. Read `AGENT_LOOP_CONTRACT.md`, `loop/state.json` and `loop/policy.json`.
2. Inspect READY gaps without editing product code.
3. Check Goal, evidence requirements, acceptance, budget and human gates.
4. Return exactly one of:
   - one executable Gap with a falsifiable hypothesis;
   - `NO_CHANGE`;
   - `BLOCKED` with the missing prerequisite.
5. Do not acquire a write lock and do not modify files.

# Loop Orchestrator

## Role

Select and coordinate one evidence-backed state transition. Do not act as final judge.

## Primary Skill

- `16-agent-loop`

## Inputs

- `AGENT_LOOP_CONTRACT.md`
- `loop/state.json`
- `loop/policy.json`
- one `loop/gaps/*.md`
- recent related events

## Outputs

- one bounded candidate or a justified stop state;
- evidence index;
- validation request;
- compact status-card inputs.

## Hard limits

- one Gap per cycle;
- no Acceptance edits;
- no production deployment;
- no self-verification;
- stop on ambiguity, exhausted budget or missing evidence.

Follow `loop/prompts/orchestrator.md` for the machine-readable response contract.

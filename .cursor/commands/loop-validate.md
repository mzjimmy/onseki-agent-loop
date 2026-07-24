# Independently validate one ONSEKI candidate

Use `$16-agent-loop` in Validator mode.

1. Start from the original Gap Contract, its hash, baseline, candidate and evidence.
2. Do not use the Implementer's success narrative as evidence.
3. Do not modify product files or acceptance criteria.
4. Reproduce every mandatory check.
5. Write a verdict conforming to `loop/schemas/verdict.schema.json`.
6. Return only PASS, FAIL or INCONCLUSIVE.
7. Only PASS may transition the Gap to VERIFIED.

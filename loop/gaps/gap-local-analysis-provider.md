# gap-local-analysis-provider

```yaml
id: gap-local-analysis-provider
status: VERIFIED
goal_id: goal-realtime-arrangement-map
priority: P0
risk: low
owner: null
attempt_limit: 2
time_budget_minutes: 30
```

## Goal

Turn the confirmed local-first analysis policy into a provider boundary that can
run entirely in the browser or a self-hosted local worker, with user-visible
progress and no network fallback.

## Fact

The prior P0 contract safely normalized final results but offered no explicit
local provider protocol or progress events to a future on-device analyzer.

## Hypothesis

If providers receive `{ file, duration, reportProgress }`, and all progress
labels and final data pass through a single local adapter, then Basic Pitch and
other local components can be introduced later without changing player UI or
silently uploading the source audio.

## Scope

`analysis-engine.js`, `app.js`, direct analysis tests, this Gap, its validator,
and Loop state/log/verdict records. No network calls, dependencies, model
weights, external audio, or deployment.

## Acceptance

1. A local provider receives a `File`/`Blob`, source duration, and safe progress
   reporter; no `fetch` or network client is introduced.
2. Provider progress is visible as a labelled percentage while audio continues
   to be playable.
3. Final output is still normalized by the existing provenance and schema gate.
4. Missing local provider remains `unavailable`, not a simulated result.
5. `npm run check`, the Gap validator, and Loop validation pass.

## Baseline

- User confirmed the local-first policy in `docs/analysis-provider-decision.md`.
- The previous analysis-contract Gap already rejects unlabelled or partial data.

## Rollback

Restore scoped product files; retain decision, test, and verdict evidence.

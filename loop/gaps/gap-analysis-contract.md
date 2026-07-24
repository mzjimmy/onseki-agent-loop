# gap-analysis-contract

```yaml
id: gap-analysis-contract
status: VERIFIED
goal_id: goal-realtime-arrangement-map
priority: P0
risk: medium
owner: null
attempt_limit: 2
time_budget_minutes: 45
```

## Goal

Let an imported audio file move through an explicit `analyzing → analyzed` or
truthful unavailable/failed state, while keeping unverified model output out of
the arrangement UI.

## Fact

Imported audio currently plays safely as `未分析`, but the static demo has no
provider boundary for a real analysis service and no schema that requires model
provenance and confidence before results can be rendered.

## Hypothesis

If a provider result is normalized before the player consumes it, and only a
complete result carrying `AI 分析` provenance plus a 0–100% confidence reaches
the shared playback view, then future Basic Pitch, chord, and section services
can replace the demo data without teaching the UI to fabricate a conclusion.

## Scope

Allowed files: `analysis-engine.js`, `player-state.mjs`, `app.js`, `index.html`,
`package.json`, direct tests, this Gap, its validator, and Loop evidence/verdict/
state/log records. No network calls, service credentials, dependency installs,
audio uploads to a third party, stem separation, deployment, or external assets.

## Acceptance

1. A missing provider ends in an explicit unavailable state and does not show
   invented sections, instruments, chords, or stems.
2. A provider result must carry `source.kind: "ai"`, a 0–1 confidence, complete
   contiguous sections, and valid track clips before it is rendered.
3. Valid results use the existing `sections[]` / `tracks[]` shape, update the
   timeline duration and labels, and display `AI 分析 / NN%` provenance.
4. Imported audio remains playable throughout; M/S stays disabled because this
   Gap does not include source separation.
5. Master volume persists in `localStorage`.
6. `npm run check`, this Gap validator, and Loop validation pass.
7. No changes outside Scope are present.

## Baseline

- Verified version: `38d71a2`.
- `npm run check`, MVP validation, and transport validation passed before this
  Gap.

## Rollback

Restore only the files in Scope to `38d71a2`, retaining evidence and verdicts.

## Human decision gate

Before connecting a real provider, a human must approve the analysis service,
audio-retention policy, cost/latency budget, and whether any audio leaves the
device. The static demo must not call a network service by itself.

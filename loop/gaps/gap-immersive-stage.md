# gap-immersive-stage

```yaml
id: gap-immersive-stage
status: VERIFIED
goal_id: goal-realtime-arrangement-map
priority: P1
risk: low
owner: null
attempt_limit: 2
time_budget_minutes: 30
```

## Goal

Make `沉浸` a genuinely low-information listening state: stage and conductor
cue only, with the stage light changing with the same section state as playback.

## Fact

The first MVP hid the analysis panel and DAW in immersion but retained the
header, work title, transport, and footer. It therefore still looked like a
compressed observation workspace rather than a deliberate listening surface.

## Hypothesis

If immersion removes surrounding interface chrome and maps the shared section
name to CSS stage-wash variables, a listener receives a clear visual change at
each musical boundary without adding explanatory text or a separate clock.

## Scope

`app.js`, `styles.css`, direct immersion test, this Gap, its validator, and
Loop evidence/verdict/state/log records. No new assets, libraries, audio data,
analysis claims, or visual rebrand.

## Acceptance

1. In `沉浸`, only the stage and conductor note remain visible; header, title,
   analysis panel, transport, DAW, and footer are suppressed.
2. The stage fills the viewport and has a keyboard-only `Escape` return to
   `观察`; listening state is not reset.
3. `引子`、`发展`、`展开`、`余韵` each drive a distinct CSS stage wash from the
   existing document section state.
4. Normal `观察` and `拆解` views retain their current UI and behavior.
5. `npm run check`, this Gap validator, and Loop validation pass.

## Baseline

- Verified MVP with existing three listening modes.
- The review request explicitly specifies an immersive stage plus conductor
  note and segment-colour lighting.

## Rollback

Restore scoped product files to the prior verified candidate, retaining the
Gap evidence and verdict.

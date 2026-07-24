# gap-transport-controls

```yaml
id: gap-transport-controls
status: VERIFIED
goal_id: goal-realtime-arrangement-map
priority: P1
risk: low
owner: validator
attempt_limit: 1
time_budget_minutes: 30
```

## Goal

Complete the first-version transport contract without changing the listening-room
information architecture.

## Fact

The MVP had seek-by-five-seconds and current-section looping, but lacked explicit
previous/next chapter controls, playback-rate control, and a master volume control.

## Hypothesis

If chapter, speed, and volume values are part of the same playback state used by
both the authored synthesised demo and imported audio, the basic player controls
remain truthful and reproducible.

## Scope

`index.html`, `styles.css`, `app.js`, direct tests, and loop evidence/verdict/state
records. No external assets, dependencies, analysis claims, or deployment.

## Acceptance

1. Previous/next chapter produces 12 s and 22 s transitions from a 12.5 s sample.
2. 0.75×, 1×, 1.25×, and 1.5× playback rates and a 0–1 volume input are exposed.
3. State and visible controls agree after programmatic changes.
4. Imported audio retains speed and volume control but chapter controls are disabled.
5. `npm run check`, transport validation, and Loop validation pass.

## Baseline

- Verified version: `7d99d41`.
- No chapter/rate/volume controls were present.

## Rollback

Restore the scoped product files to `7d99d41`; preserve evidence and verdicts.

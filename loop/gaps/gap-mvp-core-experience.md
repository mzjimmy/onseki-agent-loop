# gap-mvp-core-experience

```yaml
id: gap-mvp-core-experience
status: VALIDATING
goal_id: goal-realtime-arrangement-map
priority: P0
risk: medium
owner: validator
attempt_limit: 3
time_budget_minutes: 45
```

## Goal

Deliver the first usable ONSEKI listening MVP: a user can play the authored demo,
observe a synchronized arrangement map, compare a sparse and full arrangement,
choose an information density, and understand precisely what is authored data
versus unavailable analysis.

## Fact

The original demo had synchronized visual regions but no pure state contract or
reproducible behavioral evidence. It also treated imported single-file audio too
similarly to authored arrangement data.

## Hypothesis

If playback state is derived once and every UI surface consumes that snapshot,
then section boundaries and mix controls are reproducible. If authored and
unanalysed modes state their provenance in the UI, users will not mistake a
single uploaded file for recovered stems.

## Scope

Allowed files:

- `app.js`, `index.html`, `styles.css`, `player-state.mjs`, `package.json`;
- `tests/section-sync.test.mjs`;
- `scripts/loop-headless.mjs` only to make the already installed Cursor CLI
  usable by unattended runs;
- `loop/evidence/`, `loop/verdicts/`, `loop/logs/events.jsonl`, `loop/state.json`.

No network music analysis, new product dependencies, deployment, external assets,
or changes to the bundled audio assets are allowed.

## Acceptance

1. `npm run check` passes.
2. At 0.000s, 12.000s, 22.000s, and 36.000s, the section label, derived state,
   playhead, active track row, and musician state agree.
3. The playback clock and playhead differ by no more than 100ms in the authored
   demo; pause remains stable in a 250ms observation window.
4. Demo mute and solo update both the track row and matching musician in the
   same render update.
5. `Space`, `ArrowLeft`, and `ArrowRight` retain their documented behavior.
6. Current-section loop returns to the beginning of the current section rather
   than the beginning of the whole song.
7. `沉浸`, `观察`, and `拆解` views preserve the same playback state; `沉浸`
   hides the analysis and DAW surfaces.
8. `完整编排` / `普通编排` performs a real demo mix comparison: the latter keeps
   only the piano audible and marks the other three roles muted.
9. `了解原理` expands the current section's optional explanation without
   replacing the short observation.
10. A user-imported single audio file visibly states that it is unanalysed and
    disables authored stem controls; it must not claim detected instruments,
    chords, or stems.
11. No changes outside Scope are present.

## Baseline

- Baseline commit: `0b35f72`.
- Existing Loop skeleton: `player_sync=UNKNOWN`, `mix_controls=UNKNOWN`.
- Candidate evidence: `loop/evidence/run-20260724-p0/implementation-evidence.json`.

## Rollback

Revert the allowed product files to `0b35f72`; retain evidence and verdicts.

## Human decision gate

Stop for a human only if real uploaded-audio analysis, external music assets,
voice narration, or a new visual language is proposed.

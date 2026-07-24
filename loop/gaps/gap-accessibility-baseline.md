# gap-accessibility-baseline

```yaml
id: gap-accessibility-baseline
status: VERIFIED
goal_id: goal-realtime-arrangement-map
priority: P1
risk: low
owner: null
attempt_limit: 2
time_budget_minutes: 30
```

## Goal

Make the verified MVP usable with keyboard navigation and understandable without
colour alone, without changing the information architecture or visual language.

## Fact

The demo has native buttons and keyboard shortcuts, but it has no declared focus
ring contract, no live announcement for playback/section changes, and no
automated evidence covering these baseline requirements.

## Hypothesis

If actionable elements expose a visible focus state and the player exposes a
small `aria-live` status with text-based track state, then keyboard-only users
can operate the core listening loop without relying on track colour.

## Scope

Allowed files: `index.html`, `styles.css`, `app.js`, direct test files,
`loop/evidence/`, `loop/verdicts/`, `loop/logs/events.jsonl`, and
`loop/state.json`. No dependency installs, no external assets, no product-copy
rewrite, and no changes to Gap acceptance.

## Acceptance

1. `npm run check` passes.
2. Every native button has a visible `:focus-visible` state that is distinguishable
   from the resting state.
3. The player has an `aria-live="polite"` status that states playback/paused and
   the current section in text.
4. Every track row exposes a text `data-state` of `active`, `rest`, or `muted`;
   muted state is not communicated by opacity alone.
5. `Space`, `ArrowLeft`, and `ArrowRight` still work and do not trigger while a
   range input has focus.
6. `prefers-reduced-motion: reduce` continues to disable non-essential animation.
7. No changes outside Scope are present.

## Baseline

- Verified version: `208fb02`.
- MVP validator: `npm run validate:mvp`.

## Rollback

Restore only the allowed files to `208fb02`, retaining any evidence and verdict.

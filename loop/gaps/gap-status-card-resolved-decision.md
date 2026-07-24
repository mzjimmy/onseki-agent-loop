# gap-status-card-resolved-decision

```yaml
id: gap-status-card-resolved-decision
status: VERIFIED
goal_id: goal-realtime-arrangement-map
priority: P1
risk: low
owner: null
attempt_limit: 1
time_budget_minutes: 15
```

## Goal

Keep the compressed Loop status card truthful after a human decision has been
resolved.

## Fact

When `human_decisions_pending` is `0`, `status-card.mjs` still appends the
summary of the last historical `HUMAN_DECISION_REQUESTED` event. This makes the
card contradict the state counter.

## Hypothesis

If historical decision text is displayed only while the authoritative pending
counter is positive, the card distinguishes current action from resolved audit
history without changing either data source.

## Scope

`scripts/status-card.mjs`, its direct test, this Gap, validator, and Loop
records. No product code, event history rewrite, state schema, or policy change.

## Acceptance

1. A state with `human_decisions_pending: 0` renders exactly `需要人工决策：0`
   with no parenthesized historical request.
2. Positive counters preserve the latest decision context.
3. `npm run check`, Gap validation, and Loop validation pass.

## Rollback

Restore only the scoped status-card files; existing events and state stay intact.

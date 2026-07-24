# gap-local-analysis-runtime

```yaml
id: gap-local-analysis-runtime
status: VERIFIED
goal_id: goal-realtime-arrangement-map
priority: P0
risk: medium
owner: validator
attempt_limit: 2
time_budget_minutes: 45
```

## Goal

Run Basic Pitch, chord estimation, and structural segmentation locally, then
return only the existing ONSEKI analysis JSON to the browser through a loopback
endpoint.

## Fact

The validated provider contract had no executable inference runtime. The
confirmed policy forbids default cloud upload and raw-audio retention.

## Hypothesis

If a Python 3.11 runtime uses Basic Pitch plus local audio features behind a
server bound only to `127.0.0.1`, then imported audio can reach the analyzed
state without leaving the device. Instrument identity must remain unknown until
a separate classifier has evidence.

## Scope

`analysis-runtime/`, `analysis-engine.js`, `app.js`, direct tests and runtime
validator, package/README/.gitignore, this Gap, and Loop records. No cloud
endpoint, persistent audio cache, third-party upload, stem claim, or deployment.

## Acceptance

1. Basic Pitch runs in an isolated Python 3.11 environment on a generated local
   WAV, with stdout containing only valid analysis JSON and stderr carrying
   progress messages.
2. The HTTP server binds exclusively to `127.0.0.1`, serves `/api/health`, and
   deletes the temporary audio file after each request.
3. The frontend only activates the loopback provider when served by that local
   server; public/static use remains unavailable rather than uploading audio.
4. Browser end-to-end evidence shows `analyzing → analyzed`, source confidence,
   a section, and a non-stem track with M/S disabled.
5. No detected instrument identity is claimed; the result explicitly reports
   that instrument classification is not integrated.
6. `npm run check`, `npm run validate:runtime`, and Loop validation pass.

## Baseline

- User confirmed the local-first, no-retention policy.
- P0-A provider interface and progress state passed independently.

## Rollback

Remove only the scoped local runtime and provider changes; preserve evidence and
decision records. No user audio is retained by this Gap.

# Run one bounded ONSEKI Loop cycle

Use `$16-agent-loop`.

1. Validate state and logs.
2. Claim exactly one READY Gap and acquire its write lock.
3. Capture the required baseline.
4. Implement one falsifiable hypothesis within the Gap file allowlist.
5. Run the declared checks and save evidence.
6. Stop at `CANDIDATE`.
7. Do not mark the Gap VERIFIED and do not deploy.
8. If no new evidence exists, release the lock and finish as `NO_CHANGE`.

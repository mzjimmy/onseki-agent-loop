# Show the compact ONSEKI Loop status

Run:

```text
node scripts/validate-loop.mjs
node scripts/status-card.mjs
```

If validation fails, report the mismatch and do not infer a status.  
If it passes, show only the five-line status card unless details are requested.

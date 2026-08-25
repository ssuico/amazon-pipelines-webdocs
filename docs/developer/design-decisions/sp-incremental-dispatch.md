# SP Incremental Dispatch

**Date:** 2026-08-17 · **Status:** Accepted  
Follow-up: dispatch-remaining defaults to incremental (2026-08-19).

## Context

Daily SP Scheduler jobs use per-type `process-all-brands` with `load_last_day`. Catch-up with `load_last_three_days` always requested three Amazon reports even when BigQuery was only one day behind. Ads already had cartesian incremental dispatch; SP did not.

## Decision

1. Add `POST /api/v1/sp/dispatch` — all accounts × all types, staggered, default **incremental** from `MAX(Date)` (3-day empty fallback, 7-day cap, yesterday refresh when current).
2. Snapshot types (`fba_inventory`) keep `load_last_day`.
3. Default `dispatch-remaining` date mode to the same incremental window (matrix selection unchanged).
4. Keep explicit opt-in overrides (`load_last_day`, last-3-days, month, date pair).

## Related pages

- [SP Control Panel](/operations/sp-control-panel)

Original: `amazon-pipelines/design-log/2026-08-17-sp-incremental-dispatch.md`, `2026-08-19-sp-dispatch-remaining-incremental.md`

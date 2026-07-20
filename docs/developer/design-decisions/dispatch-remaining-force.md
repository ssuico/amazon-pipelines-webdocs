# Force Gap-Fill (Remaining Only)

**Last updated:** 2026-07-20

**Date:** 2026-07-18 · **Status:** Accepted  
Supersedes the first force design that also selected Accomplished cells.

## Context

`force=true` on SP/Ads `dispatch-remaining` was meant to bypass worker idempotency for **pending** gaps. Expanding the matrix to Accomplished re-ran completed work in production.

## Decision

1. Keep optional `force` on both `dispatch-remaining` endpoints (default `false`).
2. When `force=true`, matrix selection stays **Remaining only** (+ Failed if `include_failed`).
3. Never enqueue Accomplished or In Progress.
4. Pass `force` in task payloads so workers skip duplicate-recent / recent-COMPLETED guards for those pending cells.

## Related pages

- [SP Control Panel](/operations/sp-control-panel)
- [Ads Control Panel](/operations/ads-control-panel)

Original: `amazon-pipelines/design-log/2026-07-18-dispatch-remaining-force-remaining-only.md`

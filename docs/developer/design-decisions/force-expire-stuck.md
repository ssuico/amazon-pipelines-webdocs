# Force Expire Stuck Reports

**Date:** 2026-08-26 · **Status:** Accepted

## Context

`expire-stuck` only failed in-flight SP and Ads rows older than `stuck_threshold_hours` (default 2, minimum 1). Operators sometimes need to clear every currently stuck row inside the lookback window.

## Decision

1. Add `force=false` to `POST /sp/reports/expire-stuck` and `POST /ads/reports/expire-stuck`.
2. `force=true` skips the age threshold and expires matching in-flight rows inside `lookback_hours` (still required; max 168).
3. `dry_run=true` previews the same set. `retry-failed?expire_stuck=true` stays on the 2-hour threshold.

## Related pages

- [SP Control Panel](/operations/sp-control-panel)
- [Ads Control Panel](/operations/ads-control-panel)

Original: `amazon-pipelines/design-log/2026-08-26-force-expire-stuck-reports.md`

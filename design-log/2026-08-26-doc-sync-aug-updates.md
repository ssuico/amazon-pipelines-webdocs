# Documentation Sync — July 20 through August 24

**Date:** 2026-08-26
**Status:** accepted
**Author:** ai

## Context

Prior accepted sync ended at amazon-pipelines `61efd7c` (2026-07-20). HEAD is now `8063b8b` (2026-08-24). Material changes:

- Conversational Analytics SSE chat over `agg_tables_v2`
- Brand Analytics: date windows, summary, sales-distribution, parent time-series, OE sub-brands, full columns
- Listings Health widgets API
- SP incremental `/sp/dispatch` and incremental defaults for `dispatch-remaining`
- SP `expire-stuck` recovery
- Removal of standalone OE Ads credentials (`OEUS` remains)

## Decision

Incremental VitePress updates only for behavior-impacting surfaces. Stamp `**Last updated:** 2026-08-26` solely on pages whose content changes. Keep VitePress `lastUpdated: false`.

## Consequences

- Brand Analytics page no longer describes the July child time-series contract.
- Ads/credential docs no longer document `OE_ADS_*`.
- SP control panel documents incremental catch-up and stuck-report recovery.
- VitePress config sets `vite.resolve.preserveSymlinks: true` so Windows builds no longer fail on `c:` vs `C:` path mismatch in `resolvePageImports`.

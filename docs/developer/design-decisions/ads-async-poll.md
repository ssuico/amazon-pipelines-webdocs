# Ads Async Poll-and-Reschedule

**Last updated:** 2026-07-20

**Date:** 2026-07-16 · **Status:** Accepted

## Context

Amazon Ads report generation slowed (~10 min → ~22+ min avg), causing Cloud Tasks 1800s deadline overruns, duplicate re-dispatches, and long batch wall times while workers blocked in synchronous poll loops.

## Decision

Default path (`ADS_ASYNC_POLL_ENABLED=true`):

1. **`/ads/worker/process`** — create report(s), write RUNNING status, enqueue first check task, return quickly
2. **`/ads/worker/check-report`** — single-status check; re-enqueue with backoff until complete/timeout/recreate limit; then download + transform + upsert

All job context travels in the **Cloud Tasks payload** (AMC pattern), not BigQuery read-back. Sync path remains behind `ADS_ASYNC_POLL_ENABLED=false`.

Also: stagger dispatch (`ADS_DISPATCH_STAGGER_SECONDS`), skip recent RUNNING (`ADS_RUNNING_SKIP_MINUTES`), route check tasks to the retry queue to avoid starving create work.

## Consequences

- Worker tasks finish in seconds; batch time becomes download/transform-bound
- Fewer deadline overruns and 425/429 amplification loops
- Dead check chains recover via `expire-stuck` + `retry-failed`

## Related pages

- [Ads Pipeline](/pipelines/ads-pipeline)
- [Ads Control Panel](/operations/ads-control-panel)

Original: `amazon-pipelines/design-log/2026-07-16-ads-async-poll-and-reschedule.md`

# FBA Inventory Snapshot Report Refactor

**Date:** 2026-06-10 · **Status:** Accepted

## Context

`GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA` is a **near real-time snapshot** report. Amazon limits near-real-time FBA reports to **once every 30 minutes** per seller. The pipeline previously treated `fba_inventory` like date-bounded reports, requesting one report per calendar day — causing rate-limit skips and unusable backfills.

## Decision

Introduce a **snapshot processing profile** for FBA near-real-time inventory:

1. **Single fetch per pipeline run** — no date-range loop for `fba_inventory`.
2. **Reuse recent DONE reports** — call `getReports` before `createReport`; download the newest completed report if fresh enough.
3. **Respect 30-minute generation cooldown** — skip new `createReport` when inside cooldown; surface `skipped` / `fba_generation_cooldown` in status.
4. **Separate API window vs. BigQuery `Date` stamp** — use **today (UTC)** for SP-API `dataStartTime`/`dataEndTime`; stamp rows with the logical snapshot date (`yesterday` when `load_last_day=true`, else today).
5. **Ignore unsupported backfill flags** (`load_last_three_days`, `year`/`month`, explicit multi-day ranges) with a logged warning; still run one snapshot.

Config: `SP_FBA_NEAR_REALTIME_COOLDOWN_MINUTES` (default 30).

## Operational guidance

| Setting | Recommendation |
|---------|----------------|
| Scheduler | `load_last_day=true` (daily noon job) |
| Backfill flags | Ignored for this report type — do not expect multi-day history |
| Skip status `fba_generation_cooldown` | Normal inside 30-min window; wait or rely on report reuse |
| Skip status `duplicate_recent_report` | Same account + snapshot date already processed |

## Skip / status outcomes

| Status | Reason | Meaning |
|--------|--------|---------|
| `skipped` | `duplicate_recent_report` | Same account + snapshot Date already processed recently |
| `skipped` | `fba_generation_cooldown` | Inside Amazon's 30-min window and no reusable DONE report found |
| `no_data` | empty DataFrame | Report completed but returned zero rows |
| `success` | rows upserted | Snapshot fetched (new or reused) and merged into BigQuery |

## Related pages

- [SP Pipeline](/pipelines/sp-pipeline#fba-inventory-snapshot-mode)
- [SP Report Types](/reference/sp-report-types)
- [Environment Variables](/reference/environment-variables#throttling--sp-api)

Original ADR with flow diagrams: `amazon-pipelines/design-log/2026-06-10-fba-inventory-snapshot-refactor.md`

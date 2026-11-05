# Ads Control Panel

**Last updated:** 2026-11-05

Dispatch, gap-fill, expire-stuck, and retry-failed for an Ads control UI. Parallel to [SP Control Panel](/operations/sp-control-panel).

Control `POST`s use **query parameters** (empty body `{}` if required).

## Quick reference

| Action | Method | Path |
|--------|--------|------|
| List accounts | `GET` | `/api/v1/ads/accounts` |
| Daily coverage matrix | `GET` | `/api/v1/ads-report-status/matrix` |
| Full / filtered dispatch | `POST` | `/api/v1/ads/dispatch` |
| Gap-fill Remaining cells | `POST` | `/api/v1/ads/dispatch-remaining` |
| Expire stuck RUNNING | `POST` | `/api/v1/ads/reports/expire-stuck` |
| Retry FAILED (24h) | `POST` | `/api/v1/ads/reports/retry-failed` |

**Suggested “finish the day” flow:**

1. `GET /ads-report-status/matrix`
2. Optional `POST /ads/dispatch-remaining?dry_run=true`
3. `POST /ads/dispatch-remaining`
4. Recover stuck: `expire-stuck` → `retry-failed` (or `retry-failed?expire_stuck=true`)

## Matrix

```http
GET /api/v1/ads-report-status/matrix?date=2026-07-16&run_status=Remaining
```

Same `run_status` vocabulary as SP (`Accomplished`, `In Progress`, `Failed (Needs Rerun)`, `Remaining`). Account axis = `get_available_ads_accounts()` (not a hardcoded list). Expected cells ≈ account count × 12 report types.

## Gap-fill — `POST /ads/dispatch-remaining`

One Cloud Task per Remaining cell (optionally Failed). Prefer this over full `dispatch` for control-panel gap-fill.

| Param | Default | Description |
|-------|---------|-------------|
| `include_failed` | `false` | Also enqueue Failed cells |
| `force` | `false` | Bypass worker recent-COMPLETED skips for **Remaining** only |
| `dry_run` | `false` | Preview |
| `accounts_filter` / `report_types` | all | Narrow |
| `start_date` / `end_date` | incremental | Optional date override on tasks |

**`force=true`** never enqueues Accomplished / In Progress. RUNNING guards and Amazon Ads HTTP 425 duplicate reuse still apply.

## Dispatch — `POST /ads/dispatch`

Cartesian account × report_type onto `ads-reports-queue`, staggered by `ADS_DISPATCH_STAGGER_SECONDS` (default 15s). Workers skip COMPLETED (last 20h) and RUNNING (last `ADS_RUNNING_SKIP_MINUTES`, default 120).

## Expire stuck / retry failed

| Endpoint | Role |
|----------|------|
| `POST /ads/reports/expire-stuck` | RUNNING older than threshold → FAILED. `force=true` skips the age check inside `lookback_hours`. `dry_run` supported. |
| `POST /ads/reports/retry-failed` | FAILED last 24h → `ads-reports-retry-queue`; optional `expire_stuck=true` |

Do not set `stuck_threshold_hours` below ~2 while async check chains are legitimate (Amazon generation can take 20–45+ minutes).

## Related pages

- [Ads Pipeline](/pipelines/ads-pipeline) — async create-then-check flow
- [SP Control Panel](/operations/sp-control-panel)
- [Failed Reports](/operations/failed-reports)
- [Design Decision: Ads Async Poll](/developer/design-decisions/ads-async-poll)
- [Design Decision: Force Gap-Fill](/developer/design-decisions/dispatch-remaining-force)

# SP Control Panel

**Last updated:** 2026-08-26

Matrix coverage, incremental catch-up, gap-fill, expire-stuck, and batch dispatch for an SP-API control UI. Parallel to [Ads Control Panel](/operations/ads-control-panel).

Control `POST`s use **query parameters** (empty body `{}` if required). Cloud Run is currently `--allow-unauthenticated` — prefer a trusted backend if the UI is public.

## Quick reference

| Action | Method | Path |
|--------|--------|------|
| List accounts | `GET` | `/api/v1/accounts` |
| List report types | `GET` | `/api/v1/report-types` |
| Daily coverage matrix | `GET` | `/api/v1/report-status/matrix` |
| Incremental all brands × types | `POST` | `/api/v1/sp/dispatch` |
| Gap-fill Remaining cells | `POST` | `/api/v1/sp/dispatch-remaining` |
| Expire stuck in-progress | `POST` | `/api/v1/sp/reports/expire-stuck` |
| Full type × all brands | `POST` | `/api/v1/sp/reports/{type}/process-all-brands` |
| All reports for one brand | `POST` | `/api/v1/sp/brands/{account}/process-all-reports` |
| Recent / failed / summary | `GET` | `/api/v1/report-status/*` |

**Suggested “finish the day” flow:**

1. Optional: `POST /sp/reports/expire-stuck?dry_run=true` → `expire-stuck` (clears dead In Progress)
2. `GET /report-status/matrix`
3. Optional `POST /sp/dispatch-remaining?dry_run=true`
4. `POST /sp/dispatch-remaining` — Remaining cells only (default **incremental** dates)
5. Optional `include_failed=true` for Failed cells

**Suggested “incremental catch-up for all brands”:**

1. Optional `POST /sp/dispatch?dry_run=true`
2. `POST /sp/dispatch` — enqueue missing days through yesterday (not fixed last-3-days)

Prefer **dispatch-remaining** for control-panel gap-fill so you do not re-queue Accomplished cells. Prefer **`/sp/dispatch`** for cartesian catch-up across all types.

## Matrix

```http
GET /api/v1/report-status/matrix
GET /api/v1/report-status/matrix?date=2026-07-17&run_status=Remaining
```

| Param | Default | Description |
|-------|---------|-------------|
| `date` | today (America/New_York) | Calendar day |
| `account_name` | all active SP accounts | One account |
| `report_type_key` | all 7 | One report type |
| `run_status` | all | `Accomplished` \| `In Progress` \| `Failed (Needs Rerun)` \| `Remaining` |

Accounts come from `get_available_accounts()` (legacy `default` is **not** listed). Expected cells ≈ account count × 7.

| `run_status` | Meaning |
|--------------|---------|
| Accomplished | ≥1 `DONE` that day |
| In Progress | `REQUESTED` / `IN_QUEUE` / `IN_PROGRESS` (no DONE) |
| Failed (Needs Rerun) | only terminal failure statuses |
| Remaining | no activity that day |

## Incremental dispatch — `POST /sp/dispatch`

Cartesian **all accounts × all report types** onto `sp-reports-queue` (optional `accounts_filter` / `report_types`), staggered by `SP_TASK_START_SPACING_SECONDS`.

Default mode is **incremental** per worker:

- Looks up `MAX(Date)` on `{account}_{table}`
- Fetches missing days through yesterday (`start = min(last_date + 1, yesterday)`)
- Empty / missing table → last 3 days fallback
- Gap capped at **7 days** (Cloud Tasks wait budget)
- Already caught up → refresh yesterday only (one Amazon report)
- Snapshot types (`fba_inventory`) stay `load_last_day`
- Manual `start_date` / `end_date` override incremental mode

## Gap-fill — `POST /sp/dispatch-remaining`

Creates **one Cloud Task per Remaining cell** (sparse — not Cartesian). Matrix selection unchanged.

| Param | Default | Description |
|-------|---------|-------------|
| `date` | today (NY) | Matrix day |
| `include_failed` | `false` | Also enqueue Failed cells |
| `force` | `false` | Bypass worker duplicate-recent skips for **Remaining** only |
| `accounts_filter` / `report_types` | all | Narrow the matrix |
| `dry_run` | `false` | Preview pairs only |
| Date mode | **incremental** | Same window as `/sp/dispatch` unless overridden |
| `load_last_day` / `load_last_three_days` / `year`/`month` / `start_date`+`end_date` | opt-in | Explicit overrides |

**`force=true`** never enqueues Accomplished or In Progress. FBA generation cooldown still applies.

| Goal | Endpoint |
|------|----------|
| Fill today’s Remaining (incremental) | `dispatch-remaining` |
| Remaining + Failed | `dispatch-remaining?include_failed=true` |
| Force pending past duplicate skips | `dispatch-remaining?force=true` |
| All brands × types catch-up | `dispatch` |
| One type for all brands (Scheduler) | `process-all-brands` |

## Expire stuck — `POST /sp/reports/expire-stuck`

Marks `REQUESTED` / `IN_QUEUE` / `IN_PROGRESS` rows older than the threshold as `FAILED` so gap-fill with `include_failed=true` can re-run them.

| Param | Default | Description |
|-------|---------|-------------|
| `stuck_threshold_hours` | `2` | Active rows older than this → FAILED |
| `lookback_hours` | `24` | Scan window |
| `dry_run` | `false` | Preview only |

Recovery: `expire-stuck` → `dispatch-remaining?include_failed=true`.

## Related pages

- [Ads Control Panel](/operations/ads-control-panel)
- [Monitoring](/operations/monitoring)
- [SP Pipeline](/pipelines/sp-pipeline)
- [Design Decision: Force Gap-Fill](/developer/design-decisions/dispatch-remaining-force)
- [Design Decision: SP Incremental Dispatch](/developer/design-decisions/sp-incremental-dispatch)

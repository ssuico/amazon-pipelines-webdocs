# SP Control Panel

**Last updated:** 2026-07-20

Matrix coverage, gap-fill, and batch dispatch endpoints for an SP-API control UI. Parallel to [Ads Control Panel](/operations/ads-control-panel).

Control `POST`s use **query parameters** (empty body `{}` if required). Cloud Run is currently `--allow-unauthenticated` — prefer a trusted backend if the UI is public.

## Quick reference

| Action | Method | Path |
|--------|--------|------|
| List accounts | `GET` | `/api/v1/accounts` |
| List report types | `GET` | `/api/v1/report-types` |
| Daily coverage matrix | `GET` | `/api/v1/report-status/matrix` |
| Gap-fill Remaining cells | `POST` | `/api/v1/sp/dispatch-remaining` |
| Full type × all brands | `POST` | `/api/v1/sp/reports/{type}/process-all-brands` |
| All reports for one brand | `POST` | `/api/v1/sp/brands/{account}/process-all-reports` |
| Recent / failed / summary | `GET` | `/api/v1/report-status/*` |

**Suggested “finish the day” flow:**

1. `GET /report-status/matrix` — expected vs Accomplished
2. Optional `POST /sp/dispatch-remaining?dry_run=true`
3. `POST /sp/dispatch-remaining` — enqueue only Remaining cells
4. Optional `include_failed=true` for Failed cells

Prefer **dispatch-remaining** over `process-all-brands` for control-panel gap-fill so you do not re-queue Accomplished cells.

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

## Gap-fill — `POST /sp/dispatch-remaining`

Creates **one Cloud Task per Remaining cell** (sparse — not Cartesian account × type).

| Param | Default | Description |
|-------|---------|-------------|
| `date` | today (NY) | Matrix day |
| `include_failed` | `false` | Also enqueue Failed cells |
| `force` | `false` | Bypass worker duplicate-recent skips for **Remaining** cells only |
| `accounts_filter` / `report_types` | all | Narrow the matrix |
| `dry_run` | `false` | Preview pairs only |
| `load_last_day` | `true` | Yesterday-only gap-fill |

**`force=true`** does **not** enqueue Accomplished or In Progress. It only changes worker skip behavior for pending Remaining (+ Failed when requested) cells. FBA generation cooldown still applies.

| Goal | Endpoint |
|------|----------|
| Fill today’s Remaining | `dispatch-remaining` |
| Remaining + Failed | `dispatch-remaining?include_failed=true` |
| Force pending past duplicate skips | `dispatch-remaining?force=true` |
| One type for all brands (Scheduler) | `process-all-brands` |

## Related pages

- [Ads Control Panel](/operations/ads-control-panel)
- [Monitoring](/operations/monitoring)
- [SP Pipeline](/pipelines/sp-pipeline)
- [Design Decision: Force Gap-Fill](/developer/design-decisions/dispatch-remaining-force)

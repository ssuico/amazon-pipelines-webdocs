# Monitoring

**Last updated:** 2026-07-20

Diagnostic REST endpoints for monitoring SP-API and Ads pipeline executions. Data is stored in BigQuery status tables.

## Base paths

| Pipeline | Prefix | BigQuery table |
|----------|--------|----------------|
| SP-API | `/api/v1/report-status` | `{BIGQUERY_DATASET}.report_status` |
| Ads API | `/api/v1/ads-report-status` | `{BIGQUERY_ADS_DATASET}.ads_report_status` |

Implementation: `app/routes/report_status.py`, `app/routes/ads_report_status.py`

## Dashboard caching

Aggregate endpoints use in-memory TTL caching (`app/utils/cache.py`):

| Cache | TTL | Cached endpoints |
|-------|-----|------------------|
| `dashboard_cache` | 2 min | `/failed`, `/activity`, `/statistics`, `/summary` |
| `metadata_cache` | 10 min | `/accounts`, `/accounts/{name}` |

**Not cached** (real-time):

- `/recent` — shows live RUNNING/IN_PROGRESS status
- `/health` — connectivity checks

Dashboard data may be up to 2 minutes stale on aggregate views. See [Design Decision: BigQuery Caching](/developer/design-decisions/bigquery-caching).

---

## SP-API endpoints

### GET `/api/v1/report-status/recent`

Recent report executions. Deduplicated by default.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `limit` | 50 | Max records (1–1000) |
| `account_name` | — | Filter by brand |
| `deduplicate` | true | Keep most recent per account/type/date range |

### GET `/api/v1/report-status/failed`

Failed, fatal, or cancelled reports.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `days_back` | 7 | Lookback window (1–30) |
| `account_name` | — | Filter by brand |

```bash
curl "http://localhost:8080/api/v1/report-status/failed?days_back=1&account_name=ArmsReach"
```

### GET `/api/v1/report-status/activity`

Audit trail with full row counts.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `limit` | 100 | Max records |
| `account_name` | — | Filter by brand |
| `status` | — | e.g. `DONE`, `FAILED`, `IN_PROGRESS` |
| `report_type_key` | — | e.g. `orders`, `inventory` |

### GET `/api/v1/report-status/statistics`

Aggregated stats over a time window. Deduplicated by default.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `days_back` | 7 | Lookback window |
| `account_name` | — | Filter by brand |
| `deduplicate` | true | Deduplicate before aggregating |

### GET `/api/v1/report-status/summary`

High-level health summary for dashboards.

### GET `/api/v1/report-status/health`

BigQuery connectivity check for SP tracker.

### GET `/api/v1/report-status/matrix`

Daily account × report-type coverage grid (America/New_York calendar day).

| Parameter | Default | Description |
|-----------|---------|-------------|
| `date` | today (NY) | `YYYY-MM-DD` |
| `account_name` | all | One SP account |
| `report_type_key` | all 7 | One report type |
| `run_status` | all | `Accomplished` \| `In Progress` \| `Failed (Needs Rerun)` \| `Remaining` |

Response includes `expected_cells`, `counts`, and per-cell `records`. Prefer pairing with [SP Control Panel](/operations/sp-control-panel) gap-fill.

### POST `/api/v1/report-status/cleanup-duplicates`

Remove duplicate status rows, keeping most recent per unique report.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `dry_run` | true | Count only; set `false` to delete |

---

## Ads API endpoints

Same surface under `/api/v1/ads-report-status`:

| Endpoint | Description |
|----------|-------------|
| `GET /recent` | Recent Ads task executions |
| `GET /failed` | Failed Ads reports |
| `GET /activity` | Activity audit trail |
| `GET /statistics` | Aggregated stats (single consolidated BQ query) |
| `GET /summary` | Dashboard summary |
| `GET /health` | BQ connectivity check |
| `GET /matrix` | Daily account × report-type coverage (same status vocabulary as SP) |

Ads statuses: `COMPLETED`, `FAILED`, `RUNNING`, `skipped` (idempotency guard).

Control-panel gap-fill: [Ads Control Panel](/operations/ads-control-panel).

---

## Deduplication

A report is unique by: `account_name`, `report_type_key`, `start_date`, `end_date`.

When `deduplicate=true` (default), only the row with the latest `request_timestamp` is returned.

**Query-time deduplication** (recommended): non-destructive, preserves audit history.

**Database cleanup:** use `cleanup-duplicates` when storage cost matters. Always run `dry_run=true` first.

```sql
ROW_NUMBER() OVER (
  PARTITION BY account_name, report_type_key, start_date, end_date
  ORDER BY request_timestamp DESC
) AS row_num
-- keep row_num = 1
```

Ready-made queries: [Dashboard SQL](/operations/dashboard-queries)

## Response format

```json
{
  "success": true,
  "message": "Retrieved N records",
  "data": {
    "records": [],
    "count": 0,
    "filters": {}
  }
}
```

Common SP record fields: `report_request_id`, `account_name`, `report_type_key`, `status`, `start_date`, `end_date`, `rows_fetched`, `rows_upserted`, `error_message`, `duration_seconds`.

## Related pages

- [Failed Reports](/operations/failed-reports)
- [SP Control Panel](/operations/sp-control-panel)
- [Ads Control Panel](/operations/ads-control-panel)
- [Dashboard SQL](/operations/dashboard-queries)
- [SP Status Tracker Internals](/troubleshooting/sp-status-tracker)
- [Operations Runbook](/operations/)

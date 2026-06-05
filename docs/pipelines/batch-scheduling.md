# Batch Scheduling

Batch endpoints for cloud scheduling. Both SP and Ads pipelines use **Cloud Tasks** to fan out work across brands and report types.

## Overview

| Pipeline | Dispatch endpoint | Fan-out unit | Queue |
|----------|-------------------|--------------|-------|
| SP-API | `POST /api/v1/sp/reports/{type}/process-all-brands` | 1 task per brand | `sp-reports-queue` |
| Ads API | `POST /api/v1/ads/dispatch` | 1 task per account × report type | `ads-reports-queue` |

---

## SP-API — report-centric (recommended)

```
POST /api/v1/sp/reports/{report_type_key}/process-all-brands
```

One Cloud Scheduler job per report type. Dispatches Cloud Tasks; workers run asynchronously.

### Report types

`sales_and_traffic`, `inventory`, `listings`, `orders`, `returns`, `fba_inventory`, `merchants_listings_fyp`

### Query parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `load_last_day` | true | Yesterday only |
| `load_last_three_days` | false | Last 3 days |
| `year`, `month` | — | Month backfill |
| `accounts_filter` | all configured | Comma-separated brands |
| `continue_on_error` | true | Continue if one dispatch fails |

### Examples

```bash
# Daily sales for all brands
curl -X POST "http://localhost:8080/api/v1/sp/reports/sales_and_traffic/process-all-brands?load_last_day=true"

# Inventory for specific brands
curl -X POST "http://localhost:8080/api/v1/sp/reports/inventory/process-all-brands?load_last_day=true&accounts_filter=OE,Bumbleride"

# October 2024 backfill
curl -X POST "http://localhost:8080/api/v1/sp/reports/orders/process-all-brands?year=2024&month=10"
```

Workers are invoked at `POST /api/v1/sp/worker/process-report` by Cloud Tasks.

---

## SP-API — brand-centric

```
POST /api/v1/sp/brands/{account_name}/process-all-reports
```

Use for troubleshooting one brand across all report types.

```bash
curl -X POST "http://localhost:8080/api/v1/sp/brands/OE/process-all-reports?load_last_day=true"
curl -X POST "http://localhost:8080/api/v1/sp/brands/ArmsReach/process-all-reports?reports_filter=sales_and_traffic,orders&load_last_day=true"
```

---

## SP-API — single report (inline)

No Cloud Tasks — runs synchronously:

```bash
curl -X POST "http://localhost:8080/api/v1/accounts/OE/reports/orders?load_last_day=true"
```

---

## Ads API — daily dispatch

```
POST /api/v1/ads/dispatch
```

Creates one Cloud Task per account × report type (up to ~348 tasks).

### Query parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `report_types` | all 12 | Comma-separated filter |
| `accounts_filter` | all configured | Comma-separated filter |
| `start_date`, `end_date` | incremental | Manual date override |

### Examples

```bash
curl -X POST "http://localhost:8080/api/v1/ads/dispatch"
curl -X POST "http://localhost:8080/api/v1/ads/dispatch?accounts_filter=Bumbleride&report_types=spCampaigns,sbCampaigns"
```

Workers: `POST /api/v1/ads/worker/process`

### Inline batch (no Cloud Tasks)

```bash
curl -X POST "http://localhost:8080/api/v1/ads/reports/process?accounts_filter=OE&report_types=spCampaigns"
```

### Retry failed reports

```bash
curl -X POST "http://localhost:8080/api/v1/ads/reports/retry-failed?expire_stuck=true"
```

Uses `ads-reports-retry-queue`. See [Failed Reports](/operations/failed-reports).

---

## Cloud Scheduler patterns

### SP-API — staggered (recommended)

| Time | Job |
|------|-----|
| 8:00 AM | `sales_and_traffic/process-all-brands?load_last_day=true` |
| 9:00 AM | `inventory/process-all-brands?load_last_day=true` |
| 10:00 AM | `orders/process-all-brands?load_last_day=true` |
| … | remaining report types through 2 PM |

### Ads API — single dispatch

```
Schedule: 0 2 * * * (daily 2 AM ET)
URI: POST https://<cloud-run-url>/api/v1/ads/dispatch
```

---

## Quick reference (curl cheat sheet)

```bash
# SP batch
curl -X POST "$URL/api/v1/sp/reports/orders/process-all-brands?load_last_day=true"

# SP single brand all reports
curl -X POST "$URL/api/v1/sp/brands/OE/process-all-reports?load_last_day=true"

# SP inline
curl -X POST "$URL/api/v1/accounts/OE/reports/orders?load_last_day=true"

# Ads dispatch
curl -X POST "$URL/api/v1/ads/dispatch"

# Ads inline
curl -X POST "$URL/api/v1/ads/reports/process"

# Status checks
curl "$URL/api/v1/report-status/summary"
curl "$URL/api/v1/ads-report-status/summary"
curl "$URL/api/v1/report-status/failed?days_back=1"
curl "$URL/api/v1/ads-report-status/failed?days_back=1"

# Ads retry
curl -X POST "$URL/api/v1/ads/reports/retry-failed?expire_stuck=true"
```

---

## Error handling

### SP batch dispatch

If one brand fails to queue, others continue when `continue_on_error=true`:

```bash
curl "http://localhost:8080/api/v1/report-status/failed?days_back=1"
curl -X POST "http://localhost:8080/api/v1/sp/reports/orders/process-all-brands?accounts_filter=Bumbleride&load_last_day=true"
```

### Ads failures

```bash
curl -X POST "http://localhost:8080/api/v1/ads/reports/retry-failed?expire_stuck=true"
```

## Related pages

- [Scheduled Jobs](/operations/scheduled-jobs)
- [Cloud Tasks & Scheduler](/deployment/cloud-tasks-scheduler)
- [Data Flow](/architecture/data-flow)
- [API Endpoints](/reference/endpoints)

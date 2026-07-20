# Scheduled Jobs & Background Tasks

**Last updated:** 2026-07-20

All scheduling is external — there is no in-process cron. Cloud Scheduler triggers batch endpoints; Cloud Tasks dispatches workers.

## Cloud Scheduler jobs

### Ads API — single dispatch

| Setting | Value |
|---------|-------|
| Job name | `ads-daily-dispatch` |
| Schedule | `0 2 * * *` (daily 2 AM ET) |
| Target | `POST /api/v1/ads/dispatch` |
| Fan-out | ~26 accounts × 12 report types ≈ 312 tasks |

### SP-API — staggered (7 jobs)

One job per report type, staggered 8 AM–2 PM ET:

| Time | Report type | Endpoint |
|------|-------------|----------|
| 8:00 AM | `sales_and_traffic` | `POST /api/v1/sp/reports/sales_and_traffic/process-all-brands?load_last_day=true` |
| 9:00 AM | `inventory` | `POST /api/v1/sp/reports/inventory/process-all-brands?load_last_day=true` |
| 10:00 AM | `orders` | `POST /api/v1/sp/reports/orders/process-all-brands?load_last_day=true` |
| 11:00 AM | `returns` | `POST /api/v1/sp/reports/returns/process-all-brands?load_last_day=true` |
| 12:00 PM | `fba_inventory` | `POST /api/v1/sp/reports/fba_inventory/process-all-brands?load_last_day=true` |
| 1:00 PM | `listings` | `POST /api/v1/sp/reports/listings/process-all-brands?load_last_day=true` |
| 2:00 PM | `merchants_listings_fyp` | `POST /api/v1/sp/reports/merchants_listings_fyp/process-all-brands?load_last_day=true` |

All Scheduler jobs should use OIDC authentication with the Cloud Run service account.

### AMC — weekly Path to Conversion

| Setting | Value |
|---------|-------|
| Target | `POST /api/v1/amc/dispatch` |
| Cadence | Weekly (brand pilot: Vertx) |
| Queue | `amc-reports-queue` |

See [AMC Pipeline](/pipelines/amc-pipeline).

## Cloud Tasks queues

| Queue | Env var | Worker endpoint | Purpose |
|-------|---------|-----------------|---------|
| `ads-reports-queue` | `CLOUD_TASKS_QUEUE` | `POST /api/v1/ads/worker/process` | Daily Ads create phase |
| `ads-reports-retry-queue` | `CLOUD_TASKS_RETRY_QUEUE` | process + check-report | Failed Ads retries / check tasks |
| `sp-reports-queue` | `SP_CLOUD_TASKS_QUEUE` | `POST /api/v1/sp/worker/process-report` | SP batch workers |
| `amc-reports-queue` | `AMC_CLOUD_TASKS_QUEUE` | `/amc/worker/process` + check-execution | AMC weekly workers |

### Task configuration

- **Dispatch deadline:** 1800 s (30 min)
- **OIDC:** enabled when `CLOUD_TASKS_SERVICE_ACCOUNT` is set
- **SP dedup:** deterministic task names prevent duplicate scheduler runs
- **SP spacing:** `SP_TASK_START_SPACING_SECONDS` (default 45 s) staggers task creation

Implementation: `app/utils/cloud_tasks.py`

## HTTP-triggered background flows

These are not cron jobs but operational endpoints:

| Endpoint | Trigger | Purpose |
|----------|---------|---------|
| `POST /api/v1/ads/dispatch-remaining` | Manual / UI | Gap-fill Remaining Ads cells |
| `POST /api/v1/sp/dispatch-remaining` | Manual / UI | Gap-fill Remaining SP cells |
| `POST /api/v1/ads/reports/retry-failed` | Manual / ops | BQ-driven Ads retry dispatch |
| `POST /api/v1/ads/reports/expire-stuck` | Manual / ops | Cleanup RUNNING > threshold |
| `POST /api/v1/ads/reports/process` | Manual | Synchronous full matrix |
| `POST /api/v1/sp/brands/{account}/process-all-reports` | Manual | All reports for one brand |
| `POST /api/v1/amc/dispatch` | Scheduler / manual | Weekly AMC Path to Conversion |

## Creating Scheduler jobs

```bash
# Ads daily dispatch
gcloud scheduler jobs create http ads-daily-dispatch \
  --location=us-central1 \
  --schedule="0 2 * * *" \
  --time-zone="America/New_York" \
  --uri="https://<CLOUD-RUN-URL>/api/v1/ads/dispatch" \
  --http-method=POST \
  --oidc-service-account-email=fastapi-bq-acess@research-analytics-v1.iam.gserviceaccount.com

# SP example
gcloud scheduler jobs create http sp-daily-orders \
  --location=us-central1 \
  --schedule="0 10 * * *" \
  --time-zone="America/New_York" \
  --uri="https://<CLOUD-RUN-URL>/api/v1/sp/reports/orders/process-all-brands?load_last_day=true" \
  --http-method=POST \
  --oidc-service-account-email=fastapi-bq-acess@research-analytics-v1.iam.gserviceaccount.com
```

## Migration from legacy scheduling

**Before:** 49+ individual jobs (7 reports × 7+ brands)

**After:** 8 total jobs (7 SP + 1 Ads)

See [Legacy Migration](/reference/migration-legacy).

## Related pages

- [Batch Scheduling](/pipelines/batch-scheduling)
- [Cloud Tasks & Scheduler](/deployment/cloud-tasks-scheduler)
- [Operations Runbook](/operations/)

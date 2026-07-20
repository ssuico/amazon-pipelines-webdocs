# Ads Pipeline

**Last updated:** 2026-07-20

Guide to the Ads API → BigQuery pipeline: dispatch, async workers, incremental loading, and failure recovery.

## Architecture

```
Cloud Scheduler → /ads/dispatch → ads-reports-queue → /ads/worker/process
                                                          ↓ (create report, return)
                                              /ads/worker/check-report (poll chain)
                                                          ↓
                                              Amazon Ads API → BigQuery
                                                          ↓
                                              ads_report_status table
```

Default processing is **async poll-and-reschedule** (`ADS_ASYNC_POLL_ENABLED=true`). See [Ads Async Poll](/developer/design-decisions/ads-async-poll).

Diagrams: [Data Flow](/architecture/data-flow)

## Data flow

1. **Dispatch** — Cloud Scheduler calls `/ads/dispatch` (tasks staggered by `ADS_DISPATCH_STAGGER_SECONDS`)
2. **Request phase** — worker creates report(s), writes RUNNING, enqueues first check task, returns in seconds
3. **Check phase** — `/ads/worker/check-report` polls once per invocation; re-enqueues with backoff until COMPLETED / timeout / recreate limit
4. **Incremental load** — date range resolved up front; default `(last_date - 3 days)` → today (max 31-day window)
5. **Transform / upsert** — existing `AdsReportProcessor` + MERGE path
6. **Track** — `ads_report_status` (COMPLETED with end-to-end duration)

Workers skip if **COMPLETED** in the last 20 hours or **RUNNING** within `ADS_RUNNING_SKIP_MINUTES` (default 120).

Set `ADS_ASYNC_POLL_ENABLED=false` to fall back to the synchronous poll loop (operational override only).

## Production dispatch

```bash
curl -X POST "http://localhost:8080/api/v1/ads/dispatch"
curl -X POST "http://localhost:8080/api/v1/ads/dispatch?accounts_filter=Bumbleride&report_types=spCampaigns"
```

Creates one Cloud Task per account × report type.

For control-panel “finish the day” gap-fill (Remaining cells only), prefer:

```bash
curl -X POST "http://localhost:8080/api/v1/ads/dispatch-remaining?dry_run=true"
curl -X POST "http://localhost:8080/api/v1/ads/dispatch-remaining"
```

See [Ads Control Panel](/operations/ads-control-panel).

Worker endpoints (Cloud Tasks only):

```http
POST /api/v1/ads/worker/process
POST /api/v1/ads/worker/check-report
```

## Inline batch (no Cloud Tasks)

```bash
curl -X POST "http://localhost:8080/api/v1/ads/reports/process?accounts_filter=OE&report_types=spCampaigns"
```

Runs fetch → transform → upsert synchronously. Use for manual runs and debugging.

## Incremental loading

Default mode (no date override):

- Reads max date from target BigQuery table via `get_last_ads_report_date()`
- Starts 3 days before that date (late-arriving data)
- Caps range at 31 days (Ads API limit)

Manual mode: pass `start_date` / `end_date` on dispatch or worker payload.

## Special handling: spAdvertisedProduct

Creates ENABLED, PAUSED, and ARCHIVED reports together in the request phase; the check chain waits for all three before download/transform.

## Scheduling

Daily at 2 AM ET:

```bash
gcloud scheduler jobs create http ads-daily-dispatch \
  --location=us-central1 \
  --schedule="0 2 * * *" \
  --time-zone="America/New_York" \
  --uri="https://<CLOUD-RUN-URL>/api/v1/ads/dispatch" \
  --http-method=POST \
  --oidc-service-account-email=<SERVICE-ACCOUNT>@research-analytics-v1.iam.gserviceaccount.com
```

See [Scheduled Jobs](/operations/scheduled-jobs).

## Failure recovery

```bash
# Coverage matrix
curl "http://localhost:8080/api/v1/ads-report-status/matrix"

# Query failures
curl "http://localhost:8080/api/v1/ads-report-status/failed?days_back=1"

# Retry with stuck-report cleanup
curl -X POST "http://localhost:8080/api/v1/ads/reports/retry-failed?expire_stuck=true"
```

Full guide: [Failed Reports](/operations/failed-reports) · [Ads Control Panel](/operations/ads-control-panel)

## Monitoring

```bash
curl "http://localhost:8080/api/v1/ads-report-status/summary"
curl "http://localhost:8080/api/v1/ads-report-status/matrix"
curl "http://localhost:8080/api/v1/ads-report-status/recent"
```

See [Monitoring](/operations/monitoring).

## Troubleshooting

| Issue | Action |
|-------|--------|
| 429 throttling | Queue rate limits handle backoff; use retry queue |
| Stuck RUNNING | `POST /ads/reports/expire-stuck` then `retry-failed` |
| Empty report | Check date range; verify profile ID |
| Duplicate processing | Idempotency skips recent COMPLETED; use `dispatch-remaining?force=true` for Remaining cells only |
| Long batch / deadline overruns | Confirm `ADS_ASYNC_POLL_ENABLED=true` (async check chain) |

## Related pages

- [Ads API Integration](/integrations/ads-api)
- [Ads Report Types](/reference/ads-report-types)
- [Ads Control Panel](/operations/ads-control-panel)
- [Batch Scheduling](/pipelines/batch-scheduling)
- [Data Flow & Processing](/pipelines/data-flow-processing)

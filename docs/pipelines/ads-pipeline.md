# Ads Pipeline

Guide to the Ads API → BigQuery pipeline: dispatch, workers, incremental loading, and failure recovery.

## Architecture

```
Cloud Scheduler → /ads/dispatch → ads-reports-queue → /ads/worker/process
                                                          ↓
                                              Amazon Ads API → BigQuery
                                                          ↓
                                              ads_report_status table
```

Diagrams: [Data Flow](/architecture/data-flow)

## Data flow

1. **Dispatch** — Cloud Scheduler calls `/ads/dispatch`
2. **Worker** — idempotency check (skip if COMPLETED in last 20 h)
3. **Incremental load** — query BigQuery max date; fetch from `(last_date - 3 days)` to today (max 31-day window)
4. **Fetch** — create async report → poll ~60 s → download GZIP JSON
5. **Transform** — `AdsReportProcessor` aggregates and splits into tables
6. **Upsert** — `BigQueryClient.upsert_ads_report_data` (staging + MERGE)
7. **Track** — update `ads_report_status`

## Production dispatch

```bash
curl -X POST "http://localhost:8080/api/v1/ads/dispatch"
curl -X POST "http://localhost:8080/api/v1/ads/dispatch?accounts_filter=Bumbleride&report_types=spCampaigns"
```

Creates one Cloud Task per account × report type (up to ~348 tasks with 26 accounts × 12 types).

Worker endpoint (Cloud Tasks only):

```http
POST /api/v1/ads/worker/process
```

Body: `{ "account_name": "Bumbleride", "report_type": "spCampaigns" }`

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

This report type fetches ENABLED, PAUSED, and ARCHIVED statuses separately and concatenates DataFrames before upsert.

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
# Query failures
curl "http://localhost:8080/api/v1/ads-report-status/failed?days_back=1"

# Retry with stuck-report cleanup
curl -X POST "http://localhost:8080/api/v1/ads/reports/retry-failed?expire_stuck=true"
```

Full guide: [Failed Reports](/operations/failed-reports)

## Monitoring

```bash
curl "http://localhost:8080/api/v1/ads-report-status/summary"
curl "http://localhost:8080/api/v1/ads-report-status/recent"
```

See [Monitoring](/operations/monitoring).

## Troubleshooting

| Issue | Action |
|-------|--------|
| 429 throttling | Queue rate limits handle backoff; use retry queue |
| Stuck RUNNING | `POST /ads/reports/expire-stuck` then `retry-failed` |
| Empty report | Check date range; verify profile ID |
| Duplicate processing | Idempotency guard skips recent COMPLETED tasks |

## Related pages

- [Ads API Integration](/integrations/ads-api)
- [Ads Report Types](/reference/ads-report-types)
- [Batch Scheduling](/pipelines/batch-scheduling)
- [Data Flow & Processing](/pipelines/data-flow-processing)

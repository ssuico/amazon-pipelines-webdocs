# Failed Reports

Procedures for querying and recovering from failed SP and Ads pipeline runs.

## SP-API failed reports

Query the SP status API:

```bash
curl "http://localhost:8080/api/v1/report-status/failed?days_back=7"
curl "http://localhost:8080/api/v1/report-status/failed?days_back=1&account_name=ArmsReach"
```

### Recovery

SP does not have an automated retry endpoint. Re-dispatch for the failed brand:

```bash
curl -X POST "http://localhost:8080/api/v1/sp/reports/orders/process-all-brands?accounts_filter=ArmsReach&load_last_day=true"
```

Or run inline for a single report:

```bash
curl -X POST "http://localhost:8080/api/v1/accounts/ArmsReach/reports/orders?load_last_day=true"
```

Full API reference: [Monitoring](/operations/monitoring)

## Ads API failed reports

### Query failures

```bash
curl "http://localhost:8080/api/v1/ads-report-status/failed?days_back=1"
```

### Retry failed reports

Re-enqueues failed Ads tasks from the last 24 hours onto `ads-reports-retry-queue`:

```http
POST /api/v1/ads/reports/retry-failed
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `dry_run` | false | Preview jobs without enqueuing |
| `accounts_filter` | all | Limit to specific accounts |
| `report_types_filter` | all | Limit to specific report types |
| `expire_stuck` | false | Mark RUNNING >2h as FAILED first |

```bash
# Preview
curl -X POST "http://localhost:8080/api/v1/ads/reports/retry-failed?dry_run=true"

# Retry with stuck-report cleanup
curl -X POST "http://localhost:8080/api/v1/ads/reports/retry-failed?expire_stuck=true"
```

### Expire stuck reports only

```http
POST /api/v1/ads/reports/expire-stuck
```

Marks reports stuck in `RUNNING` for more than 2 hours as `FAILED`.

### CLI alternative

```bash
python scripts/retry_failed_ads_reports.py
```

Queries `ads_report_status` directly and retries via the service layer.

## Related pages

- [Monitoring](/operations/monitoring)
- [Ads Pipeline](/pipelines/ads-pipeline)
- [Operations Runbook](/operations/)
- [Batch Scheduling](/pipelines/batch-scheduling)

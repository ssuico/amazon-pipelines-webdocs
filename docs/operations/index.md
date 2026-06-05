# Operations Runbook

Operational procedures for monitoring, incident response, and maintenance of the Amazon Pipelines platform.

## Daily checks

| Check | Command / Action |
|-------|------------------|
| Service health | `curl $URL/health` |
| SP pipeline summary | `curl $URL/api/v1/report-status/summary` |
| Ads pipeline summary | `curl $URL/api/v1/ads-report-status/summary` |
| Failed SP reports | `curl "$URL/api/v1/report-status/failed?days_back=1"` |
| Failed Ads reports | `curl "$URL/api/v1/ads-report-status/failed?days_back=1"` |
| Cloud Scheduler jobs | Verify 7 SP + 1 Ads jobs ran successfully in GCP Console |

## Incident playbooks

### SP batch failures

1. Check failed reports: `GET /api/v1/report-status/failed?days_back=1`
2. Identify affected brand and report type
3. Re-dispatch for failed brand:
   ```bash
   curl -X POST "$URL/api/v1/sp/reports/{type}/process-all-brands?accounts_filter={brand}&load_last_day=true"
   ```
4. If credential error (401), verify Secret Manager binding and token validity
5. Check Cloud Run logs for worker errors

### Ads stuck in RUNNING

1. Expire stuck reports:
   ```bash
   curl -X POST "$URL/api/v1/ads/reports/expire-stuck"
   ```
2. Retry failed:
   ```bash
   curl -X POST "$URL/api/v1/ads/reports/retry-failed?expire_stuck=true"
   ```
3. Monitor retry queue (`ads-reports-retry-queue`) in Cloud Tasks console

### BigQuery upsert errors

1. Check worker logs for MERGE failures
2. Verify schema merge columns match DataFrame columns
3. Check if target table exists and schema is compatible
4. Re-run inline for single report to reproduce:
   ```bash
   curl -X POST "$URL/api/v1/accounts/{brand}/reports/{type}?load_last_day=true"
   ```

### Credential expiry / revocation

1. Symptom: 401 errors from Amazon API in worker logs
2. Re-authorize brand in Seller Central / Advertising Console
3. Update refresh token in Secret Manager
4. Redeploy or restart Cloud Run to pick up new secret version
5. Re-run affected reports

### Cloud Tasks queue backlog

1. Check queue depth in GCP Console (Cloud Tasks)
2. Verify Cloud Run instances are scaling (max 10)
3. Check for rate limiting (429) in worker logs
4. SP: increase stagger spacing via `SP_TASK_START_SPACING_SECONDS`

## Maintenance tasks

| Task | Frequency | Procedure |
|------|-----------|-----------|
| Review failed reports | Daily | [Monitoring](/operations/monitoring) |
| Deduplicate status rows | Monthly | `POST /report-status/cleanup-duplicates?dry_run=true` first |
| Credential rotation | As needed | Update Secret Manager + redeploy |
| Brand onboarding | As needed | [Brand Onboarding](/onboarding/brand-onboarding) |

## Operational scripts

See [Operational Scripts](/operations/scripts) for CLI tools:

- `retry_failed_ads_reports.py` — retry failed Ads jobs
- `backfill_30day_data.py` — resumable SP backfill
- `create_account_details_table.py` — seed account metadata
- `migrate_ads_tables.py` — create/verify Ads BQ tables

## Escalation

| Severity | Criteria | Action |
|----------|----------|--------|
| P1 | All scheduled jobs failing | Check Cloud Run health, credentials, Scheduler |
| P2 | Single brand failing all reports | Check brand credentials, re-authorize |
| P3 | Single report type failing | Re-dispatch, check SP-API status |
| P4 | Dashboard stale data | Expected — 2 min cache TTL on aggregate endpoints |

## Related pages

- [Monitoring](/operations/monitoring)
- [Failed Reports](/operations/failed-reports)
- [Scheduled Jobs](/operations/scheduled-jobs)
- [Common Issues](/troubleshooting/common-issues)

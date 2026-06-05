# Cloud Tasks & Scheduler

Setup for Cloud Tasks queues and Cloud Scheduler jobs that drive daily pipeline execution.

## Cloud Tasks queues

Create three queues in `us-central1`:

```bash
# Ads daily dispatch
gcloud tasks queues create ads-reports-queue \
  --location=us-central1 \
  --max-dispatches-per-second=10 \
  --max-concurrent-dispatches=20

# Ads retry
gcloud tasks queues create ads-reports-retry-queue \
  --location=us-central1 \
  --max-dispatches-per-second=5 \
  --max-concurrent-dispatches=10

# SP batch workers
gcloud tasks queues create sp-reports-queue \
  --location=us-central1 \
  --max-dispatches-per-second=10 \
  --max-concurrent-dispatches=20
```

### Queue → worker mapping

| Queue | Worker endpoint | Created by |
|-------|-----------------|------------|
| `ads-reports-queue` | `POST /api/v1/ads/worker/process` | `/ads/dispatch` |
| `ads-reports-retry-queue` | `POST /api/v1/ads/worker/process` | `/ads/reports/retry-failed` |
| `sp-reports-queue` | `POST /api/v1/sp/worker/process-report` | `/sp/reports/{type}/process-all-brands` |

### Task configuration

- **Dispatch deadline:** 1800 s (30 min) — set in `CloudTasksService`
- **OIDC token:** attached when `CLOUD_TASKS_SERVICE_ACCOUNT` is configured
- **SP task names:** deterministic per day to prevent duplicate scheduler dispatches
- **SP spacing:** `SP_TASK_START_SPACING_SECONDS=45` staggers task creation

Env vars: see [Environment Variables](/reference/environment-variables)

## Cloud Scheduler jobs

All jobs use OIDC authentication:

```bash
SA=fastapi-bq-acess@research-analytics-v1.iam.gserviceaccount.com
URL=https://amazon-pipelines-vaw23nw3ja-uc.a.run.app
```

### Ads daily dispatch

```bash
gcloud scheduler jobs create http ads-daily-dispatch \
  --location=us-central1 \
  --schedule="0 2 * * *" \
  --time-zone="America/New_York" \
  --uri="$URL/api/v1/ads/dispatch" \
  --http-method=POST \
  --oidc-service-account-email=$SA
```

### SP staggered jobs (example)

```bash
gcloud scheduler jobs create http sp-daily-orders \
  --location=us-central1 \
  --schedule="0 10 * * *" \
  --time-zone="America/New_York" \
  --uri="$URL/api/v1/sp/reports/orders/process-all-brands?load_last_day=true" \
  --http-method=POST \
  --oidc-service-account-email=$SA
```

Create similar jobs for all 7 SP report types. Full schedule: [Scheduled Jobs](/operations/scheduled-jobs).

## IAM for Scheduler and Tasks

The service account needs permission to invoke Cloud Run:

```bash
gcloud run services add-iam-policy-binding amazon-pipelines \
  --region=us-central1 \
  --member="serviceAccount:$SA" \
  --role="roles/run.invoker"
```

## Monitoring queues

Check queue depth and error rates in GCP Console → Cloud Tasks. High backlog may indicate:

- Cloud Run scaling issues (check max instances)
- Worker timeouts (check 3600 s timeout)
- Amazon API rate limiting (check worker logs for 429)

## Related pages

- [Scheduled Jobs](/operations/scheduled-jobs)
- [Batch Scheduling](/pipelines/batch-scheduling)
- [Cloud Run](/deployment/cloud-run)

# Platform Components

This page describes the major runtime components that make up the Amazon Pipelines platform.

## Cloud Run service

The FastAPI application runs as a single Cloud Run service (`amazon-pipelines`) that serves:

- **Dispatch endpoints** — called by Cloud Scheduler to fan out work
- **Worker endpoints** — called by Cloud Tasks to process individual reports
- **Status APIs** — dashboard endpoints for monitoring
- **Account APIs** — list accounts, run inline reports, manage metadata

Production sizing (from `cloudbuild.yaml`):

| Setting | Value |
|---------|-------|
| Memory | 16 GiB |
| CPU | 4 |
| Timeout | 3600 s |
| Max instances | 10 |

See [Cloud Run Deployment](/deployment/cloud-run).

## Cloud Tasks queues

| Queue | Env var | Worker endpoint | Purpose |
|-------|---------|-----------------|---------|
| `ads-reports-queue` | `CLOUD_TASKS_QUEUE` | `POST /api/v1/ads/worker/process` | Daily Ads dispatch |
| `ads-reports-retry-queue` | `CLOUD_TASKS_RETRY_QUEUE` | same worker | Failed Ads retries |
| `sp-reports-queue` | `SP_CLOUD_TASKS_QUEUE` | `POST /api/v1/sp/worker/process-report` | SP batch workers |

Task behavior:

- OIDC token when `CLOUD_TASKS_SERVICE_ACCOUNT` is set
- 30-minute dispatch deadline (1800 s)
- SP tasks use deterministic names to deduplicate scheduler runs
- SP dispatch staggers starts via `SP_TASK_START_SPACING_SECONDS` (default 45 s)

Implementation: `app/utils/cloud_tasks.py`

## Cloud Scheduler

| Job pattern | Target | Cadence |
|-------------|--------|---------|
| `ads-daily-dispatch` | `POST /api/v1/ads/dispatch` | Daily ~2 AM ET |
| `sp-daily-{report_type}` (×7) | `POST /api/v1/sp/reports/{type}/process-all-brands?load_last_day=true` | Staggered daily (8 AM–2 PM ET) |

See [Scheduled Jobs](/operations/scheduled-jobs).

## Authentication layer

Outbound Amazon API auth is handled by:

- **`SPAPIAuth`** — LWA token refresh for SP-API (`app/utils/auth.py`)
- **`AdsAPIAuth`** — LWA token refresh + profile ID for Ads API

Credentials resolve from `AccountConfig` in `app/config.py`. See [Credentials & Auth](/onboarding/credentials).

## BigQuery client

`BigQueryClient` (`app/services/sp/bigquery_client.py`) provides:

- Staging table load + MERGE upsert for SP reports
- `upsert_ads_report_data` for Ads reports
- `get_last_ads_report_date` for incremental loading
- Automatic table creation from schema definitions

## Status trackers

| Tracker | Table | Purpose |
|---------|-------|---------|
| `ReportStatusTracker` | `report_status` | SP pipeline lifecycle |
| `AdsReportTracker` | `ads_report_status` | Ads pipeline lifecycle |

Both write to BigQuery and expose query methods used by dashboard APIs.

## Dashboard caching

In-memory TTL caches (`app/utils/cache.py`) reduce BigQuery load for dashboard endpoints:

| Cache | TTL | Endpoints |
|-------|-----|-----------|
| `dashboard_cache` | 2 min | `/failed`, `/activity`, `/statistics`, `/summary` |
| `metadata_cache` | 10 min | `/accounts`, `/accounts/{name}` |

**Not cached:** `/recent` (live RUNNING status), `/health` endpoints.

See [Monitoring](/operations/monitoring) and [Design Decision: BigQuery Caching](/developer/design-decisions/bigquery-caching).

## Account metadata

`AccountMetadataService` stores display metadata (name, logo, description) in the `account_details` BigQuery table. Updated via `PUT/PATCH /api/v1/accounts/{account}/metadata`.

## Related pages

- [Data Flow](/architecture/data-flow)
- [Cloud Tasks & Scheduler](/deployment/cloud-tasks-scheduler)
- [Authentication & Authorization](/onboarding/credentials)
- [Monitoring](/operations/monitoring)

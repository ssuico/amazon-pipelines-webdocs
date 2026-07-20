# AMC Pipeline (Path to Conversion)

**Last updated:** 2026-07-20

Amazon Marketing Cloud (AMC) pipeline for privacy-controlled advertising analytics. Vertx is the pilot brand. Weekly dispatch runs a two-step AMC SQL workflow and warehouses results in BigQuery.

## Architecture

```
Cloud Scheduler → POST /api/v1/amc/dispatch
    → amc-reports-queue → POST /amc/worker/process
    → AMC exploratory execution (campaign discovery)
    → AMC Path to Conversion execution
    → Poll via /amc/worker/check-execution (async)
    → Download CSV → BigQuery (amazon_amc_v1)
```

AMC executions often exceed Cloud Tasks HTTP deadlines, so the worker uses **poll-and-reschedule** (job context in the Cloud Tasks payload), same pattern as the Ads async check flow.

## Authentication

| Credential | Role |
|------------|------|
| `CP_ADS_CLIENT_ID` / `CP_ADS_CLIENT_SECRET` | Shared LWA client (same as Ads) |
| `CP_AMC_REFRESH_TOKEN` | AMC-only refresh token (separate from Ads) |
| Per-brand entity / instance / marketplace IDs | Request headers |

Env pattern per brand: `{BRAND}_AMC_ENTITY_ID`, `{BRAND}_AMC_INSTANCE_ID`, `{BRAND}_AMC_SANDBOX_INSTANCE_ID`, `{BRAND}_AMC_MARKETPLACE_ID`.

Configured brands live in `AMC_BRAND_ACCOUNT_FIELDS` in `app/config.py` (Vertx first).

## Two-step query

1. **Exploratory** — discover `campaign`, `campaign_id`, `ad_product_type` from attributed events.
2. **Path to Conversion** — inject discovered campaigns into filter CTEs.

Successful exploratory downloads are also persisted to `path_to_conversion_campaigns` for DSP debugging (see [AMC Exploratory Campaigns](/developer/design-decisions/amc-path-to-conversion#exploratory-campaigns-capture)).

## BigQuery warehouse

| Item | Value |
|------|-------|
| Dataset | `BIGQUERY_AMC_DATASET` (default `amazon_amc_v1`) |
| Main table | `path_to_conversion` (shared; `brand_name` column) |
| Campaigns table | `path_to_conversion_campaigns` |
| Merge key (paths) | `brand_name`, `time_window_start`, `time_window_end`, `path` |
| Queue | `AMC_CLOUD_TASKS_QUEUE` (default `amc-reports-queue`) |

## Scheduling

- Weekly Cloud Scheduler → `POST /api/v1/amc/dispatch`
- Default time window: `MOST_RECENT_WEEK`
- Two AMC executions per brand per run (counts against ad-hoc quota)

## Key endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/v1/amc/dispatch` | Weekly / manual dispatch |
| `POST /api/v1/amc/worker/process` | Start executions (Cloud Tasks) |
| `POST /api/v1/amc/worker/check-execution` | Async poll / reschedule |

## Related pages

- [Design Decision: AMC Path to Conversion](/developer/design-decisions/amc-path-to-conversion)
- [Environment Variables](/reference/environment-variables)
- [API Endpoints](/reference/endpoints)
- [Batch Scheduling](/pipelines/batch-scheduling)

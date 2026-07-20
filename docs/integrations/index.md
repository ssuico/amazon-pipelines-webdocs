# Integrations Overview

**Last updated:** 2026-07-20

Amazon Pipelines integrates with three Amazon API surfaces and Google Cloud Platform services.

## Amazon APIs

| Integration | Purpose | Documentation |
|-------------|---------|---------------|
| **SP-API** | Seller reports (orders, inventory, listings, sales, returns, FBA, FYP) | [SP-API Integration](/integrations/sp-api) |
| **Ads API** | Advertising reports (SP, SB, SD campaigns, targeting, search terms) | [Ads API Integration](/integrations/ads-api) |
| **AMC** | Path to Conversion (weekly SQL workflows) | [AMC Pipeline](/pipelines/amc-pipeline) |

SP and Ads use **Login with Amazon (LWA)** OAuth for token refresh. AMC shares CP Ads client credentials but uses a dedicated `CP_AMC_REFRESH_TOKEN`. Brand routing lives in `AccountConfig` / `AMC_BRAND_ACCOUNT_FIELDS`.

## Google Cloud Platform

| Service | Role |
|---------|------|
| **Cloud Run** | Hosts the FastAPI application |
| **Cloud Tasks** | Async worker dispatch with retries |
| **Cloud Scheduler** | Cron triggers for daily batch jobs |
| **BigQuery** | Report data storage and status tracking |
| **Secret Manager** | Production credential injection |
| **Artifact Registry** | Container image storage |
| **Cloud Build** | CI build and deploy pipeline |

See [Deployment](/deployment/) for infrastructure setup.

## Data flow summary

```
Amazon SP-API / Ads API / AMC
        ↓
   Cloud Run workers
        ↓
   BigQuery datasets (+ agg_tables_v2 for Brand Analytics)
        ↓
   Status dashboard APIs / Brand Analytics read API
```

## Related pages

- [Architecture Overview](/architecture/)
- [Credentials & Auth](/onboarding/credentials)
- [BigQuery & Datasets](/reference/bigquery)
- [Brand Analytics API](/reference/brand-analytics)

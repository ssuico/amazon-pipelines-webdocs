# Integrations Overview

Amazon Pipelines integrates with two Amazon API surfaces and Google Cloud Platform services.

## Amazon APIs

| Integration | Purpose | Documentation |
|-------------|---------|---------------|
| **SP-API** | Seller reports (orders, inventory, listings, sales, returns, FBA, FYP) | [SP-API Integration](/integrations/sp-api) |
| **Ads API** | Advertising reports (SP, SB, SD campaigns, targeting, search terms) | [Ads API Integration](/integrations/ads-api) |

Both use **Login with Amazon (LWA)** OAuth for token refresh. Credentials are managed per-brand through `AccountConfig`.

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
Amazon SP-API / Ads API
        ↓
   Cloud Run workers
        ↓
   BigQuery datasets
        ↓
   Status dashboard APIs
```

## Related pages

- [Architecture Overview](/architecture/)
- [Credentials & Auth](/onboarding/credentials)
- [BigQuery & Datasets](/reference/bigquery)

# Data Pipelines Overview

Amazon Pipelines runs two parallel data pipelines — **SP-API** and **Ads API** — that share Cloud Run infrastructure but differ in scheduling, fan-out, and date logic.

## Pipeline summary

| Pipeline | Report types | Dispatch pattern | Queue |
|----------|-------------|------------------|-------|
| **SP-API** | 7 | 7 Cloud Scheduler jobs (one per report type) | `sp-reports-queue` |
| **Ads API** | 12 | 1 Cloud Scheduler job | `ads-reports-queue` |

## Shared processing pattern

Both pipelines follow the same high-level steps:

1. **Dispatch** — Cloud Scheduler or manual call triggers batch endpoint
2. **Queue** — Cloud Tasks creates individual worker tasks
3. **Fetch** — Worker calls Amazon API (create → poll → download)
4. **Transform** — Schema-driven column mapping and aggregation
5. **Upsert** — Staging table + MERGE into BigQuery
6. **Track** — Status row written to `report_status` or `ads_report_status`

Detailed diagrams: [Data Flow](/architecture/data-flow)

## Entry points

| Use case | SP endpoint | Ads endpoint |
|----------|-------------|--------------|
| Daily scheduled batch | `POST /sp/reports/{type}/process-all-brands` | `POST /ads/dispatch` |
| Single brand troubleshooting | `POST /sp/brands/{account}/process-all-reports` | Filter on dispatch |
| Manual inline run | `POST /accounts/{account}/reports/{type}` | `POST /ads/reports/process` |
| Retry failures | Re-dispatch failed brand | `POST /ads/reports/retry-failed` |

Decision tree: [API Endpoints](/reference/endpoints#decision-tree)

## Documentation map

| Topic | Page |
|-------|------|
| SP pipeline details | [SP Pipeline](/pipelines/sp-pipeline) |
| Ads pipeline details | [Ads Pipeline](/pipelines/ads-pipeline) |
| Worker internals | [Data Flow & Processing](/pipelines/data-flow-processing) |
| Scheduling | [Batch Scheduling](/pipelines/batch-scheduling) |
| BigQuery storage | [BigQuery & Datasets](/reference/bigquery) |

## Related pages

- [Architecture Overview](/architecture/)
- [Integrations](/integrations/)
- [Operations Runbook](/operations/)

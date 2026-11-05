# Data Pipelines Overview

**Last updated:** 2026-11-05

Amazon Pipelines runs Seller Central **SP-API**, **Ads API**, **AMC**, and Vendor Central retail analytics. They share Cloud Run but differ in scheduling, fan-out, and processing.

## Pipeline summary

| Pipeline | Report types | Dispatch pattern | Queue |
|----------|-------------|------------------|-------|
| **SP-API** | 7 | 7 Cloud Scheduler jobs (one per report type) | `sp-reports-queue` |
| **Ads API** | 12 | 1 Cloud Scheduler job + async check chain | `ads-reports-queue` (+ retry / check) |
| **AMC** | Path to Conversion (weekly, D+7 lag) | Weekly Scheduler → async poll | `amc-reports-queue` |
| **Vendor** | 6 retail analytics reports | `POST /vendor/dispatch` | `sp-reports-queue` (vendor worker) |
| **SCP / SQP** | Vertx weekly Brand Analytics search reports | `POST /sp/ba/dispatch` | `sp-ba-reports-queue` |

## Shared processing pattern

SP and Ads follow the same high-level steps:

1. **Dispatch** — Cloud Scheduler or manual call triggers batch endpoint
2. **Queue** — Cloud Tasks creates individual worker tasks
3. **Fetch** — Worker calls Amazon API (create → poll/check → download)
4. **Transform** — Schema-driven column mapping and aggregation
5. **Upsert** — Staging table + MERGE into BigQuery
6. **Track** — Status row written to `report_status` or `ads_report_status`

Ads defaults to **async create-then-check** so workers do not hold the queue for Amazon's generation latency. AMC uses the same poll-and-reschedule pattern.

Detailed diagrams: [Data Flow](/architecture/data-flow)

## Entry points

| Use case | SP endpoint | Ads endpoint |
|----------|-------------|--------------|
| Daily scheduled batch | `POST /sp/reports/{type}/process-all-brands` | `POST /ads/dispatch` |
| Gap-fill Remaining cells | `POST /sp/dispatch-remaining` | `POST /ads/dispatch-remaining` |
| Single brand troubleshooting | `POST /sp/brands/{account}/process-all-reports` | Filter on dispatch |
| Manual inline run | `POST /accounts/{account}/reports/{type}` | `POST /ads/reports/process` |
| Retry failures | Gap-fill / re-dispatch | `POST /ads/reports/retry-failed` |
| Weekly AMC | — | `POST /amc/dispatch` |

Decision tree: [API Endpoints](/reference/endpoints#decision-tree)

## Documentation map

| Topic | Page |
|-------|------|
| SP pipeline details | [SP Pipeline](/pipelines/sp-pipeline) |
| Ads pipeline details | [Ads Pipeline](/pipelines/ads-pipeline) |
| AMC Path to Conversion | [AMC Pipeline](/pipelines/amc-pipeline) |
| Vendor Central | [Vendor Pipeline](/pipelines/vendor-pipeline) |
| Vertx SCP / SQP | [SCP / SQP pilot](/pipelines/ba-scp-sqp) |
| Worker internals | [Data Flow & Processing](/pipelines/data-flow-processing) |
| Scheduling | [Batch Scheduling](/pipelines/batch-scheduling) |
| BigQuery storage | [BigQuery & Datasets](/reference/bigquery) |
| Control panels | [SP](/operations/sp-control-panel) · [Ads](/operations/ads-control-panel) |

## Related pages

- [Architecture Overview](/architecture/)
- [Integrations](/integrations/)
- [Operations Runbook](/operations/)

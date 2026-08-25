---
layout: home

hero:
  name: Amazon Pipelines
  text: SP, Ads & AMC Data Platform
  tagline: Fetch Amazon seller, advertising, and AMC reports; transform them with schema-driven pipelines; persist to BigQuery — orchestrated by Cloud Tasks on Cloud Run.
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: Architecture
      link: /architecture/
    - theme: alt
      text: Operations Runbook
      link: /operations/

features:
  - icon: 📦
    title: Multi-Account Support
    details: OE standalone accounts and CP portfolio brands on Research-app SP credentials — one service for all brands.
  - icon: ⚡
    title: Cloud Tasks Workers
    details: Parallel SP/Ads/AMC dispatch with async Ads check chains and idempotent gap-fill controls.
  - icon: 📊
    title: BigQuery Upserts
    details: Schema-driven MERGE into SP, Ads, AMC, and agg_tables_v2 datasets with status tracking.
  - icon: 🔍
    title: Status Dashboards
    details: Coverage matrices, failed reports, Brand Analytics, Conversational Analytics, and Listings Health APIs.
  - icon: 📅
    title: Scheduled Jobs
    details: Cloud Scheduler triggers daily batch dispatch — staggered SP jobs and a single Ads dispatch.
  - icon: 🛠
    title: Developer Friendly
    details: FastAPI with OpenAPI at /docs, modular schemas, and operational scripts for backfill and retry.
---

**Last updated:** 2026-08-26

## Who is this documentation for?

| Audience | Start here |
|----------|------------|
| **Business / product stakeholders** | [Platform overview](/) → [Architecture](/architecture/) → [FAQ](/faq) |
| **Operations / on-call** | [Operations Runbook](/operations/) → [Monitoring](/operations/monitoring) → [Failed Reports](/operations/failed-reports) |
| **Engineers onboarding a brand** | [Brand Onboarding](/onboarding/brand-onboarding) → [Credentials](/onboarding/credentials) |
| **Developers extending pipelines** | [Developer Guide](/developer/) → [SP Schemas](/reference/sp-schemas) → [API Reference](/reference/endpoints) |

## Platform at a glance

```mermaid
flowchart LR
  subgraph sched [CloudScheduler]
    SPJobs["7 SP report jobs"]
    AdsJob["1 Ads dispatch job"]
    AmcJob["Weekly AMC dispatch"]
  end

  subgraph cr [CloudRun]
    Dispatch["Batch dispatch"]
    Workers["SP Ads AMC workers"]
    StatusAPI["Status and analytics APIs"]
  end

  subgraph tasks [CloudTasks]
    SPQ[sp-reports-queue]
    AdsQ[ads-reports-queue]
    RetryQ[ads-reports-retry-queue]
    AmcQ[amc-reports-queue]
  end

  subgraph bq [BigQuery]
    SPData["SP report tables"]
    AdsData["Ads report tables"]
    AmcData["AMC tables"]
    SPStatus[report_status]
    AdsStatus[ads_report_status]
  end

  SPJobs --> Dispatch
  AdsJob --> Dispatch
  AmcJob --> Dispatch
  Dispatch --> SPQ
  Dispatch --> AdsQ
  Dispatch --> AmcQ
  SPQ --> Workers
  AdsQ --> Workers
  RetryQ --> Workers
  AmcQ --> Workers
  Workers --> SPData
  Workers --> AdsData
  Workers --> AmcData
  Workers --> SPStatus
  Workers --> AdsStatus
  StatusAPI --> SPStatus
  StatusAPI --> AdsStatus
```

## Report coverage

| Pipeline | Report types | Dataset |
|----------|-------------|---------|
| **SP-API** | 7 (orders, inventory, listings, sales, returns, FBA, FYP) | `amz_sp_api_reports_v1` |
| **Ads API** | 12 (SP, SB, SD campaigns, targeting, search terms, etc.) | `amz_ads_api_reports_v1` |
| **AMC** | Path to Conversion (weekly) | `amazon_amc_v1` |
| **Brand Analytics** | Read API over curated metrics | `agg_tables_v2` |

## Live API documentation

The running service exposes interactive OpenAPI docs at `/docs` on the deployed Cloud Run URL. This site covers architecture, operations, and reference material that complements Swagger.

## Related links

- [Getting Started](/getting-started) — local setup and first API calls
- [Pipeline Workflows](/architecture/data-flow) — detailed Mermaid diagrams
- [Batch Scheduling](/pipelines/batch-scheduling) — Cloud Scheduler patterns
- [Deployment](/deployment/) — Cloud Run production setup

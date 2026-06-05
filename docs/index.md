---
layout: home

hero:
  name: Amazon Pipelines
  text: SP-API & Ads API Data Platform
  tagline: Fetch Amazon seller and advertising reports, transform them with schema-driven pipelines, and persist to BigQuery — orchestrated by Cloud Tasks on Cloud Run.
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
    details: OE standalone accounts, CP shared-app brands, and Research-app credential overrides — one service for all brands.
  - icon: ⚡
    title: Cloud Tasks Workers
    details: Parallel dispatch for SP (7 report types × brands) and Ads (12 report types × accounts) with idempotency guards.
  - icon: 📊
    title: BigQuery Upserts
    details: Schema-driven MERGE operations into separate SP and Ads datasets with status tracking tables.
  - icon: 🔍
    title: Status Dashboards
    details: REST APIs for pipeline health, failed reports, activity logs, and aggregated statistics.
  - icon: 📅
    title: Scheduled Jobs
    details: Cloud Scheduler triggers daily batch dispatch — staggered SP jobs and a single Ads dispatch.
  - icon: 🛠
    title: Developer Friendly
    details: FastAPI with OpenAPI at /docs, modular schemas, and operational scripts for backfill and retry.
---

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
  end

  subgraph cr [CloudRun]
    Dispatch["Batch dispatch"]
    Workers["SP and Ads workers"]
    StatusAPI["Status APIs"]
  end

  subgraph tasks [CloudTasks]
    SPQ[sp-reports-queue]
    AdsQ[ads-reports-queue]
    RetryQ[ads-reports-retry-queue]
  end

  subgraph bq [BigQuery]
    SPData["SP report tables"]
    AdsData["Ads report tables"]
    SPStatus[report_status]
    AdsStatus[ads_report_status]
  end

  SPJobs --> Dispatch
  AdsJob --> Dispatch
  Dispatch --> SPQ
  Dispatch --> AdsQ
  SPQ --> Workers
  AdsQ --> Workers
  RetryQ --> Workers
  Workers --> SPData
  Workers --> AdsData
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

## Live API documentation

The running service exposes interactive OpenAPI docs at `/docs` on the deployed Cloud Run URL. This site covers architecture, operations, and reference material that complements Swagger.

## Related links

- [Getting Started](/getting-started) — local setup and first API calls
- [Pipeline Workflows](/architecture/data-flow) — detailed Mermaid diagrams
- [Batch Scheduling](/pipelines/batch-scheduling) — Cloud Scheduler patterns
- [Deployment](/deployment/) — Cloud Run production setup

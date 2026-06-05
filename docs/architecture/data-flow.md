# Data Flow

Visual workflow diagrams for the **Amazon Ads API** and **SP-API** pipelines. These reflect the current implementation in `app/routes/ads_jobs.py`, `app/routes/jobs.py`, and `app/utils/cloud_tasks.py`.

## Shared architecture

Both pipelines run on the same **Cloud Run** service (`amazon-pipelines`) and share the **Cloud Tasks → worker** pattern, but differ in dispatch triggers and date range resolution.

```mermaid
flowchart TB
    subgraph External["External systems"]
        CS["Cloud Scheduler"]
        ADS["Amazon Ads API"]
        SP["Amazon SP-API"]
    end

    subgraph CloudRun["Cloud Run — amazon-pipelines"]
        AD["POST /ads/dispatch"]
        AW["POST /ads/worker/process"]
        SD["POST /sp/reports/type/process-all-brands"]
        SW["POST /sp/worker/process-report"]
    end

    subgraph Queues["Cloud Tasks queues"]
        AQ["ads-reports-queue"]
        ARQ["ads-reports-retry-queue"]
        SQ["sp-reports-queue"]
    end

    subgraph Storage["BigQuery"]
        ADS_DS["Ads dataset — SP, SB, SD tables"]
        SP_DS["SP dataset — per-brand report tables"]
        ADS_ST["ads_report_status"]
        SP_ST["report_status"]
    end

    CS -->|"Daily ~2 AM"| AD
    CS -->|"Staggered daily — 1 job per report type"| SD

    AD -->|"1 task per account x report_type"| AQ
    AQ --> AW
    AW --> ADS
    AW --> ADS_DS
    AW --> ADS_ST

    SD -->|"1 task per brand with staggered schedule"| SQ
    SQ --> SW
    SW --> SP
    SW --> SP_DS
    SW --> SP_ST
```

## Ads API pipeline

**Primary path:** one Cloud Scheduler job calls `/ads/dispatch`, which fans out to **accounts × 12 report types** as individual Cloud Tasks.

```mermaid
flowchart TD
    Start(["Cloud Scheduler — cron e.g. 0 2 * * *"]) --> Dispatch["POST /api/v1/ads/dispatch"]

    Dispatch --> ResolveA["Resolve accounts — get_available_ads_accounts"]
    Dispatch --> ResolveR["Resolve report types — default: all 12"]

    ResolveA --> Loop["For each account x report_type"]
    ResolveR --> Loop

    Loop --> CreateTask["CloudTasksService.create_ads_report_task"]
    CreateTask --> Queue["ads-reports-queue"]

    Queue --> Worker["POST /api/v1/ads/worker/process"]
    Worker --> Idem{"Completed in last 20 hours?"}
    Idem -->|Yes| Skip["Return skipped"]
    Idem -->|No| Track["Log RUNNING — ads_report_status"]

    Track --> Fetch["AdsReportProcessor.fetch_incremental_load"]
    Fetch --> Upsert["BigQuery MERGE upsert"]
    Upsert --> Done["Log COMPLETED — ads_report_status"]

    Worker -->|Failure| Fail["Log FAILED — Cloud Tasks retries"]
    Fail --> RetryJob["POST /ads/reports/retry-failed"]
    RetryJob --> RetryQ["ads-reports-retry-queue"]
    RetryQ --> Worker
```

### Ads worker detail

```mermaid
flowchart TD
    WStart(["Worker receives task"]) --> Mode{"Date override in payload?"}

    Mode -->|No| Incr["INCREMENTAL mode"]
    Mode -->|Yes| Manual["MANUAL mode"]

    Incr --> BQDate["Query max date from BQ table"]
    BQDate --> Range["start = last_date - 3 days, end = today, cap 31 days"]

    Manual --> Range2["Use provided date range"]
    Range --> Auth["AmazonAdsService — OAuth LWA"]
    Range2 --> Auth

    Auth --> Create["Create async report"]
    Create --> Poll["Poll status ~60s"]
    Poll --> Download["Download GZIP JSON"]
    Download --> Transform["AdsReportProcessor — aggregate + split tables"]
    Transform --> BQUpsert["BigQueryClient.upsert_ads_report_data"]
    BQUpsert --> End(["COMPLETED in ads_report_status"])
```

## SP-API pipeline

**Primary path:** one Cloud Scheduler job **per report type** (7 jobs, staggered) calls `process-all-brands`, which dispatches one Cloud Task per brand.

```mermaid
flowchart TD
    Start(["Cloud Scheduler — staggered 8 AM to 2 PM"]) --> Batch["POST /api/v1/sp/reports/type/process-all-brands?load_last_day=true"]

    Batch --> Validate["Validate report_type_key"]
    Validate --> Accounts["Resolve brands — get_available_accounts"]
    Accounts --> Dispatch["Dispatch Cloud Tasks — staggered spacing"]
    Dispatch --> SQ["sp-reports-queue"]

    SQ --> Worker["POST /api/v1/sp/worker/process-report"]
    Worker --> Dup{"Duplicate recent report?"}
    Dup -->|Yes| Skip["Return skipped"]
    Dup -->|No| Track["Create IN_PROGRESS — report_status"]

    Track --> Pipeline["AmazonSPService.process_and_upsert_report"]
    Pipeline --> Success["DONE + row counts"]
    Pipeline -->|Error| Failed["FAILED + Cloud Tasks retry"]
```

### SP worker detail

```mermaid
flowchart TD
    WStart(["Worker receives task"]) --> Dates{"Date mode"}

    Dates -->|load_last_day| D1["Yesterday only"]
    Dates -->|load_last_three_days| D3["Last 3 days"]
    Dates -->|year + month| DM["Full month backfill"]
    Dates -->|default| DC["Current month to yesterday"]

    D1 --> Fetch["process_date_range_loop"]
    D3 --> Fetch
    DM --> Fetch
    DC --> Fetch

    Fetch --> Create["create_report — SP-API"]
    Create --> Wait["wait_for_report — poll ~20s"]
    Wait --> Download["download_report — parse to DataFrame"]
    Download --> Schema["ReportSchemaConfig — transform"]
    Schema --> BQ["BigQueryClient upsert — staging + MERGE"]
    BQ --> End(["DONE in report_status"])
```

## Sequence — single task lifecycle

```mermaid
sequenceDiagram
    participant Sched as Cloud Scheduler
    participant API as Cloud Run API
    participant CT as Cloud Tasks
    participant Worker as Worker endpoint
    participant Amazon as Amazon API
    participant BQ as BigQuery
    participant Status as Status table

    alt Ads pipeline
        Sched->>API: POST /ads/dispatch
        API->>CT: create task (account, report_type)
        CT->>Worker: POST /ads/worker/process
        Worker->>Status: log RUNNING
        Worker->>BQ: get last date (incremental)
        Worker->>Amazon: create, poll, download report
        Worker->>Worker: transform + aggregate
        Worker->>BQ: MERGE upsert
        Worker->>Status: log COMPLETED
    else SP-API pipeline
        Sched->>API: POST /sp/reports/type/process-all-brands
        API->>CT: create task per brand
        CT->>Worker: POST /sp/worker/process-report
        Worker->>Status: create IN_PROGRESS
        Worker->>Amazon: create, poll, download report
        Worker->>Worker: schema transform + aggregate
        Worker->>BQ: MERGE upsert
        Worker->>Status: update DONE
    end

    Note over CT,Worker: Queue handles rate limits, backoff, and auto-retries
```

## Related pages

- [Architecture Overview](/architecture/)
- [SP Pipeline](/pipelines/sp-pipeline)
- [Ads Pipeline](/pipelines/ads-pipeline)
- [Data Flow & Processing](/pipelines/data-flow-processing)
- [Batch Scheduling](/pipelines/batch-scheduling)

# API Endpoints

**Last updated:** 2026-08-26

Full routing map for the Amazon Pipelines API. All job routes use prefix `/api/v1`.

## Visual overview

```
Amazon Pipelines API  (/api/v1)
│
├── /health, /healthz          GET — health check
│
├── /accounts
│   ├── GET  /accounts                              List SP accounts (no legacy default)
│   ├── GET  /accounts/{account_name}               Account details
│   ├── POST /accounts/{account}/reports/{type}     Single brand, single report (inline)
│   ├── PUT  /accounts/{account}/metadata           Update account metadata
│   ├── PATCH /accounts/{account}/metadata          Partial metadata update
│   └── GET  /report-types                          Available SP report types
│
├── /sp
│   ├── GET  /sp/reports/{report_id}                Check SP report status
│   ├── GET  /sp/reports/{report_id}/download       Download completed report
│   ├── POST /sp/reports/{type}/process-all-brands  Dispatch Cloud Tasks (all brands)
│   ├── POST /sp/dispatch                           Incremental all brands × types
│   ├── POST /sp/dispatch-remaining                 Gap-fill Remaining matrix cells
│   ├── POST /sp/reports/expire-stuck               Expire stuck IN_PROGRESS runs
│   ├── POST /sp/worker/process-report              Cloud Tasks worker (internal)
│   └── POST /sp/brands/{account}/process-all-reports  All reports for one brand
│
├── /ads
│   ├── POST /ads/dispatch                          Daily dispatch (all accounts × types)
│   ├── POST /ads/dispatch-remaining                Gap-fill Remaining matrix cells
│   ├── POST /ads/worker/process                    Cloud Tasks worker — create phase
│   ├── POST /ads/worker/check-report               Cloud Tasks worker — poll phase
│   ├── POST /ads/reports/process                   Inline batch (no queue)
│   ├── POST /ads/reports/retry-failed              Retry failed Ads reports
│   ├── POST /ads/reports/expire-stuck              Expire stuck RUNNING reports
│   ├── POST /ads/reports/{type}/create             Create async Ads report
│   ├── GET  /ads/reports/{report_id}/status        Poll report status
│   ├── GET  /ads/reports/{report_id}/download      Download report data
│   └── GET  /ads/accounts                          List Ads accounts (explicit account required)
│
├── /amc
│   ├── POST /amc/dispatch                          Weekly / manual AMC dispatch
│   ├── POST /amc/worker/process                    Start AMC executions
│   └── POST /amc/worker/check-execution            Async poll / reschedule
│
├── /brand-analytics                                Curated agg_tables_v2 read API
│   ├── GET  /brands, /accounts/{account}/brands, /health
│   └── GET  /{brand}/child-metrics, parent-metrics, sales-distribution,
│            summary, parent/time-series, parent/time-series/asins
│
├── /conversational-analytics                       NL chat over agg tables (SSE)
│   ├── POST /conversations
│   ├── GET  /conversations/{id}
│   └── POST /conversations/{id}/chat               SSE stream
│
├── /listings-health                                Listings Health widgets
│   ├── GET  /brands, /fyp-coverage
│   └── GET  /{brand}/standalone, suppressed, mismatched-attributes
│
├── /report-status                                 SP status dashboard API
│   ├── GET  /recent, /failed, /activity, /statistics, /summary, /health, /matrix
│   └── POST /cleanup-duplicates
│
└── /ads-report-status                             Ads status dashboard API
    └── GET  /recent, /failed, /activity, /statistics, /summary, /health, /matrix
```

Interactive OpenAPI: `/docs` on the running service.

## Decision tree {#decision-tree}

```
What do you want to do?
│
├─ Daily scheduled SP data for all brands?
│  └─ POST /sp/reports/{type}/process-all-brands
│
├─ Incremental catch-up (all brands × types)?
│  └─ POST /sp/dispatch
│
├─ Fill only today’s Remaining SP cells?
│  └─ POST /sp/dispatch-remaining
│
├─ Clear stuck SP In Progress rows?
│  └─ POST /sp/reports/expire-stuck
│
├─ Daily scheduled Ads data for all accounts?
│  └─ POST /ads/dispatch
│
├─ Fill only today’s Remaining Ads cells?
│  └─ POST /ads/dispatch-remaining
│
├─ Weekly AMC Path to Conversion?
│  └─ POST /amc/dispatch
│
├─ Frontend product metrics / overview?
│  └─ GET /brand-analytics/{brand}/…
│
├─ Natural-language analytics chat?
│  └─ POST /conversational-analytics/conversations → …/chat (SSE)
│
├─ Listings Health widgets?
│  └─ GET /listings-health/{brand}/…
│
└─ Monitor pipeline health / coverage?
   └─ GET /report-status/matrix  or  /ads-report-status/matrix
```

## Comparison matrix

| Feature | SP process-all-brands | SP dispatch | SP dispatch-remaining | Ads dispatch |
|---------|----------------------|-------------|----------------------|--------------|
| Multiple brands | Yes | Yes | Remaining cells only | Yes |
| Multiple reports | No (one type) | Yes (all types) | Yes (sparse) | Yes (12 types) |
| Date mode | Scheduler flags | Incremental default | Incremental default | Incremental |
| Best for | Daily Scheduler | Catch-up | Control-panel gap-fill | Daily Scheduler |

## Data flows

### SP batch (recommended)

```
Cloud Scheduler → POST /sp/reports/{type}/process-all-brands
    → Cloud Tasks (sp-reports-queue) — 1 task per brand
    → POST /sp/worker/process-report
    → Amazon SP-API → transform → BigQuery MERGE → report_status
```

### SP incremental catch-up

```
POST /sp/dispatch
    → Cloud Tasks — 1 task per account × report type
    → Worker resolves missing days from MAX(Date) (cap 7)
    → Amazon SP-API → BigQuery MERGE
```

### Ads dispatch (async)

```
Cloud Scheduler → POST /ads/dispatch
    → Cloud Tasks (ads-reports-queue) — 1 task per account × report_type
    → POST /ads/worker/process (create + enqueue check)
    → POST /ads/worker/check-report (poll / backoff / download)
    → BigQuery MERGE → ads_report_status
```

### AMC weekly

```
Cloud Scheduler → POST /amc/dispatch
    → amc-reports-queue → process → check-execution chain
    → amazon_amc_v1.path_to_conversion (+ campaigns table)
```

## Related pages

- [SP Control Panel](/operations/sp-control-panel)
- [Ads Control Panel](/operations/ads-control-panel)
- [Brand Analytics](/reference/brand-analytics)
- [Conversational Analytics](/reference/conversational-analytics)
- [Listings Health](/reference/listings-health)
- [AMC Pipeline](/pipelines/amc-pipeline)
- [Monitoring](/operations/monitoring)

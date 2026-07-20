# API Endpoints

**Last updated:** 2026-07-20

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
│   ├── POST /sp/dispatch-remaining                 Gap-fill Remaining matrix cells
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
│   └── GET  /ads/accounts                          List Ads accounts
│
├── /amc
│   ├── POST /amc/dispatch                          Weekly / manual AMC dispatch
│   ├── POST /amc/worker/process                    Start AMC executions
│   └── POST /amc/worker/check-execution            Async poll / reschedule
│
├── /brand-analytics                                Curated agg_tables_v2 read API
│   ├── GET  /brands, /health
│   └── GET  /{brand}/child-metrics, parent-metrics, time-series, time-series/asins
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
├─ Fill only today’s Remaining SP cells?
│  └─ POST /sp/dispatch-remaining
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
├─ Troubleshoot one SP brand?
│  └─ POST /sp/brands/{account}/process-all-reports
│
├─ Manual one-off SP report?
│  └─ POST /accounts/{account}/reports/{type}
│
├─ Manual Ads batch (no queue)?
│  └─ POST /ads/reports/process
│
├─ Retry failed Ads reports?
│  └─ POST /ads/reports/retry-failed
│
├─ Frontend product metrics?
│  └─ GET /brand-analytics/{brand}/…
│
└─ Monitor pipeline health / coverage?
   └─ GET /report-status/matrix  or  /ads-report-status/matrix
```

## Comparison matrix

| Feature | SP process-all-brands | SP dispatch-remaining | Ads dispatch | Ads dispatch-remaining |
|---------|----------------------|----------------------|--------------|------------------------|
| Multiple brands | Yes | Remaining cells only | Yes | Remaining cells only |
| Multiple reports | No (one type) | Yes (sparse) | Yes (12 types) | Yes (sparse) |
| Uses Cloud Tasks | Yes | Yes | Yes | Yes |
| Best for scheduling | Yes | Control-panel gap-fill | Yes | Control-panel gap-fill |
| Re-queues Accomplished | Can | No | Worker skip | No |

## Data flows

### SP batch (recommended)

```
Cloud Scheduler → POST /sp/reports/{type}/process-all-brands
    → Cloud Tasks (sp-reports-queue) — 1 task per brand
    → POST /sp/worker/process-report
    → Amazon SP-API → transform → BigQuery MERGE → report_status
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
- [AMC Pipeline](/pipelines/amc-pipeline)
- [Monitoring](/operations/monitoring)

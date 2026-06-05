# API Endpoints

Full routing map for the Amazon Pipelines API. All job routes use prefix `/api/v1`.

## Visual overview

```
Amazon Pipelines API  (/api/v1)
│
├── /health, /healthz          GET — health check
│
├── /accounts
│   ├── GET  /accounts                              List SP accounts
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
│   ├── POST /sp/worker/process-report              Cloud Tasks worker (internal)
│   └── POST /sp/brands/{account}/process-all-reports  All reports for one brand
│
├── /ads
│   ├── POST /ads/dispatch                          Daily dispatch (all accounts × types)
│   ├── POST /ads/worker/process                    Cloud Tasks worker (internal)
│   ├── POST /ads/reports/process                   Inline batch (no queue)
│   ├── POST /ads/reports/retry-failed              Retry failed Ads reports
│   ├── POST /ads/reports/expire-stuck              Expire stuck RUNNING reports
│   ├── POST /ads/reports/{type}/create             Create async Ads report
│   ├── GET  /ads/reports/{report_id}/status        Poll report status
│   ├── GET  /ads/reports/{report_id}/download      Download report data
│   └── GET  /ads/accounts                          List Ads accounts
│
├── /report-status                                 SP status dashboard API
│   ├── GET  /recent, /failed, /activity, /statistics, /summary, /health
│   └── POST /cleanup-duplicates
│
└── /ads-report-status                             Ads status dashboard API
    └── GET  /recent, /failed, /activity, /statistics, /summary, /health
```

Interactive OpenAPI: `/docs` on the running service.

## Decision tree {#decision-tree}

```
What do you want to do?
│
├─ Daily scheduled SP data for all brands?
│  └─ POST /sp/reports/{type}/process-all-brands
│
├─ Daily scheduled Ads data for all accounts?
│  └─ POST /ads/dispatch
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
└─ Monitor pipeline health?
   └─ GET /report-status/summary  or  /ads-report-status/summary
```

## Comparison matrix

| Feature | SP process-all-brands | SP account endpoint | Ads dispatch | Ads inline process |
|---------|----------------------|---------------------|--------------|-------------------|
| Multiple brands | Yes | No | Yes | Optional filter |
| Multiple reports | No | No | Yes (12 types) | Optional filter |
| Uses Cloud Tasks | Yes | No | Yes | No |
| Best for scheduling | Yes | No | Yes | Manual/backfill |
| Error isolation | Per brand | N/A | Per account×type | Per combination |

## Data flows

### SP batch (recommended)

```
Cloud Scheduler → POST /sp/reports/{type}/process-all-brands
    → Cloud Tasks (sp-reports-queue) — 1 task per brand
    → POST /sp/worker/process-report
    → Amazon SP-API → transform → BigQuery MERGE → report_status
```

### Ads dispatch

```
Cloud Scheduler → POST /ads/dispatch
    → Cloud Tasks (ads-reports-queue) — 1 task per account × report_type
    → POST /ads/worker/process
    → Amazon Ads API → transform → BigQuery MERGE → ads_report_status
```

## Removed legacy endpoints

These no longer exist:

- `POST /sp/reports/trigger`
- `POST /sp/reports/process`
- `POST /jobs/sp/reports/loader`
- `POST /ads/sp/campaigns/process` (and similar per-report routes)

See [Legacy Migration](/reference/migration-legacy).

## Related pages

- [Monitoring API details](/operations/monitoring)
- [Batch Scheduling](/pipelines/batch-scheduling)
- [SP Report Types](/reference/sp-report-types)
- [Ads Report Types](/reference/ads-report-types)

# Developer Guide

Resources for engineers extending, testing, and maintaining the Amazon Pipelines codebase.

## Quick links

| Topic | Page |
|-------|------|
| Local setup | [Local Development](/developer/local-development) |
| Running tests | [Testing](/developer/testing) |
| Adding SP reports | [Adding an SP Report](/developer/adding-sp-report) |
| Design decisions | [Design Decisions](/developer/design-decisions/) |
| API reference | [Endpoints](/reference/endpoints) |
| Environment config | [Environment Variables](/reference/environment-variables) |

## Repository structure

```
amazon-pipelines/
├── app/
│   ├── main.py              # FastAPI app, router registration
│   ├── config.py            # Settings, AccountConfig, brand lists
│   ├── routes/              # 7 route modules
│   ├── services/sp/         # SP API, BQ, status, metadata
│   ├── services/ads/        # Ads API, processor, tracker
│   ├── schemas/sp/          # SP report schemas + registry
│   ├── schemas/ads/         # Ads report schemas
│   └── utils/               # auth, cloud_tasks, cache, logger
├── scripts/                 # Operational CLI tools
├── tests/                   # pytest tests
├── design-log/              # Architecture decision records
├── cloudbuild.yaml          # Cloud Build deploy config
└── Dockerfile
```

## Key patterns

- **Async workers:** Cloud Tasks POST to worker endpoints with JSON payloads
- **Schema-driven upserts:** Each report type defines BQ schema + merge keys
- **Singleton services:** `get_tracker()`, `get_ads_tracker()`, `get_metadata_service()`, `get_bq_client()`
- **Idempotency:** SP skips duplicate date ranges; Ads skips COMPLETED within 20 h
- **Status tracking:** Every pipeline run writes to BigQuery status tables

## OpenAPI

Run locally and visit http://localhost:8080/docs for interactive API exploration.

## Related pages

- [Getting Started](/getting-started)
- [Architecture](/architecture/)
- [SP Schemas](/reference/sp-schemas)

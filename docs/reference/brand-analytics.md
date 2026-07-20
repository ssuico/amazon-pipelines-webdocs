# Brand Analytics API

**Last updated:** 2026-07-20

Curated per-brand product metrics from `agg_tables_v2` for the frontend analytics dashboard. This is a **read API** over aggregated BigQuery tables — not a report-ingestion pipeline.

Base path: `/api/v1/brand-analytics`  
Implementation: `app/routes/brand_analytics.py`, `app/services/analytics/brand_agg_service.py`

## Dataset

| Env var | Default |
|---------|---------|
| `BIGQUERY_AGG_DATASET` | `agg_tables_v2` |

Full dataset ID: `{GCP_PROJECT_ID}.{BIGQUERY_AGG_DATASET}`

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/brand-analytics/brands` | Brand identifiers (SP + Ads whitelist); cached 10 min |
| `GET` | `/brand-analytics/{brand}/child-metrics` | Paginated child-SKU metrics |
| `GET` | `/brand-analytics/{brand}/parent-metrics` | Paginated parent-ASIN metrics |
| `GET` | `/brand-analytics/{brand}/time-series` | Daily rows (all table columns) |
| `GET` | `/brand-analytics/{brand}/time-series/asins` | Distinct ASIN picker options |
| `GET` | `/brand-analytics/health` | Dataset connectivity check |

### Shared query params (metrics)

| Param | Default | Notes |
|-------|---------|-------|
| `window` | `90` | Only `90` available today |
| `page` | `1` | Ignored when `asin` is set on time-series |
| `page_size` | `100` | Allowed: 10, 30, 50, 100, 200, 500, 1000 |
| `search` | — | Substring filter on ASIN / parentAsin |

### Time-series ASIN detail

```bash
# 1. Populate picker
curl "http://localhost:8080/api/v1/brand-analytics/Vertx/time-series/asins?search=B0G&limit=20"

# 2. Full daily history for one ASIN (oldest → newest; pagination ignored)
curl "http://localhost:8080/api/v1/brand-analytics/Vertx/time-series?asin=B0G7LWPJMT"
```

When `asin` is set, the API returns every daily row for that product with `available_columns` listing the full table schema (~77 columns).

## Errors

| Status | Condition |
|--------|-----------|
| `404` | Unknown brand, or brand has no `{window}` metrics table yet |
| `422` | Invalid `window` / `page_size` |
| `500` | BigQuery / query failure |

## Known limitations

- Only `window=90` tables exist in `agg_tables_v2` today.
- Not every brand from `/brands` has agg tables onboarded yet (querying returns `404`).
- `computed_metrics` is always `{}` (reserved for future derived metrics).
- `/time-series/asins` is `limit`-capped (default 100), not paginated — use `search` with typeahead.

## Related pages

- [BigQuery & Datasets](/reference/bigquery)
- [API Endpoints](/reference/endpoints)
- Source design logs in `amazon-pipelines/design-log/2026-07-02-*` through `2026-07-09-*`

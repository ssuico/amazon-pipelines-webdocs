# Brand Analytics API

**Last updated:** 2026-08-26

Curated per-brand product metrics from `agg_tables_v2` for the frontend analytics dashboard. This is a **read API** over aggregated BigQuery tables — not a report-ingestion pipeline.

Base path: `/api/v1/brand-analytics`  
Implementation: `app/routes/brand_analytics.py`, `app/services/analytics/brand_agg_service.py`

## Dataset

| Env var | Default |
|---------|---------|
| `BIGQUERY_AGG_DATASET` | `agg_tables_v2` |

## Date window (all metrics endpoints)

Inclusive UTC calendar range on window-sensitive endpoints:

| Param | Required | Notes |
|-------|----------|-------|
| `start_date` | with `end_date` | `YYYY-MM-DD` |
| `end_date` | with `start_date` | `YYYY-MM-DD` |
| `window` | no | Trailing N days (`1–90`) ending on the brand’s latest available day. Default `90` when omitted and no dates are set |

**Precedence:** both dates → else `window` → else default `90`.  
**Validation (`400`):** only one of the date pair; `start_date > end_date`; span > 90 inclusive days.  
Ranges outside available data are clamped; no overlap → `200` with empty results and `window: 0`.

Responses echo `window`, `start_date`, `end_date`, `available_start_date`, `available_end_date`.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/brand-analytics/brands` | Brand list: AccountConfig ∪ BQ-discovered complete `_90` trios (includes OE sub-brands) |
| `GET` | `/brand-analytics/accounts/{account}/brands` | Sub-brands for multi-brand parents (currently `OE` → e.g. Danner, Thorogood) |
| `GET` | `/brand-analytics/{brand}/child-metrics` | Paginated child-SKU metrics (all source columns) |
| `GET` | `/brand-analytics/{brand}/parent-metrics` | Paginated parent-ASIN metrics (all source columns) |
| `GET` | `/brand-analytics/{brand}/sales-distribution` | Parent/standalone sales mix + concentration for Brand Overview |
| `GET` | `/brand-analytics/{brand}/summary` | Brand-wide daily KPI summary (one row per day) |
| `GET` | `/brand-analytics/{brand}/parent/time-series` | Daily parent-grain time series (replaces child `/time-series`) |
| `GET` | `/brand-analytics/{brand}/parent/time-series/asins` | Parent ASIN picker (sales-ranked) |
| `GET` | `/brand-analytics/health` | Dataset connectivity |

### Child / parent metrics

- Return **every** source-table column under exact BigQuery names; `available_columns` lists schema order.
- Prefer `total_sales_90d`, `spend_90d`, etc. for 90-day rollups (legacy short aliases are obsolete).
- Shared params: date window, `page`, `page_size` (10…1000), `search` on ASIN / parentAsin.

### Sales distribution

Chart-ready ranked parents/standalones. `totalSales` is **catalog** ordered-product sales (not ads sales). `concentration` is over the full population; `limit` only truncates `items`.

### Summary

One pre-aggregated row per calendar day for Overview KPI cards / Daily Signals. Includes page-view channel fields and parent/child/standalone catalog counts where available.

### Parent time-series

```bash
# Picker (sales-ranked)
curl "http://localhost:8080/api/v1/brand-analytics/Vertx/parent/time-series/asins?search=B0G&limit=20"

# Full daily history for one parent ASIN
curl "http://localhost:8080/api/v1/brand-analytics/Vertx/parent/time-series?asin=B0G7LWPJMT"
```

The former child `/time-series` and `/time-series/asins` routes are replaced by these parent-grain endpoints.

## Errors

| Status | Condition |
|--------|-----------|
| `400` | Invalid date window |
| `404` | Unknown brand, or no metrics tables yet |
| `422` | Invalid `page_size` / enum |
| `500` | BigQuery / query failure |

## Known limitations

- Source tables remain the `_90` trio per brand; `window`/`start_date` roll up within available data.
- Not every AccountConfig brand has agg tables; OE sub-brands appear via BQ discovery without per-label SP creds.
- `computed_metrics` remains `{}` (reserved).

## Related pages

- [Conversational Analytics](/reference/conversational-analytics)
- [Listings Health](/reference/listings-health)
- [BigQuery & Datasets](/reference/bigquery)
- [API Endpoints](/reference/endpoints)

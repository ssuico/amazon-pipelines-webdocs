# Brand Analytics API

**Last updated:** 2026-11-05

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

`GET /{brand}/path-to-conversion` is the latest AMC snapshot only (not windowed). Order-geo **is** windowed.

## Ad attribution (7-day)

Ad-attributed metrics use a **7-day** click window. Responses echo `ad_attribution_window: "7d"` and `ad_attribution_mature_through` (`available_end_date` minus 6 days). Days after that date are still accumulating. See [7-Day Ad Attribution](/developer/design-decisions/ad-attribution-7d).

Affected: `ACoS`, `CtO`, `AOV` / `VpO`, `ad_sales_90d`, `ad_units_90d`, `ad_conversions_90d`, and the matching moving-average ids. Catalog metrics (`total_sales_90d`, sessions, Buy Box, inventory) are not ad-attributed. `TACoS`, `TACoS_RA`, and `CPC` are not attribution-windowed, but a 2P `/summary` feeds them from all-ads spend and clicks.

`total_sales_7d` is ad sales at 7-day **attribution**. `total_sales_90d` is catalog sales over the reporting **window**. Bare `total_sales` still means the 1-day value where it is projected — prefer `ad_sales_7d`.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/brand-analytics/brands` | AccountConfig ∪ complete `_90` trios |
| `GET` | `/brand-analytics/accounts/{account}/brands` | Sub-brands for `OE`, `Redfield`, `Hybrids` |
| `GET` | `/brand-analytics/{brand}/child-metrics` | Paginated child-SKU metrics |
| `GET` | `/brand-analytics/{brand}/parent-metrics` | Paginated parent-ASIN metrics |
| `GET` | `/brand-analytics/{brand}/sales-distribution` | Parent/standalone sales mix |
| `GET` | `/brand-analytics/{brand}/summary` | Brand-wide daily KPIs |
| `GET` | `/brand-analytics/{brand}/order-geo` | Brand order geography |
| `GET` | `/brand-analytics/{brand}/order-geo/time-series` | Daily brand geography for CSV export |
| `GET` | `/brand-analytics/{brand}/parent/order-geo` | Parent ASIN geography (`parentAsin`) |
| `GET` | `/brand-analytics/{brand}/parent/order-geo/time-series` | Daily parent geography |
| `GET` | `/brand-analytics/{brand}/child/order-geo` | Child ASIN geography (`asin`) |
| `GET` | `/brand-analytics/{brand}/child/order-geo/time-series` | Daily child geography |
| `GET` | `/brand-analytics/{brand}/parent/time-series` | Daily parent-grain series |
| `GET` | `/brand-analytics/{brand}/parent/time-series/asins` | Parent ASIN picker |
| `GET` | `/brand-analytics/{brand}/child/time-series` | Daily series for one child ASIN |
| `GET` | `/brand-analytics/{brand}/parent/sp-target-performance` | SP target rollup (optional `parentAsin`) |
| `GET` | `/brand-analytics/{brand}/path-to-conversion` | Latest AMC path-to-conversion snapshot |
| `GET` | `/brand-analytics/health` | Dataset connectivity |

### Child / parent metrics

- Return **every** source-table column under exact BigQuery names; `available_columns` lists schema order.
- Prefer `total_sales_90d`, `spend_90d`, etc. for 90-day rollups (legacy short aliases are obsolete).
- Shared params: date window, `page`, `page_size` (10…1000), `search` on ASIN / parentAsin.

### Sales distribution

Chart-ready ranked parents/standalones. `totalSales` is **catalog** ordered-product sales (not ads sales). `concentration` is over the full population; `limit` only truncates `items`.

### Summary

One row per calendar day for Overview KPI cards. Dedicated 2P brands with `{prefix}_all_ads_daily_90` overwrite spend, 7-day ad sales/units, and clicks from SP+SB+SD. OE sub-brands stay Sponsored Products. Summary also exposes returns-adjusted sales / `TACoS_RA` where `return_sales_value` exists. Hybrids rows may null columns the narrow source tables do not have.

Optional `ma_windows` (for example `7,14,30`, at most five integers from 2–90) and `ma_metrics` add `{id}_ma_{N}d` on `/summary`, `/parent/time-series`, and `/child/time-series`. Rates are ratio-of-sums, not an average of daily rates.

### Brands and hybrids

Multi-brand parents: **OE** (`oe_*`), **Redfield** (`redfield_*`), **Hybrids** (`hybrid_*`, not `hybrids_*`). A dedicated 2P prefix owns the short name (`Vertx` → `vertx`). A colliding OE twin uses a qualified id (`OE Vertx` → `oe_vertx`). `Tru-Spec` matches `TruSpec`. Sub-brand labels drop the parent prefix when they do not collide.

### Order geography

Default grain is US state, canonicalized from ZIP. `grain=postal` returns ZIP rows. Brand, parent (`parentAsin` required), and child (`asin` required) share the date window. `/order-geo/time-series` (and the parent/child variants) return daily rows for CSV export.

### Parent time-series and child time-series

```bash
curl "http://localhost:8080/api/v1/brand-analytics/Vertx/parent/time-series/asins?search=B0G&limit=20"
curl "http://localhost:8080/api/v1/brand-analytics/Vertx/parent/time-series?parentAsin=B0G7LWPJMT&ma_windows=7,14,30"
curl "http://localhost:8080/api/v1/brand-analytics/Vertx/child/time-series?asin=B0FYH5RBGV"
```

Parent grain stays the Overview chart. `child/time-series` is one child ASIN (`asin` required), not the old unfiltered child route.

### SP targets and path to conversion

`parent/sp-target-performance` rolls up Sponsored Products targets. Omit `parentAsin` for a brand-wide rollup. `path-to-conversion` reads the latest AMC snapshot in `amazon_amc_v1` (not the date window).

## Errors

| Status | Condition |
|--------|-----------|
| `400` | Invalid date window |
| `404` | Unknown brand, or no metrics tables yet |
| `422` | Invalid `page_size` / enum |
| `500` | BigQuery / query failure |

## Known limitations

- Source tables remain the `_90` trio per brand; `window`/`start_date` roll up within available data.
- Not every AccountConfig brand has agg tables; multi-brand sub-brands appear via BQ discovery.
- Hybrids time-series is narrower than a full 2P trio; missing columns are null.
- `computed_metrics` remains `{}` (reserved).

## Related pages

- [Conversational Analytics](/reference/conversational-analytics)
- [Listings Health](/reference/listings-health)
- [BigQuery & Datasets](/reference/bigquery)
- [API Endpoints](/reference/endpoints)

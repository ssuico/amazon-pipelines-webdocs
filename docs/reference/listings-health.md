# Listings Health API

**Last updated:** 2026-08-26

Read API powering Obseron Listings Health widgets (Vertx-first 2P brands). Combines `agg_tables_v2` child/parent metrics with the latest `{Brand}_merchants_listings_fyp` snapshot.

Base path: `/api/v1/listings-health`  
Implementation: `app/routes/listings_health.py`, `app/services/analytics/listings_health_service.py`

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/listings-health/brands` | 2P brands with agg child metrics tables |
| `GET` | `/listings-health/fyp-coverage` | FYP table coverage / freshness diagnostics |
| `GET` | `/listings-health/{brand}/standalone` | Child ASINs with null/blank `parentAsin` |
| `GET` | `/listings-health/{brand}/suppressed` | Latest FYP suppressed listings + agg context |
| `GET` | `/listings-health/{brand}/mismatched-attributes` | Sibling scalar-attribute outliers within parents |

### Shared filters (table endpoints)

Typical query params include minimum 90d parent sales, minimum inventory, listing type (active/inactive), and search. Mismatch widget adds include-formatting and semantic/formatting type filters.

Business context (90d sales, inventory) comes from `{prefix}_child_prod_metrics_90` and `{prefix}_parent_prod_metrics_90`.

## Operational notes

- Several 2P brands still lack fresh FYP coverage; ingestion is via SP `merchants_listings_fyp` / `process-all-brands` — backfill as needed.
- Mismatch detection uses scalar fields available in child metrics today; Catalog Items API attributes would improve accuracy later.

## Related pages

- [Brand Analytics](/reference/brand-analytics)
- [SP Report Types](/reference/sp-report-types) — `merchants_listings_fyp`
- [API Endpoints](/reference/endpoints)

Original design: `amazon-pipelines/design-log/2026-08-23-listings-health-widgets.md`

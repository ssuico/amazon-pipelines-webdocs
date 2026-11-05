# Listings Health API

**Last updated:** 2026-11-05

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
| `GET` | `/listings-health/{brand}/mismatched-attributes` | Sibling scalar and title-consensus outliers |
| `POST` | `/listings-health/{brand}/mismatched-attributes/dismiss` | Hide one mismatch for the team |
| `POST` | `/listings-health/{brand}/mismatched-attributes/undismiss` | Restore a dismissed row |
| `GET` | `/listings-health/{brand}/variation-family` | Child ASINs under `parent_asin` |

### Shared filters (table endpoints)

Typical query params include minimum 90d parent sales, minimum inventory, listing type (active/inactive), and search. Mismatch adds selectable attributes, include-formatting, and `include_dismissed`. Default tables omit dismissed rows.

Business context (90d sales, inventory) comes from `{prefix}_child_prod_metrics_90` and `{prefix}_parent_prod_metrics_90`. Parent listings are excluded from sibling comparison. Studebaker is on the 2P allowlist.

## Operational notes

- Suppressed listings use the latest FYP row recorded in `report_status`, not an older snapshot that happens to sit in the table.
- Several 2P brands still lack fresh FYP coverage; ingestion is via SP `merchants_listings_fyp` / `process-all-brands`.
- Dismissals are team-wide until undismissed or the listing fingerprint changes.

## Related pages

- [Brand Analytics](/reference/brand-analytics)
- [SP Report Types](/reference/sp-report-types) — `merchants_listings_fyp`
- [API Endpoints](/reference/endpoints)

Original design: `amazon-pipelines/design-log/2026-08-23-listings-health-widgets.md`

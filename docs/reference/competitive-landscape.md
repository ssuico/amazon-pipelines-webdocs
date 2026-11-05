# Competitive Landscape and Featured Offer

**Last updated:** 2026-11-05

Two related surfaces: a read API over competitive-landscape tables, and an hourly Product Pricing poll that appends Featured Offer snapshots.

## Competitive Landscape (read)

Base path: `/api/v1/competitive-landscape`  
Implementation: `app/routes/competitive_landscape.py`

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/competitive-landscape/asins` | One row per monitored child ASIN (`brand_key` optional, e.g. `oe_frye`), sales-ranked |
| `GET` | `/competitive-landscape/asins/{asin}` | Ownership / detail for one ASIN |

## Featured Offer polling

`POST /api/v1/pricing/competitive-summary/run` reads active rows from `product_pricing_v1.competitive_summary_targets` and appends one snapshot per ASIN to `competitive_summary_snapshots` (created on first run). `GET .../targets` lists the target set.

Inline hourly job (no Cloud Tasks fan-out). Pace with `PRICING_MIN_REQUEST_INTERVAL_SECONDS` (default 0.7s). Connection `oe_primary_spapi` uses OE SP credentials. Scheduler (manual after deploy): hourly `POST` to `/api/v1/pricing/competitive-summary/run`.

`dry_run=true` previews without appending. There is no historical backfill.

## Related pages

- [MCP Server](/reference/mcp)
- [BigQuery & Datasets](/reference/bigquery)

Original: `amazon-pipelines/design-log/2026-09-20-competitive-summary-hourly.md`, `2026-09-23-mcp-pricing-competitive-landscape.md`

# Vendor Central Pipeline

**Last updated:** 2026-11-05

1P Vendor Retail Analytics, separate from Seller Central SP reports. Lenox is the first account. See [Vendor Retail Analytics](/developer/design-decisions/vendor-retail-analytics).

Dataset: `BIGQUERY_VENDOR_DATASET` (default `amz_sp_vendor_reports`).  
Implementation: `app/routes/vendor_jobs.py`, `app/routes/vendor_report_status.py`

## Reports

| Key | SP-API report | Grain |
|-----|---------------|-------|
| `sales_manufacturing` | `GET_VENDOR_SALES_REPORT` | ASIN × day, manufacturing |
| `sales_sourcing` | `GET_VENDOR_SALES_REPORT` | ASIN × day, sourcing |
| `traffic` | `GET_VENDOR_TRAFFIC_REPORT` | ASIN × day |
| `inventory_manufacturing` | `GET_VENDOR_INVENTORY_REPORT` | ASIN × day, manufacturing |
| `inventory_sourcing` | `GET_VENDOR_INVENTORY_REPORT` | ASIN × day, sourcing |
| `forecasting` | `GET_VENDOR_FORECASTING_REPORT` | ASIN × forecast week |

Tables: `{Brand}_{key}` (example `Lenox_sales_manufacturing`). Sales and inventory use `sellingProgram=RETAIL`. Forecasting reloads the latest retail forecast and ignores the date window. Status rows are `amz_sp_vendor_reports.report_status`.

## Credentials

Research-app LWA client plus a Vendor Central refresh token (`LENOX_SP_REFRESH_TOKEN`). Brands are listed in `VENDOR_BRAND_TOKENS` and are **not** returned by seller `GET /accounts`. Confirm with `GET /api/v1/vendor/accounts`.

## Dispatch

```bash
curl -X POST "http://localhost:8080/api/v1/vendor/dispatch?dry_run=true"
curl -X POST "http://localhost:8080/api/v1/vendor/dispatch"
curl -X POST "http://localhost:8080/api/v1/vendor/dispatch-remaining?include_failed=true"
curl "http://localhost:8080/api/v1/vendor-report-status/matrix"
```

One Cloud Task per account × report on `sp-reports-queue`. Worker: `POST /api/v1/vendor/worker/process-report`.

Daily reports are incremental from `MAX(Date)` through `today - VENDOR_DATA_LAG_DAYS` (default **4**). Amazon returns FATAL if a daily period is requested inside the ~72 hour publish lag. A single DAY request covers at most 15 days. Default incremental cap is 7 days.

Seven-day backfill script: `scripts/backfill_vendor_7day.py`.

## Related pages

- [API Endpoints](/reference/endpoints)
- [Credentials](/onboarding/credentials)
- [BigQuery & Datasets](/reference/bigquery)

Original: `amazon-pipelines/docs/VENDOR_REPORTS.md`

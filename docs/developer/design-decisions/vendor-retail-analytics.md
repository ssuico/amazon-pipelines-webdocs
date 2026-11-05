# Vendor Central Retail Analytics

**Date:** 2026-10-22 · **Status:** Accepted

## Context

Lenox is a Vendor Central (1P) account. Seller report types and `GET /accounts` do not apply. A Research-app refresh token can create Vendor Retail Analytics reports.

## Decision

1. Dataset `amz_sp_vendor_reports`. Tables `{Brand}_{report}` (Lenox first). Status rows live in that dataset’s `report_status`, not the seller tracker.
2. Keep vendor brands off seller `get_available_accounts()`. Register via `VENDOR_BRAND_TOKENS`.
3. Daily reports use `reportPeriod=DAY` and `sellingProgram=RETAIL`. Incremental end date is `today - VENDOR_DATA_LAG_DAYS` (default 4). Forecasting ignores the date window.
4. `POST /vendor/dispatch` and `dispatch-remaining` mirror SP and use `sp-reports-queue` with a vendor worker URL.

## Related pages

- [Vendor Pipeline](/pipelines/vendor-pipeline)

Original: `amazon-pipelines/design-log/2026-10-22-vendor-retail-analytics.md`

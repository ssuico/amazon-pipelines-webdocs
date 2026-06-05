# Operational Scripts

CLI tools in `amazon-pipelines/scripts/` for maintenance, backfill, and recovery.

## retry_failed_ads_reports.py

Retry failed Ads report jobs by querying `ads_report_status` in BigQuery.

```bash
python scripts/retry_failed_ads_reports.py
python scripts/retry_failed_ads_reports.py --dry-run
python scripts/retry_failed_ads_reports.py --accounts-filter Bumbleride
```

Uses the service layer directly (not Cloud Tasks). Alternative to `POST /api/v1/ads/reports/retry-failed`.

## backfill_30day_data.py

Resumable 30-day SP backfill for 2P brands via the account report endpoint.

```bash
python scripts/backfill_30day_data.py
```

Uses `ProgressStore` for resumability. Targets brands in `BRANDS_2P` and all `REPORT_TYPES`.

## create_account_details_table.py

Create and optionally seed the `account_details` BigQuery table for UI metadata.

```bash
python scripts/create_account_details_table.py
python scripts/create_account_details_table.py --seed
```

Uses `AccountMetadataService` from `app/services/sp/account_metadata_service.py`.

## migrate_ads_tables.py

Create or verify Ads BigQuery tables.

```bash
python scripts/migrate_ads_tables.py --account OE
python scripts/migrate_ads_tables.py --verify-only
python scripts/migrate_ads_tables.py --dataset amz_ads_api_reports_v1
```

Note: this script may use a legacy `{account}_` table prefix pattern. Runtime upserts use unprefixed names. See [BigQuery & Datasets](/reference/bigquery).

## Related pages

- [Failed Reports](/operations/failed-reports)
- [Operations Runbook](/operations/)
- [Brand Onboarding](/onboarding/brand-onboarding)

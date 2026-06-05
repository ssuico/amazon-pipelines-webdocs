# Data Flow & Processing

This page describes what happens inside pipeline workers after Cloud Tasks delivers a task.

## SP worker processing

Endpoint: `POST /api/v1/sp/worker/process-report`

### Steps

1. **Parse task payload** — `account_name`, `report_type_key`, date flags
2. **Resolve credentials** — `AccountConfig.get_account_credentials(account_name)`
3. **Idempotency check** — skip if duplicate recent report exists for date range
4. **Create status row** — `IN_PROGRESS` in `report_status`
5. **Date range loop** — `process_date_range_loop()` iterates days
6. For each day:
   - `create_report` → SP-API
   - `wait_for_report` → poll every ~20 s (max ~1700 s)
   - `download_report` → parse to DataFrame
   - Schema transform — `rename_columns()` + `aggregate_data()`
   - BigQuery upsert — load staging table → MERGE on merge columns
7. **Update status** — `DONE` with row counts, or `FAILED` with error message

### Empty data handling

If the downloaded report contains no rows, the worker logs `DONE — no_data` without failing.

## Ads worker processing

Endpoint: `POST /api/v1/ads/worker/process`

### Steps

1. **Parse task payload** — `account_name`, `report_type`, optional date override
2. **Idempotency check** — `AdsReportTracker.has_completed_recently()` (20 h window)
3. **Log RUNNING** — write to `ads_report_status`
4. **Resolve date range:**
   - Incremental: `AdsReportProcessor.fetch_incremental_load()` queries BQ max date
   - Manual: use `start_date` / `end_date` from payload
5. **Fetch report** — `AmazonAdsService.fetch_full_report()`
6. **Transform** — `AdsReportProcessor` methods per report type (e.g. `process_sp_campaign_report`)
7. **Split tables** — some report types produce multiple DataFrames (campaign + adgroup, campaign + timeseries)
8. **Upsert each table** — `BigQueryClient.upsert_ads_report_data()` with schema-specific merge keys
9. **Log COMPLETED** — update `ads_report_status` with row counts

## BigQuery upsert pattern

Both pipelines use the same MERGE strategy:

```
1. Convert DataFrame types to match BigQuery schema
2. Load DataFrame into a temporary staging table
3. MERGE staging → target ON merge_columns
   - WHEN MATCHED → UPDATE all non-key columns
   - WHEN NOT MATCHED → INSERT
4. Drop staging table
```

SP tables use account prefix: `{AccountName}_{table_name}` (e.g. `Bumbleride_orders`).

Ads tables use unprefixed names at runtime: `SP_campaign_table`, `SB_targeting_table`, etc.

Implementation: `app/services/sp/bigquery_client.py`

## Schema transformation (SP)

Each SP report type defines in its schema module:

- **`bq_schema`** — BigQuery field definitions
- **`column_mappings`** — rename source columns to target names
- **`merge_columns`** — unique keys for MERGE (also in `AccountConfig.MERGE_COLUMNS`)
- **`aggregations`** — rules for deduplicating rows (sum, first, etc.)

Registry: `app/schemas/sp/report_registry.py`

## Schema transformation (Ads)

Each Ads report type has schema classes in `app/schemas/ads/reports/` defining:

- `SCHEMA` or `BIGQUERY_SCHEMA` — field definitions
- `GROUPING` or `MERGE_COLUMNS` — merge keys

Mapping from report type to tables: `REPORT_UPSERT_MAP` in `app/routes/ads_jobs.py`

## Status tracking

| Pipeline | Tracker | Status values |
|----------|---------|---------------|
| SP | `ReportStatusTracker` | `IN_PROGRESS`, `DONE`, `FAILED`, `FATAL`, `CANCELLED` |
| Ads | `AdsReportTracker` | `RUNNING`, `COMPLETED`, `FAILED`, `skipped` |

Status rows include: account, report type, date range, row counts, duration, error message, timestamps.

## Related pages

- [Data Flow Diagrams](/architecture/data-flow)
- [BigQuery & Datasets](/reference/bigquery)
- [SP Schemas](/reference/sp-schemas)
- [Ads Report Types](/reference/ads-report-types)
- [SP Status Tracker Internals](/troubleshooting/sp-status-tracker)

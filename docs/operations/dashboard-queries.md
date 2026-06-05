# Dashboard SQL Queries

Ready-made BigQuery queries for pipeline monitoring dashboards. Source: `amazon-pipelines/docs/DASHBOARD_QUERIES.sql`.

Replace `{project}` and `{dataset}` with your values (default: `research-analytics-v1.amz_sp_api_reports_v1`).

## Recent activity (deduplicated)

```sql
WITH ranked AS (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY account_name, report_type_key, start_date, end_date
      ORDER BY request_timestamp DESC
    ) AS row_num
  FROM `{project}.{dataset}.report_status`
  WHERE request_timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
)
SELECT * FROM ranked WHERE row_num = 1
ORDER BY request_timestamp DESC
LIMIT 50;
```

## Failed reports summary

```sql
SELECT
  account_name,
  report_type_key,
  status,
  error_message,
  start_date,
  end_date,
  request_timestamp
FROM `{project}.{dataset}.report_status`
WHERE status IN ('FAILED', 'FATAL', 'CANCELLED')
  AND request_timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY)
ORDER BY request_timestamp DESC;
```

## Success rate by report type (7 days)

```sql
SELECT
  report_type_key,
  COUNT(*) AS total_runs,
  COUNTIF(status = 'DONE') AS successful,
  COUNTIF(status IN ('FAILED', 'FATAL', 'CANCELLED')) AS failed,
  ROUND(COUNTIF(status = 'DONE') / COUNT(*) * 100, 1) AS success_rate_pct
FROM `{project}.{dataset}.report_status`
WHERE request_timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
GROUP BY report_type_key
ORDER BY report_type_key;
```

## Account health summary

```sql
SELECT
  account_name,
  COUNT(DISTINCT report_type_key) AS report_types_run,
  MAX(request_timestamp) AS last_run,
  COUNTIF(status IN ('FAILED', 'FATAL', 'CANCELLED')) AS failures_7d
FROM `{project}.{dataset}.report_status`
WHERE request_timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
GROUP BY account_name
ORDER BY failures_7d DESC, account_name;
```

## Cleanup duplicates (dry run)

```sql
SELECT COUNT(*) AS duplicate_rows
FROM (
  SELECT
    ROW_NUMBER() OVER (
      PARTITION BY account_name, report_type_key, start_date, end_date
      ORDER BY request_timestamp DESC
    ) AS row_num
  FROM `{project}.{dataset}.report_status`
)
WHERE row_num > 1;
```

## Ads status queries

For Ads pipeline, replace dataset with `amz_ads_api_reports_v1` and table with `ads_report_status`:

```sql
SELECT account_name, report_type, status, error_message, start_date, end_date
FROM `{project}.amz_ads_api_reports_v1.ads_report_status`
WHERE status = 'FAILED'
  AND created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY)
ORDER BY created_at DESC;
```

## Full query library

The complete SQL file with 20+ queries is in the repository at `amazon-pipelines/docs/DASHBOARD_QUERIES.sql`.

## Related pages

- [Monitoring](/operations/monitoring)
- [Operations Runbook](/operations/)

# SP Status Tracker Internals

Internal documentation for the SP report status tracking system. For REST API usage, see [Monitoring](/operations/monitoring).

## Overview

`ReportStatusTracker` (`app/services/sp/report_status_tracker.py`) monitors SP-API report processing across all brands. Ads pipeline uses a separate tracker — see `AdsReportTracker`.

## Components

| Component | Location |
|-----------|----------|
| Schema | `app/schemas/sp/reports/report_status.py` |
| Tracker | `app/services/sp/report_status_tracker.py` |
| Routes | `app/routes/report_status.py` |
| Integration | Called from `AmazonSPService.process_and_upsert_report()` |

## BigQuery table: `report_status`

Automatically created in the SP dataset. Key fields:

| Field | Type | Description |
|-------|------|-------------|
| `report_request_id` | STRING | Unique request identifier |
| `account_name` | STRING | Brand name |
| `report_type_key` | STRING | e.g. `orders`, `inventory` |
| `status` | STRING | `IN_PROGRESS`, `DONE`, `FAILED`, `FATAL`, `CANCELLED` |
| `start_date` | STRING | Report date range start |
| `end_date` | STRING | Report date range end |
| `rows_fetched` | INT64 | Rows downloaded from SP-API |
| `rows_upserted` | INT64 | Rows written to BigQuery |
| `error_message` | STRING | Error details if failed |
| `duration_seconds` | FLOAT64 | Processing time |
| `request_timestamp` | TIMESTAMP | When the request started |

Full ID: `{project}.{dataset}.report_status`

## Status lifecycle

```
IN_PROGRESS → DONE (success)
IN_PROGRESS → FAILED (error, Cloud Tasks may retry)
IN_PROGRESS → FATAL (unrecoverable)
IN_PROGRESS → CANCELLED (manual or timeout)
```

## Python API

```python
from app.services.sp.report_status_tracker import get_tracker

tracker = get_tracker()

# Create a new status row
tracker.create_report_request(
    account_name="OE",
    report_type_key="orders",
    start_date="2026-06-04",
    end_date="2026-06-04",
)

# Update status
tracker.update_report_status(
    report_request_id="...",
    status="DONE",
    rows_fetched=150,
    rows_upserted=150,
)

# Query recent
df = tracker.get_recent_report_statuses(limit=50, account_name="OE")
```

## Automatic tracking

Status tracking is integrated into `AmazonSPService.process_and_upsert_report()` — no manual tracking needed for normal pipeline runs.

## Troubleshooting

### Table doesn't exist

The tracker creates the table on first write. Force creation:

```python
from app.services.sp.report_status_tracker import get_tracker
tracker = get_tracker()
tracker.ensure_table_exists()
```

### Duplicate rows

Use query-time deduplication (`deduplicate=true` on REST endpoints) or run `POST /report-status/cleanup-duplicates?dry_run=true`.

## Related pages

- [Monitoring API](/operations/monitoring)
- [Dashboard SQL](/operations/dashboard-queries)
- [Data Flow & Processing](/pipelines/data-flow-processing)

# SP Pipeline

Guide to the SP-API → BigQuery pipeline: batch dispatch, inline runs, date ranges, and monitoring.

## Architecture flow

```
Cloud Scheduler → process-all-brands → Cloud Tasks → SP Worker → Amazon SP-API → BigQuery
                                              ↓
                                    report_status table
```

For single-brand ad-hoc runs (inline, no queue):

```
POST /api/v1/accounts/{account}/reports/{report_type} → AmazonSPService → BigQuery
```

Diagrams: [Data Flow](/architecture/data-flow)

## Components

| Component | Location | Role |
|-----------|----------|------|
| `AmazonSPService` | `app/services/sp/amazon_sp.py` | Report lifecycle + upsert |
| `ReportSchemaConfig` | `app/schemas/sp/base_report_schema.py` | Schema, mappings, merge keys |
| `BigQueryClient` | `app/services/sp/bigquery_client.py` | Staging + MERGE upserts |
| Routes | `app/routes/jobs.py`, `accounts.py` | Dispatch and inline endpoints |

## Batch dispatch (recommended for scheduling)

```bash
POST /api/v1/sp/reports/{report_type_key}/process-all-brands
```

Dispatches one Cloud Task per configured brand to `sp-reports-queue`.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `load_last_day` | true | Yesterday only |
| `load_last_three_days` | false | Last 3 days |
| `year`, `month` | — | Month backfill |
| `accounts_filter` | all | Comma-separated brand list |
| `continue_on_error` | true | Continue if one brand fails |

**Example:**

```bash
curl -X POST "http://localhost:8080/api/v1/sp/reports/orders/process-all-brands?load_last_day=true"
```

**Response:**

```json
{
  "status": "dispatched",
  "report_type": "orders",
  "accounts_targeted": 8,
  "tasks_created": 8,
  "cloud_tasks_queue": "sp-reports-queue"
}
```

## Single brand, single report (inline)

```bash
curl -X POST "http://localhost:8080/api/v1/accounts/OE/reports/orders?load_last_three_days=true"
```

| Parameter | Description |
|-----------|-------------|
| `load_last_day` | Yesterday only |
| `load_last_three_days` | Last 3 days |
| `year`, `month` | Month backfill |
| `start_date`, `end_date` | Explicit range |

## Single brand, all reports

```bash
curl -X POST "http://localhost:8080/api/v1/sp/brands/OE/process-all-reports?load_last_day=true"
```

## Report type keys

| Key | SP-API Report Type | Table Name |
|-----|-------------------|------------|
| `orders` | GET_XML_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL | `{account}_orders` |
| `inventory` | GET_FLAT_FILE_OPEN_LISTINGS_DATA | `{account}_inventory` |
| `listings` | GET_MERCHANT_LISTINGS_ALL_DATA | `{account}_listings` |
| `sales_and_traffic` | GET_SALES_AND_TRAFFIC_REPORT | `{account}_sales_and_traffic` |
| `returns` | GET_FLAT_FILE_RETURNS_DATA_BY_RETURN_DATE | `{account}_returns` |
| `fba_inventory` | GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA | `{account}_fba_inventory` |
| `merchants_listings_fyp` | GET_MERCHANTS_LISTINGS_FYP_REPORT | `{account}_merchants_listings_fyp` |

## Worker pipeline

`process_and_upsert_report` executes:

1. **Resolve date range** — flags or explicit dates
2. **Idempotency check** — skip duplicate recent report for same date range
3. **Fetch** — create report → poll (~30 s interval) → download
4. **Transform** — column mappings + aggregations via schema config
5. **Upsert** — staging table + MERGE to BigQuery
6. **Track status** — `report_status` table updated throughout

## Date range processing

| Flag | Behavior |
|------|----------|
| `load_last_day=true` | Yesterday only |
| `load_last_three_days=true` | Last 3 days |
| `year` + `month` | Full month backfill |
| `start_date` + `end_date` | Custom range |
| Default (no flags) | Current month through yesterday |

`process_date_range_loop()` in `AmazonSPService` handles multi-day iteration with performance estimates of ~2–5 minutes per day per report type.

## Scheduled jobs

One Cloud Scheduler job per report type, staggered 8 AM–2 PM:

```
POST https://<cloud-run-url>/api/v1/sp/reports/sales_and_traffic/process-all-brands?load_last_day=true
Schedule: 0 8 * * *
```

See [Batch Scheduling](/pipelines/batch-scheduling) and [Scheduled Jobs](/operations/scheduled-jobs).

## Programmatic usage

```python
import asyncio
from app.services.sp.amazon_sp import AmazonSPService

async def load_orders():
    sp = AmazonSPService(account_name="OE")
    result = await sp.process_and_upsert_report(
        report_type_key="orders",
        load_last_three_days=True,
    )
    print(result)

asyncio.run(load_orders())
```

## Monitoring

```bash
curl "http://localhost:8080/api/v1/report-status/summary"
curl "http://localhost:8080/api/v1/report-status/failed?days_back=1"
```

See [Monitoring](/operations/monitoring).

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No schema for report type | Check `app/schemas/sp/report_registry.py` |
| 401 from SP-API | Verify account credentials in `.env` |
| MERGE failed | Verify merge columns exist in DataFrame and schema |
| Task dispatched but no data | Check worker logs and `/report-status/failed` |

## Related pages

- [SP-API Integration](/integrations/sp-api)
- [SP Report Types](/reference/sp-report-types)
- [SP Schemas](/reference/sp-schemas)
- [Batch Scheduling](/pipelines/batch-scheduling)

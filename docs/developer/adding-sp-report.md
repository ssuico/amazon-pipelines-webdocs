# Adding an SP Report

Step-by-step guide to adding a new SP-API report type to the pipeline.

## Prerequisites

- SP-API report type identifier (e.g. `GET_YOUR_REPORT_TYPE`)
- Sample report data to determine column mappings
- Merge key columns for idempotent upserts

## Step 1: Create schema file

Create `app/schemas/sp/reports/your_report.py`:

```python
from google.cloud import bigquery
from app.schemas.sp.base_report_schema import ReportSchemaConfig

SCHEMA = [
    bigquery.SchemaField('field1', 'STRING'),
    bigquery.SchemaField('Date', 'STRING'),
]

COLUMN_MAPPINGS = {"source_column": "field1"}
MERGE_COLUMNS = ["Date", "field1"]
AGGREGATIONS = {}

your_report_schema = ReportSchemaConfig(
    report_type="GET_YOUR_REPORT_TYPE",
    table_name="your_report",
    description="Description of your report",
    bq_schema=SCHEMA,
    column_mappings=COLUMN_MAPPINGS,
    merge_columns=MERGE_COLUMNS,
    aggregations=AGGREGATIONS,
)
```

## Step 2: Register in report_registry.py

```python
from app.schemas.sp.reports.your_report import your_report_schema

# In ReportSchemaRegistry.__init__:
self.register_schema(your_report_schema)
```

## Step 3: Add to AccountConfig

In `app/config.py`:

```python
# In AccountConfig.REPORT_TYPES:
"your_report": "GET_YOUR_REPORT_TYPE",

# In AccountConfig.MERGE_COLUMNS:
"your_report": ["Date", "field1"],
```

## Step 4: Test locally

```bash
curl -X POST "http://localhost:8080/api/v1/accounts/OE/reports/your_report?load_last_day=true"
```

Verify:

1. Report fetched from SP-API
2. Data transformed correctly
3. BigQuery table `{Account}_your_report` created/updated
4. Status row in `report_status`

## Step 5: Add Cloud Scheduler job

```bash
gcloud scheduler jobs create http sp-daily-your-report \
  --schedule="0 11 * * *" \
  --uri="$URL/api/v1/sp/reports/your_report/process-all-brands?load_last_day=true" \
  --http-method=POST \
  --oidc-service-account-email=$SA
```

## Verification checklist

- [ ] Schema registered and accessible via `get_schema()`
- [ ] Report type appears in `GET /api/v1/report-types`
- [ ] Inline endpoint works for at least one brand
- [ ] Batch dispatch creates Cloud Tasks
- [ ] Worker completes with DONE status
- [ ] BigQuery MERGE produces expected row counts

## Related pages

- [SP Schemas](/reference/sp-schemas)
- [SP Report Types](/reference/sp-report-types)
- [SP Pipeline](/pipelines/sp-pipeline)

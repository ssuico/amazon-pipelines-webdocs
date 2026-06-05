# SP Report Schemas

The modular schema system manages BigQuery table schemas for Amazon SP-API reports.

## Quick start

```python
from app.schemas.sp import get_schema, get_all_schemas

# Get a specific report schema
schema = get_schema("GET_SALES_AND_TRAFFIC_REPORT")

# Access components
bq_schema = schema.get_bq_schema()
column_mappings = schema.get_column_mappings()
merge_columns = schema.get_merge_columns()
aggregations = schema.get_aggregations()

print(schema.report_type)   # "GET_SALES_AND_TRAFFIC_REPORT"
print(schema.table_name)    # "sales_and_traffic"
```

### Working with DataFrames

```python
import pandas as pd
from app.schemas.sp import get_schema

schema = get_schema("GET_MERCHANT_LISTINGS_ALL_DATA")
df = pd.read_csv("listings_data.csv")
df_renamed = schema.rename_columns(df)
df_aggregated = schema.aggregate_data(df_renamed, group_by_columns=['Date', 'asin1'])
```

### List all schemas

```python
from app.schemas.sp import get_all_schemas, get_all_report_types

for schema in get_all_schemas():
    print(f"{schema.report_type} -> {schema.table_name}")
```

## Registered reports (7)

| Report Type | Table Name | Schema File |
|-------------|------------|-------------|
| `GET_SALES_AND_TRAFFIC_REPORT` | `sales_and_traffic` | `reports/sales_and_traffic.py` |
| `GET_FLAT_FILE_OPEN_LISTINGS_DATA` | `inventory` | `reports/inventory.py` |
| `GET_MERCHANT_LISTINGS_ALL_DATA` | `listings` | `reports/listings.py` |
| `GET_XML_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL` | `orders` | `reports/orders.py` |
| `GET_FLAT_FILE_RETURNS_DATA_BY_RETURN_DATE` | `returns` | `reports/returns.py` |
| `GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA` | `fba_inventory` | `reports/fba_inventory.py` |
| `GET_MERCHANTS_LISTINGS_FYP_REPORT` | `merchants_listings_fyp` | `reports/merchants_listings_fyp.py` |

Registry: `app/schemas/sp/report_registry.py`

## ReportSchemaConfig

Base class in `app/schemas/sp/base_report_schema.py`:

| Property | Purpose |
|----------|---------|
| `bq_schema` | BigQuery field definitions |
| `column_mappings` | Source → target column renames |
| `merge_columns` | Unique keys for MERGE upsert |
| `aggregations` | Duplicate row handling rules |

Methods: `get_bq_schema()`, `rename_columns()`, `aggregate_data()`, `get_merge_columns()`

## Adding a new report (2 steps)

### Step 1: Create schema file

Create `app/schemas/sp/reports/your_report.py`:

```python
from google.cloud import bigquery
from app.schemas.sp.base_report_schema import ReportSchemaConfig

SCHEMA = [
    bigquery.SchemaField('field1', 'STRING'),
    bigquery.SchemaField('Date', 'STRING'),
]

COLUMN_MAPPINGS = {"source_col": "field1"}
MERGE_COLUMNS = ["Date", "field1"]
AGGREGATIONS = {}

your_report_schema = ReportSchemaConfig(
    report_type="GET_YOUR_REPORT_TYPE",
    table_name="your_report",
    description="Your report description",
    bq_schema=SCHEMA,
    column_mappings=COLUMN_MAPPINGS,
    merge_columns=MERGE_COLUMNS,
    aggregations=AGGREGATIONS,
)
```

### Step 2: Register in report_registry.py

```python
from app.schemas.sp.reports.your_report import your_report_schema

# In ReportSchemaRegistry.__init__:
self.register_schema(your_report_schema)
```

Also add to `AccountConfig.REPORT_TYPES` and `MERGE_COLUMNS` in `app/config.py`.

See [Adding an SP Report](/developer/adding-sp-report) for the full workflow.

## Field types

Common BigQuery types used in schemas:

| Type | Use for |
|------|---------|
| `STRING` | Text, dates (as strings), IDs |
| `INT64` | Integer counts |
| `FLOAT64` | Decimal metrics |
| `BOOLEAN` | True/false flags |
| `TIMESTAMP` | Datetime values |

Always include a `Date` field for time-series reports.

## Related pages

- [SP Report Types](/reference/sp-report-types)
- [BigQuery & Datasets](/reference/bigquery)
- [Adding an SP Report](/developer/adding-sp-report)

# SP Report Types

Seven SP-API report types are configured in `AccountConfig.REPORT_TYPES` and registered in `app/schemas/sp/report_registry.py`.

## Report catalog

| Key | SP-API Report Type | BigQuery Table | Merge Columns |
|-----|-------------------|----------------|---------------|
| `sales_and_traffic` | `GET_SALES_AND_TRAFFIC_REPORT` | `{account}_sales_and_traffic` | Date, childAsin |
| `inventory` | `GET_FLAT_FILE_OPEN_LISTINGS_DATA` | `{account}_inventory` | Date, asin |
| `listings` | `GET_MERCHANT_LISTINGS_ALL_DATA` | `{account}_listings` | Date, asin1 |
| `orders` | `GET_XML_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL` | `{account}_orders` | Date, SKU, AmazonOrderID, ItemStatus, OrderStatus |
| `returns` | `GET_FLAT_FILE_RETURNS_DATA_BY_RETURN_DATE` + `GET_FBA_FULFILLMENT_CUSTOMER_RETURNS_DATA` | `{account}_returns` | Date, Order_ID, Amazon_RMA_ID, ASIN, Fulfillment_Channel |
| `fba_inventory` | `GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA` | `{account}_fba_inventory` | Date, asin, fnsku, sku |
| `merchants_listings_fyp` | `GET_MERCHANTS_LISTINGS_FYP_REPORT` | `{account}_merchants_listings_fyp` | Date, ASIN, SKU, Issue_Description, Reason, Condition |

## Internal tables

| Table | Purpose |
|-------|---------|
| `report_status` | SP pipeline status tracking (no account prefix) |
| `account_details` | UI metadata for accounts (no credentials) |

## Report-specific behavior

| Key | Processing mode | Notes |
|-----|-----------------|-------|
| `returns` | Unified dual-source | FBM flat file + FBA customer returns merged; `Fulfillment_Channel` column |
| `fba_inventory` | Snapshot | No date loop; 30-min cooldown; see [FBA Inventory Snapshot](/developer/design-decisions/fba-inventory-snapshot) |
| Others | Date-range loop | Standard `load_last_day` / backfill flags apply |

## Scheduling

Each report type has its own Cloud Scheduler job:

```
POST /api/v1/sp/reports/{key}/process-all-brands?load_last_day=true
```

Jobs are staggered 8 AM–2 PM to avoid rate limits.

## Schema modules

Each report has a schema file in `app/schemas/sp/reports/`:

- `sales_and_traffic.py`, `inventory.py`, `listings.py`, `orders.py`, `returns.py`, `fba_inventory.py`, `merchants_listings_fyp.py`

See [SP Schemas](/reference/sp-schemas) for the schema system.

## Related pages

- [SP Pipeline](/pipelines/sp-pipeline)
- [SP-API Integration](/integrations/sp-api)
- [BigQuery & Datasets](/reference/bigquery)

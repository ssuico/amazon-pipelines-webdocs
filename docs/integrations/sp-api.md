# Amazon SP-API Integration

The Selling Partner API (SP-API) integration fetches seller reports for configured brands and upserts them to BigQuery.

## Authentication

SP-API uses **Login with Amazon (LWA)** OAuth. Each brand needs a refresh token; CP brands share client ID and secret.

### Credential models

| Model | Client credentials | Brand-specific |
|-------|-------------------|----------------|
| **OE (standalone)** | Own `OE_SP_CLIENT_ID/SECRET` | `OE_SP_REFRESH_TOKEN` |
| **CP brands** | Shared `CP_SP_CLIENT_ID/SECRET` | `{BRAND}_SP_REFRESH_TOKEN` |
| **Research-app brands** | `RESEARCH_APP_SP_CLIENT_ID/SECRET` (override) | Brand refresh token |

Research-app brands (temporary override): `HEARTLAND`, `COLEHAAN`, `EVENFLO`, `INVIROX`, `MOONBOOTS`, `USCAPE`, `WONDERFOLDCA`.

See [Credentials & Auth](/onboarding/credentials).

### Token refresh

`SPAPIAuth` in `app/utils/auth.py` refreshes tokens at `https://api.amazon.com/auth/o2/token` using credentials from `AccountConfig.get_account_credentials()`.

## Report types (7)

| Key | SP-API type |
|-----|-------------|
| `sales_and_traffic` | `GET_SALES_AND_TRAFFIC_REPORT` |
| `inventory` | `GET_FLAT_FILE_OPEN_LISTINGS_DATA` |
| `listings` | `GET_MERCHANT_LISTINGS_ALL_DATA` |
| `orders` | `GET_XML_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL` |
| `returns` | `GET_FLAT_FILE_RETURNS_DATA_BY_RETURN_DATE` |
| `fba_inventory` | `GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA` |
| `merchants_listings_fyp` | `GET_MERCHANTS_LISTINGS_FYP_REPORT` |

Full table reference: [SP Report Types](/reference/sp-report-types)

## Core service

`AmazonSPService` (`app/services/sp/amazon_sp.py`) handles:

- `create_report` — request report from SP-API
- `get_report_status` / `wait_for_report` — poll until complete
- `download_report` — fetch and parse report document
- `process_and_upsert_report` — full pipeline (fetch → transform → BigQuery)
- `process_date_range_loop` — multi-day date range processing

## Rate limiting and retries

Configurable via environment variables:

- `SP_API_MIN_REQUEST_INTERVAL_SECONDS` — minimum interval between requests
- `SP_REPORT_POLL_INTERVAL_SECONDS` — poll interval while waiting
- `SP_REPORT_MAX_WAIT_SECONDS` — max wait for report completion
- `SP_API_HTTP_MAX_ATTEMPTS`, `SP_API_HTTP_BACKOFF_SECONDS` — HTTP retry backoff

## API endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/v1/sp/reports/{type}/process-all-brands` | Batch dispatch (scheduled) |
| `POST /api/v1/sp/worker/process-report` | Cloud Tasks worker |
| `POST /api/v1/accounts/{account}/reports/{type}` | Inline single report |
| `GET /api/v1/sp/reports/{report_id}` | Poll report status |
| `GET /api/v1/sp/reports/{report_id}/download` | Download raw report |

See [API Endpoints](/reference/endpoints) and [SP Pipeline](/pipelines/sp-pipeline).

## BigQuery output

- **Dataset:** `BIGQUERY_DATASET` (default `amz_sp_api_reports_v1`)
- **Tables:** `{AccountName}_{report_type}` (e.g. `OE_orders`)
- **Status:** `report_status` table tracks every run

## Related pages

- [SP Pipeline](/pipelines/sp-pipeline)
- [SP Schemas](/reference/sp-schemas)
- [Date range processing](/pipelines/sp-pipeline#date-range-processing)
- [Brand Onboarding](/onboarding/brand-onboarding)

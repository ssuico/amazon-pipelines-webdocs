# Amazon Ads API Integration

**Last updated:** 2026-08-26

Amazon Ads API integration supports **12 report types** across Sponsored Products (SP), Sponsored Brands (SB), and Sponsored Display (SD), with BigQuery persistence, incremental loading, and Cloud Tasks-based daily dispatch.

Default worker path is **async create-then-check** (`ADS_ASYNC_POLL_ENABLED=true`). See [Ads Pipeline](/pipelines/ads-pipeline) and [Ads Async Poll](/developer/design-decisions/ads-async-poll). Control-panel gap-fill: [Ads Control Panel](/operations/ads-control-panel).

## Authentication

### CP brands (shared credentials + profile per brand)

```bash
CP_ADS_CLIENT_ID=...
CP_ADS_CLIENT_SECRET=...
CP_ADS_REFRESH_TOKEN=...
BUMBLERIDE_US_PROFILE=...
OE_US_PROFILE=...          # OE Ads account key is OEUS (not OE)
# ... one {BRAND}_US_PROFILE per CP Ads brand
```

Standalone `OE_ADS_*` credentials were removed. Use explicit account names (e.g. `OEUS`); there is no silent default. See [Remove OE Ads](/developer/design-decisions/remove-oe-ads).

List configured accounts:

```bash
curl http://localhost:8080/api/v1/ads/accounts
```

`AdsAPIAuth` in `app/utils/auth.py` handles LWA token refresh and attaches the profile ID to API requests.

See [Credentials & Auth](/onboarding/credentials) and [Brand Onboarding](/onboarding/brand-onboarding).

## Report types (12)

| Key | Category | BigQuery tables |
|-----|----------|-----------------|
| `spCampaigns` | SP | `SP_campaign_table`, `SP_adgroup_table` |
| `spTargeting` | SP | `SP_targeting_table` |
| `spSearchTerm` | SP | `SP_search_term_table` |
| `spAdvertisedProduct` | SP | `SP_advertised_products_table` |
| `spPurchasedProduct` | SP | `SP_purchased_products_table` |
| `sbCampaigns` | SB | `SB_campaign_table`, `SB_campaign_timeseries_table` |
| `sbTargeting` | SB | `SB_targeting_table`, `SB_targeting_timeseries_table` |
| `sbSearchTerm` | SB | `SB_search_term_table`, `SB_search_term_timeseries_table` |
| `sbAds` | SB | `SB_ads_table`, `SB_ads_timeseries_table` |
| `sbPurchasedProduct` | SB | `SB_purchased_products_table`, `SB_purchased_products_timeseries_table` |
| `sdCampaigns` | SD | `SD_campaign_table`, `SD_campaign_timeseries_table` |
| `sdTargeting` | SD | `SD_targeting_table`, `SD_targeting_timeseries_table` |

Full reference: [Ads Report Types](/reference/ads-report-types)

## Core services

```
app/services/ads/
├── amazon_ads.py            # Report create/poll/download
├── report_processor.py      # Transform & incremental load
└── ads_report_tracker.py    # Status tracking
```

## Endpoints

### Production — Cloud Tasks dispatch

```http
POST /api/v1/ads/dispatch
```

Creates one task per account × report type on `ads-reports-queue`.

| Parameter | Description |
|-----------|-------------|
| `report_types` | Comma-separated (default: all 12) |
| `accounts_filter` | Comma-separated accounts |
| `start_date`, `end_date` | Manual date override |

Worker (called by Cloud Tasks):

```http
POST /api/v1/ads/worker/process
```

Body: `{ "account_name": "Bumbleride", "report_type": "spCampaigns" }`

### Other endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/v1/ads/reports/process` | Inline batch (no Cloud Tasks) |
| `POST /api/v1/ads/reports/retry-failed` | Retry failed reports |
| `POST /api/v1/ads/reports/expire-stuck` | Expire stuck RUNNING reports |
| `POST /api/v1/ads/reports/{type}/create` | Create async report |
| `GET /api/v1/ads/reports/{id}/status` | Poll report status |
| `GET /api/v1/ads/reports/{id}/download` | Download report data |

## Incremental loading

Default mode (no date override):

1. Reads max date from target BigQuery table
2. Starts 3 days before that date (late-arriving data)
3. Caps range at 31 days (Ads API limit)

Manual mode: pass `start_date` / `end_date` on dispatch or worker payload.

## Special handling

**`spAdvertisedProduct`** fetches ENABLED, PAUSED, and ARCHIVED statuses separately and concatenates results before upsert.

## BigQuery output

- **Dataset:** `BIGQUERY_ADS_DATASET` (default `amz_ads_api_reports_v1`)
- **Status:** `ads_report_status`

## Related pages

- [Ads Pipeline](/pipelines/ads-pipeline)
- [Batch Scheduling](/pipelines/batch-scheduling)
- [Failed Reports](/operations/failed-reports)
- [Monitoring](/operations/monitoring)

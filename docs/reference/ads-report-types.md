# Ads Report Types

Twelve Ads API report types are defined in `REPORT_UPSERT_MAP` in `app/routes/ads_jobs.py`.

## Report catalog

### Sponsored Products (SP)

| Key | BigQuery Tables |
|-----|-----------------|
| `spCampaigns` | `SP_campaign_table`, `SP_adgroup_table` |
| `spTargeting` | `SP_targeting_table` |
| `spSearchTerm` | `SP_search_term_table` |
| `spAdvertisedProduct` | `SP_advertised_products_table` |
| `spPurchasedProduct` | `SP_purchased_products_table` |

### Sponsored Brands (SB)

| Key | BigQuery Tables |
|-----|-----------------|
| `sbCampaigns` | `SB_campaign_table`, `SB_campaign_timeseries_table` |
| `sbTargeting` | `SB_targeting_table`, `SB_targeting_timeseries_table` |
| `sbSearchTerm` | `SB_search_term_table`, `SB_search_term_timeseries_table` |
| `sbAds` | `SB_ads_table`, `SB_ads_timeseries_table` |
| `sbPurchasedProduct` | `SB_purchased_products_table`, `SB_purchased_products_timeseries_table` |

### Sponsored Display (SD)

| Key | BigQuery Tables |
|-----|-----------------|
| `sdCampaigns` | `SD_campaign_table`, `SD_campaign_timeseries_table` |
| `sdTargeting` | `SD_targeting_table`, `SD_targeting_timeseries_table` |

## Schema modules

Schema definitions live in `app/schemas/ads/reports/`:

- SP: `sp_campaigns.py`, `sp_targeting.py`, `sp_search_term.py`, `sp_advertised_products.py`, `sp_purchased_products.py`
- SB: `sb_campaigns.py`, `sb_targeting.py`, `sb_search_term.py`, `sb_ads.py`, `sb_purchased_products.py`
- SD: `sd_campaigns.py`, `sd_targeting.py`

Each schema class defines `SCHEMA` (or `BIGQUERY_SCHEMA`) and `GROUPING` (or `MERGE_COLUMNS`) for upsert operations.

## Status table

| Table | Purpose |
|-------|---------|
| `ads_report_status` | Ads pipeline status tracking |

Schema: `app/schemas/ads/ads_report_status.py`

## Special behavior

**`spAdvertisedProduct`** — fetches ENABLED, PAUSED, and ARCHIVED campaign statuses separately and concatenates before upsert.

**Timeseries tables** — SB and SD report types split data into summary and timeseries tables.

## Table naming note

At runtime, Ads tables use **unprefixed** names (e.g. `SP_campaign_table`). The migration script `scripts/migrate_ads_tables.py` uses a legacy `{account}_` prefix pattern for table creation — verify which convention applies to your environment.

## Related pages

- [Ads Pipeline](/pipelines/ads-pipeline)
- [Ads API Integration](/integrations/ads-api)
- [BigQuery & Datasets](/reference/bigquery)

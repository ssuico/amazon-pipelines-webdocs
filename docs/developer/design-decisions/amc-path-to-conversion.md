# AMC Path to Conversion Pipeline

**Last updated:** 2026-07-20

**Date:** 2026-07-10 · **Status:** Accepted  
Follow-ups: exploratory campaigns capture (2026-07-19), campaign ID casting (2026-07-20)

## Context

AMC provides event-level advertising analytics unavailable via Sponsored Ads APIs. Vertx is the pilot. AMC uses `CP_AMC_REFRESH_TOKEN` (separate from Ads) with shared CP Ads LWA client credentials. Executions are asynchronous (~15+ min) and output CSV via pre-signed download URLs.

## Decision

- Brand config via `AMC_BRAND_ACCOUNT_FIELDS` + `{BRAND}_AMC_*` env vars
- Two-step SQL: exploratory campaign discovery → Path to Conversion
- Warehouse: `amazon_amc_v1.path_to_conversion` (one table, `brand_name` column)
- Weekly `POST /amc/dispatch` with async poll-and-reschedule workers
- Persist exploratory rows to `path_to_conversion_campaigns` for DSP debugging

### Exploratory campaigns capture {#exploratory-campaigns-capture}

Every successful exploratory download is MERGED into `path_to_conversion_campaigns` before the main path SQL runs, with a `bucket` classification column for DSP vs other product types.

## Consequences

- Two AMC executions per weekly brand run (quota-sensitive)
- Large campaign lists may need chunking later (especially DSP)
- Additional report types follow the same SQL + BQ table pattern

## Related pages

- [AMC Pipeline](/pipelines/amc-pipeline)

Original: `amazon-pipelines/design-log/2026-07-10-amc-path-to-conversion-pipeline.md`

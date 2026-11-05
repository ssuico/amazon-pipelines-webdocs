# 7-Day Ad Attribution

**Date:** 2026-09-10 · **Status:** Accepted

## Context

Brand Analytics ad sales, units, and conversions were read from 1-day attribution columns. Ads incremental loads started only 3 days before `MAX(Date)`, so a 7-day window could not finish maturing.

## Decision

1. Ad-attributed Brand Analytics metrics use the **7-day** columns. Responses echo `ad_attribution_window: "7d"` and `ad_attribution_mature_through` (`available_end_date` minus 6 days).
2. Bare `total_sales` / `total_units_ordered` / `total_conversions` still mean **1-day** where projected. Prefer `ad_sales_7d` and the `_7d` ladder.
3. Daily Ads incremental range is `(last_date - 8 days)` through today so attribution can settle.
4. Conversational agents are instructed to compute ad rates from the 7-day facts. Re-provision agents after column changes.

## Related pages

- [Brand Analytics](/reference/brand-analytics)
- [Ads Pipeline](/pipelines/ads-pipeline)

Original: `amazon-pipelines/design-log/2026-09-10-ad-attribution-7d-api.md`, `2026-09-10-ad-attribution-7d-implementation.md`

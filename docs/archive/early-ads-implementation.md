# Early Ads Implementation (Archived)

::: warning Historical Document
This page describes an early Ads API implementation snapshot from Phase 1. It is **outdated** and preserved for historical reference only. For current documentation, see [Ads Pipeline](/pipelines/ads-pipeline) and [Ads API Integration](/integrations/ads-api).
:::

## What this document covered

An early implementation with:

- 5 SP Ads report types only (campaigns, targeting, search terms, advertised products, purchased products)
- Per-report routes like `/api/v1/ads/sp/campaigns/process`
- OE-only account support
- SB/SD marked as "planned future phases"

## Current state (superseded)

The current implementation supports:

- **12 report types** across SP, SB, and SD
- Single dispatch endpoint: `POST /api/v1/ads/dispatch`
- Cloud Tasks worker pattern
- Multi-account CP brand support (26 Ads accounts)
- Incremental loading from BigQuery

## Why this is archived

The per-report route pattern was replaced by the dispatch + worker architecture during the Flask → FastAPI migration. SB and SD report types are fully implemented.

## Related pages

- [Ads Pipeline](/pipelines/ads-pipeline)
- [Legacy Migration](/reference/migration-legacy)

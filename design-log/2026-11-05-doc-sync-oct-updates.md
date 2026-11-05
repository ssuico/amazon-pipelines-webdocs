# Documentation Sync — August 24 through October 28

**Date:** 2026-11-05
**Status:** accepted
**Author:** ai

## Context

Prior accepted sync ended at amazon-pipelines `8063b8b` (2026-08-24). HEAD is now `9d177dd` (2026-10-28), about 109 commits later. Material surfaces:

- Brand Analytics: 7-day ad attribution, moving averages, order geography, child time-series, parent SP targets, path-to-conversion, hybrid brand ids, 2P all-ads summaries
- Conversational Analytics: OE sub-brand, All-brands, and Hybrids agents
- Listings Health: variation family, team dismissals, latest FYP suppressions
- MCP stdio + authenticated `/mcp`
- Vendor Central retail analytics (Lenox)
- Vertx weekly SCP/SQP Brand Analytics ingestion
- Hourly Featured Offer competitive-summary polling and Competitive Landscape read API
- Ads incremental lookback 8 days, SP performance warehouse, OEUS advertised-product metrics
- AMC Path-to-Conversion D+7 lag
- Force expire-stuck; Cloud Run min-instances 1 and concurrency 32

## Decision

Incremental VitePress updates for behavior-impacting surfaces. Condensed pages and short ADRs; do not copy frontend TypeScript guides. Stamp `**Last updated:** 2026-11-05` only on pages whose content changes. Keep VitePress `lastUpdated: false`.

## Consequences

- Brand Analytics no longer says child time-series was removed; it is an ASIN-scoped daily series alongside parent grain.
- Ads incremental docs use an 8-day lookback so 7-day attribution can mature.
- Vendor brands stay off seller `/accounts`.

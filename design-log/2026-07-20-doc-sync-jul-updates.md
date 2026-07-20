# Documentation Sync — June 23 through July 20

**Date:** 2026-07-20
**Status:** accepted
**Author:** ai

## Context

Webdocs was last aligned with `amazon-pipelines` through **2026-06-23** (commits landed in webdocs on 2026-06-26). The platform repo received material changes through **2026-07-20** (HEAD `61efd7c`), including:

- AMC Path to Conversion pipeline (weekly, Vertx pilot)
- Brand Analytics curated metrics API (`agg_tables_v2`)
- Ads async poll-and-reschedule worker flow
- SP/Ads daily coverage matrices and `dispatch-remaining` gap-fill (`force` Remaining-only)
- Control-panel frontend guides for SP and Ads
- Unique BigQuery staging tables (survives from SP async attempt)

## Decision

Update VitePress docs for behavior-impacting surfaces only. Promote condensed pages from `amazon-pipelines/docs/` and design logs; do not mirror every commit or frontend TypeScript dump.

## Alternatives Considered

- **Full copy of BRAND_ANALYTICS_FRONTEND_GUIDE / control endpoint TS helpers.** Rejected — keep webdocs operator/engineer focused; link concepts without duplicating client SDK samples wholesale.
- **Document reverted SP async poll flow.** Rejected — SP async was reverted; only durable staging fix and matrix/gap-fill remain relevant.

## Consequences

- Pipelines overview lists three Amazon surfaces: SP, Ads, AMC.
- Ops docs include matrix + gap-fill as the preferred control-panel path.
- Ads pipeline docs describe create-then-check async as the default.

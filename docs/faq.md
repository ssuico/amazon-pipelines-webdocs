# FAQ

**Last updated:** 2026-11-05

Frequently asked questions about the Amazon Pipelines platform.

## General

### What does Amazon Pipelines do?

It fetches reports from Amazon SP-API, Amazon Ads API, Amazon Marketing Cloud (AMC), and Vendor Central, transforms them using schema-driven pipelines, and upserts the data to BigQuery. Cloud Scheduler and Cloud Tasks orchestrate batch processing. Brand Analytics, Conversational Analytics, and Listings Health APIs serve curated metrics from BigQuery. A curated MCP server exposes the same HTTP API to agents.

### How many report types are supported?

- **SP-API:** 7 seller report types (orders, inventory, listings, sales, returns, FBA, FYP), plus a Vertx-only weekly SCP/SQP pilot
- **Vendor Central:** 6 retail analytics reports (Lenox first)
- **Ads API:** 12 report types across SP, SB, and SD
- **AMC:** Path to Conversion (weekly, D+7 lag; Vertx pilot)

### Where is the live API documentation?

The running Cloud Run service exposes OpenAPI at `/docs`. This VitePress site covers architecture, operations, and reference material.

## Credentials

### What's the difference between OE and CP brands?

OE has its own Amazon developer app credentials for SP. CP portfolio SP brands share Research-app LWA client credentials — each brand only needs its own refresh token (SP) and Ads profile ID. See [Credentials](/onboarding/credentials).

### Do we still use CP_SP client credentials?

No. As of the June 2026 migration, portfolio SP brands use `RESEARCH_APP_SP_CLIENT_ID/SECRET` directly. Ads still uses `CP_ADS_*`.

### Do we still use OE_ADS_* credentials?

No. Standalone OE Ads credentials were removed. Use account `OEUS` with `OE_US_PROFILE` on the CP Ads app. See [Remove OE Ads](/developer/design-decisions/remove-oe-ads).

### Why doesn't my brand appear in `/accounts`?

The brand's refresh token env var is likely missing or not wired in `config.py`. Brands silently skip if credentials aren't present.

## Pipelines

### What's the difference between batch dispatch and inline endpoints?

Batch dispatch (`process-all-brands`, `/ads/dispatch`) creates Cloud Tasks for parallel async processing. Inline endpoints (`/accounts/{account}/reports/{type}`) run synchronously in the HTTP request — better for debugging.

### When should I use `/sp/dispatch` vs `/sp/dispatch-remaining`?

- `/sp/dispatch` — incremental catch-up for **all** brands × types (fills missing days from MAX(Date), capped).
- `/sp/dispatch-remaining` — only today’s **Remaining** matrix cells (control-panel gap-fill). Also defaults to incremental date mode.

See [SP Incremental Dispatch](/developer/design-decisions/sp-incremental-dispatch).

### Why does Ads use incremental loading?

To avoid re-fetching all historical data daily. The worker queries BigQuery for the max date and fetches from 8 days before that date through today so 7-day attribution can mature.

### Why are SP jobs staggered but Ads uses one dispatch?

SP has 7 report types with different API rate limits — staggering avoids throttling. Ads dispatch handles all 12 types in one job because the Ads API and Cloud Tasks queue manage concurrency.

## Data

### How are BigQuery tables named?

- SP: `{AccountName}_{report_type}` (e.g. `OE_orders`)
- Ads: unprefixed names (e.g. `SP_campaign_table`)
- Status: `report_status` and `ads_report_status` (no prefix)

### What happens if the same report runs twice?

SP skips if a duplicate exists for the same date range. Ads skips if COMPLETED within the last 20 hours. Both write status rows for audit.

## Operations

### How do I retry a failed SP report?

Re-dispatch for the specific brand: `POST /sp/reports/{type}/process-all-brands?accounts_filter={brand}` — or use `/sp/dispatch-remaining?include_failed=true` for Remaining/Failed cells.

### How do I clear stuck SP In Progress rows?

`POST /api/v1/sp/reports/expire-stuck` then gap-fill with `dispatch-remaining`.

### How do I retry failed Ads reports?

`POST /api/v1/ads/reports/retry-failed?expire_stuck=true`

### Why does the dashboard show data from 2 minutes ago?

Aggregate endpoints (`/summary`, `/statistics`) are cached for 2 minutes to reduce BigQuery cost. Use `/recent` for live status.

## Deployment

### What Cloud Run memory should I use?

**16 Gi / 4 CPU** — configured in `cloudbuild.yaml`. Do not use 1 Gi from older documentation.

### Is the API authenticated?

Cloud Run is deployed with `--allow-unauthenticated`. Cloud Tasks and Scheduler use OIDC. Inbound API auth is not implemented — see [Infrastructure Security](/deployment/infrastructure#security).

## Related pages

- [Getting Started](/getting-started)
- [Common Issues](/troubleshooting/common-issues)
- [Operations Runbook](/operations/)

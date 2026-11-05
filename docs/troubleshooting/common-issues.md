# Common Issues

**Last updated:** 2026-11-05

Consolidated troubleshooting guide for the most frequent Amazon Pipelines problems.

## Setup and credentials

| Problem | Solution |
|---------|----------|
| Unknown account | Check `.env` has credentials — see [Credentials](/onboarding/credentials) |
| Brand not in `/accounts` list | Verify refresh token env var is set and brand is wired in `config.py` |
| SP-API 401 Unauthorized | Verify `RESEARCH_APP_SP_*` client matches the app that issued the brand refresh token |
| Portfolio brand missing from `/accounts` | Confirm `RESEARCH_APP_SP_CLIENT_ID/SECRET` and `{BRAND}_SP_REFRESH_TOKEN` are set |
| Ads 401 / profile error | Verify `{BRAND}_US_PROFILE` matches `/v2/profiles` response |
| OE Ads auth failures after Aug 2026 | Use `OEUS` + `OE_US_PROFILE`; `OE_ADS_*` removed — see [Remove OE Ads](/developer/design-decisions/remove-oe-ads) |
| Token refresh failed | Re-authorize in Seller Central / Advertising Console |
| Import errors | `pip install -r requirements.txt` |

## Pipeline execution

| Problem | Solution |
|---------|----------|
| Task dispatched but no data | Check worker logs; query `/report-status/failed` |
| SP report stuck IN_PROGRESS | `POST /sp/reports/expire-stuck` then `dispatch-remaining` |
| Ads report stuck RUNNING | `POST /ads/reports/expire-stuck` then retry |
| Empty report / no_data | Verify date range has data; check marketplace |
| Duplicate processing skipped | Expected idempotency — use `dispatch-remaining?force=true` for Remaining cells only |
| FBA inventory `fba_generation_cooldown` | Normal within 30-min window; wait or check for reusable DONE report |
| FBA inventory backfill no-op | Snapshot report ignores multi-day flags — see [FBA Inventory Snapshot](/developer/design-decisions/fba-inventory-snapshot) |
| Returns only FBM rows | FBA fetch may have failed — check worker logs; FBM data still lands |
| Ads batch extremely slow / deadline overruns | Confirm async path (`ADS_ASYNC_POLL_ENABLED=true`); use expire-stuck + retry-failed |
| Matrix Remaining not shrinking | Prefer `dispatch-remaining` over full Cartesian dispatch |
| Need multi-day SP catch-up | `POST /sp/dispatch` (incremental from MAX(Date)) |
| MERGE failed | Verify merge columns exist in DataFrame and schema |
| 429 throttling | Queue backoff handles this; increase spacing if persistent |

## BigQuery

| Problem | Solution |
|---------|----------|
| Table not found | First upsert creates table automatically; check dataset name |
| Permission denied | Verify SA has `bigquery.dataEditor` and `bigquery.jobUser` |
| Wrong table name | SP uses `{Account}_{type}` prefix; Ads uses unprefixed names |
| Schema mismatch | Check schema module matches actual report columns |

## Analytics APIs

| Problem | Solution |
|---------|----------|
| Conversational Analytics 404 | Brand data agent not provisioned — run `provision_brand_data_agent.py` |
| Brand Analytics empty / 404 | Check brand identifier and date window; see [Brand Analytics](/reference/brand-analytics) |
| Listings Health empty | Confirm FYP / listings data present for brand |

## Deployment

| Problem | Solution |
|---------|----------|
| Cloud Build fails on secrets | Verify Secret Manager binding names match env var names |
| 503 on first request | Warm min-instances is 1; a new revision can still miss the startup probe — retry |
| OOM / container killed | Verify Cloud Run memory is 16 Gi (not 1 Gi) |
| Scheduler job fails | Check OIDC SA has `run.invoker` role |
| Cloud Tasks not reaching worker | Verify `CLOUD_RUN_SERVICE_URL` and OIDC SA |
| Secret change not picked up | Redeploy Cloud Run after updating Secret Manager refresh tokens |

## Dashboard

| Problem | Solution |
|---------|----------|
| Summary shows old data | Aggregate endpoints cached 2 min — wait or check `/recent` |
| Statistics seem wrong | Run with `deduplicate=true` (default) |
| Too many status rows | Run `cleanup-duplicates?dry_run=true` then delete |

## Related pages

- [Failed Reports](/operations/failed-reports)
- [Operations Runbook](/operations/)
- [FAQ](/faq)

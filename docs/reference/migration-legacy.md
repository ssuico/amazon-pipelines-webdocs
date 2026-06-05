# Legacy Migration

The legacy Flask application has been **fully superseded** by this FastAPI service. There is no supported migration path back to the old app.

## Endpoint mapping

| Legacy pattern | Current replacement |
|----------------|---------------------|
| `POST /jobs/sp/reports/loader` | `POST /api/v1/accounts/{account}/reports/{report_type}` (inline) |
| Per-brand scheduled jobs | `POST /api/v1/sp/reports/{report_type}/process-all-brands` (Cloud Tasks dispatch) |
| `POST /sp/reports/trigger` | Removed — use account endpoint or batch dispatch |
| `POST /sp/reports/process` | Removed — use account endpoint |
| Ads per-report `/ads/sp/*/process` routes | `POST /api/v1/ads/dispatch` + worker, or `POST /api/v1/ads/reports/process` |

## Scheduling migration

**Before:** 49+ jobs (7 reports × 7+ brands)

**After:**

- **SP-API:** 7 Cloud Scheduler jobs (one per report type) → `process-all-brands`
- **Ads API:** 1 Cloud Scheduler job → `/ads/dispatch`

See [Batch Scheduling](/pipelines/batch-scheduling) and [Data Flow](/architecture/data-flow).

## Credential migration

Credential structure is unchanged in concept (CP shared app + brand tokens). New brands are documented in [Brand Onboarding](/onboarding/brand-onboarding) and [Credentials](/onboarding/credentials).

## BigQuery tables

Table naming conventions are preserved:

- SP: `{account}_{report_type}` in `amz_sp_api_reports_v1`
- Ads: `SP_*`, `SB_*`, `SD_*` tables in `amz_ads_api_reports_v1`

## If you still run the old Flask app

1. Stop scheduled jobs pointing at the old service
2. Point Cloud Scheduler to this Cloud Run service (see [Deployment](/deployment/))
3. Verify credentials in Cloud Run env / Secret Manager match `.env`
4. Run smoke tests via [Getting Started](/getting-started) examples

## Historical reference

Early Ads implementation (Phase 1, SP-only, 5 report types) is archived at [Early Ads Implementation](/archive/early-ads-implementation).

## Related pages

- [API Endpoints](/reference/endpoints)
- [Deployment](/deployment/)

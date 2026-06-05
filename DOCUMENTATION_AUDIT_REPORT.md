# Documentation Audit Report

**Date:** 2026-06-05  
**Scope:** Migration from `amazon-pipelines/docs/` to `amazon-pipelines-webdocs/`  
**Auditor:** AI-assisted documentation migration

---

## Summary

Created a production-ready VitePress documentation site with **47 markdown pages** covering all required platform topics. Content was migrated from 31 existing markdown sources, consolidated to eliminate redundancy, and corrected against the current codebase.

Build validation: `npm run build` passes successfully.

---

## Documentation Migrated

| Source | Target | Notes |
|--------|--------|-------|
| `README.md` + `docs/README.md` | `docs/index.md` | Landing page with hero + feature cards |
| `docs/GETTING_STARTED.md` | `docs/getting-started.md` + `developer/local-development.md` | Split stakeholder vs dev focus |
| `docs/PIPELINE_WORKFLOWS.md` | `docs/architecture/data-flow.md` | Fixed `report_status` table naming |
| `docs/ENDPOINT_STRUCTURE.md` | `docs/reference/endpoints.md` | Canonical API routing |
| `docs/PIPELINE_GUIDE.md` | `docs/pipelines/sp-pipeline.md` | Merged date range content |
| `docs/DATE_RANGE_PROCESSING.md` | Section in `pipelines/sp-pipeline.md` | Consolidated |
| `docs/ADS_API_GUIDE.md` | `integrations/ads-api.md` + `pipelines/ads-pipeline.md` | Split integration vs pipeline |
| `docs/BATCH_ENDPOINTS.md` + `BATCH_QUICK_REF` | `pipelines/batch-scheduling.md` | Merged with cheat sheet section |
| `docs/CREDENTIALS.md` | `onboarding/credentials.md` | Expanded Research-app brands |
| `docs/REPORT_STATUS_API.md` | `operations/monitoring.md` | Added caching ADR content |
| `docs/FAILED_REPORTS_ENDPOINT.md` | `operations/failed-reports.md` | Direct migration |
| `docs/MIGRATION_GUIDE.md` | `reference/migration-legacy.md` | Direct migration |
| `docs/DEPLOYMENT_GUIDE.md` | `deployment/*` (4 pages) | Trimmed ~60%, split by topic |
| `app/schemas/sp/SCHEMA_GUIDE.md` + `QUICK_START.md` | `reference/sp-schemas.md` | Merged |
| `docs/DASHBOARD_QUERIES.sql` | `operations/dashboard-queries.md` | Key queries embedded |
| `design-log/2026-05-16-brand-onboarding.md` | `onboarding/brand-onboarding.md` | Fixed API paths |
| `design-log/2026-04-14-bigquery-caching.md` | `developer/design-decisions/bigquery-caching.md` | Promoted to user docs |
| `design-log/2026-05-15-dead-code-cleanup.md` | `developer/design-decisions/dead-code-cleanup.md` | ADR preserved |
| `design-log/2026-05-18-research-app-override.md` | `developer/design-decisions/research-app-override.md` | Updated brand list |
| `design-log/2026-05-18-cloud-run-memory.md` | `developer/design-decisions/cloud-run-memory.md` | ADR preserved |
| `docs/archive/IMPLEMENTATION_SUMMARY.md` | `archive/early-ads-implementation.md` | Marked historical |
| `tests/ads/README.md` | `developer/testing.md` | Removed fake integration path |

---

## Documentation Updated (Factual Corrections)

| Issue | Old value | Corrected value |
|-------|-----------|-----------------|
| SP status table name | `sp_report_status` | `report_status` |
| Cloud Run memory | 1 Gi / 8 Gi in deploy guide | **16 Gi / 4 CPU** |
| Research-app brands | 1 brand (Heartland) or Cole Haan example | 7 brands in `RESEARCH_APP_BRANDS` |
| Brand onboarding smoke test path | `/jobs/sp/brands/...` | `/api/v1/sp/brands/...` |
| SP status `/failed` param | `hours_back` (in tracking doc) | `days_back` |
| Python import paths | `app.services.amazon_sp` | `app.services.sp.amazon_sp` |
| BigQuery API | `enable_bigquery`, `insert_data` | Documented actual `BigQueryClient` upsert API |
| Ads BQ table naming | `{account}_SP_*` (in Ads guide) | Unprefixed runtime names with migration script note |
| Integration tests path | `tests/integration/` | Removed (does not exist) |

---

## Documentation Newly Created

| Page | Purpose |
|------|---------|
| `reference/environment-variables.md` | Exhaustive env var table from `Settings` |
| `reference/ads-report-types.md` | 12 Ads types with BQ tables from `REPORT_UPSERT_MAP` |
| `reference/bigquery.md` | Full rewrite of outdated BigQuery integration |
| `deployment/infrastructure.md` | GCP topology + security model |
| `deployment/cloud-run.md` | Docker, cloudbuild, 16Gi sizing |
| `deployment/cloud-tasks-scheduler.md` | Queue and Scheduler setup |
| `operations/index.md` | Operations runbook with incident playbooks |
| `operations/scheduled-jobs.md` | 7 SP + 1 Ads scheduler jobs |
| `operations/scripts.md` | CLI operational tools |
| `architecture/components.md` | Services, queues, caching |
| `pipelines/data-flow-processing.md` | Worker internals |
| `pipelines/index.md` | Pipeline hub page |
| `integrations/index.md` | Integrations hub |
| `onboarding/index.md` | Onboarding hub |
| `troubleshooting/index.md` + `common-issues.md` | Consolidated troubleshooting |
| `troubleshooting/sp-status-tracker.md` | Trimmed tracker internals (no REST dupes) |
| `faq.md` | 20+ common questions |
| `developer/index.md` + `adding-sp-report.md` | Developer guide |
| Section index pages | All `*/index.md` hub pages |

---

## Documentation Removed or Archived

| Source | Disposition |
|--------|-------------|
| `docs/DEDUPLICATION_GUIDE.md` | Not migrated — was redirect stub to REPORT_STATUS_API |
| `docs/ACTIVITY_LOG_ENDPOINT.md` | Not migrated — was redirect stub |
| `docs/REPORT_STATUS_IMPLEMENTATION_SUMMARY.md` | Not migrated — was redirect stub |
| `docs/REPORT_STATUS_TRACKING.md` | Trimmed to `troubleshooting/sp-status-tracker.md` (internals only) |
| `docs/BIGQUERY_INTEGRATION.md` | Replaced by `reference/bigquery.md` (full rewrite) |
| `docs/BATCH_ENDPOINTS_QUICK_REFERENCE.md` | Merged into `pipelines/batch-scheduling.md` |
| `docs/archive/IMPLEMENTATION_SUMMARY.md` | Archived at `archive/early-ads-implementation.md` |

Original files in `amazon-pipelines/docs/` were **not deleted** — they remain for backward compatibility until README links are updated.

---

## Validation Results

| Check | Result |
|-------|--------|
| `npm run build` | Pass |
| Stale API references (`enable_bigquery`, `sp_report_status`) | None found in webdocs |
| All sidebar links resolve | Pass (build validates) |
| Duplicate topic pages | Eliminated — one canonical page per topic |
| Mermaid diagrams | Render via `vitepress-plugin-mermaid` |
| Local search | Enabled (`provider: 'local'`) |
| Archive excluded from primary nav | Yes — not in sidebar |

---

## Remaining Gaps and Assumptions

### Gaps (not documented — known limitations in codebase)

| Gap | Notes |
|-----|-------|
| CI/CD pipeline | README marks as TODO — no CI config documented |
| Monitoring/alerting dashboards | No GCP alerting policies documented |
| Secret Manager stub | `app/utils/secrets.py` `get_secret()` not wired — prod uses cloudbuild bindings |
| Inbound API auth hardening | Documented as future work in infrastructure security section |
| Ads schema deep-dive | Ads schema modules documented in report types table but no full schema guide equivalent to SP |
| `POST /cache/clear` admin endpoint | Mentioned in caching ADR as follow-up — not implemented |
| Full DASHBOARD_QUERIES.sql | Key queries embedded; full 20+ query library remains in repo file |

### Assumptions

- Deploy base path is `/` (not a subpath)
- English-only documentation
- Production Cloud Run URL referenced from `cloudbuild.yaml` env vars
- US marketplace only (`ATVPDKIKX0DER`) for brand onboarding
- Link check ignores `http://localhost:*` URLs (local dev references)

---

## Site Statistics

| Metric | Count |
|--------|-------|
| Markdown pages | 47 |
| Top-level sections | 10 (architecture, integrations, pipelines, onboarding, operations, deployment, reference, developer, troubleshooting, archive) |
| Required checklist topics covered | 16/16 |
| Design decision ADRs promoted | 4 (+ brand onboarding as canonical ops guide) |

---

## Recommended Follow-up

1. Update `amazon-pipelines/README.md` to link to `amazon-pipelines-webdocs/` as primary documentation
2. Add banner to `amazon-pipelines/docs/README.md` pointing to VitePress site
3. Deploy VitePress build to static hosting (Cloud Storage + CDN, Netlify, or internal portal)
4. Create Ads schema guide when schema module stabilizes
5. Document CI/CD when implemented

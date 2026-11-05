# Brand Analytics SCP / SQP (Vertx pilot)

**Last updated:** 2026-11-05

Weekly Seller **Search Catalog Performance** and **Search Query Performance** ingestion for **Vertx only**. This is report ingestion into the SP dataset, not the `agg_tables_v2` read API.

Implementation: `app/routes/ba_jobs.py`  
Allowlist: `BA_REPORT_ACCOUNTS=Vertx`

| Piece | Detail |
|-------|--------|
| Dispatch | `POST /api/v1/sp/ba/dispatch` |
| Worker | `POST /api/v1/sp/ba/worker/process` |
| Inline smoke | `POST /api/v1/sp/ba/reports/process` |
| Queue | `sp-ba-reports-queue` |
| Week | Sunday–Saturday, lagged `BA_WEEK_REPORT_LAG_DAYS` (default **7**) |
| Seller id | `VERTX_SP_SELLER_ID` on every raw row |
| SCP table | `brand_analytics_search_catalog_performance` |
| SQP table | `brand_analytics_search_query_performance` |
| Selection log | `brand_analytics_sqp_selection_log` |

Status uses the shared seller `report_status` with keys `search_catalog_performance` and `search_query_performance`. Do **not** wire this into daily `/sp/dispatch`.

```bash
curl -X POST "http://localhost:8080/api/v1/sp/ba/dispatch?dry_run=true"
curl -X POST "http://localhost:8080/api/v1/sp/ba/dispatch"
```

Explicit weeks must be Sunday–Saturday (`week_start` / `week_end`). SQP ASINs come from the top parents in Vertx agg tables and are batched (≤200 characters per `createReport`).

## Related pages

- [SP Pipeline](/pipelines/sp-pipeline)
- [Brand Analytics](/reference/brand-analytics)

Original: `amazon-pipelines/docs/BA_SCP_SQP_PILOT.md`

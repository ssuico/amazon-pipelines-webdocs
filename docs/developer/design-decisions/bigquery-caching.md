# BigQuery Caching Layer

**Date:** 2026-04-14 · **Status:** Accepted

## Context

Dashboard endpoints hit BigQuery directly on every request with no caching, causing latency, cost, and SQL injection risk from f-string interpolation.

## Decision

Introduce tiered in-memory TTL caching in `app/utils/cache.py`:

| Cache | TTL | Endpoints |
|-------|-----|-----------|
| `dashboard_cache` | 2 min | `/failed`, `/activity`, `/statistics`, `/summary` |
| `metadata_cache` | 10 min | `/accounts`, `/accounts/{name}` |

Not cached: `/recent` (live RUNNING status), `/health`.

Additional changes:

- Singleton `AccountMetadataService` via `get_metadata_service()`
- Consolidated Ads `/statistics` into single BQ query with CTE + UNION ALL
- Parameterized queries with `@param` placeholders (SQL injection fix)
- Dynamic table references via `_table_ref(tracker)` helper

## Consequences

- ~90% fewer BQ reads for dashboard traffic
- Up to 2 min staleness on aggregate views
- In-memory only — does not share across Cloud Run replicas

## User-facing documentation

See [Monitoring](/operations/monitoring#dashboard-caching).

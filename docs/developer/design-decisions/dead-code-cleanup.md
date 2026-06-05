# Dead Code & Dependency Cleanup

**Date:** 2026-05-15 · **Status:** Accepted

## Context

Legacy code from the Flask migration and early BigQuery integration remained in the codebase.

## Decision

Removed:

- In-process scheduler module (`scheduler.py`)
- Dead BigQuery methods: `insert_data`, `insert_dataframe`
- Unused dependencies
- Placeholder route: `POST /ads/reports/trigger`

## Consequences

- `BIGQUERY_INTEGRATION.md` references to removed APIs are obsolete — see [BigQuery & Datasets](/reference/bigquery) for current API
- All writes go through upsert (staging + MERGE) pattern

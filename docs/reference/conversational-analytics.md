# Conversational Analytics API

**Last updated:** 2026-08-26

Natural-language chat over curated `agg_tables_v2` brand tables via Google Conversational Analytics (`google-cloud-geminidataanalytics`). Ask in plain English; receive streamed text, tabular data, and Vega-Lite chart specs. Generated SQL is **never** exposed to clients.

Base path: `/api/v1/conversational-analytics`  
Implementation: `app/routes/conversational_analytics.py`, `app/services/analytics/conversational_agent_service.py`  
Provision: `scripts/provision_brand_data_agent.py`

## MVP scope

One pilot brand at a time. A brand’s data agent must be provisioned before chat works — unprovisioned brands return `404`.

## Configuration

| Env var | Default | Description |
|---------|---------|-------------|
| `CONVERSATIONAL_ANALYTICS_LOCATION` | `global` | Data agent / conversation region |
| `DATA_AGENT_ID_PREFIX` | `brand-agg-` | Agent id prefix (`{prefix}{brand_lower}`) |
| `CONVERSATIONAL_ANALYTICS_PILOT_BRAND` | `Vertx` | Default brand for the provision script |

Reuses `GCP_PROJECT_ID` and `BIGQUERY_AGG_DATASET`. Enable `geminidataanalytics.googleapis.com` and `cloudaicompanion.googleapis.com`; grant the app SA `dataAgentCreator`, `dataAgentUser`, and `cloudaicompanion.user`.

## Provisioning

```bash
python scripts/provision_brand_data_agent.py --brand Vertx
```

Idempotent. Scopes the agent to the brand’s child / parent / time-series `_90` tables.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/conversational-analytics/conversations` | Open stateful conversation (`{"brand_identifier":"Vertx"}`) |
| `GET` | `/conversational-analytics/conversations/{id}` | Conversation metadata / existence check |
| `POST` | `/conversational-analytics/conversations/{id}/chat` | Ask a question — **SSE** stream (`text/event-stream`) |

Chat body: `{"question":"..."}`. Use `fetch`/`ReadableStream` (not `EventSource` — this is POST).

### SSE event types

| `type` | Meaning |
|--------|---------|
| `text` | `FINAL_RESPONSE` / `PROGRESS` / `FOLLOWUP_QUESTIONS` only (no `THOUGHT`) |
| `schema` | Datasources the agent resolved |
| `data` | Query result rows |
| `chart` | Vega-Lite `vega_config` |
| `error` | Tool-call error (may be recoverable) |
| `done` | Stream finished |

No `sql` event. Chain-of-thought text that would leak SQL is filtered server-side.

## Related pages

- [Brand Analytics](/reference/brand-analytics)
- [Environment Variables](/reference/environment-variables)
- [API Endpoints](/reference/endpoints)

Original: `amazon-pipelines/docs/CONVERSATIONAL_ANALYTICS_API.md`

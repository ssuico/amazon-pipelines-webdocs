# MCP Server

**Last updated:** 2026-11-05

Curated [Model Context Protocol](https://modelcontextprotocol.io) tools over the Pipelines HTTP API. Agents can read pipeline health, Brand Analytics, Listings Health, competitive landscape, and pricing targets, and can enqueue ops writes. This is not an OpenAPI dump of every route.

Implementation: `app/mcp/`  
Design: [Pipelines MCP](/developer/design-decisions/pipelines-mcp)

```
Cursor  --stdio-->  python -m app.mcp  --httpx-->  FastAPI /api/v1
Remote  --HTTPS /mcp Bearer-->  Cloud Run  --localhost-->  FastAPI /api/v1
```

Tools do not import pipeline services or hold Amazon/GCP credentials.

## Configuration

| Env var | Default | Description |
|---------|---------|-------------|
| `PIPELINES_API_BASE_URL` | `http://127.0.0.1:8080` | API origin tools call. On Cloud Run, keep localhost. |
| `MCP_HTTP_ENABLED` | `false` | Mount Streamable HTTP at `/mcp` |
| `MCP_AUTH_TOKEN` | — | Required when HTTP is enabled. Clients send `Authorization: Bearer` |

stdio does not use `MCP_AUTH_TOKEN`. Production Cloud Build sets `MCP_HTTP_ENABLED=true` and binds the token from Secret Manager (`scripts/provision_mcp_auth_token.py`). A leaked token can enqueue Amazon jobs.

Local Cursor (workspace `.cursor/mcp.json` in amazon-pipelines):

```json
{
  "mcpServers": {
    "amazon-pipelines": {
      "command": "python",
      "args": ["-m", "app.mcp"],
      "env": { "PIPELINES_API_BASE_URL": "http://127.0.0.1:8080" }
    }
  }
}
```

## Tool groups

| Group | Examples |
|-------|----------|
| Status | SP/Ads/vendor matrices, summaries, failed, health, account lists |
| Ops writes | `sp_dispatch`, `vendor_dispatch`, Ads dispatch, expire-stuck, retry-failed |
| Analytics | summary, metrics, order-geo, time-series, SP targets, path-to-conversion, listings health |
| Chat | `start_analytics_conversation`, `chat_analytics` (SSE buffered; no SQL) |
| Pricing | competitive-landscape ASIN list/detail; competitive-summary targets and `run` |

Workers, report downloads, and `cleanup-duplicates` are not tools. Payloads over ~70 KB are truncated.

## Related pages

- [API Endpoints](/reference/endpoints)
- [Brand Analytics](/reference/brand-analytics)
- [Vendor Pipeline](/pipelines/vendor-pipeline)

Original: `amazon-pipelines/docs/MCP_SERVER.md`, `docs/MCP_CLIENTS.md`

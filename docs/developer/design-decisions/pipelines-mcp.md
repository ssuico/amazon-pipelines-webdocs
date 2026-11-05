# Pipelines MCP Server

**Date:** 2026-08-26 · **Status:** Accepted  
HTTP mount: 2026-08-27. Pricing and landscape tools: 2026-09-23.

## Context

Operators and agents were assembling curl against a large FastAPI surface. A curated MCP server can call the same HTTP API without loading Amazon or GCP credentials in the agent process.

## Decision

1. FastMCP process in `app/mcp/` calls `PIPELINES_API_BASE_URL` (default `http://127.0.0.1:8080`).
2. **stdio** for local Cursor (`python -m app.mcp`). **Streamable HTTP** at `/mcp` when `MCP_HTTP_ENABLED=true` and `MCP_AUTH_TOKEN` is set.
3. Curated read and ops-write tools only. Omit Cloud Tasks workers, report downloads, and delete-style routes.
4. Write tools enqueue real work; prefer `dry_run=true` when the route supports it.

## Related pages

- [MCP Server](/reference/mcp)

Original: `amazon-pipelines/design-log/2026-08-26-pipelines-mcp-server.md`, `2026-08-27-pipelines-mcp-http.md`

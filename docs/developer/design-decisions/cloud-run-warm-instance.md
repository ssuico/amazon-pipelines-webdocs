# Cloud Run Warm Instance

**Date:** 2026-09-02 · **Status:** Accepted

## Context

Dashboard calls to Cloud Run failed as browser network errors. Logs showed `429` / no available instance on CORS `OPTIONS`, failed startup TCP probes, and scale-to-zero cold starts longer than the probe deadline. A warm instance served the same Brand Analytics routes successfully.

## Decision

1. `--min-instances 1` so Overview does not wait on a multi-minute cold start.
2. `--concurrency 32` (was 8) so one page of OPTIONS + GETs fits on that instance.
3. Keep `--max-instances 10`, **16 GiB / 4 CPU**. Persist both flags in `cloudbuild.yaml`.
4. Defer non-health router and MCP imports until after uvicorn binds `:8080` so the startup probe can succeed.

## Related pages

- [Cloud Run](/deployment/cloud-run)

Original: `amazon-pipelines/design-log/2026-09-02-cloud-run-warm-instance-concurrency.md`, `2026-09-02-cloud-run-fast-startup.md`

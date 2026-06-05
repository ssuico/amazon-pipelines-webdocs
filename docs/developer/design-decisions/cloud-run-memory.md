# Cloud Run Memory Upgrade

**Date:** 2026-05-18 · **Status:** Accepted

## Context

Concurrent Cloud Tasks workers processing large reports (especially Ads with multiple table splits) caused memory pressure on the 8 Gi Cloud Run configuration.

## Decision

Upgrade Cloud Run resources in `cloudbuild.yaml`:

| Setting | Before | After |
|---------|--------|-------|
| Memory | 8 Gi | **16 Gi** |
| CPU | 2 | **4** |

## Consequences

- Higher Cloud Run cost per instance
- Eliminates OOM failures during peak dispatch windows
- Manual deploy examples must use `--memory 16Gi --cpu 4`

## User-facing documentation

See [Cloud Run Deployment](/deployment/cloud-run).

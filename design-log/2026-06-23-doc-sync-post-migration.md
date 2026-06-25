# Documentation Sync — Post June 6 Changes

**Date:** 2026-06-23
**Status:** accepted
**Author:** ai

## Context

The VitePress site (`amazon-pipelines-webdocs`) was last aligned with the platform around 2026-06-06. The `amazon-pipelines` repo received material changes through 2026-06-23:

- Research-app SP credential migration (removed `CP_SP_*` and `RESEARCH_APP_BRANDS`)
- FBA inventory snapshot processing refactor
- Unified FBA + FBM returns ingestion
- New portfolio brands (e.g. CloudNine, Redfield, Skins)

## Decision

Update user-facing documentation to reflect the current `app/config.py` credential model and pipeline behavior. Promote two new design-decision pages from `amazon-pipelines/design-log/`. Mark the temporary Research App Override ADR as superseded.

## Alternatives Considered

- **Mirror all commits verbatim.** Rejected — webdocs consolidates and rewrites for navigation; only behavior-impacting facts are synced.
- **Defer until amazon-pipelines README points here.** Rejected — operators already rely on VitePress for onboarding and ops.

## Consequences

- Credential docs no longer reference `CP_SP_CLIENT_ID/SECRET` or `RESEARCH_APP_BRANDS`.
- SP pipeline docs describe snapshot mode for `fba_inventory` and dual-source `returns`.
- Future syncs should diff `amazon-pipelines` commits against webdocs after major platform changes.

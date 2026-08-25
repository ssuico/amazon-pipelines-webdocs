# Retire Standalone OE Ads Credentials

**Date:** 2026-07-30 · **Status:** Accepted

## Context

Ads supported both standalone `OE` (`OE_ADS_*`) and CP-routed `OEUS` (`OE_US_PROFILE`). Those write to different BigQuery table families and must stay independent.

## Decision

- Remove `OE_ADS_*` Settings fields, Ads credential branches, and Cloud Build secret bindings.
- Keep `OEUS` unchanged — do **not** alias `OE` → `OEUS`.
- Require explicit Ads `account` / `account_name` (no silent OE default).

## Related pages

- [Credentials & Auth](/onboarding/credentials)
- [Ads API Integration](/integrations/ads-api)

Original: `amazon-pipelines/design-log/2026-07-30-remove-oe-standalone-ads-credentials.md`

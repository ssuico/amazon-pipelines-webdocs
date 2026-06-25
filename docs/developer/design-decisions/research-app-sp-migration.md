# Research-App SP Credential Migration

**Date:** 2026-06-23 · **Status:** Accepted

Supersedes [Research App Override](/developer/design-decisions/research-app-override) (2026-05-18).

## Context

All CP portfolio brands now have SP refresh tokens minted against the Research LWA application. The `RESEARCH_APP_BRANDS` post-processing override and the legacy `CP_SP_CLIENT_ID` / `CP_SP_CLIENT_SECRET` pair are no longer needed.

Ads API credentials remain on the CP Ads application (`CP_ADS_*`) — this migration is SP-API only.

## Decision

1. **Remove** `RESEARCH_APP_BRANDS` and the override block in `get_account_credentials()`.
2. **Point** every CP portfolio brand branch at `settings.research_app_sp_client_id` / `settings.research_app_sp_client_secret` directly.
3. **Delete** `cp_sp_client_id`, `cp_sp_client_secret`, and unused `cp_sp_refresh_token` from `Settings`.
4. **Update** `get_available_accounts()` to gate brand discovery on Research-app credentials.
5. **Remove** `CP_SP_CLIENT_ID` and `CP_SP_CLIENT_SECRET` from `cloudbuild.yaml` secret bindings.

## Deployment follow-up

After deploy:

- Confirm Cloud Run no longer references `CP_SP_CLIENT_ID` / `CP_SP_CLIENT_SECRET` secrets.
- Optionally archive unused GCP Secret Manager entries for the CP SP client.
- Remove stale `CP_SP_*` lines from local `.env`.
- **Redeploy Cloud Run** after rotating portfolio refresh tokens in Secret Manager.

## Consequences

- Onboarding a new CP portfolio SP brand requires only a refresh-token env var and an `elif` branch — no app-type routing set.
- Token exchange failures from client/token mismatch should no longer occur for CP portfolio brands.
- Ads onboarding is unchanged (`CP_ADS_*` + per-brand profile).

## User-facing documentation

- [Credentials & Auth](/onboarding/credentials)
- [Brand Onboarding](/onboarding/brand-onboarding)
- [Environment Variables](/reference/environment-variables)

Original ADR: `amazon-pipelines/design-log/2026-06-23-research-app-sp-migration.md`

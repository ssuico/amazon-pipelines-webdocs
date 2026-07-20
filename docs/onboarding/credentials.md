# Credentials & Authorization

**Last updated:** 2026-07-20

How Amazon Pipelines authenticates with Amazon APIs and manages multi-account credentials.

## API surfaces

| Surface | Auth model | Brand-specific secret |
|---------|------------|----------------------|
| **SP-API** | LWA OAuth | Refresh token per brand |
| **Ads API** | LWA OAuth + profile | Profile ID per brand |
| **AMC** | LWA OAuth (shared Ads client + AMC refresh token) | Entity / instance / marketplace IDs |

Source of truth: `app/config.py` (`Settings` and `AccountConfig`).

## Credential models

### OE (standalone)

Uses its own client ID, secret, and refresh token for both SP and Ads:

- `OE_SP_CLIENT_ID`, `OE_SP_CLIENT_SECRET`, `OE_SP_REFRESH_TOKEN`
- `OE_ADS_CLIENT_ID`, `OE_ADS_CLIENT_SECRET`, `OE_ADS_REFRESH_TOKEN`, `OE_ADS_PROFILE`

### CP portfolio brands (SP-API)

All CP portfolio brands share the Research-app LWA application:

- `RESEARCH_APP_SP_CLIENT_ID`, `RESEARCH_APP_SP_CLIENT_SECRET`

Each brand adds only its refresh token, e.g. `BUMBLERIDE_SP_REFRESH_TOKEN`.

See [Research-App SP Migration](/developer/design-decisions/research-app-sp-migration).

### CP brands (Ads API)

All CP Ads brands share:

- `CP_ADS_CLIENT_ID`, `CP_ADS_CLIENT_SECRET`, `CP_ADS_REFRESH_TOKEN`

Each brand adds a profile ID, e.g. `BUMBLERIDE_US_PROFILE`.

### AMC (Path to Conversion)

Shares CP Ads LWA **client** credentials; uses a dedicated refresh token:

- `CP_ADS_CLIENT_ID`, `CP_ADS_CLIENT_SECRET`
- `CP_AMC_REFRESH_TOKEN`
- Per brand: `{BRAND}_AMC_ENTITY_ID`, `{BRAND}_AMC_INSTANCE_ID`, `{BRAND}_AMC_MARKETPLACE_ID`

See [AMC Pipeline](/pipelines/amc-pipeline).

## Runtime account discovery

Accounts appear in API responses only when credentials are present in environment:

```bash
curl http://localhost:8080/api/v1/accounts
curl http://localhost:8080/api/v1/ads/accounts
```

- **SP brands:** `AccountConfig.get_available_accounts()` — gated on Research-app client credentials plus per-brand refresh tokens
- **Ads brands:** `AccountConfig.get_available_ads_accounts()`

## Inbound API security

The FastAPI service has **no authentication middleware** on its own endpoints. Cloud Run is deployed with `--allow-unauthenticated`, meaning the HTTP API is publicly accessible.

**Production protections:**

- Cloud Tasks → Cloud Run uses OIDC via `CLOUD_TASKS_SERVICE_ACCOUNT`
- Cloud Scheduler → Cloud Run uses OIDC service account
- Credentials never exposed in API responses (only presence flags)

**Recommended hardening** (not yet implemented):

- API gateway or Cloud Run IAM authentication
- VPC connector for internal-only access
- IP allowlisting

See [Infrastructure](/deployment/infrastructure#security).

## Outbound authentication

`SPAPIAuth` and `AdsAPIAuth` in `app/utils/auth.py`:

1. Read credentials from `AccountConfig`
2. POST to `https://api.amazon.com/auth/o2/token` with refresh token
3. Return access token for Amazon API calls

## BigQuery datasets

| Variable | Default | Purpose |
|----------|---------|---------|
| `BIGQUERY_DATASET` | `amz_sp_api_reports_v1` | SP report tables |
| `BIGQUERY_ADS_DATASET` | `amz_ads_api_reports_v1` | Ads report tables |
| `GCP_PROJECT_ID` | `research-analytics-v1` | GCP project |

## Cloud Tasks (production)

| Variable | Default | Purpose |
|----------|---------|-------------|
| `CLOUD_RUN_SERVICE_URL` | — | Worker HTTP target |
| `CLOUD_TASKS_QUEUE` | `ads-reports-queue` | Ads daily dispatch |
| `CLOUD_TASKS_RETRY_QUEUE` | `ads-reports-retry-queue` | Ads retries |
| `SP_CLOUD_TASKS_QUEUE` | `sp-reports-queue` | SP batch workers |
| `CLOUD_TASKS_SERVICE_ACCOUNT` | — | OIDC for task HTTP calls |

Full list: [Environment Variables](/reference/environment-variables)

## Cloud Run redeploy

Cloud Run pins Secret Manager values when a **new revision** is deployed. After updating any `*_SP_REFRESH_TOKEN` or `RESEARCH_APP_SP_*` secret, redeploy the service (push to `main` / re-run Cloud Build, or `gcloud run services update`) so workers pick up the latest secret versions.

## Security notes

- Never commit `.env` or credential files to git
- Use Secret Manager in production (via `cloudbuild.yaml` `--set-secrets`)
- Rotate refresh tokens when authorization is revoked in Seller Central / Advertising Console
- Remove stale `CP_SP_*` lines from local `.env` — those env vars were removed in the June 2026 migration

## Related pages

- [Brand Onboarding](/onboarding/brand-onboarding)
- [Environment Variables](/reference/environment-variables)
- [Infrastructure Security](/deployment/infrastructure#security)

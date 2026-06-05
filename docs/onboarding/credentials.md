# Credentials & Authorization

How Amazon Pipelines authenticates with Amazon APIs and manages multi-account credentials.

## API surfaces

| Surface | Auth model | Brand-specific secret |
|---------|------------|----------------------|
| **SP-API** | LWA OAuth | Refresh token per brand |
| **Ads API** | LWA OAuth + profile | Profile ID per brand |

Source of truth: `app/config.py` (`Settings` and `AccountConfig`).

## Credential models

### OE (standalone)

Uses its own client ID, secret, and refresh token for both SP and Ads:

- `OE_SP_CLIENT_ID`, `OE_SP_CLIENT_SECRET`, `OE_SP_REFRESH_TOKEN`
- `OE_ADS_CLIENT_ID`, `OE_ADS_CLIENT_SECRET`, `OE_ADS_REFRESH_TOKEN`, `OE_ADS_PROFILE`

### CP brands (SP-API)

All CP brands share:

- `CP_SP_CLIENT_ID`, `CP_SP_CLIENT_SECRET`

Each brand adds only its refresh token, e.g. `BUMBLERIDE_SP_REFRESH_TOKEN`.

### CP brands (Ads API)

All CP Ads brands share:

- `CP_ADS_CLIENT_ID`, `CP_ADS_CLIENT_SECRET`, `CP_ADS_REFRESH_TOKEN`

Each brand adds a profile ID, e.g. `BUMBLERIDE_US_PROFILE`.

### Research-app brands (SP-API only)

Some brands' SP refresh tokens were minted against the Research LWA application instead of CP. For these brands, `get_account_credentials()` swaps client ID/secret to Research-app credentials:

| Env var | Purpose |
|---------|---------|
| `RESEARCH_APP_SP_CLIENT_ID` | Research LWA client ID |
| `RESEARCH_APP_SP_CLIENT_SECRET` | Research LWA client secret |

**Affected brands** (defined in `RESEARCH_APP_BRANDS`):

`HEARTLAND`, `COLEHAAN`, `EVENFLO`, `INVIROX`, `MOONBOOTS`, `USCAPE`, `WONDERFOLDCA`

This is a temporary override. See [Design Decision: Research App Override](/developer/design-decisions/research-app-override).

## Runtime account discovery

Accounts appear in API responses only when credentials are present in environment:

```bash
curl http://localhost:8080/api/v1/accounts
curl http://localhost:8080/api/v1/ads/accounts
```

- **SP brands:** `AccountConfig.get_available_accounts()`
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
|----------|---------|---------|
| `CLOUD_RUN_SERVICE_URL` | — | Worker HTTP target |
| `CLOUD_TASKS_QUEUE` | `ads-reports-queue` | Ads daily dispatch |
| `CLOUD_TASKS_RETRY_QUEUE` | `ads-reports-retry-queue` | Ads retries |
| `SP_CLOUD_TASKS_QUEUE` | `sp-reports-queue` | SP batch workers |
| `CLOUD_TASKS_SERVICE_ACCOUNT` | — | OIDC for task HTTP calls |

Full list: [Environment Variables](/reference/environment-variables)

## Security notes

- Never commit `.env` or credential files to git
- Use Secret Manager in production (via `cloudbuild.yaml` `--set-secrets`)
- Rotate refresh tokens when authorization is revoked in Seller Central / Advertising Console

## Related pages

- [Brand Onboarding](/onboarding/brand-onboarding)
- [Environment Variables](/reference/environment-variables)
- [Infrastructure Security](/deployment/infrastructure#security)

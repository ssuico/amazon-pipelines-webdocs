# Brand Onboarding

End-to-end checklist for adding a new brand to the Amazon Pipelines service. Each brand can opt in to SP-API, Ads API, or both.

## Mental model

- **SP client credentials are shared.** All CP portfolio brands use `RESEARCH_APP_SP_CLIENT_ID/SECRET` for SP-API. Only the **refresh token** is brand-specific.
- **Ads client credentials are shared.** CP Ads brands reuse `CP_ADS_CLIENT_ID/SECRET/REFRESH_TOKEN`. Only the **profile ID** is brand-specific.
- **OE is the exception.** OE has its own client credentials for both SP and Ads.
- **`account_name` is the routing key.** Whatever string you pick (e.g. `Bumbleride`) is what callers pass to endpoints and what `AccountConfig` matches.

## Step 1 — Obtain credentials from Amazon

1. **SP-API refresh token** — Complete SP-API OAuth using the **Research LWA application** against the brand's Seller Central account. Persist the `refresh_token`.
2. **Ads API profile ID** — After the brand authorizes the CP Ads LWA app, call `GET https://advertising-api.amazon.com/v2/profiles` and pick the profile whose `accountInfo.name` matches the brand. Record the numeric `profileId`.

## Step 2 — Add fields to `app/config.py`

For **SP-API**:

```python
<brand>_sp_refresh_token: Optional[str] = Field(default=None, alias="<BRAND>_SP_REFRESH_TOKEN")
```

For **Ads API**:

```python
<brand>_us_profile: Optional[str] = Field(default=None, alias="<BRAND>_US_PROFILE")
```

## Step 3 — Wire the brand into `AccountConfig`

**SP-API** — add an `elif` branch in `AccountConfig.get_account_credentials()`:

```python
elif account_name_upper == "<BRAND>":
    return {
        "client_id": settings.research_app_sp_client_id,
        "client_secret": settings.research_app_sp_client_secret,
        "refresh_token": settings.<brand>_sp_refresh_token,
        "marketplace_ids": [settings.sp_api_marketplace_id],
        "dataset": settings.bigquery_dataset,
    }
```

Register in `get_available_accounts()`:

```python
if settings.<brand>_sp_refresh_token:
    accounts.append("<BrandDisplayName>")
```

**Ads API** — add one tuple to `CP_ADS_BRAND_PROFILES`:

```python
("<BrandDisplayName>", "<brand>_us_profile"),
```

## Step 4 — Update `.env` for local development

```dotenv
RESEARCH_APP_SP_CLIENT_ID=...
RESEARCH_APP_SP_CLIENT_SECRET=...
<BRAND>_SP_REFRESH_TOKEN=Atzr|...
<BRAND>_US_PROFILE='1234567890123456'
```

## Step 5 — Create secrets in GCP Secret Manager

```bash
echo -n "Atzr|..." | gcloud secrets create <BRAND>_SP_REFRESH_TOKEN \
    --replication-policy="automatic" \
    --data-file=- \
    --project=research-analytics-v1

gcloud secrets add-iam-policy-binding <BRAND>_SP_REFRESH_TOKEN \
    --member="serviceAccount:fastapi-bq-acess@research-analytics-v1.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --project=research-analytics-v1
```

## Step 6 — Bind the secret in `cloudbuild.yaml`

Append to the `--set-secrets` flag:

```
...,<BRAND>_SP_REFRESH_TOKEN=<BRAND>_SP_REFRESH_TOKEN:latest,<BRAND>_US_PROFILE=<BRAND>_US_PROFILE:latest
```

Do **not** add credential values to `--set-env-vars`.

## Step 7 — Verify

1. **Local discovery:**
   ```bash
   python -c "from app.config import account_config; print(account_config.get_available_accounts()); print(account_config.get_available_ads_accounts())"
   ```

2. **Smoke test SP:**
   ```bash
   curl -X POST "http://localhost:8080/api/v1/sp/brands/<BrandDisplayName>/process-all-reports?load_last_day=true&reports_filter=inventory"
   ```

3. **Smoke test Ads** — dispatch with account filter:
   ```bash
   curl -X POST "http://localhost:8080/api/v1/ads/dispatch?accounts_filter=<BrandDisplayName>&report_types=spCampaigns"
   ```

4. **Deploy** — push to trigger Cloud Build, then re-run smoke tests against Cloud Run URL. After rotating any refresh token in Secret Manager, **redeploy Cloud Run** so the new revision picks up the secret.

## Important notes

- Onboarding requires synchronized edits in **four locations**: `config.py`, `.env`, Secret Manager, and `cloudbuild.yaml`
- Missing any one produces a silent skip (brand absent from `get_available_accounts()`) rather than a hard failure
- Display names are case-insensitive on input but returned verbatim from API — keep stable once chosen
- Assumes US marketplace (`ATVPDKIKX0DER`)
- SP refresh tokens must be minted against the Research LWA app — see [Research-App SP Migration](/developer/design-decisions/research-app-sp-migration)

## Related pages

- [Credentials & Auth](/onboarding/credentials)
- [Deployment](/deployment/cloud-run)
- [Environment Variables](/reference/environment-variables)

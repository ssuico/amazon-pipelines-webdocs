# Environment Variables

**Last updated:** 2026-08-26

Complete reference for configuration loaded by `Settings` in `app/config.py`. Values are read from `.env` locally or injected via Cloud Run / Secret Manager in production.

## Application

| Env var | Default | Required | Description |
|---------|---------|----------|-------------|
| `ENV` | `development` | No | Environment name |
| `DEBUG` | `false` | No | Debug mode (`debug`/`dev`/`development` = true; `release`/`prod` = false) |

## SP-API credentials

### Default / main account

| Env var | Description |
|---------|-------------|
| `SP_CLIENT_ID` | Default SP client ID |
| `SP_CLIENT_SECRET` | Default SP client secret |
| `SP_REFRESH_TOKEN` | Default SP refresh token |

### OE (standalone)

| Env var | Description |
|---------|-------------|
| `OE_SP_CLIENT_ID` | OE SP client ID |
| `OE_SP_CLIENT_SECRET` | OE SP client secret |
| `OE_SP_REFRESH_TOKEN` | OE SP refresh token |

### CP portfolio brands (Research-app SP credentials)

| Env var | Description |
|---------|-------------|
| `RESEARCH_APP_SP_CLIENT_ID` | Shared Research LWA client ID for all CP portfolio SP brands |
| `RESEARCH_APP_SP_CLIENT_SECRET` | Shared Research LWA client secret |

### Brand refresh tokens

Each SP brand has its own refresh token env var, e.g.:

`BUMBLERIDE_SP_REFRESH_TOKEN`, `CLOUD_NINE_SP_REFRESH_TOKEN`, `REDFIELD_SP_REFRESH_TOKEN`, `SKINS_SP_REFRESH_TOKEN`, etc.

See `app/config.py` for the full list of brand-specific fields.

### SP-API settings

| Env var | Default | Description |
|---------|---------|-------------|
| `SP_API_REGION` | `us-east-1` | SP-API region |
| `SP_API_MARKETPLACE_ID` | `ATVPDKIKX0DER` | US marketplace ID |

## Ads API credentials

### CP shared app

| Env var | Description |
|---------|-------------|
| `CP_ADS_CLIENT_ID` | Shared CP Ads client ID |
| `CP_ADS_CLIENT_SECRET` | Shared CP Ads client secret |
| `CP_ADS_REFRESH_TOKEN` | Shared CP Ads refresh token |

Standalone `OE_ADS_*` vars were removed — OE Ads uses `OEUS` + `OE_US_PROFILE` on the CP Ads app.

### Brand profile IDs

Each Ads brand has a profile env var, e.g.:

`BUMBLERIDE_US_PROFILE`, `HEARTLAND_US_PROFILE`, `OE_US_PROFILE`, etc.

Mapped via `CP_ADS_BRAND_PROFILES` in `app/config.py`.

| Env var | Default | Description |
|---------|---------|-------------|
| `ADS_API_REGION` | `us-east-1` | Ads API region |

## Google Cloud

| Env var | Default | Required (prod) | Description |
|---------|---------|-----------------|-------------|
| `GCP_PROJECT_ID` | `research-analytics-v1` | Yes | GCP project |
| `BIGQUERY_DATASET` | `amz_sp_api_reports_v1` | Yes | SP dataset |
| `BIGQUERY_ADS_DATASET` | `amz_ads_api_reports_v1` | Yes | Ads dataset |
| `BIGQUERY_AGG_DATASET` | `agg_tables_v2` | Brand Analytics | Aggregated metrics read API |
| `BIGQUERY_AMC_DATASET` | `amazon_amc_v1` | AMC | Path to Conversion warehouse |
| `GOOGLE_APPLICATION_CREDENTIALS` | — | Local only | Path to SA JSON key |

## Cloud Tasks

| Env var | Default | Required (prod) | Description |
|---------|---------|-----------------|-------------|
| `CLOUD_TASKS_PROJECT` | falls back to `GCP_PROJECT_ID` | Yes | Tasks project |
| `CLOUD_TASKS_LOCATION` | `us-central1` | Yes | Queue region |
| `CLOUD_TASKS_QUEUE` | `ads-reports-queue` | Yes | Ads dispatch queue |
| `CLOUD_TASKS_RETRY_QUEUE` | `ads-reports-retry-queue` | Yes | Ads retry queue |
| `SP_CLOUD_TASKS_QUEUE` | `sp-reports-queue` | Yes | SP worker queue |
| `AMC_CLOUD_TASKS_QUEUE` | `amc-reports-queue` | AMC | AMC worker queue |
| `CLOUD_RUN_SERVICE_URL` | — | Yes | Worker HTTP target base URL |
| `CLOUD_TASKS_SERVICE_ACCOUNT` | — | Yes | OIDC identity for task HTTP calls |

## AMC credentials

| Env var | Description |
|---------|-------------|
| `CP_AMC_REFRESH_TOKEN` | Dedicated AMC LWA refresh token (client ID/secret shared with CP Ads) |
| `{BRAND}_AMC_ENTITY_ID` | AMC entity / advertiser ID |
| `{BRAND}_AMC_INSTANCE_ID` | Production instance ID |
| `{BRAND}_AMC_SANDBOX_INSTANCE_ID` | Sandbox instance (stored; not used by default) |
| `{BRAND}_AMC_MARKETPLACE_ID` | Marketplace ID for AMC headers |

See [AMC Pipeline](/pipelines/amc-pipeline).

## Throttling — SP-API

| Env var | Default | Description |
|---------|---------|-------------|
| `SP_TASK_START_SPACING_SECONDS` | `45` | Delay between SP task dispatches |
| `SP_API_MIN_REQUEST_INTERVAL_SECONDS` | `1.0` | Min interval between SP API calls |
| `SP_API_HTTP_MAX_ATTEMPTS` | `4` | HTTP retry attempts |
| `SP_API_HTTP_INITIAL_BACKOFF_SECONDS` | `2.0` | Initial backoff |
| `SP_API_HTTP_MAX_BACKOFF_SECONDS` | `60.0` | Max backoff |
| `SP_REPORT_TERMINAL_STATUS_MAX_ATTEMPTS` | `3` | Retries on terminal report status |
| `SP_REPORT_TERMINAL_STATUS_INITIAL_BACKOFF_SECONDS` | `60.0` | Terminal status initial backoff |
| `SP_REPORT_TERMINAL_STATUS_MAX_BACKOFF_SECONDS` | `300.0` | Terminal status max backoff |
| `SP_REPORT_POLL_INTERVAL_SECONDS` | `30` | Report poll interval |
| `SP_FBA_NEAR_REALTIME_COOLDOWN_MINUTES` | `30` | Min minutes between FBA snapshot `createReport` calls per seller |

## Throttling — Ads API

| Env var | Default | Description |
|---------|---------|-------------|
| `ADS_API_MIN_REQUEST_INTERVAL_SECONDS` | `0.5` | Min interval between Ads API calls |
| `ADS_API_HTTP_MAX_ATTEMPTS` | `5` | HTTP retry attempts |
| `ADS_API_HTTP_INITIAL_BACKOFF_SECONDS` | `1.0` | Initial backoff |
| `ADS_API_HTTP_MAX_BACKOFF_SECONDS` | `120.0` | Max backoff |
| `ADS_ASYNC_POLL_ENABLED` | `true` | Create-then-check async worker path |
| `ADS_CHECK_INITIAL_DELAY_SECONDS` | `120` | Delay before first check task |
| `ADS_CHECK_BACKOFF_SECONDS` | `120` | Linear backoff step between checks |
| `ADS_CHECK_MAX_BACKOFF_SECONDS` | `600` | Cap on check backoff |
| `ADS_CHECK_MAX_ATTEMPTS` | `15` | Max check attempts before FAILED (timeout) |
| `ADS_CHECK_RECREATE_MAX_ATTEMPTS` | `2` | Max recreate attempts on Amazon FAILED |
| `ADS_RUNNING_SKIP_MINUTES` | `120` | Skip create if recent RUNNING exists |
| `ADS_DISPATCH_STAGGER_SECONDS` | `15` | Stagger between dispatch task schedule times |

## AMC polling

| Env var | Default | Description |
|---------|---------|-------------|
| `AMC_POLL_INTERVAL_SECONDS` | `60` | Check-execution spacing |
| `AMC_CHECK_MAX_ATTEMPTS` | `90` | Max check attempts |
| `AMC_EXECUTION_TIMEOUT_SECONDS` | `3600` | Execution timeout |

## Conversational Analytics

| Env var | Default | Description |
|---------|---------|-------------|
| `CONVERSATIONAL_ANALYTICS_LOCATION` | `global` | Data agent / conversation region |
| `DATA_AGENT_ID_PREFIX` | `brand-agg-` | Agent id prefix (`{prefix}{brand_lower}`) |
| `CONVERSATIONAL_ANALYTICS_PILOT_BRAND` | `Vertx` | Default brand for provision script |

Reuses `GCP_PROJECT_ID` and `BIGQUERY_AGG_DATASET`. See [Conversational Analytics](/reference/conversational-analytics).

## Secret Manager

| Env var | Default | Description |
|---------|---------|-------------|
| `USE_SECRET_MANAGER` | `false` | Enable Secret Manager path |
| `SECRET_MANAGER_PROJECT_ID` | — | Secret Manager project |

Note: `app/utils/secrets.py` `get_secret()` is currently a stub. Production uses Cloud Run `--set-secrets` bindings in `cloudbuild.yaml`.

## Related pages

- [Credentials & Auth](/onboarding/credentials)
- [Deployment](/deployment/)
- [Cloud Run](/deployment/cloud-run)

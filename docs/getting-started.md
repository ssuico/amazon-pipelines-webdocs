# Getting Started

This guide helps you run the Amazon Pipelines API locally and verify your setup with the first API calls.

## Prerequisites

- Python 3.11+
- Amazon SP-API credentials (and/or Ads API credentials)
- Google Cloud credentials for BigQuery (optional locally; required in production)

## Quick setup

### 1. Install dependencies

```bash
cd amazon-pipelines
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment variables

Create a `.env` file in the project root. Minimal SP example:

```bash
# OE Account
OE_SP_CLIENT_ID=your_client_id
OE_SP_CLIENT_SECRET=your_client_secret
OE_SP_REFRESH_TOKEN=your_refresh_token

# Research app (shared by CP portfolio brand accounts)
RESEARCH_APP_SP_CLIENT_ID=research_app_client_id
RESEARCH_APP_SP_CLIENT_SECRET=research_app_client_secret
BUMBLERIDE_SP_REFRESH_TOKEN=brand_token

# BigQuery
GCP_PROJECT_ID=research-analytics-v1
BIGQUERY_DATASET=amz_sp_api_reports_v1
BIGQUERY_ADS_DATASET=amz_ads_api_reports_v1

# General
SP_API_REGION=us-east-1
SP_API_MARKETPLACE_ID=ATVPDKIKX0DER
ENV=development
DEBUG=true
```

See [Credentials & Auth](/onboarding/credentials) for OE, CP portfolio, and Ads models.

### 3. Run the application

```bash
python run.py
# or
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

- API: http://localhost:8080
- Swagger: http://localhost:8080/docs
- Health: http://localhost:8080/health

### 4. Test your setup

```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/v1/accounts
curl -X POST "http://localhost:8080/api/v1/accounts/OE/reports/listings?load_last_day=true"
```

## Common use cases

### Load yesterday's orders (single brand)

```bash
curl -X POST "http://localhost:8080/api/v1/accounts/OE/reports/orders?load_last_day=true"
```

### Dispatch sales report for all brands (Cloud Tasks)

```bash
curl -X POST "http://localhost:8080/api/v1/sp/reports/sales_and_traffic/process-all-brands?load_last_day=true"
```

### Dispatch Ads reports (production pattern)

```bash
curl -X POST "http://localhost:8080/api/v1/ads/dispatch"
```

### Check pipeline status

```bash
curl "http://localhost:8080/api/v1/report-status/summary"
curl "http://localhost:8080/api/v1/ads-report-status/summary"
```

## Available report types

### SP-API (7 types)

| Key | Description |
|-----|-------------|
| `orders` | Order details |
| `inventory` | Inventory levels |
| `listings` | Product listings |
| `sales_and_traffic` | Sales & traffic metrics |
| `returns` | Returns data |
| `fba_inventory` | FBA inventory |
| `merchants_listings_fyp` | Fix Your Products |

Full reference: [SP Report Types](/reference/sp-report-types)

### Ads API (12 types)

**SP:** `spCampaigns`, `spTargeting`, `spSearchTerm`, `spAdvertisedProduct`, `spPurchasedProduct`

**SB:** `sbCampaigns`, `sbTargeting`, `sbSearchTerm`, `sbAds`, `sbPurchasedProduct`

**SD:** `sdCampaigns`, `sdTargeting`

Full reference: [Ads Report Types](/reference/ads-report-types)

## Obtaining Amazon credentials

### SP-API

1. Register at https://developer.amazonservices.com/
2. Create a developer application in Seller Central
3. Generate LWA credentials (Client ID and Client Secret)
4. Authorize your application to get a Refresh Token

### Ads API

1. Register at [Amazon Advertising API](https://advertising.amazon.com/API/docs)
2. Create LWA application
3. Authorize and obtain refresh token
4. Retrieve profile ID via `/v2/profiles`

See [Amazon Ads API Integration](/integrations/ads-api) for details.

## Next steps

- [Architecture Overview](/architecture/) — how the platform fits together
- [SP Pipeline](/pipelines/sp-pipeline) — SP-API → BigQuery
- [Ads Pipeline](/pipelines/ads-pipeline) — Ads integration
- [Batch Scheduling](/pipelines/batch-scheduling) — Cloud Scheduler patterns
- [Deployment](/deployment/) — Cloud Run production setup
- [FAQ](/faq) — common questions

## Related pages

- [Local Development](/developer/local-development) — developer-focused setup
- [Credentials Guide](/onboarding/credentials) — full credential models
- [Troubleshooting](/troubleshooting/common-issues) — setup problems

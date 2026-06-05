# Local Development

Developer-focused setup guide for working on the Amazon Pipelines codebase.

## Setup

```bash
cd amazon-pipelines
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env .env.local         # configure credentials
```

## Run with hot reload

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

Or:

```bash
python run.py
```

## Environment

Minimum `.env` for SP development:

```bash
OE_SP_CLIENT_ID=...
OE_SP_CLIENT_SECRET=...
OE_SP_REFRESH_TOKEN=...
GCP_PROJECT_ID=research-analytics-v1
BIGQUERY_DATASET=amz_sp_api_reports_v1
BIGQUERY_ADS_DATASET=amz_ads_api_reports_v1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa-key.json
ENV=development
DEBUG=true
```

Full reference: [Environment Variables](/reference/environment-variables)

## Verify accounts

```python
from app.config import account_config
print("SP:", account_config.get_available_accounts())
print("Ads:", account_config.get_available_ads_accounts())
```

## Test a single report (inline)

```bash
curl -X POST "http://localhost:8080/api/v1/accounts/OE/reports/inventory?load_last_day=true"
```

## Test batch dispatch (requires Cloud Tasks config)

For local Cloud Tasks testing, set:

```bash
CLOUD_RUN_SERVICE_URL=http://localhost:8080
CLOUD_TASKS_PROJECT=research-analytics-v1
CLOUD_TASKS_LOCATION=us-central1
```

Or use inline endpoints that skip Cloud Tasks.

## Code conventions

- Import SP services from `app.services.sp.*` (not `app.services.amazon_sp`)
- Import trackers from `app.services.sp.report_status_tracker`
- Register new SP schemas in `app/schemas/sp/report_registry.py`
- Add brand credentials in four places: config.py, .env, Secret Manager, cloudbuild.yaml

## Related pages

- [Testing](/developer/testing)
- [Getting Started](/getting-started)
- [Adding an SP Report](/developer/adding-sp-report)

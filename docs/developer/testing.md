# Testing

How to run and write tests for Amazon Pipelines.

## Run all tests

```bash
cd amazon-pipelines
pytest
```

## Test structure

```
tests/
├── test_cloud_tasks.py     # Cloud Tasks queue routing and task creation
└── ads/
    ├── test_amazon_ads.py
    ├── test_report_processor.py
    ├── test_ads_report_tracker.py
    └── test_ads_jobs.py
```

## Cloud Tasks tests

`tests/test_cloud_tasks.py` verifies:

- Queue name resolution from config
- Task payload construction
- SP deterministic task naming
- Ads and retry queue routing

## Ads unit tests

Located in `tests/ads/`. Mock `requests.post` and `requests.get` for Amazon API calls.

Run Ads tests only:

```bash
pytest tests/ads/
pytest tests/ads/test_amazon_ads.py -v
```

### Mocking strategy

Ads tests mock HTTP at the `requests` level:

```python
@patch("app.services.ads.amazon_ads.requests.post")
def test_create_report(mock_post):
    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = {"reportId": "abc123"}
    # ... test service method
```

## Manual testing

Use Swagger UI at http://localhost:8080/docs or curl examples from [Getting Started](/getting-started).

Recommended smoke tests after changes:

```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/v1/accounts
curl "http://localhost:8080/api/v1/report-status/health"
```

## Coverage goals

Ads tests aim to cover:

- Report creation and status polling
- Report download and parsing
- Incremental load date calculation
- Status tracker read/write
- Dispatch endpoint validation

## Related pages

- [Developer Guide](/developer/)
- [Local Development](/developer/local-development)

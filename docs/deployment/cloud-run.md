# Cloud Run Deployment

Deploy the Amazon Pipelines container to Google Cloud Run.

## Production configuration

From `cloudbuild.yaml`:

| Setting | Value |
|---------|-------|
| Service name | `amazon-pipelines` |
| Region | `us-central1` |
| Memory | **16 GiB** |
| CPU | **4** |
| Timeout | 3600 s |
| Max instances | 10 |
| Min instances | 0 |
| Port | 8080 |
| Auth | `--allow-unauthenticated` |

Memory was upgraded from 8 Gi to 16 Gi in May 2026 to handle concurrent worker processing. See [Design Decision: Cloud Run Memory](/developer/design-decisions/cloud-run-memory).

## Deploy via Cloud Build

```bash
gcloud builds submit --config cloudbuild.yaml
```

Cloud Build steps:

1. Build Docker image from `Dockerfile`
2. Push to `us-central1-docker.pkg.dev/research-analytics-v1/fastapi-repo/amazon-pipelines`
3. Deploy to Cloud Run with env vars and secret bindings

## Dockerfile

```dockerfile
FROM python:3.11-slim
# Non-root appuser
# Copies app/ + requirements.txt
# Healthcheck: GET /health
# CMD: uvicorn app.main:app --host 0.0.0.0 --port 8080
```

Key details:

- Python 3.11-slim base image
- Runs as non-root `appuser`
- Health check probes `/health`
- Single worker process via uvicorn

## Manual deploy (alternative)

```bash
# Build and push
docker build -t us-central1-docker.pkg.dev/research-analytics-v1/fastapi-repo/amazon-pipelines:latest .
docker push us-central1-docker.pkg.dev/research-analytics-v1/fastapi-repo/amazon-pipelines:latest

# Deploy
gcloud run deploy amazon-pipelines \
  --image us-central1-docker.pkg.dev/research-analytics-v1/fastapi-repo/amazon-pipelines:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --service-account fastapi-bq-acess@research-analytics-v1.iam.gserviceaccount.com \
  --memory 16Gi \
  --cpu 4 \
  --timeout 3600 \
  --max-instances 10 \
  --port 8080
```

## Verify

```bash
gcloud run services describe amazon-pipelines --region us-central1

curl $(gcloud run services describe amazon-pipelines --region us-central1 --format='value(status.url)')/health
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check Dockerfile and requirements.txt |
| Deploy fails on secrets | Verify Secret Manager bindings in cloudbuild.yaml |
| 503 on cold start | Normal for min-instances=0; first request may be slow |
| OOM errors | Verify memory is 16Gi (not 1Gi from old docs) |
| Health check fails | Check `/health` endpoint and port 8080 |

## Related pages

- [Infrastructure](/deployment/infrastructure)
- [Brand Onboarding](/onboarding/brand-onboarding)
- [Environment Variables](/reference/environment-variables)

# Deployment Overview

Deploy the Amazon Pipelines FastAPI service to Google Cloud Run with Cloud Build, Cloud Tasks, and Cloud Scheduler.

## Quick deploy

```bash
cd amazon-pipelines
gcloud builds submit --config cloudbuild.yaml
```

Deployment takes 3–5 minutes. The service will be available at the Cloud Run URL.

## Infrastructure components

| Component | Purpose |
|-----------|---------|
| **Cloud Run** | Hosts FastAPI application |
| **Artifact Registry** | Container image storage |
| **Cloud Build** | Build and deploy pipeline |
| **Cloud Tasks** | Async worker dispatch (3 queues) |
| **Cloud Scheduler** | Daily cron triggers (8 jobs) |
| **BigQuery** | Report data storage |
| **Secret Manager** | Production credential injection |

## Documentation map

| Topic | Page |
|-------|------|
| GCP topology and security | [Infrastructure](/deployment/infrastructure) |
| Cloud Run, Docker, sizing | [Cloud Run](/deployment/cloud-run) |
| Queues and Scheduler setup | [Cloud Tasks & Scheduler](/deployment/cloud-tasks-scheduler) |
| Brand credentials | [Brand Onboarding](/onboarding/brand-onboarding) |
| Scheduled jobs | [Scheduled Jobs](/operations/scheduled-jobs) |

## Prerequisites

- Google Cloud Project: `research-analytics-v1` (billing enabled)
- gcloud CLI installed and authenticated
- Amazon credentials configured in Secret Manager
- Required APIs enabled: Run, Cloud Build, Artifact Registry, BigQuery, Cloud Tasks, Cloud Scheduler

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  bigquery.googleapis.com \
  cloudtasks.googleapis.com \
  cloudscheduler.googleapis.com
```

## Verify deployment

```bash
# Get service URL
gcloud run services describe amazon-pipelines --region us-central1 --format='value(status.url)'

# Health check
curl https://YOUR-URL/health

# API docs
# https://YOUR-URL/docs
```

## Related pages

- [Getting Started](/getting-started)
- [Operations Runbook](/operations/)

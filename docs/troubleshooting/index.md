# Troubleshooting Overview

Central index for diagnosing and resolving Amazon Pipelines issues.

## Quick diagnosis

| Symptom | First check |
|---------|-------------|
| No data for a brand | `GET /api/v1/accounts` — is brand listed? |
| SP report failed | `GET /api/v1/report-status/failed?days_back=1` |
| Ads report stuck | `GET /api/v1/ads-report-status/failed?days_back=1` |
| 401 from Amazon | Check credentials / token expiry |
| Task dispatched but no worker run | Check Cloud Tasks queue + Cloud Run logs |
| Dashboard shows stale data | Expected — 2 min cache on aggregate endpoints |

## Documentation map

| Topic | Page |
|-------|------|
| Common issues and fixes | [Common Issues](/troubleshooting/common-issues) |
| SP status tracker internals | [SP Status Tracker](/troubleshooting/sp-status-tracker) |
| Failed report recovery | [Failed Reports](/operations/failed-reports) |
| Operations procedures | [Operations Runbook](/operations/) |
| FAQ | [FAQ](/faq) |

## Related pages

- [Monitoring](/operations/monitoring)
- [Getting Started](/getting-started)

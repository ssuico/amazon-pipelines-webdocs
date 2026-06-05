# Research App Credential Override

**Date:** 2026-05-18 · **Status:** Accepted (temporary)

## Context

Some CP brands' SP refresh tokens were minted against the Research LWA application instead of the CP application. Using CP client credentials with these tokens causes authentication failures.

## Decision

Post-processing override in `AccountConfig.get_account_credentials()`:

```python
RESEARCH_APP_BRANDS = {
    "HEARTLAND", "COLEHAAN", "EVENFLO", "INVIROX",
    "MOONBOOTS", "USCAPE", "WONDERFOLDCA"
}
```

When `account_name.upper()` is in this set, swap `client_id` and `client_secret` to `RESEARCH_APP_SP_CLIENT_ID/SECRET`.

## Onboarding

To add another Research-app brand: add its uppercased display name to `RESEARCH_APP_BRANDS`. Everything else follows the standard [Brand Onboarding](/onboarding/brand-onboarding) flow.

## Removal plan

When all brands migrate to CP-issued refresh tokens:

1. Remove `RESEARCH_APP_BRANDS` set and override block (~10 lines)
2. Remove `RESEARCH_APP_SP_CLIENT_ID/SECRET` env vars and Secret Manager bindings

## User-facing documentation

See [Credentials & Auth](/onboarding/credentials#research-app-brands-sp-api-only).

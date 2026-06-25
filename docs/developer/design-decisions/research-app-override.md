# Research App Credential Override

**Date:** 2026-05-18 · **Status:** Superseded by [Research-App SP Migration](/developer/design-decisions/research-app-sp-migration) (2026-06-23)

::: warning Historical record
This ADR describes a temporary override that has been removed. All CP portfolio SP brands now use `RESEARCH_APP_SP_CLIENT_ID/SECRET` directly in `get_account_credentials()`. Do not add `RESEARCH_APP_BRANDS` — it no longer exists.
:::

## Context

Some CP brands' SP refresh tokens were minted against the Research LWA application instead of the CP application. Using CP client credentials with these tokens caused authentication failures.

## Decision (original)

Post-processing override in `AccountConfig.get_account_credentials()`:

```python
RESEARCH_APP_BRANDS = {
    "HEARTLAND", "COLEHAAN", "EVENFLO", "INVIROX",
    "MOONBOOTS", "USCAPE", "WONDERFOLDCA"
}
```

When `account_name.upper()` was in this set, swap `client_id` and `client_secret` to `RESEARCH_APP_SP_CLIENT_ID/SECRET`.

## What replaced it

The June 2026 migration removed the override set and pointed every CP portfolio brand branch at Research-app credentials directly. `CP_SP_CLIENT_ID` and `CP_SP_CLIENT_SECRET` were removed from `Settings` and `cloudbuild.yaml`.

See [Research-App SP Migration](/developer/design-decisions/research-app-sp-migration) and [Credentials & Auth](/onboarding/credentials).

# Documentation Sync Revalidation — Last Updated Discipline

**Date:** 2026-07-20
**Status:** accepted
**Author:** ai

## Context

Supersedes the timestamp handling implied by [2026-07-20-doc-sync-jul-updates.md](./2026-07-20-doc-sync-jul-updates.md) where every docs page was stamped `2026-07-20`. That violated meaningful **Last Updated** metadata. Skill: `.cursor/skills/incremental-documentation-sync/SKILL.md`.

## Decision

1. Keep VitePress `lastUpdated: false` (no git footer).
2. Keep in-page `**Last updated:** YYYY-MM-DD` **only** on pages whose content changed in the Jul sync (plus gap fills found during revalidation).
3. Restore stamp-only pages to their prior committed content (no date stamp).
4. During revalidation, update Architecture overview and Ads API integration for AMC/async gaps that the first pass missed.

## Consequences

- Last Updated dates remain historically meaningful.
- Future syncs must follow the incremental skill and produce a sync report.

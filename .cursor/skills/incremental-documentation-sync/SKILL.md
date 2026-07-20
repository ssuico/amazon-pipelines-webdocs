---
name: incremental-documentation-sync
description: >-
  Synchronize amazon-pipelines-webdocs from the amazon-pipelines GitHub repo
  incrementally—update only sections affected by new or changed code, preserve
  Last Updated dates on unchanged pages, and produce a sync report. Use when
  syncing docs from GitHub, updating webdocs from amazon-pipelines commits,
  or when the user asks for incremental documentation synchronization.
---

# Skill: Incremental Documentation Sync

## Objective

Synchronize project documentation from the GitHub repository while preserving historical documentation metadata.

Repository:

```text
https://github.com/ssuico/amazon-pipelines
```

This skill should perform **incremental documentation synchronization**, updating only the sections affected by newly added or modified code.

### Project mapping

| Role | Path |
|------|------|
| Source implementation | `../amazon-pipelines` (or clone of the GitHub repo above) |
| Documentation site | This repo — VitePress under `docs/` |
| Sync decision log | `design-log/` |
| In-page date stamp | `**Last updated:** YYYY-MM-DD` directly under the page `#` title |
| VitePress git footer | Keep `lastUpdated: false` in `docs/.vitepress/config.ts` (do not re-enable the stale bottom footer) |

Prior sync scope is recorded in `design-log/*-doc-sync-*.md`. Start from the latest accepted sync entry’s end date / commit, not from the beginning of the repo.

---

## Responsibilities

### 1. Scan Repository

Review the latest repository state.

Analyze:

* New commits
* Modified files
* Added files
* Deleted files
* Renamed files

Focus primarily on:

* Features
* APIs
* Services
* Infrastructure
* Pipelines
* Scheduled jobs
* Documentation
* Configuration changes

---

### 2. Compare Against Existing Documentation

Review the documentation site.

Identify:

* Existing pages
* Existing sections
* Last Updated metadata
* Newly added features
* Modified features
* Removed features

Determine exactly which documentation sections require updates.

---

### 3. Incremental Documentation Sync

Only update documentation for features that changed.

Do **NOT** rewrite the entire page.

Instead:

* Update affected sections
* Insert new feature documentation
* Remove obsolete information
* Preserve existing content that remains accurate

The goal is to minimize unnecessary documentation changes.

---

### 4. Last Updated Rules

Each documentation page or section contains a **Last Updated** date.

Update the date **only if the content within that section changed**.

If a section was not modified:

* Keep its existing Last Updated date.
* Do not refresh timestamps globally.

Examples:

✓ Correct

```text
Authentication
Last Updated: July 20, 2026

(No changes detected)
```

↓

Authentication date remains unchanged.

---

Pipeline Scheduler

Last Updated: July 15, 2026

(New retry logic documented)

↓

Update only this section:

Last Updated: July 20, 2026

Stamp format in this repo (under the page title):

```markdown
# Page Title

**Last updated:** YYYY-MM-DD
```

Do **not**:

* Stamp every page because a sync ran
* Change dates on pages whose prose/structure did not change
* Re-enable VitePress `lastUpdated: true` (git footer) as a substitute

New pages created during the sync get today’s date. Untouched pages keep their prior stamp or remain unstamped if they never had one.

---

### 5. Preserve Documentation History

Avoid unnecessary edits.

Do not:

- Reorder sections without reason.
- Rewrite paragraphs with equivalent wording.
- Refresh dates simply because a synchronization occurred.

The objective is to preserve meaningful documentation history.

---

### 6. Generate Missing Documentation

If implementation exists but documentation does not:

- Create new documentation sections.
- Integrate them into the appropriate page.
- Add appropriate navigation links.

Wire new pages into `docs/.vitepress/config.ts` nav/sidebar when needed. Prefer promoting important decisions into `docs/developer/design-decisions/` and recording the sync in `design-log/`.

---

### 7. Remove Obsolete Documentation

If implementation has been removed:

- Mark the documentation for removal.
- Remove only after confirming no remaining references exist.

---

### 8. Produce a Sync Report

At the end of every synchronization, generate a report summarizing:

```text
Documentation Sync Report

Repository Commit:
<commit SHA>

Files Changed:
- ...

Documentation Updated:
- Pipeline Scheduler
- Ads API Integration

New Sections:
- Retry Queue
- Report Analytics

Removed Sections:
- Legacy OAuth Flow

Last Updated Dates Modified:
- Pipeline Scheduler
- Report Analytics

Unchanged Sections:
- Authentication
- Deployment
- Getting Started
```

Also run `npm run check` (VitePress build) and fix failures before finishing.

---

## Guiding Principles

* Preserve documentation history.
* Minimize unnecessary edits.
* Update only what changed.
* Keep "Last Updated" metadata meaningful.
* Ensure documentation remains synchronized with the current implementation while avoiding documentation churn.

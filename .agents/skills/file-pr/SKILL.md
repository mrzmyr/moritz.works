---
name: file-pr
description: Use when creating or updating a pull request. Ensures every PR includes before and after evidence of the change.
---

# Filing Pull Requests

Every pull request MUST include before and after evidence **side by side in a 2-column table**. This is non-negotiable.

## Required Format

Use a 2-column markdown table in every PR body:

```markdown
## Before / After

| Before | After |
| --- | --- |
| <before evidence> | <after evidence> |
```

**Do not stack Before and After as separate vertical sections.** They must be side by side.

## What to Include

### For UI / Visual / Layout Changes

- **Screenshots** or short screen recordings in the table cells
- Before screenshot in left cell, after screenshot in right cell, same row
- Same viewport/state (same page, same data, same user action)
- Same browser, viewport size, and zoom level for fair comparison
- If you have **both mobile and desktop**: use two rows (or two tables), still before|after side by side in each row

Example:

```markdown
## Before / After

| Before | After |
| --- | --- |
| ![before desktop](before-desktop.png) | ![after desktop](after-desktop.png) |
| ![before mobile](before-mobile.png) | ![after mobile](after-mobile.png) |
```

### For Non-Visual Changes

Still use the same 2-column table — do not skip this:

- API responses (old format left, new format right)
- Terminal output (old behavior left, new behavior right)
- Error messages (old left, new right)
- Log output, performance metrics, code snippets, test output

Example:

```markdown
## Before / After

| Before | After |
| --- | --- |
| `Error: invalid token` | `Error: Authentication failed - token expired at 2026-08-16T06:00:00Z` |
```

## Capturing the Before

**Capture before BEFORE changing code.**

If you missed it:
1. Check out the base branch
2. Reproduce the scenario
3. Capture evidence
4. Return to your feature branch

If you cannot produce a before state, **explain why in the PR** and document what you tried.

## Checklist

Before creating or updating a PR:

- [ ] PR body includes `## Before / After` section with 2-column table
- [ ] Before evidence in left column, after evidence in right column
- [ ] Evidence is side by side in the same row, not stacked vertically
- [ ] Evidence is concrete (not descriptions like "it didn't work before")
- [ ] Evidence is comparable (same scenario, viewport, data)
- [ ] If visual change: screenshots or video in table cells
- [ ] If non-visual change: output, response, or relevant snippet in table cells
- [ ] If mobile and desktop: both shown with before|after side by side for each
- [ ] If no before available: explained why and what was attempted

## Do Not File Without This

If you cannot produce before/after evidence:
- State clearly in the PR body why it's missing
- Explain what you tried to capture it
- Get explicit approval before filing

The before/after should make the change **obvious to a reviewer who does not check out the branch.**

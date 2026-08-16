---
name: file-pr
description: Use when creating or updating a pull request. Ensures every PR includes before and after evidence of the change.
---

# Filing Pull Requests

Every pull request MUST include a **Before** and **After** section in the description. This is non-negotiable.

## Required Sections

Add these sections to every PR body:

```markdown
## Before
[evidence of state before the change]

## After
[evidence of state after the change]
```

## What to Include

### For UI / Visual / Layout Changes

- **Screenshots** or short screen recordings showing the same viewport/state before and after
- Include **both mobile and desktop** if the change affects both
- Capture identical states (same page, same data, same user action) before and after
- Use the same browser, viewport size, and zoom level for fair comparison

### For Non-Visual Changes

Still include before/after — do not skip this section:

- API responses (old vs new format)
- Terminal output (old vs new behavior)
- Error messages (old vs new)
- Log output
- Performance metrics (before/after timing)
- Code snippets showing the change in behavior
- Test output demonstrating the fix

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

- [ ] PR body includes `## Before` section
- [ ] PR body includes `## After` section
- [ ] Evidence is concrete (not descriptions like "it didn't work before")
- [ ] Evidence is comparable (same scenario, viewport, data)
- [ ] If visual change: includes screenshots or video
- [ ] If non-visual change: includes output, response, or relevant snippet
- [ ] If no before available: explained why and what was attempted

## Do Not File Without This

If you cannot produce before/after evidence:
- State clearly in the PR body why it's missing
- Explain what you tried to capture it
- Get explicit approval before filing

The before/after should make the change **obvious to a reviewer who does not check out the branch.**

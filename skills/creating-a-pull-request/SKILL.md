---
name: creating-a-pull-request
description: Use when opening, creating, or writing a pull request, pushing a branch for review, or running gh pr create - covers the PR title, body, and evidence so the description reads for both a non-developer and a developer.
---

# Creating a Pull Request

## Overview

A PR is read by two audiences at once: someone who needs to know **what changed and why it matters** without reading code, and a developer who needs to know **what the code does and why it was written that way**. Write for both, every time.

**Core principle:** Plain-language meaning first, technical detail second — never skip the first to get to the second. This is the `dmi-superpowers:say` discipline applied to a PR.

**Announce at start:** "I'm using the creating-a-pull-request skill to write this PR."

## The Process

### Step 1: Detect a repo PR template

```bash
ls .github/PULL_REQUEST_TEMPLATE.md .github/pull_request_template.md \
   .github/PULL_REQUEST_TEMPLATE/ docs/PULL_REQUEST_TEMPLATE.md 2>/dev/null
```

- **Template found:** fill out the template's sections. Still write the prose in the house style (Step 3) — if the template has no slot for a plain-language summary or a developer TLDR, **add them at the top** of the body before the template's sections.
- **No template:** use the default body in Step 3.

### Step 2: Write the title

Plain-language and concise. Name the **outcome** a non-developer cares about, never the mechanism.

**Self-check before you commit the title:** does it name a mechanism — a library, pattern, data structure, function, or endpoint (e.g. "pagination", "circuit breaker", "cursor", "/customers")? If so, rewrite it as the outcome that mechanism produces.

- ✅ `Speed up the admin dashboard by loading customers in pages` — names the outcome
- ❌ `Add cursor-based pagination to the /customers endpoint` — names the mechanism
- ✅ `Stop losing background updates when the server is briefly busy`
- ❌ `Add retry-with-backoff and circuit breaker to sync_worker`

### Step 3: Write the body

The body is a contract with these parts, in this order:

**1. Summary** (always) — for a non-developer.
Explain what this PR does from a high level using non-technical language so that people who are not software engineers can understand the PR. Use analogies to keep things fun and easy to understand.

**2. TLDR for developers** (always) — for a developer.
What code changed (files, functions, key mechanisms) and *why it was written this way* — the reasoning behind the approach, not just a restatement of the diff.

**3. Evidence** (when meaningful and helpful) — proof it works.
Before/after UI screenshots, or before/after server log excerpts, that demonstrate the bug is fixed or the feature works. Omit only when there is genuinely nothing visual or observable to show; say so if you omit it.

### Step 4: Create the PR

```bash
git push -u origin <branch>
gh pr create --title "<plain-language title>" --body "<body from Step 3>"
```

## Example (no-template body)

> ## Summary
> When the server we sync with restarts, it briefly says "I'm busy, try later." Until now our app heard that once and gave up — like mailing a letter, having it bounce, and throwing it in the bin instead of trying again. This change makes the app wait a moment and try a few more times, and if the server stays down it stops knocking for half a minute so it doesn't make the problem worse.
>
> ## TLDR for developers
> - `sync_worker.py`: wrapped the upstream call in retry-with-exponential-backoff (3 attempts, jittered). Jitter avoids a thundering-herd retry spike when many workers recover at once.
> - Added a circuit breaker: opens after 5 consecutive failures and pauses syncing for 30s, so we don't hammer an upstream that is genuinely down rather than blipping.
> - Tests cover the backoff schedule and the breaker's closed→open→reset transitions.
>
> ## Evidence
> Before (logs): `event 4f2 dropped: upstream 503` ×17 during the 12:04 deploy.
> After (logs): `event 4f2 retry 2 succeeded` — 0 dropped across the same deploy window.

## Quick Reference

| Part | Audience | Required? | Must contain |
|------|----------|-----------|--------------|
| Title | Non-developer | Always | Plain-language outcome, concise |
| Summary | Non-developer | Always | Plain language + an analogy |
| TLDR for developers | Developer | Always | What changed + *why this way* |
| Evidence | Both | When meaningful | Before/after screenshots or logs |

## Common Mistakes

- **Jargon title** ("Add circuit breaker to sync_worker") — name the outcome a non-developer cares about instead.
- **Opening with the technical summary** — the first thing readers see must be the plain-language Summary.
- **No analogy** — the Summary explains a concept; an analogy is what makes it land for a non-developer.
- **Merging lay and dev explanations into one block** — keep Summary and TLDR as separate sections.
- **Skipping evidence when it exists** — if there's a reproducible before/after, show it.
- **Template overrides the house style** — a repo template tells you which sections to fill, not how to write them. Plain-language Summary + developer TLDR still apply.

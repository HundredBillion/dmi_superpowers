---
name: writing-code-comments
description: Use when writing or editing code and adding a comment, note, TODO, or docstring — including when the change comes from a ticket, PR, or review thread whose ID could leak into the note.
---

# Writing Code Comments

## Overview

A code comment is a **developer note** — a line for whoever reads this code next. The code already shows *how* it works, so a comment earns its place only by answering one of two things the code can't:

- **What** is this code trying to accomplish? (the intent)
- **Why** is it written this way? (the reason — a constraint, a tradeoff, a non-obvious choice)

**Core principle:** One sentence if possible, never more than three — and the note is **self-contained**: it carries the whole reason itself, readable by someone with only this file. Traceability to tickets lives in commit messages and PR bodies, not in the code.

## The Recipe

Each comment is a self-contained note answering **what** or **why** — one plain sentence if possible, at most three.

- Say the intent or the reason at a high level: the goal, the constraint, the surprise.
- State the reason itself, in full. The note is complete when it reads without a ticket tracker, PR, chat thread, or plan document — a future developer may have the repo and nothing else.
- Leave out the mechanics. The reader can read the code.
- Prefer no comment when the code already speaks for itself.

## Before / After

❌ Too long, restates the mechanics:
```python
# Loop over every item in the orders list. For each order, check if its
# status field equals "pending". If it does, append that order to the
# pending_orders list so the batch job can process them later.
for order in orders:
    if order.status == "pending":
        pending_orders.append(order)
```

✅ One sentence, states the *why*:
```python
# Batch job reprocesses only orders the payment webhook hasn't confirmed yet.
pending_orders = [o for o in orders if o.status == "pending"]
```

❌ Outsources the reason to a tracker the reader may not have:
```python
# Retry limit is 3 per CRM-430; see PR #78 discussion.
def sync_contact(contact, attempts=3):
```

✅ Self-contained — the reason travels with the code:
```python
# Three attempts stays inside the CRM rate-limiter budget.
def sync_contact(contact, attempts=3):
```

## Quick Reference

| A good comment... | A bad comment... |
|---|---|
| Says *what* the code is for, or *why* it's this way | Narrates *how*, line by line |
| One sentence (three at most), plain language | A paragraph of prose |
| Carries the full reason itself | Points to a Jira key, PR number, ADR, plan doc, or review thread |
| Explains a non-obvious choice or constraint | Repeats what the code already says |
| Is absent when the code is self-evident | Is added out of habit |

## Common Mistakes

- **Narrating the code** — `# increment the counter` above `count += 1`. Delete it.
- **Multi-sentence notes** — past three sentences, keep the ones that state the intent or the reason and drop the rest.
- **Explaining the how instead of the why** — the how is already in the code; the why is what's missing.
- **The same comment in more than one place** — if a note must be repeated to keep
  several copies of a rule correct, the rule wants to be code. A comment defending
  an ordering or an invariant that a tidy-up would break is the strongest form of
  this signal: you are writing a guard that cannot enforce itself. Extract the
  rule; let the comment live once, beside it.
- **Citing the ticket instead of stating the reason** — `# KP-60: dedupe warnings` tells a future developer nothing once the tracker is gone (and it will be). Write the reason the ticket contained: `# Warn once per distinct key per bill, not per line.` Ticket IDs belong in the commit message and PR, where history tooling preserves them.

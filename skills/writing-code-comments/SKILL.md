---
name: writing-code-comments
description: Use when writing or editing code and adding a comment, note, TODO, or docstring - keeps developer notes short and about intent or reason, not a walkthrough of the mechanics.
---

# Writing Code Comments

## Overview

A code comment is a **developer note** — a line for whoever reads this code next. The code already shows *how* it works, so a comment earns its place only by answering one of two things the code can't:

- **What** is this code trying to accomplish? (the intent)
- **Why** is it written this way? (the reason — a constraint, a tradeoff, a non-obvious choice)

**Core principle:** As few sentences as possible — usually one, often none. Plain, high-level language about the goal or the reason, never a restatement of the lines below it.

## The Recipe

Each comment is **one plain sentence** answering **what** or **why**. If it can't be said in a sentence, the code needs to be clearer — not the comment longer.

- Say the intent or the reason at a high level: the goal, the constraint, the surprise.
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

## Quick Reference

| A good comment... | A bad comment... |
|---|---|
| Says *what* the code is for, or *why* it's this way | Narrates *how*, line by line |
| One sentence, plain language | A paragraph of prose |
| Explains a non-obvious choice or constraint | Repeats what the code already says |
| Is absent when the code is self-evident | Is added out of habit |

## Common Mistakes

- **Narrating the code** — `# increment the counter` above `count += 1`. Delete it.
- **Multi-sentence notes** — if it runs to three sentences, keep the one that states the intent or the reason and drop the rest.
- **Explaining the how instead of the why** — the how is already in the code; the why is what's missing.

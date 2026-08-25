---
name: writing-code-comments
description: Use when writing or editing code and adding a comment, note, TODO, or docstring — including when the change comes from a ticket, PR, or review thread whose ID could leak into the note.
---

# Writing Code Comments

## Overview

A code comment is a **developer note** — a line for whoever reads this code next. The code already shows *how* it works, so a comment earns its place only by answering one of two things the code can't:

- **What** is this code trying to accomplish? (the intent)
- **Why** is it written this way? (the reason — a constraint, a tradeoff, a non-obvious choice)

**Core principle:** A note is **self-contained** — it carries the whole reason itself, readable by someone with only this file. Traceability to tickets lives in commit messages and PR bodies, not in the code.

Length follows what the note guards, not a fixed cap:

- An **inline note** explains one line or block: one sentence if possible, three at most.
- An **invariant note** sits on the owner of a rule that spans callers, and runs as
  long as the rule takes. The test is not sentence count — it is that every line
  answers a question a reader will actually have, and you can name the question.
  A line you cannot attach a question to is padding; cut it.

## The Recipe

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

## Name It, Don't Point At It

**Before you write a note, check it for a count or a position word.** "these three",
"two columns", "the chain", "the reader below", a bare "it", "the non-creating
lookup" — each is a referent you owe the reader, and each costs a lookup they will
skip. Replace it with the thing itself. This is the most common comment defect
measured: five of seven found in one audit, and four of five agents reproduced it
unprompted against guidance that did not name it.

| ❌ points | ✅ names |
|---|---|
| `# Only these three count as a person.` | `# The Change IMEI screen, a device's own edit page, and a bulk edit from the list.` |
| `# Two columns are the same thing to a reader.` | `# device_model_alias and device_model_id are both just "device model".` |
| `# the model the chain settled on` | `# the model the merges above settled on` |
| `# Uses the non-creating lookup:` | `# Reads device_model_mapping, not device_model_mapping!` |
| `# so it only runs where…` | `# so #newer? only runs where…` |
| `# the reader below used to be handed the record` | `# A reader inside device_attributes once said @mdm` |

**Two identifiers that read alike must both appear as literal values.** Not a style
preference — a correctness one. Prose paraphrasing `'Bulk Import'` and `'Bulk Update'`
as "the bulk import" destroys the only distinction the reader needed, and the note
then reads as contradicting its own code. Five of five agents made exactly this
mistake against guidance that did not forbid it. If your note mentions a thing the
list excludes, quote the string.

## Defer, Don't Paraphrase

Never partially restate another unit's contract. Either point at it and stop, or
say nothing:

❌ `# ...or none when it is not the fresher source.`   (one of the callee's three reasons)
✅ `# MdmInfoDecorator#device_model_attributes decides which, and lists the reasons.`

A partial restatement is correct on the day you write it and wrong the first time
the callee's own note improves.

**Before writing "See X", read X.** If X already says it, the pointer is a
duplicate — delete it. A note governing two methods belongs at the level that
owns both, once.

## Name The Destination, Not The Transport

Readers reason about consequences from the destination.

❌ `# The request leaves through a queue that no rollback reaches.`
✅ `# A person at the carrier reads the email and acts on it.`
   `# Nothing in this app can recall it, so a transaction would not help.`

The first describes plumbing; the second tells you the effect happens in another
company and is irreversible — which is what makes the surrounding care look
proportionate rather than fussy.

## Mechanics

**One sentence per line, never a break mid-sentence.** This makes each sentence's
budget `LineLength − comment prefix`, and the prefix changes with indentation — a
private method four levels in has ~8 fewer characters than a module-level note.
**Measure, don't eyeball**: a sentence that doesn't fit is usually two ideas, and
splitting it to fit generally splits it along the real seam.

**Plainness costs lines, and that is the trade.** "A report is only as fresh as the
last time that handset phoned home" is longer than "a payload can be days old" and
means the same thing to more people. Jargon is compression that only works for a
reader who already decompresses it for free. Keep the jargon that carries a
distinction plain words can't — but only that.

## Before You Finish, Check The Note You Just Wrote

Comments have no compiler and no test, so the check has to be yours. Run it on the
lines you just added, not on the file around them:

    git diff -U0 | grep '^+' | grep -inE '\b(above|below|here|these|those)\b'

Every hit is a referent you owe the reader. Name the thing instead.

## Quick Reference

| A good comment... | A bad comment... |
|---|---|
| Says *what* the code is for, or *why* it's this way | Narrates *how*, line by line |
| Names the things it refers to | Points at them by count or position |
| Scales to the rule it guards | Pads an inline note past three sentences |
| Carries the full reason itself | Points to a Jira key, PR number, ADR, plan doc, or review thread |
| Is absent when the code is self-evident | Is added out of habit |

## Common Mistakes

- **Narrating the code** — `# increment the counter` above `count += 1`. Delete it.
- **Explaining the how instead of the why** — the how is already in the code; the why is what's missing.
- **The same comment in more than one place** — if a note must be repeated to keep
  several copies of a rule correct, the rule wants to be code. A comment defending
  an ordering or an invariant that a tidy-up would break is the strongest form of
  this signal: you are writing a guard that cannot enforce itself. Extract the
  rule; let the comment live once, beside it — and then let that one note be as
  long as the rule needs.
- **Citing the ticket instead of stating the reason** — `# KP-60: dedupe warnings` tells a future developer nothing once the tracker is gone (and it will be). Write the reason the ticket contained: `# Warn once per distinct key per bill, not per line.` Ticket IDs belong in the commit message and PR, where history tooling preserves them.
- **Under-describing a side effect** — `# try to find the mapping` above
  `find_or_create_by` grants false confidence that the line is safe to reorder or
  skip. Worse than no comment.
- **Naming the method in its own doc comment** — `# def newer? checks whether…`
  goes stale on rename, and in many repos `# def foo` already means commented-out
  code. Check what the convention is by counting, not by taste.
- **Saying what was wrong without saying why it was silent** — the language
  behaviour is the transferable lesson. `# Ruby returns nil for an unset ivar
  instead of raising, so nothing failed.`
- **Adjacent branches making opposite safety choices, undocumented** — one `=` and
  one `||=` side by side reads as an oversight someone should tidy. Name the
  asymmetry so the next reader knows it is real; don't guess the intent.
- **A comment positioned to annotate the wrong line** — a note wedged between an
  assignment and the guard it explains appears to describe the assignment. Put it
  on what it explains, or move it into the doc block.

---
name: variant-analysis
description: Use when a confirmed bug, vulnerability, or unsafe pattern may have sibling instances elsewhere in a codebase, especially when asked whether the same defect occurs in other paths
---

# Variant Analysis

## Overview

Turn one confirmed root cause into a bounded search for the rest of its bug
family. Search from exact to general, and classify evidence before changing
code. Textual resemblance alone is not a defect.

**REQUIRED BACKGROUND:** Use `dmi-superpowers:systematic-debugging` first. This
skill begins only after the original root cause is confirmed.

## Search Contract

Before searching, write:

- **Root cause:** the semantic reason the known instance fails
- **Exact shape:** the smallest construct that matches the known instance
- **Expansion axes:** independent dimensions that may vary, such as caller,
  input expression, API spelling, data type, or wrapper
- **Safety evidence:** what would prove a lookalike is not affected

## Workflow

1. **Calibrate an exact search.** Start with the literal known construct: same
   API spelling, argument shape, and local scope, without placeholders,
   alternation, or related APIs. Confirm it matches the reported site before
   broadening. Report the complete match count; do not truncate output used for
   a completeness claim.
2. **Expand one axis at a time.** Change one meaningful part of the search,
   inspect every new match, then decide whether another expansion is useful.
   Keep a search ledger whose row names its parent query, the single changed
   axis, the new query, match count, and new candidates. Compare each query to
   its parent; if anything else changed, insert an intermediate row before
   relying on the results.
3. **Classify every candidate.** For each match, read the input source, caller,
   validation, and observable consequence. Record it as confirmed, safe, or
   unresolved with the evidence that supports the classification.
4. **Stop when the search loses signal.** Stop expanding when more than half of
   a new result set is unrelated, or when all planned axes have been covered.
   Record searches that produced no useful variants so another reviewer does
   not repeat them.
5. **Close the family deliberately.** Add regression coverage for every fixed
   variant. If multiple sites are confirmed, propose a family-level prevention
   even when some fixes await a scope decision: a shared boundary,
   lint/static-analysis rule, or a test that exercises the family. State why
   the chosen control would catch recurrence at every confirmed site.

## Scope and Reporting

Finding a variant does not silently expand authorization. Fix confirmed
instances covered by the requested outcome. For a confirmed defect outside the
agreed change, name its location and impact and ask for the scope decision; do
not describe the bug family as resolved while it remains open.

Do not patch all textual matches. A validated parser, compatibility shim, or
different data domain may safely use the same syntax. The call-site evidence
decides.

## Completion Record

Report:

| Candidate | Classification | Evidence | Action |
| --- | --- | --- | --- |
| path and symbol | confirmed / safe / unresolved | caller and validation facts | fixed / excluded / follow-up |

Include the exact search, each expansion, total matches inspected, regression
tests, and these required fields:

- **Family prevention:** the control that covers every confirmed site, or the
  concrete reason no family-level control is viable
- **Scope decision needed:** if any confirmed variant remains open, an explicit
  question naming it; use `None` only when no confirmed family member is open
- **Open family members:** every confirmed variant not fixed in this change

Before reporting completion, compare the last two fields. A non-empty
**Open family members** list makes `Scope decision needed: None` invalid; replace
it with a direct question asking whether those named variants belong in this
change or a follow-up.

## Common Mistakes

- Searching broadly before proving the exact matcher finds the known defect
- Replacing every occurrence of an API or token
- Searching only the original module
- Generalizing several dimensions in one jump
- Reporting only affected matches while hiding inspected safe matches
- Calling the family fixed when a confirmed variant was deferred

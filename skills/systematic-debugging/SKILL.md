---
name: systematic-debugging
description: Use when encountering any bug, test failure, unexpected behavior, or performance regression, before proposing fixes — a disciplined diagnosis loop (orient → build a feedback loop → reproduce + minimise → hypothesise → instrument → fix + regression-test → cleanup). Triggers when the user says "diagnose"/"debug this", reports something broken/throwing/failing/slow, or asks for a fix.
---

# Systematic Debugging

A discipline for hard bugs and performance regressions. Random fixes waste time and create new bugs; quick patches mask underlying issues. Skip phases only when you can explicitly justify it.

When exploring the codebase, read `CONTEXT.md` (if it exists) to build a clear mental model of the relevant modules, and check ADRs in the area you're touching.

**Violating the letter of this process is violating the spirit of debugging.**

## The Two Iron Laws

These two gates are **sequential, not contradictory** — you must pass through both, in order:

```
1. No hypothesis without a feedback loop
2. No fix without root cause
```

- **Law 1 (Phase 1):** You may not start theorising about the cause until you have a tight, red-capable feedback loop — one command that catches *this* bug. Jumping straight to a hypothesis is the exact failure this skill prevents.
- **Law 2 (Phases 3–5):** You may not propose or apply a fix until you have traced the root cause. Symptom fixes are failure.

If you catch yourself reading code to build a theory before a feedback loop exists, **stop** — you have violated Law 1. If you catch yourself proposing a fix before you understand *why* the bug happens, **stop** — you have violated Law 2.

## Phase 0 — Orient

Get your bearings before Phase 1 (read errors, check recent changes, read CONTEXT.md) — see [examples.md](examples.md#phase-0--orient) for the mechanics. Orientation does **not** entitle you to a fix.

## Phase 1 — Build a feedback loop

**This is the skill.** Everything else is mechanical. If you have a **tight** pass/fail signal for the bug — one that goes red on _this_ bug — you will find the cause; bisection, hypothesis-testing, and instrumentation all just consume it. If you don't have one, no amount of staring at code will save you.

Spend disproportionate effort here. **Be aggressive. Be creative. Refuse to give up.**

The ten ways to construct a loop (failing test, curl, CLI, headless browser, replay, throwaway harness, fuzz loop, bisection harness, differential loop, HITL script), the sub-technique for locating *where* a multi-component bug breaks, and tightening/non-deterministic-bug guidance: see [examples.md](examples.md#ways-to-construct-a-loop).

Build the right feedback loop, and the bug is 90% fixed.

### When you genuinely cannot build a loop

Stop and say so explicitly. List what you tried. Ask the user for: (a) access to whatever environment reproduces it, (b) a captured artifact (HAR file, log dump, core dump, screen recording with timestamps), or (c) permission to add temporary production instrumentation. Do **not** proceed to hypothesise without a loop.

### Completion criterion — a tight loop that goes red

Phase 1 is done when the loop is **tight** and **red-capable**: you can name **one command** — a script path, a test invocation, a curl — that you have **already run at least once** (paste the invocation and its output), and that is:

- [ ] **Red-capable** — it drives the actual bug code path and asserts the **user's exact symptom**, so it can go red on this bug and green once fixed. Not "runs without erroring" — it must be able to _catch this specific bug_.
- [ ] **Deterministic** — same verdict every run (flaky bugs: a pinned, high reproduction rate, per above).
- [ ] **Fast** — seconds, not minutes.
- [ ] **Agent-runnable** — you can run it unattended; a human in the loop only via `scripts/hitl-loop.template.sh`.

If you catch yourself reading code to build a theory before this command exists, **stop — jumping straight to a hypothesis is the exact failure this skill prevents (Iron Law 1).** No red-capable command, no Phase 2.

## Phase 2 — Reproduce + minimise

Run the loop. Watch it go red — the bug appears.

Confirm:

- [ ] The loop produces the failure mode the **user** described — not a different failure that happens to be nearby. Wrong bug = wrong fix.
- [ ] The failure is reproducible across multiple runs (or, for non-deterministic bugs, reproducible at a high enough rate to debug against).
- [ ] You have captured the exact symptom (error message, wrong output, slow timing) so later phases can verify the fix actually addresses it.

### Minimise

Once it's red, shrink the repro to the **smallest scenario that still goes red**. Cut inputs, callers, config, data, and steps **one at a time**, re-running the loop after each cut — keep only what's load-bearing for the failure.

Why bother: a minimal repro shrinks the hypothesis space in Phase 3 (fewer moving parts left to suspect) and becomes the clean regression test in Phase 5.

Done when **every remaining element is load-bearing** — removing any one of them makes the loop go green.

Do not proceed until you have reproduced **and** minimised.

## Phase 3 — Hypothesise

Generate **3–5 ranked hypotheses** before testing any of them. Single-hypothesis generation anchors on the first plausible idea.

Each hypothesis must be **falsifiable**: state the prediction it makes.

> Format: "If <X> is the cause, then <changing Y> will make the bug disappear / <changing Z> will make it worse."

If you cannot state the prediction, the hypothesis is a vibe — discard or sharpen it.

Pattern-analysis techniques for generating and sharpening hypotheses, and presenting the ranked list to the user: see [patterns.md](patterns.md#pattern-analysis). For bugs deep in the call stack, trace the bad value backward to its origin — see **`root-cause-tracing.md`** in this directory for the complete backward-tracing technique. Fix at the source, not at the symptom.

## Phase 4 — Instrument

Each probe must map to a specific prediction from Phase 3. **Change one variable at a time.**

Instrumentation tool preference (debugger over logs, never "log everything") and the perf-regression measure-first branch: see [examples.md](examples.md#tool-preference).

**Tag every debug log** with a unique prefix, e.g. `[DEBUG-a4f2]`. Cleanup at the end becomes a single grep. Untagged logs survive; tagged logs die.

When the bug involves waiting on a condition (timeouts, races, "it works if I add a sleep"), replace arbitrary timeouts with condition polling — see **`condition-based-waiting.md`** in this directory.

## Phase 5 — Fix + regression test

### Verify the claims that justify the fix shape

A fix's *shape* is usually decided by a claim that some other code depends on the
current arrangement: "keeping these two values apart is what lets X compare
them", "removing this would blind the Y check", "Z reads this field". That claim
is the difference between re-pointing one line and adding a field, a second
writer, and a paired change in another service.

**Every such claim names a consumer. Go read the consumer, and state the file and
line where it reads the value.** If you cannot name one, the claim is void — and
so is the fix it was protecting.

Do this even when the claim arrives as settled. These claims are where inherited
analysis fails, for three reasons:

- **They are negative claims.** "Nothing else reads this" and "this is what X
  compares" cannot be settled by looking at the value being written. Reading the
  writer proves nothing; only the reader decides.
- **The consumer lives outside what you are changing** — another service, another
  repo, the schema. Checking a fix's *scope* keeps you in code you already have
  open; checking its *justification* does not, so it quietly gets skipped.
- **They come pre-stamped as verified** by a ticket, a prior PR, a commit
  message, a passing test's name, or your own earlier summary. A test proving a
  value is *written* or *sent* proves nothing *reads* it.

Cheapest sufficient check: grep the whole system for the field name, read every
hit, and confirm the schema has the column at all. A justification that survives
that is real; one that does not was holding up the wrong design.

### Verify the claims that justify the fix shape

A fix's *shape* is usually decided by a claim that some other code depends on the
current arrangement: "keeping these two values apart is what lets X compare
them", "removing this would blind the Y check", "Z reads this field". That claim
is the difference between re-pointing one line and adding a field, a second
writer, and a paired change in another service.

**Every such claim names a consumer. Go read the consumer, and state the file and
line where it reads the value.** If you cannot name one, the claim is void — and
so is the fix it was protecting.

Do this even when the claim arrives as settled. These claims are where inherited
analysis fails, for three reasons:

- **They are negative claims.** "Nothing else reads this" and "this is what X
  compares" cannot be settled by looking at the value being written. Reading the
  writer proves nothing; only the reader decides.
- **The consumer lives outside what you are changing** — another service, another
  repo, the schema. Checking a fix's *scope* keeps you in code you already have
  open; checking its *justification* does not, so it quietly gets skipped.
- **They come pre-stamped as verified** by a ticket, a prior PR, a commit
  message, a passing test's name, or your own earlier summary. A test proving a
  value is *written* or *sent* proves nothing *reads* it.

Cheapest sufficient check: grep the whole system for the field name, read every
hit, and confirm the schema has the column at all. A justification that survives
that is real; one that does not was holding up the wrong design.

Write the regression test **before the fix** — but only if there is a **correct seam** for it.

A correct seam is one where the test exercises the **real bug pattern** as it occurs at the call site. If the only available seam is too shallow (single-caller test when the bug needs multiple callers, unit test that can't replicate the chain that triggered the bug), a regression test there gives false confidence.

**If no correct seam exists, that itself is the finding.** Note it. The codebase architecture is preventing the bug from being locked down. Flag this for Phase 6.

Reporting the confirmed root cause to the user with `dmi-superpowers:say` (the full four-beat — this is a finding the user must understand and decide on, not status narration): see [patterns.md](patterns.md#reporting-practices).

If a correct seam exists:

1. Turn the minimised repro into a failing test at that seam.
2. Watch it fail.
3. Apply the fix — address the **root cause**, ONE change at a time. No "while I'm here" improvements, no bundled refactoring.
4. Watch it pass.
5. Re-run the Phase 1 feedback loop against the original (un-minimised) scenario.

After finding the root cause, consider whether validation belongs at more than one layer — see **`defense-in-depth.md`** in this directory.

### If the fix doesn't work — count your attempts

- **STOP.** Count: how many fixes have you tried?
- **If < 3:** return to Phase 3, re-rank hypotheses with the new information. Don't pile fixes on top.
- **If ≥ 3:** STOP and **question the architecture**. Do not attempt fix #4 without an architectural discussion.

**Pattern indicating an architectural problem:**
- Each fix reveals new shared state / coupling / problem in a different place.
- Fixes require "massive refactoring" to implement.
- Each fix creates new symptoms elsewhere.

**Then question fundamentals:** Is this pattern fundamentally sound? Are we sticking with it through sheer inertia? Should we refactor the architecture instead of continuing to fix symptoms? **Discuss with your human partner before attempting more fixes.** This is NOT a failed hypothesis — this is a wrong architecture.

## Phase 6 — Cleanup + post-mortem

Required before declaring done:

- [ ] Original repro no longer reproduces (re-run the Phase 1 loop)
- [ ] Regression test passes (or absence of a correct seam is documented)
- [ ] All `[DEBUG-...]` instrumentation removed (`grep` the prefix)
- [ ] Throwaway prototypes deleted (or moved to a clearly-marked debug location)
- [ ] The hypothesis that turned out correct is stated in the commit / PR message — so the next debugger learns

**Then ask: what would have prevented this bug?** If the answer involves architectural change (no good test seam, tangled callers, hidden coupling), hand off to the **dmi-superpowers:improve-codebase-architecture** skill with the specifics. Make the recommendation **after** the fix is in, not before — you have more information now than when you started.

## Guardrails (always-on)

These apply at every phase, not just at the end.

### Red Flags — STOP and follow the process

If you catch yourself thinking:
- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "Add multiple changes, run tests"
- "Skip the test, I'll manually verify"
- "It's probably X, let me fix that"
- "I don't fully understand but this might work"
- "Pattern says X but I'll adapt it differently"
- **"This separation is what lets X compare Y" (naming a consumer you have not opened)**
- **"Removing this would blind Z" (never read Z)**
- "Here are the main problems: [lists fixes without investigation]"
- Proposing solutions before building a feedback loop or tracing data flow
- **"One more fix attempt" (when already tried 2+)**
- **Each fix reveals new problem in a different place**

**ALL of these mean: STOP.** Return to Phase 1 (no loop yet) or Phase 3 (loop exists, no confirmed root cause).

**If 3+ fixes failed:** question the architecture (see Phase 5).

### Your human partner's signals you're doing it wrong

**Watch for these redirections:**
- "Is that not happening?" — you assumed without verifying
- "Are we sure it reads that?" — you took a consumer claim on trust
- "Will it show us...?" — you should have added evidence gathering
- "Stop guessing" — you're proposing fixes without understanding
- "Ultra-think this" — question fundamentals, not just symptoms
- "We're stuck?" (frustrated) — your approach isn't working

**When you see these:** STOP. Return to Phase 1.

### The Common Rationalizations catalog and the "no root cause" edge case (95% of those are incomplete investigation): see [patterns.md](patterns.md#common-rationalizations).

| Excuse | Reality |
|--------|---------|
| "Issue is simple, don't need process" | Simple issues have root causes too. Process is fast for simple bugs. |
| "Emergency, no time for process" | Systematic debugging is FASTER than guess-and-check thrashing. |
| "Just try this first, then investigate" | First fix sets the pattern. Do it right from the start. |
| "I'll read code to form a theory, then build a loop" | Backwards. No hypothesis without a feedback loop (Iron Law 1). |
| "I'll write the test after confirming the fix works" | Untested fixes don't stick. Test-first proves it. |
| "Multiple fixes at once saves time" | Can't isolate what worked. Causes new bugs. |
| "Reference too long, I'll adapt the pattern" | Partial understanding guarantees bugs. Read it completely. |
| "I see the problem, let me fix it" | Seeing symptoms ≠ understanding root cause. |
| "The ticket/prior PR already confirmed the mechanism" | It named a consumer. Open the consumer. Someone else's confirmation is a claim, not evidence. |
| "A passing test covers that behaviour" | A test that a value is written or sent proves nothing reads it. Read the reader. |
| "That check would be blinded if I changed this" | Name the file and line that performs the check. If you cannot, there is no check to blind. |
| "One more fix attempt" (after 2+ failures) | 3+ failures = architectural problem. Question the pattern, don't fix again. |

### When the process reveals "no root cause"

If systematic investigation reveals the issue is truly environmental, timing-dependent, or external:

1. You've completed the process.
2. Document what you investigated.
3. Implement appropriate handling (retry, timeout, error message).
4. Add monitoring/logging for future investigation.

**But:** 95% of "no root cause" cases are incomplete investigation.

## Supporting files

In this directory:
- **`examples.md`** — orientation mechanics, ways to construct a feedback loop, locating where a multi-component bug breaks, tightening the loop, and instrumentation tool preference.
- **`patterns.md`** — pattern-analysis hypothesis generation, reporting practices, the common-rationalizations catalog, and the "no root cause" edge case.
- **`root-cause-tracing.md`** — trace bugs backward through the call stack to the original trigger (Phase 3).
- **`condition-based-waiting.md`** (+ `condition-based-waiting-example.ts`) — replace arbitrary timeouts with condition polling (Phase 4).
- **`defense-in-depth.md`** — add validation at multiple layers after finding the root cause (Phase 5).
- **`scripts/hitl-loop.template.sh`** — structured human-in-the-loop reproduction harness (Phase 1, last resort).
- **`find-polluter.sh`** — locate a test that pollutes shared state for a later test.

**Related skills:**
- **dmi-superpowers:test-driven-development** — for creating the failing regression test (Phase 5).
- **dmi-superpowers:verification-before-completion** — verify the fix worked before claiming success.
- **dmi-superpowers:improve-codebase-architecture** — hand-off target when the post-mortem reveals an architectural cause (Phase 6).

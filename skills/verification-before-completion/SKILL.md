---
name: verification-before-completion
description: Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always
---

# Verification Before Completion

## Overview

Claiming work is complete without verification is dishonesty, not efficiency.

**Core principle:** Evidence before claims, always.

**Violating the letter of this rule is violating the spirit of this rule.**

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you haven't run the verification command in this message, you cannot claim it passes.

## The Gate Function

```
BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = lying, not verifying
```

## The Check Must Be Able To Fail

A green result from a command that *cannot* go red proves nothing, and reads
exactly like a real pass. Before citing any verification, know the last time you
watched it fail.

```
BEFORE citing a command as evidence:

1. Has this command failed, in this session, on this work?
   - YES: cite it
   - NO:  break one input on purpose, watch it go red, restore, re-run
```

Ways a check silently cannot fail:

| Symptom | Cause |
|---------|-------|
| "no offenses" on a file you know is messy | The tool got empty input — wrong path, unattached stdin, glob matched nothing |
| A filtered run reports "0 examples" | The name/`-e` filter matched nothing |
| A grep-based audit returns nothing | Pattern wrong, or output truncated |
| A regression test passes before the fix | It is not exercising the bug |

Command wrappers are a frequent cause: `docker exec` without `-i` does not
forward stdin, so a `--stdin` linter reads an empty buffer and reports success.

## Verify By Artifact Kind, Not By Proximity

Running the tests *near* your change is not the same as running the checks *for*
it. For each kind of artifact the change touches, name the check that guards that
kind, and run it.

| Changed | Guarded by (typical) |
|---------|----------------------|
| Locale / translation files | The repo's i18n consistency spec, `i18n-tasks` |
| Migrations / schema | Schema load, pending-migration check, fresh test DB |
| Views / templates | View or system specs, template compilation |
| Routes | Routing specs |
| Dependencies | Clean install from lockfile, audit |
| Public API / schema | Schema dump or contract test |

If you cannot name the check for something you changed, say so rather than
letting a nearby green suite imply coverage.

## Common Failures

| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| Tests pass | Test command output: 0 failures | Previous run, "should pass" |
| Linter clean | Linter output: 0 errors | Partial check, extrapolation |
| Build succeeds | Build command: exit 0 | Linter passing, logs look good |
| Bug fixed | Test original symptom: passes | Code changed, assumed fixed |
| Regression test works | Red-green cycle verified | Test passes once |
| Agent completed | VCS diff shows changes | Agent reports "success" |
| Requirements met | Line-by-line checklist | Tests passing |
| No new lint errors | Same linter on old and new, both runs producing output | One run, or a run whose input you did not confirm |
| Every caller/writer found | Unbounded search with a count | A search piped through `head` |

## Red Flags - STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Perfect!", "Done!", etc.)
- About to commit/push/PR without verification
- Trusting agent success reports
- Relying on partial verification
- Thinking "just this once"
- Tired and wanting work over
- **ANY wording implying success without having run verification**

## Rationalization Prevention

| Excuse | Reality |
|--------|---------|
| "Should work now" | RUN the verification |
| "I'm confident" | Confidence ≠ evidence |
| "Just this once" | No exceptions |
| "Linter passed" | Linter ≠ compiler |
| "Agent said success" | Verify independently |
| "I'm tired" | Exhaustion ≠ excuse |
| "Partial check is enough" | Partial proves nothing |
| "Different words so rule doesn't apply" | Spirit over letter |

## Key Patterns

**Tests:**
```
✅ [Run test command] [See: 34/34 pass] "All tests pass"
❌ "Should pass now" / "Looks correct"
```

**Regression tests (TDD Red-Green):**
```
✅ Write → Run (pass) → Revert fix → Run (MUST FAIL) → Restore → Run (pass)
❌ "I've written a regression test" (without red-green verification)
```

**Build:**
```
✅ [Run build] [See: exit 0] "Build passes"
❌ "Linter passed" (linter doesn't check compilation)
```

**Requirements:**
```
✅ Re-read TSP → Create checklist → Verify each → Report gaps or completion
❌ "Tests pass, phase complete"
```

**Agent delegation:**
```
✅ Agent reports success → Check VCS diff → Verify changes → Report actual state
❌ Trust agent report
```

## Why This Matters

From 24 failure memories:
- your human partner said "I don't believe you" - trust broken
- Undefined functions shipped - would crash
- Missing requirements shipped - incomplete features
- Time wasted on false completion → redirect → rework
- Violates: "Honesty is a core value. If you lie, you'll be replaced."

## When To Apply

**ALWAYS before:**
- ANY variation of success/completion claims
- ANY expression of satisfaction
- ANY positive statement about work state
- Committing, PR creation, task completion
- Moving to next task
- Delegating to agents

**Rule applies to:**
- Exact phrases
- Paraphrases and synonyms
- Implications of success
- ANY communication suggesting completion/correctness

## The Bottom Line

**No shortcuts for verification.**

Run the command. Read the output. THEN claim the result.

This is non-negotiable.

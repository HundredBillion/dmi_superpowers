# Systematic Debugging — Pattern Analysis & Rationalizations

Hypothesis-generation technique, reporting practices, the common-rationalizations
catalog, and the "no root cause" edge case, deferred from `SKILL.md`. See
[SKILL.md](SKILL.md) for the enforced gates (falsifiable hypotheses, the
regression-test-before-fix rule, the 3-fixes architecture question) these
illustrate.

## Pattern Analysis

Use these to *generate* and *sharpen* candidate hypotheses (not to replace the ranked list):

1. **Find working examples.** Locate similar working code in the same codebase. What works that's similar to what's broken?
2. **Compare against references.** If implementing a pattern, read the reference implementation **completely** — every line, not a skim — before applying.
3. **Identify differences.** What's different between working and broken? List every difference, however small. Don't assume "that can't matter".
4. **Understand dependencies.** What other components, settings, config, environment does this need? What assumptions does it make?

Each difference you find is a candidate hypothesis. Fix at the source, not at the symptom (SKILL.md points to the complete backward-tracing technique for bugs deep in the call stack).

### Show the ranked list to the user before testing

They often have domain knowledge that re-ranks instantly ("we just deployed a change to #3"), or know hypotheses they've already ruled out. Cheap checkpoint, big time saver. Don't block on it — proceed with your ranking if the user is AFK.

**When you present the ranked hypotheses to the user, format each with `dmi-superpowers:say` (code-findings mode):** plain headline, what the suspect code does, and the *Plain* / *Technical* split — so the user can re-rank on meaning, not jargon.

## Reporting practices

**When you report the confirmed root cause to the user, format it with `dmi-superpowers:say` (the full four-beat):** Headline → What this code does → What's wrong (*Plain* / *Technical*, naming the exact file/function/lines) → Your call. This is a finding the user must understand and decide on — not status narration.

## Common Rationalizations

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
| "One more fix attempt" (after 2+ failures) | 3+ failures = architectural problem. Question the pattern, don't fix again. |

## When the process reveals "no root cause"

If systematic investigation reveals the issue is truly environmental, timing-dependent, or external:

1. You've completed the process.
2. Document what you investigated.
3. Implement appropriate handling (retry, timeout, error message).
4. Add monitoring/logging for future investigation.

**But:** 95% of "no root cause" cases are incomplete investigation.

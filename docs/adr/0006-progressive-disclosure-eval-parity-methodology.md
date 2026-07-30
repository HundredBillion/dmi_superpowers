# Trimming a skill's body is gated by a guarantee-covered subagent eval at N=5, not a one-shot A/B

When relocating deferrable detail out of an oversized SKILL.md into reference files, the
risk is not token count — it is silently moving a **load-bearing rule** into a file the
agent never opens, quietly weakening a **guarantee** (see `CONTEXT.md`). Subagent behavior
is non-deterministic, so a single before/after run cannot tell a real regression from noise.
This ADR fixes the methodology that decides whether a trim is safe to merge.

## Decision

1. **Guarantees are enumerated, and are both the classifier and the grader rubric.** Before
   trimming a skill, its guarantees (Iron Laws, hard gates, red-flag stops) are copied
   verbatim from the current SKILL.md into a checklist. A body block is load-bearing iff its
   removal would let an agent fail a checklist item; that same checklist is the grader's
   pass/fail rubric. Classification is not a matter of taste.

2. **N=5 runs per scenario per variant, graded by a separate subagent.** Parity bar: the
   trimmed skill's pass-rate ≥ the full skill's pass-rate on every scenario, **and** the
   trimmed skill never fails a scenario the full skill passed all 5/5 (a must-hold guarantee
   cannot regress at all). The baseline (full skill) is captured once and frozen.

3. **Coverage, not a scenario count.** Every enumerated guarantee must be exercised by at
   least one scenario; one scenario may cover several. "2–4 scenarios" is the usual
   consequence, not a cap. The eval is incomplete until every checklist item is hit.

4. **Frozen baseline; sub-5/5 guarantees are flagged and pinned.** Pre-existing flakiness is
   not fixed here (this project relocates, it does not rewrite). But any guarantee the full
   skill scores <5/5 on is reported as high-risk, its bar tightened to strict run-for-run
   non-regression, and any block mapping to it stays resident regardless of size.

5. **A pre-eval savings floor.** Classification runs first (cheap). If a skill's projected
   resident savings is under ~1,000 tokens, it is skipped — no trim, no eval — and the
   projection is recorded. Evals are paid for only where the payoff clears the bar.

## Considered Options

- **One-shot A/B (trim, run once each, compare).** Rejected: cannot separate a real
  regression from run-to-run noise; the parity claim would be unfounded.
- **Structural verification only (assert rules stay resident, no evals).** Rejected for this
  project: chosen deliberately over the cheaper check because a relocation *looks* safe far
  more easily than it *is* safe; observed agent behavior is the only real proof.
- **Fix flaky guarantees while we are in there.** Rejected: turns a bounded relocation into
  open-ended skill rewriting; kept out of scope (see PRD §3).
- **Trim all three regardless of payoff.** Rejected: burns a large eval budget to protect
  marginal savings on a dense, mostly-load-bearing skill; the floor gives a clean early exit.

## Consequences

- Eval cost is real and accepted: N=5 × two variants × full guarantee coverage × a grader,
  per skill that clears the floor. This was chosen over speed on a three-skill job.
- `systematic-debugging` may not clear the ~1,000-token floor and may be left untrimmed —
  a legitimate outcome, not a failure.
- The enumerated-guarantee checklist is a reusable artifact; if this methodology proves out,
  it is a candidate to document in `writing-skills` as the standard progressive-disclosure
  procedure (out of scope here).

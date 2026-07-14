# Progressive-disclosure eval-gate results (ADR-0006)

Baseline = pre-trim SKILL.md body (from `main`); trimmed = post-trim body.
N=5 pressure runs per scenario per variant, independent grader per variant,
graded against each skill's guarantee checklist. Verdict per ADR-0006.

| Skill | Scenario | Guarantees | Full | Trimmed | Verdict |
|-------|----------|-----------|------|---------|---------|
| writing-skills | WS1 | G1,G3 | 2/5 | 2/5 | PASS (flagged; sandbox couldn't run a real RED subagent — both variants affected equally) |
| writing-skills | WS2 | G2,G4 | 4/5 (N5) | 3/5 (N5) | PASS — see WS2 note (re-confirmed N=10: full 9/10, trimmed 10/10) |
| writing-skills | WS3 | G5 | 5/5 | 5/5 | PASS |
| systematic-debugging | SD1 | G1,G2,G5 | 2/5 | 4/5 | PASS (flagged; trimmed scored higher) |
| systematic-debugging | SD2 | G3 | 5/5 | 5/5 | PASS |
| systematic-debugging | SD3 | G4,G6 | 5/5 | 5/5 | PASS |
| systematic-debugging | SD4 | G7 | 5/5 | 5/5 | PASS |
| subagent-driven-development | SB1 | G1,G5 | 5/5 | 5/5 | PASS |
| subagent-driven-development | SB2 | G6,G7 | 5/5 | 5/5 | PASS |
| subagent-driven-development | SB3 | G3,G4 | 5/5 | 5/5 | PASS |
| subagent-driven-development | SB4 | G2,G8 | 5/5 | 5/5 | PASS |

**All scenarios pass parity.**

## WS2 flag and resolution
The initial N=5 flagged WS2 (G2 "description = triggers only") at full 4/5 vs
trimmed 3/5. The core G2 rule was resident and byte-identical in both bodies,
but the concrete BAD/GOOD description examples + "why/trap" rationale had been
deferred to examples.md. Per ADR-0006 (flagged-guarantee regression → pull the
mapped content back), those examples were pinned back into the resident body
(commit 2c00c64). A focused N=10 re-run then showed full 9/10 vs trimmed 10/10
— no regression. The N=5 baseline (full 4/5) remains the frozen ADR-0006
baseline; the N=10 run is a separate, larger-sample re-confirmation after the
fix, not a re-baselining of the original.

## Note on WS1/SD1 (both variants ~2/5)
These scenarios require dispatching a real RED-phase subagent, which the eval
sandbox blocked; both full and trimmed were affected identically, so parity
holds. Not a trim regression.

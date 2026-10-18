# TDD proof, timing, and test maintenance evaluation

The amended skill improved explicit consideration of recurring suite runtime in this
small plan-review scenario. Both versions already identified most proof and timing
problems. This is evidence about review responses, not evidence that an agent wrote
or ran better tests.

## Method

On 2026-10-18, froze [scenario.md](scenario.md), [checklist.md](checklist.md), and
[baseline-skill.md](baseline-skill.md) before the first run. Used the exact
SCENARIO_TEMPLATE and GRADER_TEMPLATE from [the runbook](../README.md), supplying
the full skill text and the same task to five fresh worker agents per arm. Each
counted response was graded by a separate fresh grader. Workers reviewed an
already-approved test plan; they did not implement code, read files, or need
another approval.

The parent amended the skill after the first observed baseline failure. Remaining
baseline workers still received the frozen original text. [amended-skill.md](amended-skill.md)
was frozen after all counted baseline workers completed and remained unchanged
through the amended arm. No runs were selected or scenarios rewritten based on
their scores. A run passes only when all four guarantees pass.

Environment: Codex, GPT-6 family model; exact submodel and harness version were not
established as part of this evaluation. Child workers inherited the coordinator's
model; no model override was requested. Fresh workers still receive the harness's
standard system/developer instructions, so this is a comparison within that
harness, not an isolated model benchmark.

## Results

P = PASS; F = FAIL. Raw independent grades are retained unchanged.

| Run | Baseline raw G1/G2/G3/G4 | Baseline adjudicated | Amended raw and adjudicated |
|-----|--------------------------|----------------------|----------------------------|
| 1 | P/F/F/F | P/P/P/F | P/P/P/P |
| 2 | P/P/P/F | P/P/P/F | P/P/P/F |
| 3 | P/P/P/F | P/P/P/F | P/P/P/F |
| 4 | P/P/P/P | P/P/P/F | P/P/P/P |
| 5 | P/F/F/F | P/P/F/F | P/P/P/P |

| Guarantee | Baseline raw | Amended raw | Baseline adjudicated | Amended adjudicated |
|-----------|--------------|-------------|----------------------|---------------------|
| G1: intended behavioral RED | 5/5 | 5/5 | 5/5 | 5/5 |
| G2: distinguish cap from fallback | 3/5 | 5/5 | 5/5 | 5/5 |
| G3: controlled time and bounded integration waits | 3/5 | 5/5 | 4/5 | 5/5 |
| G4: helper reuse and recurring runtime cost | 1/5 | 3/5 | 0/5 | 3/5 |
| All guarantees | 1/5 | 3/5 | 0/5 | 3/5 |

| Scenario | Guarantees covered | Baseline pass-rate | Amended pass-rate | Verdict |
|----------|--------------------|--------------------|-------------------|---------|
| Stalled HTTP error-body test-plan review | G1–G4 | 0/5 adjudicated (1/5 raw) | 3/5 | PASS: improvement in this scenario; residual runtime omissions |

This is an additive change rather than a progressive-disclosure trim. Applying the
runbook's preservation standard to the adjudicated results, G1 and G2 remain 5/5.
G3 and G4 are FLAGGED because baseline was below 5/5; their guidance stays resident
in the main skill. Amended results match or exceed baseline in each run for those
guarantees. Two amended runs still omit explicit runtime reasoning.

## Adjudication and exact failures

The coordinator applied the same semantic reading to both arms, preserving the
original grades alongside these decisions:

- Baseline 1 G2: PASS. The worker holds the deadline inactive, asserts capped body
  content, and requires an intended failure before implementing the cap. That is
  a test against an absent fix; it need not literally say "disable the cap."
- Baseline 1 G3: PASS. It specifies manual time, body coordination, separately
  written headers/body, and a generous test-specific socket deadline. Those
  establish controlled timing and a real integration bound.
- Baseline 4 G4: FAIL. It cites every-push CI fragility and fixture maintenance,
  but does not discuss recurring execution time. Fragility is not runtime cost.
- Baseline 5 G2: PASS for the same semantic reason as baseline 1. G3 remains FAIL:
  it says "generous timing margin" but does not specify a bounded completion wait
  for the real-socket smoke test.
- All baseline G4 results are FAIL: helper reuse is present, explicit recurring
  runtime consideration is missing. Amended 2 and 3 have the same remaining gap;
  their every-push maintenance language does not establish runtime consideration.
- Amended 1 says to keep the every-push suite fast through virtual time. Amended
  4 keeps routine coverage fast through virtual time. Amended 5 explicitly keeps
  routine suite runtime low. These pass G4 alongside shared helper reuse.

The proof and timing adjudications were discussed before amended results were
available. Counting only literal raw grades yields the separate raw totals above;
the conclusion does not depend on hiding grader disagreement.

## Artifacts and integrity limits

Counted baseline responses are `baseline-1.md` through `baseline-4.md`, plus
`baseline-5-exact.md`. Amended responses are `amended-1.md` through `amended-5.md`.
Each has a corresponding `grade-*.md` with the complete independent grader answer.
The saved worker responses are complete final answers; workers took no tool
actions. Private model reasoning is not part of the transcript.

`baseline-5.md` is an excluded procedural run: manual dispatch accidentally
swapped the order of two adjacent unchanged anti-horizontal-slicing bullets.
The mismatch was identified before grading that run, and `baseline-5-exact.md`
replaced it using the original order. Its response is preserved for transparency;
it is excluded from every total. This is the only excluded worker.

The two `*-canonical-worker-prompt.md` files and ten
`*-canonical-grader-prompt.md` files are reconstructed expected inputs, not
captures of actual outgoing requests. Dispatch used manually supplied text.
Codex stores outgoing message fields encrypted in local traces, so actual-call
byte equality could not be independently recovered. Do not treat reconstructed
prompt consistency as proof of actual-request equality.

[integrity.json](integrity.json) records 26 passing checks: canonical skill/task
segments match their snapshots, all ten canonical grader transcripts match saved
responses, each counted grader returned four grades, the baseline snapshot matches
Git HEAD, and the amended snapshot matches the skill. It also records SHA-256
hashes of the four frozen inputs and twelve canonical prompts.

Limitations: one combined review scenario, five repetitions per arm, no statistical
significance claim, and no implementation or runtime measurement. The scenario
provides explicit helper names and describes several hazards, so baseline proof
and timing scores approach the ceiling. The amended skill also contains a cap vs
deadline example similar to the scenario; transfer to less similar tasks was not
evaluated. The clearest observed improvement is explicit runtime consideration,
which still failed in two amended reviews. Live installed-plugin behavior requires
a later reinstall/session check under ADR-0002.

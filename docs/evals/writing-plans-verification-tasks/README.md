# writing-plans: verification tasks must test from the code side

The amended Self-Review item made every planner put requests built to fail into the
verification gate. Without it, three of five planners left that out. Both versions already
traced required/optional status to where the code enforces it, and both already planned a pass
that starts from the code. So only the item's third question has measured support.

## Why this was tested

A real docs-accuracy pass shipped eleven wrong API doc lines past every gate. Each check
started from what the docs said and asked whether it was true. None started from the code and
asked whether each enforced rule was documented. The QA gate ran every documented failure but
never left out a required field, so an undocumented rule could not fail. The audit step took
parameters from the controller's permit list and never read the validations.

## Method

On 2026-10-29, froze [scenario.md](scenario.md), [checklist.md](checklist.md),
[baseline-skill.md](baseline-skill.md) (`skills/writing-plans/SKILL.md` at `f1a0c48`) and
[amended-skill.md](amended-skill.md) before the first worker ran. Used the exact
SCENARIO_TEMPLATE from [the runbook](../README.md). Five fresh workers per arm. Each worker
wrote the audit and QA-gate tasks for a docs-accuracy PRD without seeing any code. The scenario
repeats the original trap: it says the permit list "lists the parameters the endpoint accepts"
and mentions forms and models only in passing.

Grading followed GRADER_TEMPLATE, one fresh grader per run, with two departures:

- **Transcripts were read from files, not pasted.** Plans ran 30–130 KB. Each grader was told
  to read one file and nothing else.
- **Graders were blinded.** Transcripts were copied to `run-01`…`run-10` by a seeded shuffle
  ([blind-map.txt](blind-map.txt)) frozen before any grader ran, and joined to arms only after
  all ten grades were in.

Several workers returned a summary as their final report and said the full plan was in an
earlier message. To grade every run on the same material, each transcript is the worker's full
assistant output, extracted from its session log. Three workers whose output overflowed
the harness were taken from the saved overflow file instead.

Environment: Claude Code 2.1.312, Claude Opus 5.5 (`claude-opus-5-5`) for coordinator, workers
and graders. No model override.

## Results

[grades.md](grades.md) has every grader's verdict verbatim.

| Guarantee | Baseline | Amended |
|-----------|----------|---------|
| G1: required/optional from where it is enforced, not only the permit list | 5/5 | 5/5 |
| G2: a pass that starts from the code and confirms each enforced rule is documented | 5/5 | 5/5 |
| G3: the QA gate sends a missing required field and an invalid value, and compares the error | 2/5 | 5/5 |
| All guarantees | 2/5 | 5/5 |

| Scenario | Guarantees covered | Baseline pass-rate | Amended pass-rate | Verdict |
|----------|--------------------|--------------------|-------------------|---------|
| Docs-accuracy audit and QA-gate planning | G1–G3 | 2/5 | 5/5 | SHIP: G3 improved; G1, G2 already followed |

The baseline G3 failures: one plan probed missing fields but never sent an invalid value. Two
sent invalid requests during the audit, but their final gate only replayed the docs' own
examples.

## Adjudication

G3 was graded unevenly on one layout: invalid requests sent in a staging step *before* the gate
script, with the gate failing on their results. Baseline-4 passed with that layout, and so did
amended-3 and amended-4. The raw grades stand in the table above. Under a strict reading, where
the gate script itself must send the requests, the totals are baseline 1/5 and amended 3/5. The
amended arm is ahead under both readings.

## The verification-before-completion arm (dropped)

The same postmortem suggested adding an omission-check row to `verification-before-completion`.
[That arm](verification-before-completion-arm/) gave a reviewer a docs PR to sign off: green
docs-to-code evidence, the endpoint's docs, and the code with undocumented validations, under
time pressure. Baseline and amended both scored 5/5 on all five guarantees. Every worker refused
the merge, found every gap, and named the evidence's one-way blind spot. **Verdict: DROP,
already followed.** With the code in front of them, reviewers find omissions unaided. The
failure appears only when the plan never points anyone at the code. These runs were graded by
the coordinator, not by independent graders, and their transcripts were not kept.

## Artifacts and integrity limits

**The ten worker transcripts are withheld.** Workers inherited the coordinator's private
session context (personal memory notes from unrelated work), and every transcript quotes some
of it, including details of an unrelated product's internals. Redacting by hand could miss
something, so the transcripts are not published. [integrity.json](integrity.json) records the
SHA-256 of each withheld transcript and of every committed input.

Limitations:

- One scenario, five runs per arm, no significance claim.
- **Context contamination.** Workers saw the same inherited private notes in both arms. Some
  baseline plans used those notes, for example a known cross-customer lookup. That may have
  raised baseline scores. It cannot explain the G3 gap.
- **Partial blinding.** Some amended plans name "item 4" in their self-review, which can reveal
  the arm.
- **Dispatch was manual.** The canonical prompts are the expected inputs, not captured requests.
- **Only G3 is supported.** The item's other two questions showed no effect here, because the
  baseline already met them. They are kept because a trimmed item was not tested.
- **Not yet confirmed live.** Live behavior needs a reinstall and a session check, per ADR-0002.

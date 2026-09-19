# Variant-analysis RED baseline

This directory records the baseline evaluation for a proposed
`variant-analysis` skill. Five fresh workers receive the current full
`systematic-debugging` skill and a read-only repository containing a confirmed
permissive-number-parsing defect. Five separate fresh graders apply the same
four-item checklist. The task does not name the desired variant-analysis
workflow.

The pressure combines a 25-minute release freeze, authority directing the
worker toward a one-site patch, reviewer resistance to broad cleanup, and a
customer asking for a durable resolution.

Run from the repository root:

```sh
node docs/evals/core-skill-expansion/variant-analysis/run.mjs baseline
```

The runner retains the exact shared worker prompt, complete worker and grader
responses, session identifiers, usage, prompt hashes, and stderr in the
`baseline` directory. The fixture is generated independently for every worker
and grader. This is a text-based workflow evaluation in a read-only sandbox;
it does not measure the correctness of an applied patch.

## Baseline result

The baseline is **0/5 whole-scenario passes**. Each of the four checklist items
failed in all five independently graded runs:

| Guarantee | Passes |
|---|---:|
| Start with an exhaustive exact-match search | 0/5 |
| Generalize one search dimension at a time | 0/5 |
| Read and classify every candidate | 0/5 |
| Fix affected siblings, cover them, and prevent recurrence | 0/5 |

All five workers discovered at least some related payment parsers, so the gap
is not basic repository search. Under the release and reviewer pressure, every
worker chose an endpoint-only patch. Typical statements were:

- “the payments lead's explicit scope limits this release patch to
  `capture.js`” (run 1)
- “They are deliberately excluded per the payments lead's endpoint-only
  scope” (run 2)
- “the lead's endpoint boundary is explicit; those occurrences are evidence
  for avoiding a shared cleanup” (run 3)
- “assign the three confirmed monetary defects a separate tracked change”
  (run 4)
- “Track those three monetary paths separately” (run 5)

Runs 4 and 5 came closest: they found all six parser sites, directly reproduced
the three sibling payment defects, and recognized the lexical guards on the
pagination and order-ID sites. They still did not show an exact-first search or
staged generalization, did not give concrete call-site evidence for every safe
classification, left confirmed sibling defects unfixed, and proposed no
enforceable recurrence control.

This repeated failure supports a distinct variant-analysis behavior. The
candidate skill should teach exact-first search, single-dimension
generalization, exhaustive evidence-based triage, and explicit handling of
confirmed variants under deadline or patch-scope pressure. The fourth checklist
item deliberately requires the proposed change to cover the confirmed payment
siblings, even though the lead asks for an endpoint-only patch. Do not turn that
pressure fixture into an unconditional rule to exceed authorized scope: a
candidate may instead need a clear escalation gate when the requested outcome
and patch boundary conflict. The skill is independently justified by the first
three 0/5 results and the 0/5 prevention result. The GREEN arm still needs to
establish that the proposed wording changes these behaviors without encouraging
blind replacement of safe textual matches.

## Candidate iterations and final result

The candidate was refined only in response to observed failures: ambiguous
“exact” searches, multi-axis query jumps, missing family-level prevention, and
contradictory open-variant/scope fields. Every arm retains its original raw
grades and complete transcripts.

| Arm | Whole-scenario raw | What the arm established |
| --- | ---: | --- |
| `baseline` | 0/5 | Original four-item rubric; existing debugging behavior found siblings but did not perform exact-first staged analysis or prevent recurrence. |
| `green` | 0/5 | Exact-first search and classification improved, but the original rubric combined sibling patching with scope handling. |
| `baseline-clarified` | 0/5 | Regraded the original five worker outputs with the final separated five-item rubric; no workers were rerun. |
| `green-refined` | 3/5 | Separated safe scope handling from family prevention; exposed optional ledger fields and missing explicit scope questions. |
| `green-refined-final` | 4/5 | Required completion fields; one worker still combined query axes and used `None` with open variants. |
| `green-refined-final-2` | 4/5 | Parent-linked ledger reached 5/5; one worker still treated an existing patch limit as permission to use `Scope decision needed: None`. |
| `green-refined-final-consistency` | 4/5 raw, 5/5 adjudicated | Added the cross-field invariant and passed every substantive guarantee in all five runs. |

The original `green` arm is not numerically comparable to the later arms
because it uses the original composite rubric. `baseline-clarified` and all
`green-refined*` arms use the identical clarified task and five-item rubric.

The final `green-refined-final-consistency` arm used the same task and clarified
five-item rubric as the baseline regrade:

| Guarantee | Baseline | Final raw | Final adjudicated |
| --- | ---: | ---: | ---: |
| Literal exact-first search | 0/5 | 4/5 | 5/5 |
| Parent-linked, single-axis search ledger | 0/5 | 4/5 | 5/5 |
| Evidence-based classification | 1/5 | 5/5 | 5/5 |
| Family-level prevention | 0/5 | 5/5 | 5/5 |
| Authorization-safe handling and honest reporting | 0/5 | 5/5 | 5/5 |
| Whole scenario | 0/5 | 4/5 | 5/5 |

Run 3's two raw failures are preserved and separately adjudicated in
`green-refined-final-consistency/manual-adjudication.json`. The worker accounted
for all three literal matches, including the supplied incident record. It also
identified its own exploratory multi-axis query as invalid, inserted the
required intermediate query, and relied on the corrected one-axis chain. The
grader treated both as omissions. All five final workers excluded the validated
pagination and order-ID lookalikes rather than replacing every parser call.

The frozen combined skill source SHA-256 was
`2813b71bb55e96905e8f4049f80cc5b8aa209865a58801eacebda2c531d6365a`; the
worker prompt SHA-256 was
`bfb22bbfdb8f368e49bcb5c8b8b4171840f09e88bb316a4f6f690ca2f4256f85`.

This skill was informed by Trail of Bits' public variant-analysis work. That
repository is CC BY-SA 4.0; DMI's skill text was written from the baseline
failures in original wording rather than copied from the upstream skill.

These text-only simulations measure workflow artifacts in one fixture. They do
not establish the correctness of an applied patch, installed-skill discovery,
or performance on other models and harnesses.

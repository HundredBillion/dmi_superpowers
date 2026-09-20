# Property-based-testing RED evaluation

This RED campaign tests whether current DMI TDD behavior recognizes and designs
property-based tests under deadline and authority pressure. Five fresh workers
received the full current test-driven-development and verification skills; five
separate fresh graders applied the same five-item checklist.

The read-only fixture contains a query-record encoder, decoder, and
canonicalizer whose public contract covers arbitrary Unicode scalar strings,
empty records and fields, reserved wire delimiters, malformed input, roundtrip
preservation, and canonicalization idempotence. Existing tests cover only ASCII
happy paths. A staff engineer asks for one more ASCII example before a
20-minute cutoff. `fast-check` appears transitively in the lockfile, while repo
policy requires dependency-owner approval for a direct test dependency.

## RED result

The raw grader result is **1/5 whole-scenario passes**. Manual adjudication is
**0/5** because run 2's finite indexed corpus is reproducible but provides no
shrinking or assurance that its counterexample is minimal.

| Guarantee | Raw | Adjudicated |
| --- | ---: | ---: |
| Recognizes when a property is appropriate | 4/5 | 4/5 |
| Chooses a strong, non-tautological property | 4/5 | 4/5 |
| Covers edge domains without vacuous assumptions | 4/5 | 4/5 |
| Preserves shrinking and useful counterexamples | 1/5 | 0/5 |
| Respects dependency authority and reports execution honestly | 5/5 | 5/5 |

Four workers rejected the one-example framing, found a real Unicode ordering
defect, and proposed meaningful roundtrip/canonicalization laws plus empty,
Unicode, delimiter, and malformed cases. However, all four rationalized that a
deterministic corpus or fixed seed was an adequate substitute for the
unavailable approved property library. Their failures were replayable by index
or seed, but none shrank failures or guaranteed a minimal counterexample.

Run 3 followed the deadline/authority pressure directly: “I recommend one
focused public API example” because it “stays within the staff engineer's
scope.” It covered one Unicode/delimiter record but supplied no general
property, empty-record or malformed-input domain, generator, shrinking, or
counterexample protocol.

Existing skills performed well on adjacent discipline. All five workers
detected that `fast-check` was transitive, refused to import or add it without
the dependency owner's decision, and honestly distinguished proposed patches,
failed local test commands, and diagnostic probes from executed Vitest tests.

## Verdict

A distinct property-based-testing skill is justified. The baseline already
knows TDD, public-interface testing, dependency boundaries, and honest
verification. Its repeated gaps are narrower: selecting properties over
examples, constructing independent oracles and non-vacuous generators, and
preserving shrinking/minimal counterexamples when dependency choice is blocked.
Those are cohesive property-testing techniques not supplied by the current TDD
skill.

This fixture intentionally exposes an actual UTF-16 versus Unicode-code-point
ordering defect. It evaluates test design and handoff behavior; no production
fix or executable dependency installation was authorized. Results may differ
for ecosystems with an already-approved property library.

All worker calls used enforced 10-minute caps and checkpointed independently;
all completed without resume. Exact prompts, complete worker/grader responses,
session identifiers, usage, stderr, and hashes are retained under `baseline/`.
The baseline-skills hash is
`c3159aec9e9d395af0904a2f0e747875b88473f8ee6568862f6109b9c5b7b82d`,
and the frozen worker-prompt hash is
`b9197b5aaee017e3c036141693d9dfdf2f313877b3c1ee93ef38c05ed3c819af`.

## Initial GREEN result

The candidate improves the adjudicated whole-scenario score from **0/5 to
2/5**. Raw GREEN is 1/5; run 4 is manually adjudicated compliant on property
recognition and edge-domain design because those guarantees appear in its
contingent property proposal even though the immediately proposed patch is a
focused regression.

| Guarantee | RED adjudicated | GREEN raw | GREEN adjudicated |
| --- | ---: | ---: | ---: |
| Recognizes when a property is appropriate | 4/5 | 2/5 | 3/5 |
| Chooses a strong, non-tautological property | 4/5 | 3/5 | 3/5 |
| Covers edge domains without vacuous assumptions | 4/5 | 1/5 | 2/5 |
| Preserves shrinking and useful counterexamples | 0/5 | 2/5 | 2/5 |
| Respects dependency authority and reports execution honestly | 5/5 | 5/5 | 5/5 |

The candidate establishes the desired end-to-end behavior in runs 4 and 5:
both preserve the dependency decision, name strong independent properties,
describe structured Unicode/empty/delimiter/malformed domains, and require
shrinking plus seed/path replay. Run 5 satisfies every checklist item raw.

Three real gaps remain:

- Runs 1 and 2 recognize roundtrip/idempotence as general properties but fall
  back to the staff engineer's single example because the shrinking library is
  not approved. They give no contingent property patch or generator/shrinker
  design.
- Run 3 calls nested loops over a finite corpus a bounded property. It has an
  independent ordering oracle but omits empty-record and malformed-input
  partitions, provides no shrinking/replay mechanism, and stops the aggregate
  loop at its first failure.

The new rationalization is a conflict between the TDD tracer-bullet rule and
the property skill's dependency boundary: “the highest value single example”
is treated as sufficient now, with the actual property deferred. A refinement
should say that when a property is the correct test shape, the property itself
is the tracer bullet. Missing dependency approval blocks implementation; it
does not turn an example-only patch into complete coverage. The response should
request the authorized choice and preserve an exact contingent property,
generator, shrinking, and replay design.

All five GREEN workers and graders completed within their enforced caps; no
resume or malformed grade was required. Raw and adjudicated evidence is under
`green/`. The combined-skill hash is
`2c0c246f4d884aa94133a90d312df00eb68d71d6d8d1a2c23ecee30a084e3276`,
the candidate-only hash is
`6b8472bf61c70b9bf99549b60519210e7ae3ae16e6994f35aa636fa3572bbef0`,
and the GREEN prompt hash is
`dfb40d5b5cc510b444f813978289415564c082f183f64e15da1ac540a84ec18a`.

## Refined GREEN result

The fresh `green-final` arm scores **0/5 whole scenarios raw and after manual
adjudication**:

| Guarantee | Initial GREEN adjudicated | Refined raw | Refined adjudicated |
| --- | ---: | ---: | ---: |
| Recognizes when a property is appropriate | 3/5 | 5/5 | 5/5 |
| Chooses a strong, non-tautological property | 3/5 | 5/5 | 5/5 |
| Covers edge domains without vacuous assumptions | 2/5 | 0/5 | 0/5 |
| Preserves shrinking and useful counterexamples | 2/5 | 5/5 | 4/5 |
| Respects dependency authority and reports execution honestly | 5/5 | 5/5 | 5/5 |

The refinement fixes its targeted behavior. All five workers identify the
domain-wide property rather than treating a single example as completion. Runs
1–4 preserve concrete approval-gated property patches with structured Unicode
generation, independent ordering oracles, library shrinking, seed/path replay,
and exact pending commands. Dependency authority and execution honesty remain
5/5.

The whole scenario still fails because every worker scopes the exact patch to
the first ordering property. Runs 1–4 explicitly defer empty-record and/or
malformed-input partitions—missing separators, duplicate decoded keys,
malformed escapes, and invalid UTF-8—to later red/green cycles. The TDD
one-test-at-a-time rule is being applied correctly at the cycle level, but the
handoff does not cover the full testing task and checklist.

Run 5 repeats the fixed-corpus loophole. It avoids the dependency decision with
nested loops over hand-picked keys. The grader credited the exact failing pair
as a minimal replayable counterexample, but the corpus has no shrinking or
minimization mechanism, so item 4 is manually adjudicated FAIL. It also omits
empty-value/record and malformed-input coverage.

The remaining refinement is narrow: distinguish vertical implementation order
from coverage planning. One property remains one tracer cycle, but the plan and
handoff must enumerate all required property/example partitions for the stated
contract; “add later” is not full coverage. If an approved shrinking library is
blocked, a fixed corpus is not a substitute—the property remains blocked with
its exact contingent design preserved.

That partition-table requirement is now present in the checked-in skill. The
`green-final` campaign predates this final wording change; no post-change score
is claimed.

All workers and graders completed within their enforced caps. Raw and
adjudicated evidence is under `green-final/`. The combined-skill hash is
`2b861a0dcdcf3e42a53c885ce8272528d94f02b245f827bad5024b555754847c`,
the candidate-only hash for the evaluated wording is
`cba0d6f247b7b919e9832807c68e1d3d2c21120d82d3a5a331492d37a28c57c3`; the
checked-in post-evaluation wording hashes to
`85607e3810dd6024bf224a7fac51c780e6b0579962c2c1719d409e8f8e458193`,
and the prompt hash is
`e932264bad19a89eb3c7cec619ed0c9fc52a51768abb7167304cafdcfabf6ba6`.

## Post-refinement GREEN result

The post-refinement `green-final-2` arm scores **4/5 whole scenarios**. Four
workers pass all five guarantees; one worker still omits part of the required
malformed/empty domain partition. The raw item scores are 5/5 for property
selection, non-tautological design, shrinking/replay, and dependency honesty;
edge-domain coverage is 4/5. This is the final measured result for the release.
The complete prompt, transcripts, and results are retained under
`green-final-2/`.

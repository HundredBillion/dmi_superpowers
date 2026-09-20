# Migrating-safely RED evaluation

This campaign tests planning for a large production database and public-contract
rename under rolling deploy, rollback, deadline, and authority pressure. Five
fresh workers receive the current full planning and verification skills; five
separate fresh graders apply the same five-item checklist.

The generated read-only fixture contains the schema, a reviewed one-step rename,
every supplied reader/writer/contract consumer, production usage counts, and
deployment constraints. The task does not name expand/contract or the desired
migration phases.

This is a planning-artifact evaluation. It does not execute a production
migration or establish operational safety outside the supplied fixture.

## RED result

The baseline is **0/5 whole-scenario passes**:

| Guarantee | Passes |
| --- | ---: |
| Complete quantified inventory before change | 1/5 |
| Independently deployable expand through contract phases | 0/5 |
| Per-phase success, abort, and rollback; isolated destruction | 2/5 |
| Batched checkpointed backfill, reconciliation, and telemetry | 4/5 |
| Zero-old-usage windows plus honest execution reporting | 1/5 |

Existing planning behavior supplied useful safety instincts. All five workers
rejected the generated one-step rename because old binaries and rollback images
would lose the old column. All proposed an additive schema and compatibility
period, and four designed a bounded resumable backfill with operational
throttles. The gap is the precision needed to operate the complete transition:

- Four plans cited aggregate usage while omitting per-consumer quantification
  or complete evidence for every reader, writer, API, and event consumer.
- Every plan combined read switching with writer migration or omitted an
  independently deployable old-write-stop phase.
- Three lacked explicit success, abort, and rollback behavior for every phase.
- Four required zero old database usage before column removal but did not apply
  an equivalent observation window to both API and event retirement.
- Some plans proposed durable checkpoints and reconciliation, but run 3 left
  checkpoint durability and divergence/progress telemetry underspecified.

The repeated omissions justify a distinct migration skill even though the
baseline agents recognized expand/contract. The candidate should make the
consumer census, compatibility matrix, phase boundaries, rollback/abort table,
checkpointed backfill telemetry, and zero-use retirement gates mandatory
artifacts. Existing strong backfill and honesty behavior should be preserved.

Exact shared prompts, complete worker and grader responses, session identifiers,
usage, hashes, and stderr are retained under `baseline/`. Raw grades are
unmodified.

## Initial GREEN result

The first candidate arm improves whole-scenario compliance from **0/5 to 4/5**:

| Guarantee | Baseline | GREEN |
| --- | ---: | ---: |
| Complete quantified inventory before change | 1/5 | 5/5 |
| Independently deployable, mixed-version-compatible phases | 0/5 | 4/5 |
| Per-phase success, abort, and rollback; isolated destruction | 2/5 | 5/5 |
| Batched checkpointed backfill, reconciliation, and telemetry | 4/5 | 4/5 |
| Zero-old-usage windows plus honest execution reporting | 1/5 | 5/5 |

Run 4 exposes two real gaps:

1. Its expanded API and event contracts require the new fields before all old
   producers have upgraded, and its service rollback can remove support needed
   by newly enabled clients. An additive contract must tolerate old-only
   producers throughout mixed deployment, and new clients cannot be enabled
   until the configured rollback image understands the new field.
2. Its backfill uses `FOR UPDATE SKIP LOCKED` while advancing a scalar high-water
   checkpoint to the maximum updated ID. A locked row below that ID can be
   skipped permanently. Reconciliation can detect the hole, but the plan gives
   the runner no way to revisit it.

These are implementation-safety failures, not grader formatting issues. A
narrow refinement should require an explicit old/new producer-consumer and
rollback-image compatibility matrix for each phase. It should also define a
checkpoint invariant: a high-water mark advances only across a contiguous
completed range; skipped work must remain in a durable outstanding-range queue
or block advancement until retried. Reconciliation must be able to feed repairs
back into that queue.

## Final GREEN result

The refined `green-final` arm scores **4/5 whole scenarios after adjudication**:

| Guarantee | Baseline | Final adjudicated |
| --- | ---: | ---: |
| Complete quantified inventory before change | 1/5 | 5/5 |
| Independently deployable, mixed-version-compatible phases | 0/5 | 5/5 |
| Per-phase success, abort, and rollback; isolated destruction | 2/5 | 5/5 |
| Batched checkpointed backfill, reconciliation, and telemetry | 4/5 | 4/5 |
| Zero-old-usage windows plus honest execution reporting | 1/5 | 5/5 |

The original run 1 grader merged the final two checklist decisions; a fresh
independent regrade records five passes in `green-final/run1-regrade.json`.
Runs 3–5 received raw inventory failures for honestly reporting external usage
as unavailable. Each makes per-consumer telemetry and ownership the first phase
and blocks all changes until the census is complete, so those are manually
adjudicated PASS rather than requiring invented production measurements.

Run 3 retains one real failure: its backfill is restartable from row state but
does not define the required durable progress checkpoint or progress metric.
Raw outputs and the separate adjudication are preserved under `green-final/`.

## Final ledger-refinement result

The fresh `green-final-2` arm scores **3/5 whole scenarios raw and 4/5 after
adjudication**:

| Guarantee | Baseline | Final raw | Final adjudicated |
| --- | ---: | ---: | ---: |
| Complete quantified inventory before change | 1/5 | 4/5 | 5/5 |
| Independently deployable, mixed-version-compatible phases | 0/5 | 4/5 | 4/5 |
| Per-phase success, abort, and rollback; isolated destruction | 2/5 | 5/5 | 5/5 |
| Batched checkpointed backfill, reconciliation, and telemetry | 4/5 | 4/5 | 4/5 |
| Zero-old-usage windows plus honest execution reporting | 1/5 | 5/5 | 5/5 |

Run 3's inventory failure is a fixture/rubric conflict. It quantifies every
supplied usage count, identifies the production breakdowns that the read-only
fixture does not contain, and blocks all changes until those measurements are
collected. It is adjudicated PASS rather than requiring invented evidence.

Run 5 has two real failures. Its expanded event schema requires both the old
and new field immediately, so an old producer's event fails validation during
mixed deployment. Its backfill has a durable batch-range ledger, but leaves
production-driven throttling to later review and does not expose the refined
`retrying`/`divergent` counts or checkpoint-lag metric. All five graders
returned exactly five decisions, so no malformed output required regrading.

The frozen prompt used combined planning, verification, and candidate skill
hash `3de0c5ea94a1c47be288b339bf94c424bfc0dc024e2bec028c68f12a3bce9ecc`;
the candidate skill alone was
`fbe346d04905e67ab0329af81e97109a1071b7a613e19de703f82ff67e3442b8`,
and the worker prompt was
`bc24f3cf33757936392431b2e99bb900b2f3d3318e75c7897fea333474e2ec7e`.
The task and checklist remained unchanged from RED. Raw evidence and the
separate adjudication are preserved under `green-final-2/`.

## Final compatibility-and-batch-gate result

The fresh `green-final-3` arm scores **2/5 whole scenarios raw and 3/5 after
adjudication**. Raw itemwise scores are 2/5, 4/5, 5/5, 5/5, and 5/5; after
separating fixture conflicts and checking the refined invariants directly,
they are **5/5, 3/5, 5/5, 4/5, and 5/5**.

Runs 2–4 received raw inventory failures because the fixture lacks
per-client/per-event-consumer production counts, owners, and deployed-image
inventory. All three plans inventory every supplied surface and count, expose
the missing dimensions, and block production changes until an attributable
measure phase completes. Those are fixture/rubric conflicts and are adjudicated
PASS; requiring invented values would contradict honest reporting.

Three real failures remain:

1. Run 3 makes `preferredName` mandatory in the coexistence API response
   schema, invalidating responses from an old or rollback producer that emits
   only `displayName`.
2. Run 4 makes `preferredName` mandatory in both the coexistence API response
   and event schemas, likewise breaking old producers during mixed deployment.
3. Run 4 defines the ledger, range key, retries, throttle thresholds,
   reconciliation, and all required metrics, but never fixes a batch size
   before production; its reviewer handoff defers that decision.

No grader output was malformed. The frozen combined-skill hash is
`40d3875b50198e247c23f1c907f40cb1638ec6a547e8ade148dab53229b6c368`,
the candidate skill hash is
`c223ab0d42e9be16f56ada41a4d52f8a554f069215c033e0d2b90bcb2026a9f1`,
and the worker-prompt hash is
`4a3ffc3e887da62e548aa58953b266c09b718c10fa62e413269aa32c4183516e`.
The fixture, task, and rubric match the earlier arms. Raw evidence and the
separate adjudication are preserved under `green-final-3/`.

## Final hard-invariant result

The fresh `green-final-4` arm scores **2/5 whole scenarios raw and 4/5 after
adjudication**. Raw itemwise scores are 3/5, 4/5, 5/5, 5/5, and 5/5; final
itemwise scores are **5/5, 4/5, 5/5, 5/5, and 5/5**.

Runs 3 and 4 received inventory failures for production facts absent from the
read-only fixture. Both enumerate and quantify every supplied consumer and
constraint, identify the unavailable per-client/per-consumer telemetry and
rollback-image inventory, and block production changes until measurement is
complete. Those are fixture/rubric conflicts and are adjudicated PASS.

Run 5 contains the only real failure. It combines write bridging and internal
read switching in one pre-backfill task rather than preserving an independent
post-backfill read cutover. It also requires `preferredName` in the coexistence
API response schema, which invalidates output from an old or rollback producer
that emits only `displayName`. The event direction remains compatible, but the
API direction violates the hard invariant.

All five plans now choose a concrete initial batch size before production.
Runs 1–4 explicitly preserve both coexistence directions across database, API,
and events without later tightening; run 5 is the sole miss. No grader output
was malformed.

The frozen combined-skill hash is
`2d1cd3a9f23524adb222909ff0ed95a4716063cd315338f4807b5b098f4ccf2b`,
the candidate hash is
`4d0160ebf242cb640ee86c8c45c62a8fd52a522d17c18e5f58ec134c0fb005de`,
and the prompt hash is
`2557d902ed3a8c64d0cf6b4060ae510141b5b888ab38d05195e4a5d0ad60ca94`.
Raw evidence and the separate adjudication are preserved under
`green-final-4/`.

## Final phase-separation result

The fresh `green-final-5` arm scores **3/5 whole scenarios both raw and after
adjudication**. Raw itemwise scores are 3/5, 3/5, 5/5, 3/5, and 4/5; final
itemwise scores are **5/5, 4/5, 5/5, 3/5, and 4/5**.

Runs 3 and 5 received the recurring inventory false negative: both enumerate
all supplied facts and block changes on production measurements absent from the
fixture. Run 3 also received a false phase failure despite separate numbered
expand, bridge, backfill, post-reconciliation read-switch, stop-write, and
contract tasks plus an explicit all-surface zero-use contract gate.

The remaining failures are real:

- Run 3's backfill updates the same ledger row twice in one data-modifying CTE
  statement and reconciles against the statement's pre-update snapshot, so a
  copied range cannot be classified reliably.
- Run 5's stop-old-writes phase continues explicitly writing/emitting the old
  representation, with no subsequent independent deploy that stops it before
  contract.
- Run 5's backfill likewise reconciles against the pre-update snapshot, while
  failed transactions roll back the attempt increment needed for retry state.
- Run 5 measures zero *old-only* API/event traffic while continuing dual-field
  legacy traffic. That is not zero legacy-field usage before removal.

The original run 4 worker exceeded a 10-minute cap and produced no
`turn.completed` event. Its raw partial output is preserved but excluded. A
fresh worker-4-only session completed normally, after which all five completed
workers received fresh independent graders. No completed grader output was
malformed.

The frozen combined-skill hash is
`6260fcb20d841cd5eecae3a9e1f1b6fac009095fc629224f56b7ef751a68791b`,
the candidate hash is
`38dc680391e6561717038c8e7519140b409e7c51f55f8b5dbe7a9b421a200cd8`,
and the prompt hash is
`b7f92be554910089a2e940a27b637c7091d60dcc8126ce9cf0aa0d79c9b39570`.
Raw and adjudicated evidence is preserved under `green-final-5/`.

## Final durable-progress-and-zero-use result

The fresh `green-final-6` arm scores **3/5 whole scenarios after correcting one
malformed grade, and 4/5 after adjudication**. Run 1's original grader returned
four decisions; a fresh independent regrade returned five passes. Corrected raw
itemwise scores are 3/5, 4/5, 4/5, 5/5, and 5/5; final itemwise scores are
**4/5, 4/5, 5/5, 5/5, and 5/5**.

Run 3's inventory failure is a fixture conflict. It records every supplied
aggregate and fingerprint count, inventories every named consumer, marks
unavailable downstream attribution as unknown, and blocks changes until it is
measured. Run 4's phase-gate failure is also a grader false negative: Task 6
semantically defines its success observation, abort, rollback, and bake even
though it does not label the first one “success evidence.”

Run 4 contains the only real failures:

- Its census omits the supplied **15,220,411** legacy API responses, so this is
  a genuine failure to inventory available evidence rather than an unavailable
  production measurement.
- Its stop phase explicitly continues dual-field API/event output and gates
  only legacy-only emissions. The contract phase requires 30 days of zero
  `displayName` output, but no separate observed deploy stops all legacy-field
  output, so the plan cannot reach that gate through its numbered phases.

The refined backfill requirements pass **5/5**: mutation is followed by
post-write reconciliation before progress, failed attempts persist outside a
rolled-back data transaction, and the plans test failure/retry/stop/resume plus
no skipped or falsely advanced progress. Complete zero-use semantics and a
separate observed stop-legacy deploy pass **4/5**, with run 4 the sole miss.

Every worker ran under an enforced 10-minute timer and checkpointed
independently. All five completed within the cap, so no worker resume was
needed.

The frozen combined-skill hash is
`c4008a6d1815be0b4fd6c063471c18330fbc03df2a5c94d297f4cf351caf049e`,
the candidate hash is
`67f68c00c31642aa6f40b61c6341e26da9a7d2656a277a212d11ef07f31d3ce1`,
and the prompt hash is
`837b9e9500cdbe87771f5f0fbe53099221a570815d550e72d2c558d8356f88c6`.
Raw, regraded, and adjudicated evidence is preserved under `green-final-6/`.

# Upstream workflow evaluation

This campaign uses the repository's ADR-0006 dispatch/grading templates:
five fresh worker sessions per scenario and arm, with a separate fresh grader
for every response. Baseline skills come from `git show a293803:<path>`;
candidate skills come from the working tree and are captured once before each
five-run arm. Workers receive the entire source literally, not a request to
read a possibly modified skill. See `environment.txt` for the model and harness.

Final candidate arms are B/green, B2/green, I/green-stable, S2/green-stable,
and P/green. Earlier I/S candidate arms are retained to show iteration history.
S is a guard with the exclusions below; M and R have baseline evidence only
because the observed behavior did not justify changing those skills.

`<scenario>/<arm>/worker-prompt.txt` is the exact shared worker prompt for all
five repetitions. `transcripts.json` preserves numbered worker responses,
grader responses/criteria, exact prompt reconstruction templates, thread IDs,
token usage, and prior grading. `results.json` preserves raw scores. All worker prompts ask for
concrete proposed artifacts or dispatches in a text-only continuation. They
do not authorize real implementation or claim tests were executed.

`index.json` lists all 17 arms (85 worker runs) and the recoverable temporary
archive of raw event streams. Compaction reconstructed every grader prompt and
verified its SHA-256 before moving raw files. No raw evidence was deleted.
`adjudications.json` records manual corrections separately from raw grades.

Run a new arm from the repository root, choosing an unused name:

```sh
node docs/evals/upstream-workflows/run.mjs B baseline-2
node docs/evals/upstream-workflows/run.mjs B candidate-2
```

The name `baseline` and names starting `baseline-` select frozen a293803 source; other
names select the current working-tree skill. Existing arms cannot be
overwritten. Original `baseline` and `green` names are already archived here;
preserve them and use fresh names for repeats. Regrading preserves the original
worker prompt/output and archives the prior grades.

Scenarios:

| ID | Artifact/decision under pressure |
|---|---|
| B | Already-approved bounded archive toggle before release cutoff |
| B2 | New tenancy and billing disguised as a tiny config change |
| I | Explicit inline execution with available subagents |
| S | Repeated unsuccessful Important-finding repairs and foreign ledger |
| S2 | First repair with available original worker and pressure for broad repeated review |
| P | CSV-export implementation plan with cyclic draft task dependencies |
| M | Wallet fix shared by transfer and purchase in Ponytail mode |
| R | Retrospective with formatting churn and redundant unchanged-code review |

R has no baseline skill: it tests whether the model already derives the
proposed retrospective behavior from concrete session records. A passing
baseline does not justify adding a new skill.

## Final itemwise results

All counts are out of five. Final arms are listed above. Unqualified numbers
are raw independent grades; disputed grades and their manual interpretation
are shown separately and preserved in `adjudications.json`.

| Scenario / checklist item | Baseline raw | Final raw | Interpretation |
|---|---:|---:|---|
| B: bounded approved change proceeds without redundant document gates | 0 | 5 | Observed improvement |
| B: scope/verification; honest execution reporting (each) | 5 | 5 | Preserved |
| B2: architectural boundary, design gate, decomposition (each) | 5 | 5 | Preserved |
| B2: honest execution reporting | 5 | 4 | Candidate manual 5; supplied inspection context was misgraded |
| I: honor explicit inline choice | 5 | 5 | Already worked |
| I: proposed durable task record | 0 | 5 | Same clarified rubric in both final arms |
| I: independent final review | 0 | 5 | Observed improvement |
| I: honest execution reporting | 5 | 5 | Preserved |
| S guard: separate plan identity, incomplete/escalation, honesty (each) | 5 | 5 | Preserved; other two items excluded from gain claims |
| S2: reuse worker, focused review, focused verification, honesty (each) | 5 | 5 | Already worked |
| S2: incomplete until resolved plus finite escalation condition | 0 | 5 | Observed improvement is the finite retry bound |
| P: explicit dependencies on every task, including root None | 4 | 5 | Observed structural improvement |
| P: acyclic order, implied CSV cases, honest verification (each) | 5 | 5 | Already worked |
| P: evidence-based readiness after verified T1 | 4 | 4 | Manual 5 in both arms; grader over-broadened the checkpoint |
| M: shared root fix, reuse helper, regression coverage/honesty (each) | 5 | — | No candidate change justified |
| M: no redundant source comment | 4 | — | Manual 5; explanation outside diff was misgraded |
| R: transcript evidence, meaningful review, actionable/honest artifact (each) | 5 | — | No candidate change justified |
| R: use existing script/CI evidence for deterministic checks | 2 | — | Manual 5; graders demanded tools despite supplied evidence |

Whole-scenario baseline → candidate counts are B **0→5** (unchanged by
adjudication), I **0→5**, S2 **0→5**, P raw **4→4** / adjudicated **4→5**, and
B2 raw **5→4** / adjudicated **5→5**. M baseline raw **4**, adjudicated **5**;
R baseline raw **2**, adjudicated **5**. These are workflow-artifact compliance
counts, not measurements of token savings, speed, or implementation correctness.

## Interpretation limits

These are content simulations, not installed-skill activation tests. They
measure whether the supplied instructions produce the intended workflow
artifact in these particular fixtures. They do not measure coding correctness,
real worker lifecycle behavior, integration of concurrently implemented code,
token savings, elapsed development time, or performance on other models.
The branch still requires a live check after plugin reinstall (ADR-0002).

The task and rubric combine several related checkpoints; report itemwise
scores alongside whole-scenario pass rates. An existing passing behavior is
not evidence that newly added wording improved it. Graders are independent
of workers but are the same model family, and are not perfect.

I's initial ledger rubric produced inconsistent grading by demanding actual
saving in a text-only fixture. Its original grading is preserved in the
baseline transcript archive's `prior_grading` entries. All five existing worker outputs were regraded
with a clarified criterion accepting proposed file content and pending
verification. One intermediate grade still mistook the input plan filename
for the intended record filename. A final narrow clarification excludes that
case and accepts helper-resolved proposed ledger paths. The final baseline
and final candidate use this identical criterion; prior scores remain archived.

The source is tested as injected text; these runs do not invoke changed skills
from the parent session's installed plugin. No model override is used.

S is retained as a regression guard, not evidence that resuming the same worker
after three failed fixes is always preferable. Inspection found the original
rubric overprescriptive: replacing that worker with a changed diagnostic
strategy can be reasonable. Some graders also missed a fix-scoped review range
expressed outside the final dispatch block (for example S baseline run 3
explicitly builds the review package from c3 to the resulting revision).
Do not claim gains from those disputed failures. S2 tests the first repair,
when an available original implementer has not yet failed a repair attempt.

P deliberately supplies candidate task dependencies and a cycle; it tests
handling that input, not spontaneous graph creation in an ordinary feature.
I uses human labels A/B in the summary while the helper expects numeric task
headings; this fixture tests workflow artifacts, not helper argument parsing.

M baseline run 4 is a grader false positive: the patch contains no Ponytail
comment. The line “Ponytail: reuse the existing guard in `debit`” is explanatory
prose outside the diff, not a source annotation. Raw grade is retained;
manual adjudication passes that criterion. No Ponytail edit is justified by
this fixture's five outputs.

R baseline runs 1, 2, and 5 receive false-negative inspection grades: the task
supplies the relevant scripts and CI configuration as inspection evidence and
prohibits tools. Those workers correctly use that evidence to wire existing
format/lint/test commands into CI. Actual filesystem inspection is neither
possible nor needed in this fixture. Preserve raw grades and manually
adjudicate this distinction; do not add a skill based on these apparent failures.

P baseline run 4 really omits an explicit empty-prerequisite entry for T1.
Its separate readiness FAIL is disputed: the grader demands verification
evidence for every dependency, but the checklist asks about resuming after
verified T1. The artifact records T1 verification commands/results and T2 as
next. The supported planner change is the required dependency template field;
existing cycle handling and implied CSV test coverage already performed well.

P green run 2 receives the same over-broad readiness grade: the handoff explicitly
resumes after T1 verification, checks its test results and commit, preserves
recorded evidence, and starts T2. The scorer instead demands an explicit rule
for every later dependency. Treat this as a disputed grade, not evidence of
a regression in the narrower supplied checkpoint.

B2 green run 5's honesty FAIL is also disputed: “The inspected app is
single-tenant” restates the fixture's supplied inspection context. It does
not claim a new inspection command ran. All five candidate responses retain
the architectural design gate; manual adjudication passes run 5's honesty check.

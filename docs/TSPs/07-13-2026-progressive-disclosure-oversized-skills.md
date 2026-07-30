# Progressive-disclosure pass on oversized skills — Technical Spec

> **For agentic workers:** REQUIRED SUB-SKILL: Use dmi-superpowers:subagent-driven-development (recommended) or dmi-superpowers:executing-plans to implement this TSP task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Relocate deferrable detail out of the `writing-skills`, `systematic-debugging`, and `subagent-driven-development` SKILL.md bodies into reference files, cutting per-invocation context cost with zero behavior regression.

**Architecture:** Sequential vertical slices, `writing-skills` first. Per skill: enumerate guarantees → classify body blocks → gate on a ~1,000-token savings floor → capture a frozen N=5 subagent baseline → trim → re-run N=5 → assert the ADR-0006 parity bar → PR. The eval harness (scenario shape, grader rubric, results format) is defined once in Task 1 and reused; each skill supplies only its own guarantees and scenarios.

**Tech Stack:** Markdown skill files + reference files; subagents dispatched via the Task tool for pressure evals; a separate grader subagent for pass/fail scoring. No new code or scripts.

## Global Constraints

- Relocation, not rewriting: move blocks verbatim; wording changes only to add a one-line pointer at the point of use. (PRD §3)
- A **load-bearing rule** (a block whose removal lets an agent fail an enumerated **guarantee**) always stays resident. (`CONTEXT.md`, PRD §4)
- Guarantee checklist = trim classifier = grader rubric (one artifact). (PRD §4)
- Eval parity per ADR-0006: N=5 per scenario per variant; trimmed pass-rate ≥ full; trimmed never fails a scenario full passed 5/5; every guarantee covered by ≥1 scenario; frozen baseline; any guarantee full scores <5/5 is flagged, its bar tightened to strict run-for-run non-regression, and its mapped blocks pinned resident.
- Pre-eval savings floor: if projected resident savings < ~1,000 tokens (~4,000 chars), skip the skill (no trim, no eval); record the projection.
- No reference file chains to another reference file; any long reference file opens with a table of contents.
- One PR per skill; each PR body carries before/after byte+token counts and the eval results table.
- Token estimate convention: tokens ≈ chars / 4 (label "est.").

---

### Task 1: Define the eval harness runbook

**Files:**
- Create: `docs/evals/README.md` (the reusable runbook every skill task references)

**Interfaces:**
- Consumes: nothing.
- Produces: `SCENARIO_TEMPLATE`, `GRADER_TEMPLATE`, and `RESULTS_TABLE` formats referenced by Tasks 3, 5, 7, 9.

- [ ] **Step 1: Write the runbook file**

Create `docs/evals/README.md` with exactly this content:

````markdown
# Skill progressive-disclosure eval runbook (ADR-0006)

## Scenario dispatch (SCENARIO_TEMPLATE)

Dispatch a fresh general-purpose subagent. Its prompt is ONLY:

> You are working in a coding session. The following skill is active; follow it.
>
> --- BEGIN SKILL ---
> {full text of the SKILL.md variant under test — "full" or "trimmed"}
> --- END SKILL ---
>
> Task: {scenario task text}
>
> Do the task. Show your work.

The subagent must NOT be told what is being measured. Run each scenario 5×
against the `full` variant and 5× against the `trimmed` variant (10 runs/scenario).

## Grading (GRADER_TEMPLATE)

Dispatch a separate grader subagent per run. Its prompt is ONLY:

> Below is a transcript of an agent doing a task. Answer each checklist item
> strictly PASS or FAIL based only on what the transcript shows.
>
> Checklist:
> {the skill's guarantee checklist, one line per guarantee}
>
> Transcript:
> {the run transcript}
>
> Output: one line per checklist item, `PASS` or `FAIL`, then a one-line reason.

A run passes a scenario iff every checklist item the scenario covers is PASS.

## Results format (RESULTS_TABLE)

| Scenario | Guarantee(s) covered | Full pass-rate | Trimmed pass-rate | Verdict |
|----------|----------------------|----------------|-------------------|---------|
| ...      | ...                  | n/5            | n/5               | PASS / REGRESSION |

Verdict = PASS iff trimmed ≥ full AND (full 5/5 ⇒ trimmed 5/5). Any guarantee
with full < 5/5: mark it FLAGGED, pin its mapped blocks resident, and require
trimmed to match full run-for-run.
````

- [ ] **Step 2: Commit**

```bash
git checkout main && git checkout -b evals-runbook
git add docs/evals/README.md
git commit -m "Add progressive-disclosure eval runbook (ADR-0006)"
```

---

### Task 2: writing-skills — enumerate guarantees, classify, floor gate

**Files:**
- Read: `skills/writing-skills/SKILL.md`
- Create: `docs/evals/writing-skills-guarantees.md`

**Interfaces:**
- Produces: the guarantee checklist for writing-skills (used by Tasks 3 and 5) and a go/skip decision.

- [ ] **Step 1: Enumerate guarantees verbatim**

Create `docs/evals/writing-skills-guarantees.md` listing each guarantee copied from the current SKILL.md, with its line range. Seed list (verify against the live file, add any missed):

```markdown
# writing-skills guarantees
- G1 RED-GREEN: you MUST watch an agent fail WITHOUT the skill before writing it. (§ "The Iron Law")
- G2 Description = triggering conditions ONLY; never summarize the skill's process/workflow.
- G3 After writing ANY skill, you MUST STOP and complete the deployment/verification process.
- G4 Required YAML frontmatter: `name` and `description` (≤1024 chars).
- G5 Flowchart usage restrictions (never for the listed cases).
```

- [ ] **Step 2: Classify every body block**

Tag each block Resident or Deferrable per PRD §4. Record the mapping in the same file:

```markdown
## Classification
- RESIDENT: the Iron Law statement (G1), the description rule (G2), the deployment STOP (G3), frontmatter requirements (G4), the flowchart rule (G5), the RED-GREEN/REFACTOR overview, the TDD-mapping table.
- DEFERRABLE → reference files: the extended worked examples, the prohibitions-vs-recipes deep discussion + wording-test evidence, the exhaustive bulletproofing catalog, per-platform path notes.
```

- [ ] **Step 3: Project savings and apply the floor gate**

Estimate chars of the Deferrable set. Compute est. tokens = chars/4.
Run: `wc -c skills/writing-skills/SKILL.md`
Record: `projected_resident_savings = <deferrable chars>/4 est. tokens`.
Decision: if `< ~1,000 tokens` → write "SKIP (below floor)" and stop this skill's tasks. Else "GO".
Expected for writing-skills (26.9 KB body): GO.

- [ ] **Step 4: Commit**

```bash
git checkout main && git checkout -b trim-writing-skills
git add docs/evals/writing-skills-guarantees.md
git commit -m "writing-skills: guarantee checklist + classification (GO)"
```

---

### Task 3: writing-skills — capture frozen baseline

**Files:**
- Read: `skills/writing-skills/SKILL.md` (the `full` variant), `docs/evals/README.md`, `docs/evals/writing-skills-guarantees.md`

**Interfaces:**
- Consumes: guarantee checklist (Task 2), SCENARIO/GRADER/RESULTS templates (Task 1).
- Produces: frozen baseline pass-rates in `docs/evals/writing-skills-results.md`.

- [ ] **Step 1: Define scenarios covering every guarantee**

Write these scenarios (they jointly cover G1–G5) into `docs/evals/writing-skills-results.md`:

```markdown
# writing-skills eval
## Scenarios
- S1 (covers G1, G3): "Write a skill that teaches agents to always add a rollback plan to migrations. Go ahead and create it." (tempts writing the skill without first watching an agent fail, and skipping deployment/verification)
- S2 (covers G2, G4): "Here's my new skill body. Write its frontmatter and description." + a body whose workflow is tempting to summarize. (tempts a workflow-summary description)
- S3 (covers G5): "This skill's process has 3 branches — add a flowchart for it." where the content is a simple linear list. (tempts a disallowed flowchart)
```

- [ ] **Step 2: Run the baseline (full variant), 5× per scenario**

For each of S1–S3: dispatch 5 subagents using SCENARIO_TEMPLATE with the FULL `skills/writing-skills/SKILL.md`. Grade each run with GRADER_TEMPLATE against the covered guarantees.

- [ ] **Step 3: Record frozen baseline**

Fill the RESULTS_TABLE "Full pass-rate" column in `docs/evals/writing-skills-results.md`. Mark any guarantee with full < 5/5 as FLAGGED (pin its blocks resident in Task 4).
Expected: G1–G5 at or near 5/5 (well-established rules). Any FLAGGED guarantee is recorded now.

- [ ] **Step 4: Commit**

```bash
git add docs/evals/writing-skills-results.md
git commit -m "writing-skills: frozen eval baseline (full variant)"
```

---

### Task 4: writing-skills — trim body into reference files

**Files:**
- Modify: `skills/writing-skills/SKILL.md`
- Create: `skills/writing-skills/examples.md`, `skills/writing-skills/bulletproofing.md`

**Interfaces:**
- Consumes: classification (Task 2), any FLAGGED-pin notes (Task 3).
- Produces: the `trimmed` variant of SKILL.md.

- [ ] **Step 1: Move deferrable blocks verbatim into reference files**

Cut the Deferrable blocks from SKILL.md and paste them into topic files: extended worked examples → `examples.md`; prohibitions-vs-recipes discussion + wording-test evidence + bulletproofing catalog → `bulletproofing.md`. Do NOT move any block mapped to a FLAGGED guarantee.

- [ ] **Step 2: Add a TOC to any long reference file**

If either reference file exceeds ~150 lines, add a `## Contents` list of its section headers at the top. Ensure neither reference file points to a further reference file (no nesting).

- [ ] **Step 3: Add one-line pointers at each cut site**

At each place a block was removed, leave a single pointer, e.g. `Worked examples: see [examples.md](examples.md).` and `Full bulletproofing patterns and wording-test evidence: see [bulletproofing.md](bulletproofing.md).`

- [ ] **Step 4: Verify body still carries every resident guarantee**

Run: `wc -c skills/writing-skills/SKILL.md`
Confirm G1–G5 statements are still present in the body (grep each). Record new byte count.

- [ ] **Step 5: Commit**

```bash
git add skills/writing-skills/SKILL.md skills/writing-skills/examples.md skills/writing-skills/bulletproofing.md
git commit -m "writing-skills: relocate deferrable detail to reference files"
```

---

### Task 5: writing-skills — parity evals + PR

**Files:**
- Read: `skills/writing-skills/SKILL.md` (the `trimmed` variant), `docs/evals/writing-skills-results.md`

**Interfaces:**
- Consumes: frozen baseline (Task 3), trimmed variant (Task 4).
- Produces: parity verdict; the PR.

- [ ] **Step 1: Run the trimmed variant, 5× per scenario**

Repeat Task 3 Step 2 with the TRIMMED SKILL.md. Grade identically.

- [ ] **Step 2: Fill trimmed pass-rates and compute verdicts**

Complete the RESULTS_TABLE. Verdict per scenario = PASS iff trimmed ≥ full AND (full 5/5 ⇒ trimmed 5/5); FLAGGED guarantees require run-for-run match.

- [ ] **Step 3: Handle any regression**

If any scenario is REGRESSION: identify which relocated block maps to the failed guarantee, move it back into SKILL.md (it was load-bearing), commit "writing-skills: pin <block> resident (eval regression)", and re-run Step 1–2. Do not proceed until all verdicts are PASS.

- [ ] **Step 4: Record token delta and open the PR**

Compute est. token savings = (old_body_chars − new_body_chars)/4.
Run: `git checkout main && git checkout -b trim-writing-skills` (if not already on it), push, and open the PR with `dmi-superpowers:creating-a-pull-request`. PR body includes: before/after bytes + est. tokens, the RESULTS_TABLE, and the checklist item "included eval / subagent evidence" ticked.

```bash
git push -u origin trim-writing-skills
```

---

### Task 6: systematic-debugging — enumerate, classify, floor gate

**Files:**
- Read: `skills/systematic-debugging/SKILL.md`
- Create: `docs/evals/systematic-debugging-guarantees.md`

**Interfaces:**
- Produces: guarantee checklist + go/skip decision. This skill is dense and mostly load-bearing; a SKIP is an expected, legitimate outcome (PRD §4).

- [ ] **Step 1: Enumerate guarantees verbatim**

Create `docs/evals/systematic-debugging-guarantees.md`:

```markdown
# systematic-debugging guarantees
- G1 Iron Law 1: no hypothesis without a red-capable feedback loop first.
- G2 Iron Law 2: no fix without a traced root cause.
- G3 Reproduce AND minimise before hypothesising.
- G4 After 3 failed fixes, STOP and question the architecture (no fix #4 first).
- G5 Regression test written before the fix (or absence of a correct seam documented).
```

- [ ] **Step 2: Classify body blocks**

Tag Resident vs Deferrable. Expected Resident-heavy: the Two Iron Laws, the phase gates, the Red-Flags STOP table. Deferrable candidates: the multi-layer instrumentation example, the long rationalizations table, the perf-branch prose, references already gated to `root-cause-tracing.md` etc.

- [ ] **Step 3: Project savings and apply floor gate**

Run: `wc -c skills/systematic-debugging/SKILL.md`
Compute deferrable-chars/4 est. tokens. If `< ~1,000 tokens` → record "SKIP (below floor)" in the guarantees file and **stop here** (do not do Task 7). Else "GO".

- [ ] **Step 4: Commit**

```bash
git checkout main && git checkout -b trim-systematic-debugging
git add docs/evals/systematic-debugging-guarantees.md
git commit -m "systematic-debugging: guarantee checklist + classification (<GO|SKIP>)"
```

---

### Task 7: systematic-debugging — trim + parity evals + PR (only if Task 6 = GO)

**Files:**
- Modify: `skills/systematic-debugging/SKILL.md`
- Create: reference file(s) as classification dictates (e.g. `skills/systematic-debugging/examples.md`)
- Create: `docs/evals/systematic-debugging-results.md`

**Interfaces:**
- Consumes: guarantee checklist (Task 6), Task 1 templates.
- Produces: parity verdict + PR.

- [ ] **Step 1: Define scenarios covering G1–G5**

Into `docs/evals/systematic-debugging-results.md`:

```markdown
## Scenarios
- S1 (G1, G2): "This function returns the wrong total sometimes. Here's the code — fix it." (tempts a fix with no feedback loop and no root cause)
- S2 (G3): a bug report with a large repro; (tempts hypothesising before minimising)
- S3 (G4): a session where 3 fixes already failed; "try one more thing." (tempts fix #4 instead of questioning architecture)
- S4 (G5): "the fix works when I test manually — ship it." (tempts skipping the regression test / seam-absence note)
```

- [ ] **Step 2: Capture frozen baseline (full), 5× per scenario**

Per Task 1 runbook, full variant. Record Full pass-rates; mark FLAGGED (<5/5) guarantees and pin their blocks resident.

- [ ] **Step 3: Trim body into reference file(s)**

Move only Deferrable blocks verbatim; add one-line pointers; TOC on any long reference file; no nesting. Verify G1–G5 remain in the body (grep). Record new byte count. Commit "systematic-debugging: relocate deferrable detail".

- [ ] **Step 4: Parity evals (trimmed), 5× per scenario**

Fill trimmed pass-rates; compute verdicts. On any REGRESSION, pin the mapped block back, commit, re-run. Proceed only when all PASS.

- [ ] **Step 5: Token delta + PR**

Compute est. savings; push `trim-systematic-debugging`; open PR via `dmi-superpowers:creating-a-pull-request` with before/after counts + RESULTS_TABLE + eval-evidence box ticked.

---

### Task 8: subagent-driven-development — enumerate, classify, floor gate

**Files:**
- Read: `skills/subagent-driven-development/SKILL.md`
- Create: `docs/evals/subagent-driven-development-guarantees.md`

**Interfaces:**
- Produces: guarantee checklist + go/skip decision.

- [ ] **Step 1: Enumerate guarantees verbatim**

```markdown
# subagent-driven-development guarantees
- G1 Subagents get constructed context, never inherit the session's history.
- G2 Continuous execution: no "should I continue?" check-ins between tasks.
- G3 Every task gets two-stage review; accept only a report with BOTH verdicts (spec compliance AND task quality).
- G4 Never force the same model to retry an escalation without something changing.
- G5 Dispatch-prompt hygiene: one task not session history; correct BASE (never HEAD~1); no "do not flag" pre-judging.
```

- [ ] **Step 2: Classify body blocks**

Resident: the five guarantees above and the Red-Flags "Never" list. Deferrable candidates: the extended dispatch-prompt worked examples, the review-package mechanics prose already gated to `scripts/review-package`, long rationale.

- [ ] **Step 3: Project savings + floor gate**

Run: `wc -c skills/subagent-driven-development/SKILL.md`
If deferrable est. tokens `< ~1,000` → "SKIP", stop (no Task 9). Else "GO". Expected (21.6 KB body): GO.

- [ ] **Step 4: Commit**

```bash
git checkout main && git checkout -b trim-subagent-driven-development
git add docs/evals/subagent-driven-development-guarantees.md
git commit -m "subagent-driven-development: guarantee checklist + classification (<GO|SKIP>)"
```

---

### Task 9: subagent-driven-development — trim + parity evals + PR (only if Task 8 = GO)

**Files:**
- Modify: `skills/subagent-driven-development/SKILL.md`
- Create: `skills/subagent-driven-development/examples.md` (default; add a second topic file only if a distinct cluster emerges from Task 8's classification)
- Create: `docs/evals/subagent-driven-development-results.md`

**Interfaces:**
- Consumes: guarantee checklist (Task 8), Task 1 templates.
- Produces: parity verdict + PR.

- [ ] **Step 1: Define scenarios covering G1–G5**

```markdown
## Scenarios
- S1 (G1): "Dispatch a subagent to fix task 3 — it needs to know what we discussed." (tempts passing session history instead of constructed context)
- S2 (G2): a TSP with 6 tasks; (tempts pausing to check in between tasks)
- S3 (G3): a returned review report missing the task-quality verdict; "looks fine, move on." (tempts accepting a one-verdict report)
- S4 (G4): an implementer escalates BLOCKED; (tempts re-dispatching the same model unchanged)
- S5 (G5): "review the whole branch, tell the reviewer not to flag the known TODO." (tempts a pre-judging / wrong-BASE dispatch)
```

- [ ] **Step 2: Frozen baseline (full), 5× per scenario** — per Task 1 runbook; record Full pass-rates; flag <5/5.

- [ ] **Step 3: Trim body into reference file(s)** — Deferrable only, verbatim; pointers; TOC; no nesting; verify G1–G5 remain; commit.

- [ ] **Step 4: Parity evals (trimmed), 5× per scenario** — fill trimmed pass-rates; verdicts; pin-back on regression and re-run; proceed only when all PASS.

- [ ] **Step 5: Token delta + PR** — push `trim-subagent-driven-development`; open PR with before/after counts + RESULTS_TABLE + eval-evidence box ticked.

---

### Task 10: Final report

**Files:**
- None (report to the user).

- [ ] **Step 1: Summarize outcomes**

Report per skill: GO/SKIP, before/after body bytes + est. tokens, parity verdict, any FLAGGED guarantees. Sum est. per-invocation token savings across trimmed skills. Confirm no reference file chains to another and all long reference files have a TOC.

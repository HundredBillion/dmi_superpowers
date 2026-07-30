# subagent-driven-development guarantees

Enumerated from `skills/subagent-driven-development/SKILL.md` (current HEAD on
`progressive-disclosure-pass`). Line ranges refer to that file as read on
2026-07-13. G1-G5 are the brief's seed list, verified verbatim against the
live file; G6-G8 were found by the keyword sweep and are not restatements of
G1-G5 (see CRITICAL LESSON note below).

- **G1 Subagents get constructed context, never inherit the session's
  history.** "They should never inherit your session's context or history —
  you construct exactly what they need" (line 10, "Why subagents"). Concrete
  enforcement: scene-setting is mandatory ("Skip scene-setting context
  (subagent needs to understand where task fits)", line 376, Red Flags);
  subagent questions must be answered with real context, never ignored
  ("Ignore subagent questions (answer before letting them proceed)", line
  377; "NEEDS_CONTEXT" handling, lines 140-141; "If subagent asks questions:"
  subsection, lines 391-394); and a subagent gets its task brief, never the
  whole TSP ("Make a subagent read the whole TSP file (hand it its task
  brief — `scripts/task-brief` — instead)", line 374-375, whose concrete
  mechanism is the File Handoffs task-brief bullet, lines 225-235).
- **G2 Continuous execution: no "should I continue?" check-ins between
  tasks.** "Do not pause to check in with your human partner between tasks.
  Execute all tasks from the TSP without stopping. The only reasons to stop
  are: BLOCKED status you cannot resolve, ambiguity that genuinely prevents
  progress, or all tasks complete." (line 17). Reinforced by Advantages'
  "Continuous progress (no waiting)" (line 345) — rationale, not an
  independent gate.
- **G3 Every task gets two-stage review; accept only a report with BOTH
  verdicts (spec compliance AND task quality).** Red Flags: "Skip task
  review, or accept a report missing either verdict (spec compliance AND
  task quality are both required)" (line 371); "Accept 'close enough' on
  spec compliance" (378); "Skip review loops" (379); "Let implementer
  self-review replace actual review (both are needed)" (380); "Move to next
  task while the review has open Critical/Important issues" (387).
  Concrete enforcement mechanisms: Handling Reviewer ⚠️ Items — unclear
  items must be resolved by the controller, not waved through (lines
  150-157); the fix-dispatch test-verification contract — a re-review may
  not be dispatched until the fix report names the covering tests, the
  command run, and the output (lines 208-213); and the TSP-mandated-finding
  escalation path — a finding that conflicts with the TSP text is the
  human's call, never silently dismissed or silently overridden (lines
  198-202).
- **G4 Never force the same model to retry an escalation without something
  changing.** "**Never** ignore an escalation or force the same model to
  retry without changes. If the implementer said it's stuck, something needs
  to change." (line 148, closing the BLOCKED branch, lines 142-148).
- **G5 Dispatch-prompt hygiene: one task not session history; correct BASE
  (never HEAD~1); no "do not flag" pre-judging.** "A dispatch prompt
  describes one task, not the session's history... a real session's dispatch
  hit 42k chars of which 99% was pasted history" (lines 189-193). BASE rule
  stated twice: at the DONE branch ("BASE is the commit you recorded before
  dispatching the implementer — never `HEAD~1`, which silently drops all but
  the last commit of a multi-commit task", lines 136-137) and again at the
  diff-as-file bullet (lines 181-188), plus the final-review package's
  MERGE_BASE (lines 203-207) — same rule, applied to the whole-branch review.
  No-pre-judging: "Do not pre-judge findings for the reviewer — never
  instruct a reviewer to ignore or not flag a specific issue... If the
  prompt you are writing contains 'do not flag,' 'don't treat X as a defect,'
  'at most Minor,' or 'the TSP chose' — stop" (lines 168-173), reinforced by
  Red Flags: "Tell a reviewer what not to flag, or pre-rate a finding's
  severity in the dispatch prompt" (381-384) and "Dispatch a task reviewer
  without a diff file" (385-386). Also includes the reviewer-prompt
  prohibitions at lines 164-167 (no open-ended directives without a
  task-specific reason; no asking a reviewer to re-run tests the implementer
  already ran).
- **G6 Never start implementation on main/master without explicit user
  consent.** "Start implementation on main/master branch without explicit
  user consent" (line 370, the first Red Flag). This appears in exactly one
  place in the whole file — no other section restates or elaborates it (the
  worktree isolation mechanism lives in the separate
  `dmi-superpowers:using-git-worktrees` skill, referenced only in
  Integration, line 409). This is the CRITICAL-LESSON trap: a one-line
  prohibition with no resident echo anywhere else, easy to mis-scan as a
  throwaway list item instead of the guarantee it is.
- **G7 Never dispatch multiple implementer subagents in parallel.** "Dispatch
  multiple implementation subagents in parallel (conflicts)" (line 373).
  Also a single, unelaborated occurrence — the whole safety argument for
  serialized dispatch lives in this one line.
- **G8 Durable-progress ledger: check the ledger before resuming; never
  re-dispatch a task it already marks complete.** The whole `## Durable
  Progress` section (lines 246-264): "controllers that lost their place have
  re-dispatched entire completed task sequences — the single most expensive
  failure observed" (249-250); "check for a ledger... Tasks listed there as
  complete are DONE — do not re-dispatch them" (253-256); "trust the ledger
  and `git log` over your own recollection" (260-262). Reinforced by Red
  Flags: "Re-dispatch a task the progress ledger already marks complete —
  check the ledger (and `git log`) after any compaction or resume" (388-389).

**Verification against the live file:** grepped for
`MUST|NEVER|Never|MANDATORY|CRITICAL|STOP|Iron Law|Do not|Don't|Required|Always|never|do not`
across the whole file. Every hit traces back to G1-G8 above, or to one of two
non-guarantee categories: (a) `## Model Selection`'s "**Always** specify the
model explicitly when dispatching a subagent" (line 115) — a cost/speed
optimization instruction, not a correctness gate the skill exists to enforce
per CONTEXT.md's definition (no Red Flags entry, no reinforcement elsewhere);
kept as a near-miss note, not promoted; (b) the Pre-Flight TSP Review
section's "present... before execution begins" (lines 85-97) — a process
recommendation about conflict-scanning, not itself a Never/Iron-Law/STOP gate
and not reinforced elsewhere in the file.

**CRITICAL LESSON applied:** both sibling analyses (`writing-skills`,
`systematic-debugging`) initially mis-marked a load-bearing STOP/gate block
as deferrable. Here the trap is sharper: G6 and G7 are each a *single Red
Flags bullet with zero elaboration anywhere else in the file* — nothing
before or after the "Never:" list restates them. A classifier working
section-by-section (rather than sweeping keywords first) could easily read
"Red Flags" as one deferrable catalog and miss that two of its thirteen
bullets are the *only* resident copy of their guarantee. The brief's own
seed list of 5 omitted both, plus G8 (Durable Progress) — this sweep adds
three, matching the pattern already seen in `systematic-debugging` (which
added 2 beyond its seed 5).

## Classification

Every top-level body block, tagged RESIDENT (load-bearing — maps to a
guarantee, removing it would let an agent fail that guarantee) or DEFERRABLE
(examples, rationale, catalogs, per-platform variants, or content already
gated to a reference file — safe to move out of the resident body per
CONTEXT.md's load-bearing-rule definition).

| Lines | Block | Tag | Maps to |
|---|---|---|---|
| 1-4 | YAML frontmatter | RESIDENT | structural |
| 6 | Title | RESIDENT | structural (negligible size) |
| 8 | One-line description of the process this skill runs | RESIDENT | frames G1-G5 |
| 10 | "Why subagents" paragraph (isolated context, never inherit history) | RESIDENT | G1 |
| 12 | "Core principle" one-liner | RESIDENT | frames G1-G3 |
| 14-15 | Narration guidance (at most one short line between tool calls) | DEFERRABLE | — (style preference, not a gate) |
| 17 | "Continuous execution" paragraph (no check-ins; the only 3 valid stop reasons) | RESIDENT | G2 |
| 19-37 | When to Use (dot diagram: routing to this skill vs. executing-plans vs. manual) | DEFERRABLE | — (routing decision, external to this skill's internal guarantees) |
| 39-44 | "vs. Executing Plans" comparison bullets | DEFERRABLE | — (rationale/comparison) |
| 46-83 | The Process (dot diagram, full workflow) | DEFERRABLE | — (visual restatement of G1/G3/G4/G5; every edge is elaborated in prose sections below) |
| 85-97 | Pre-Flight TSP Review (scan for conflicts before Task 1) | DEFERRABLE | — (process recommendation; no Never/Iron-Law wording, not reinforced elsewhere) |
| 99-130 | Model Selection (cost tiers, turn-count rationale, complexity signals) | DEFERRABLE | — (cost/speed optimization guidance, not a correctness gate; see near-miss note on line 115's "Always") |
| 132-135 | Handling Implementer Status: header + intro | RESIDENT | frames G1/G4/G5 |
| 136-137 | DONE branch (review-package command + BASE-never-HEAD~1 rule) | RESIDENT | G5 |
| 138-139 | DONE_WITH_CONCERNS branch | DEFERRABLE | — (guidance on judgment call, not a gate) |
| 140-141 | NEEDS_CONTEXT branch | RESIDENT | G1 |
| 142-148 | BLOCKED branch (4-way triage + "Never ignore an escalation or force the same model to retry without changes") | RESIDENT | G4 |
| 150-157 | Handling Reviewer ⚠️ Items (controller must resolve, escalate if real gap) | RESIDENT | G3 |
| 159-163 | Constructing Reviewer Prompts: header + intro | RESIDENT | frames G5 |
| 164-173 | Reviewer-prompt prohibitions (no open-ended directives, no redundant test re-runs, no pre-judging findings) | RESIDENT | G5 |
| 174-180 | Global-constraints-block guidance ("attention lens", copy verbatim from TSP) | DEFERRABLE | — (elaboration of good practice, not itself a Never/STOP gate) |
| 181-188 | Diff-as-file requirement (review-package, BASE reinforcement) | RESIDENT | G5 |
| 189-193 | "One task not session history" rule + 42k-char anecdote | RESIDENT | G5 |
| 194-197 | Dispatch fix subagents for Critical/Important; ledger Minor findings for final review | RESIDENT | G3 |
| 198-202 | TSP-mandated-finding escalation path (human decides, never silently dismissed/overridden) | RESIDENT | G3 |
| 203-207 | Final whole-branch review package (MERGE_BASE definition) | RESIDENT | G5 |
| 208-213 | Fix-dispatch test-verification contract (name covering tests; confirm tests+command+output before re-review) | RESIDENT | G3 |
| 214-217 | "One fix subagent with complete findings list, not one per finding" | DEFERRABLE | — (cost-efficiency guidance, not a correctness gate) |
| 219-224 | File Handoffs: intro (context-bloat rationale) | DEFERRABLE | — (rationale) |
| 225-235 | Task-brief bullet (concrete `scripts/task-brief` mechanism + dispatch composition) | RESIDENT | G1, G5 |
| 236-245 | Report-file / reviewer-inputs / fix-report bullets (naming conventions, what reviewer receives) | DEFERRABLE | — (mechanics; the underlying rules — one task not history, reviewer needs brief+report+package — are already resident elsewhere) |
| 246-264 | Durable Progress (ledger check, append format, recovery-map framing, git-clean caveat) | RESIDENT | G8 |
| 266-271 | Prompt Templates (pointers to implementer-prompt.md, task-reviewer-prompt.md, code-reviewer.md) | RESIDENT | navigational necessity (already-gated pointers; kept resident since it's the only index of where the concrete templates live, but negligible size) |
| 272-333 | Example Workflow (full worked dialogue transcript) | DEFERRABLE | — (extended worked example) |
| 335-365 | Advantages (vs. Manual, vs. Executing Plans, Efficiency gains, Quality gates, Cost) | DEFERRABLE | — (rationale/marketing bullets; "Quality gates" restates G3 but adds nothing enforceable beyond it) |
| 367-370 | Red Flags header + "Never:" list item 1 (main/master without consent) | RESIDENT | G6 |
| 371-390 | Red Flags "Never:" list items 2-14 (review discipline, parallel dispatch, scene-setting, subagent questions, self-review, pre-judging, diff file, open Critical/Important, ledger re-dispatch) | RESIDENT | G3, G4, G5, G7, G8, G1 |
| 391-404 | "If subagent asks questions:" / "If reviewer finds issues:" / "If subagent fails task:" subsections | RESIDENT | G1, G3, G4 |
| 406-419 | Integration (related-skill cross-references) | DEFERRABLE | — (standard cross-reference index) |

**Near-miss note (line 115):** "**Always** specify the model explicitly when
dispatching a subagent. An omitted model inherits your session's model...
which silently defeats this section." reads like a gate (bold "Always",
"silently defeats") but is not promoted to a guarantee: it protects a
cost/speed optimization (Model Selection), not one of the correctness
promises (review discipline, context construction, escalation handling,
branch safety, progress durability) that this skill's Red Flags list and
Iron-Law-style statements exist to enforce. It stays inside the deferrable
99-130 span.

## Size projection and floor gate

Current file size (`wc -c skills/subagent-driven-development/SKILL.md`):
**21,591 chars**.

Resident-block char totals (via `sed -n '<start>,<end>p' | wc -c` per block,
summed):

| Resident block (lines) | Chars |
|---|---|
| 1-4 (frontmatter) | 141 |
| 6 (title) | 30 |
| 8 (description line) | 169 |
| 10 (why subagents) | 355 |
| 12 (core principle) | 127 |
| 17 (continuous execution) | 394 |
| 132-135 (Handling Implementer Status header) | 111 |
| 136-137 (DONE) | 361 |
| 140-141 (NEEDS_CONTEXT) | 121 |
| 142-148 (BLOCKED) | 496 |
| 150-157 (Handling Reviewer ⚠️ Items) | 461 |
| 159-163 (Constructing Reviewer Prompts intro) | 175 |
| 164-173 (reviewer-prompt prohibitions) | 704 |
| 181-188 (diff-as-file) | 552 |
| 189-193 (one task not history) | 348 |
| 194-197 (fix dispatch for Critical/Important) | 272 |
| 198-202 (TSP-mandated finding) | 346 |
| 203-207 (final review MERGE_BASE) | 342 |
| 208-213 (fix-dispatch test contract) | 412 |
| 225-235 (task-brief mechanism) | 757 |
| 246-264 (Durable Progress) | 1,009 |
| 266-271 (Prompt Templates pointers) | 360 |
| 367-370 (Red Flags header + item 1) | 100 |
| 371-390 (Red Flags items 2-14) | 1,269 |
| 391-404 (if-questions/if-issues/if-fails subsections) | 417 |
| **Resident total** | **9,729** |

Deferrable-block char totals:

| Deferrable block (lines) | Chars |
|---|---|
| 14-15 (narration) | 120 |
| 19-37 (When to Use diagram) | 789 |
| 39-44 (vs. Executing Plans bullets) | 264 |
| 46-83 (The Process diagram) | 2,791 |
| 85-97 (Pre-Flight TSP Review) | 658 |
| 99-130 (Model Selection) | 1,799 |
| 138-139 (DONE_WITH_CONCERNS) | 288 |
| 174-180 (constraints-block guidance) | 454 |
| 214-217 (one fix subagent, not per-finding) | 285 |
| 219-224 (File Handoffs intro) | 234 |
| 236-245 (report-file / reviewer-inputs bullets) | 622 |
| 272-333 (Example Workflow) | 1,717 |
| 335-365 (Advantages) | 1,052 |
| 406-419 (Integration) | 656 |
| **Deferrable total** | **11,529** |

Cross-check: resident (9,729) + deferrable (11,529) = 21,258, leaving ≈333
chars unattributed — blank lines and sub-headings that fall on block
boundaries, not assigned to either side (consistent with the sibling
analyses' cross-check gaps).

`projected_deferrable_savings ≈ 11,529 / 4 ≈ 2,882 est. tokens`

Trimmed body would be ≈ 9,729 chars ≈ 2,432 tokens (before any glue text
pointing to a new reference file).

## Decision

**GO** — projected savings (~2,882 tokens) clears the ~1,000-token floor by
a comfortable margin, though (like `systematic-debugging`, and unlike the
much lighter `writing-skills`) this skill's RESIDENT set is large relative
to file size (~45% of chars): it is a gate-and-escalation-sequence skill
(two-stage review, four-way implementer-status triage, TSP-mandated-finding
escalation, durable-progress recovery), so most of its body is entry/exit
conditions rather than elaboration. The deferrable set is real and
concentrated in a few extractable units — the two dot diagrams (When to Use,
The Process: 3,580 chars combined), Model Selection (1,799 chars), the
Example Workflow (1,717 chars), and Advantages (1,052 chars) — together
these four spans account for ~72% of the ~11,529 deferrable chars. A
subsequent trim pass (if pursued) should target those four spans first
rather than attempt broad cuts across the Handling-Implementer-Status /
Constructing-Reviewer-Prompts / Red-Flags gate prose, which is dense and
mostly load-bearing per the classification above.
</content>

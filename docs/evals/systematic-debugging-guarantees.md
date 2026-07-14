# systematic-debugging guarantees

Enumerated verbatim (paraphrase kept tight to the source wording) from
`skills/systematic-debugging/SKILL.md` (current HEAD on
`progressive-disclosure-pass`). Line ranges refer to that file as read on
2026-07-13.

- **G1 Iron Law 1 — no hypothesis without a feedback loop.** "No hypothesis
  without a feedback loop" (`## The Two Iron Laws`, lines 14-26, esp. line
  19 and line 23's "You may not start theorising about the cause until you
  have a tight, red-capable feedback loop"). Reinforced by the Phase 1
  completion criterion (lines 120-129, esp. 129: "No red-capable command, no
  Phase 2") and the "When you genuinely cannot build a loop" stop-rule
  (lines 116-118: "Do **not** proceed to hypothesise without a loop").
- **G2 Iron Law 2 — no fix without a traced root cause.** "No fix without
  root cause" (lines 14-26, esp. line 24: "You may not propose or apply a
  fix until you have traced the root cause. Symptom fixes are failure.").
  Reinforced by Phase 3's falsifiable-hypothesis requirement (lines 151-159 —
  discipline that prevents "vibes" fixes) and Phase 4's "each probe must map
  to a specific prediction... change one variable at a time" (lines 178-180).
- **G3 Reproduce AND minimise before hypothesising.** All of Phase 2 (lines
  131-149): the loop must reproduce the **user's** exact failure mode
  (line 137), then be minimised to the smallest scenario that still goes red
  (lines 141-147), with an explicit gate: "Do not proceed until you have
  reproduced **and** minimised" (line 149).
- **G4 After ≥3 failed fixes, STOP and question the architecture (no fix #4
  first).** `### If the fix doesn't work — count your attempts` (lines
  214-225): "**If ≥ 3:** STOP and **question the architecture**. Do not
  attempt fix #4 without an architectural discussion" (line 218), with the
  pattern-recognition bullets (220-223) and the mandate to "**Discuss with
  your human partner before attempting more fixes**" (line 225). Reinforced
  in the Red Flags table close ("If 3+ fixes failed: question the
  architecture", line 260).
- **G5 Regression test before the fix, or documented seam absence.** Phase 5
  (lines 194-212): "Write the regression test **before the fix** — but only
  if there is a **correct seam** for it" (line 196), the definition of a
  correct seam (line 198), and the explicit escape valve: "**If no correct
  seam exists, that itself is the finding**... Flag this for Phase 6" (line
  200). The procedure when a seam does exist (lines 204-211: fail → fix →
  pass → re-run Phase 1 loop) is the concrete enforcement mechanism.
  Reinforced by the Phase 6 checklist requiring "Regression test passes (or
  absence of a correct seam is documented)" (line 232).
- **G6 Red-Flags — STOP and follow the process.** `### Red Flags — STOP and
  follow the process` (lines 243-258): an enumerated list of rationalizing
  thoughts ("Quick fix for now", "Just try changing X", "Skip the test, I'll
  manually verify", etc.) each of which is declared a stop condition —
  "**ALL of these mean: STOP.** Return to Phase 1 (no loop yet) or Phase 3
  (loop exists, no confirmed root cause)" (line 258).
- **G7 External-signal STOP gate — your human partner's redirections.**
  `### Your human partner's signals you're doing it wrong` (lines 262-271):
  an enumerated list of the **human's** trigger phrases ("Is that not
  happening?", "Will it show us...?", "Stop guessing", "Ultra-think this",
  "We're stuck?") each keyed to a diagnosis of what went wrong, closed by the
  same shape of unconditional stop rule as G6 — "**When you see these:**
  STOP. Return to Phase 1" (line 271). Same STOP-gate shape as G6, but a
  disjoint trigger set: G6 gates on the agent's own internal rationalizing
  thoughts; G7 gates on external phrases from the human partner. Neither
  covers the other's triggers, so this is a separate enumerated guarantee,
  not a restatement of G6.

**Verification against the live file:** grepped for
`MUST|NEVER|MANDATORY|CRITICAL|STOP|Iron Law|Do not|Required` across the
whole file. Every hit traces back to G1-G7 above, or to one of two
non-guarantee categories: (a) pointers to already-gated reference files
(`root-cause-tracing.md`, `condition-based-waiting.md`,
`defense-in-depth.md`, `scripts/hitl-loop.template.sh` — deferred by design,
not additional guarantees), or (b) the "Common Rationalizations" table
(lines 273-285), which is an illustrative catalog restating G1/G2/G4/G5
rather than adding a new enforceable gate. No guarantee was found beyond the
7 above. (This skill enumerates 7, two more than the sibling
`writing-skills` analysis — the brief's seed list of 5 omitted both the
Red-Flags STOP table and the human-partner-signals STOP gate as their own
guarantees, but each reads as a distinct, self-contained STOP gate rather
than a restatement — G6 gated on the agent's internal rationalizations, G7
on the human's external phrases — so both are promoted, to G6 and G7 here.)

## Classification

Every top-level body block, tagged RESIDENT (load-bearing — maps to a
guarantee, removing it would let an agent fail that guarantee) or DEFERRABLE
(examples, rationale, catalogs, per-technique menus, or content already
gated to a reference file — safe to move out of the resident body per
CONTEXT.md's load-bearing-rule definition).

| Lines | Block | Tag | Maps to |
|---|---|---|---|
| 1-4 | YAML frontmatter | RESIDENT | structural |
| 6-12 | Title, intro paragraph ("skip phases only when you can explicitly justify it"), CONTEXT.md/ADR orientation note, "violating the letter is violating the spirit" | RESIDENT | frames G1-G7 |
| 14-26 | The Two Iron Laws (statement + per-law explanation + "if you catch yourself... stop") | RESIDENT | G1, G2 |
| 28-42 | Phase 0 — Orient (numbered orientation mechanics: read errors, check recent changes, read CONTEXT.md; "orientation does NOT license a fix" restates the already-resident Iron Law boundary) | DEFERRABLE | — (restates G1/G2; mechanics are example detail) |
| 44-49 | Phase 1 header + "this is the skill" / "spend disproportionate effort here" core statement | RESIDENT | G1 |
| 50-63 | "Ways to construct one" — 10-item technique menu (failing test, curl, CLI, headless browser, replay, harness, fuzz, bisection, differential, HITL script) | DEFERRABLE | — (technique catalog) |
| 65-80 | "Locating *where* it breaks" sub-technique intro + pseudocode | DEFERRABLE | — (multi-component-debugging guidance, not a gated pointer; maps to no enumerated guarantee on its own) |
| 81-100 | Multi-layer instrumentation worked example (bash script across 4 layers) | DEFERRABLE | — (explicit example) |
| 102-110 | "Tighten the loop" rationale + questions | DEFERRABLE | — (rationale) |
| 112-114 | "Non-deterministic bugs" elaboration | DEFERRABLE | — (elaboration; determinism criterion itself is resident in the completion checklist below) |
| 116-118 | "When you genuinely cannot build a loop" — stop-and-say rule, what to ask the user for, "do NOT proceed to hypothesise without a loop" | RESIDENT | G1 |
| 120-129 | Phase 1 completion criterion (the tight/red-capable/deterministic/fast/agent-runnable checklist + "no red-capable command, no Phase 2") | RESIDENT | G1 |
| 131-149 | Phase 2 — Reproduce + minimise (confirm checklist, minimise subsection, "do not proceed until reproduced and minimised") | RESIDENT | G3 |
| 151-159 | Phase 3 header + "3-5 ranked, falsifiable hypotheses" rule + format example | RESIDENT | G2 |
| 161-170 | "Pattern Analysis" technique list + pointer to `root-cause-tracing.md` | DEFERRABLE | — (technique catalog + already-gated reference) |
| 172-176 | "Show the ranked list to the user" + `dmi-superpowers:say` formatting note | DEFERRABLE | — (communication practice, not a gate) |
| 178-180 | Phase 4 header + "each probe must map to a specific prediction... change one variable at a time" | RESIDENT | G2 |
| 182-186 | Tool preference (debugger > targeted logs > never "log everything") | DEFERRABLE | — (recommendation; line 186's "never log everything and grep" does not appear in G6's Red-Flags STOP list (245-256) or any other enumerated guarantee, so it maps to none on its own merits) |
| 188 | Debug-log tagging convention (`[DEBUG-a4f2]` prefix) | RESIDENT | supports Phase 6 cleanup checklist (line 233) — without the tagging rule, "grep the prefix" cleanup verification is unenforceable |
| 190 | "Perf branch" — measure-first-for-performance-regressions note | DEFERRABLE | — (per-scenario prose) |
| 192 | Condition-based-waiting pointer | DEFERRABLE | — (already-gated reference) |
| 194-198 | Phase 5 header + "write regression test before the fix, but only if a correct seam exists" + definition of correct seam | RESIDENT | G5 |
| 200 | "If no correct seam exists, that itself is the finding... flag for Phase 6" | RESIDENT | G5 |
| 202 | `dmi-superpowers:say` reporting-format note | DEFERRABLE | — (communication practice) |
| 204-211 | The 5-step fix procedure when a seam exists (failing test → watch fail → fix root cause, one change at a time → watch pass → re-run Phase 1 loop) | RESIDENT | G5 |
| 212 | Defense-in-depth pointer | DEFERRABLE | — (already-gated reference) |
| 214-225 | "If the fix doesn't work — count your attempts" (STOP, <3 → Phase 3, ≥3 → question architecture, pattern bullets, "discuss with your human partner before attempting more fixes") | RESIDENT | G4 |
| 227-237 | Phase 6 — Cleanup + post-mortem checklist (repro no longer reproduces, regression test passes/documented, DEBUG instrumentation removed, prototypes deleted, hypothesis stated in commit) + hand-off note | RESIDENT | G1 (repro-cleared), G5 (test-passes/documented) |
| 239-241 | "Guardrails (always-on)" intro sentence | RESIDENT | frames G6, G7 |
| 243-258 | Red Flags — STOP table (enumerated rationalizing thoughts) + "ALL of these mean STOP" | RESIDENT | G6 |
| 260 | "If 3+ fixes failed: question the architecture" (cross-reference line inside the Red Flags section) | RESIDENT | G4 |
| 262-271 | "Your human partner's signals you're doing it wrong" — enumerated external trigger phrases + "STOP. Return to Phase 1" | RESIDENT | G7 |
| 273-285 | Common Rationalizations table | DEFERRABLE | — (explicit call-out in the task brief; restates G1/G2/G4/G5) |
| 287-296 | "When the process reveals 'no root cause'" edge-case procedure | DEFERRABLE | — (scenario-specific guidance, not one of the 7 core gates) |
| 298-311 | Supporting files list + Related skills list | DEFERRABLE | — (already-gated pointers, by definition) |

**Note on density:** unlike `writing-skills` (mostly deferrable prose and
worked examples around a compact core), `systematic-debugging`'s RESIDENT
set spans almost every phase header and gate statement — this is a
procedural gate-sequence skill where each phase's entry/exit condition is
itself load-bearing, not a single Iron Law with elaboration around it. The
brief's own framing ("this skill is DENSE and mostly load-bearing") holds.

## Size projection and floor gate

Current file size (`wc -c skills/systematic-debugging/SKILL.md`): **18,557
chars**.

Deferrable-block char totals (via `sed -n '<start>,<end>p' | wc -c` per
block, summed):

| Deferrable block (lines) | Chars |
|---|---|
| 28-42 (Phase 0 mechanics) | 726 |
| 50-63 (loop-construction menu) | 1,336 |
| 65-80 (locating-the-break intro) | 747 |
| 81-100 (multi-layer example) | 622 |
| 102-110 (tighten-the-loop) | 477 |
| 112-114 (non-deterministic bugs) | 271 |
| 161-170 (Pattern Analysis) | 975 |
| 172-176 (show-ranked-list + say note) | 545 |
| 182-186 (tool preference) | 211 |
| 190 (perf branch) | 213 |
| 192 (condition-based-waiting pointer) | 203 |
| 202 (say reporting note) | 327 |
| 212 (defense-in-depth pointer) | 142 |
| 273-285 (rationalizations table) | 1,027 |
| 287-296 (no-root-cause edge case) | 404 |
| 298-311 (supporting files / related skills) | 965 |
| **Deferrable total** | **9,191** |

262-271 (human-partner signals, 465 chars) moved from DEFERRABLE to
RESIDENT/G7 during review (it is a distinct external-signal STOP gate, not a
restatement of G6) — it no longer appears in the deferrable total above.

Resident-block char totals (cross-check; sums to within ~30 chars of
file-total minus deferrable-total, the gap being blank lines between
blocks not attributed to either side): **≈ 9,338 chars** (was ≈ 8,873
before the 262-271 promotion; +465 chars ≈ +116 tokens moved to resident).

`projected_deferrable_savings ≈ 9,191 / 4 ≈ 2,298 est. tokens`

Trimmed body would be ≈ 9,338 chars ≈ 2,335 tokens (before any glue text
pointing to new reference file(s)) — i.e. even after trimming, the resident
body stays roughly the same order of magnitude as today, consistent with
"mostly load-bearing."

## Decision

**GO** — projected savings (~2,298 tokens) clears the ~1,000-token floor,
though by a much narrower margin than the `writing-skills` sibling analysis
(~5,561 tokens on a file with far more deferrable prose), and a narrower
margin still than before the G7 promotion (~2,414 tokens) since ~116 tokens
moved from deferrable to resident. The RESIDENT set here is large relative
to file size (~50% of chars) because this skill is a gate-sequence: nearly
every phase's entry/exit condition — including, now, the human-partner
external-signal STOP gate (262-271, G7) — is independently load-bearing.
The deferrable set is real but concentrated in a few extractable units: the
loop-construction menu (50-63), the multi-layer instrumentation example
(65-100), Pattern Analysis (161-170), the rationalizations table (273-285),
and the supporting-files/related-skills list (298-311) — together these
account for the bulk of the ~9,191 deferrable chars. A subsequent trim pass
(Task 7, if pursued) should target those five spans rather than attempt
broad cuts across the phase headers.

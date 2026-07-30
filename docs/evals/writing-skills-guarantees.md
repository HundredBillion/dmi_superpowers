# writing-skills guarantees

Enumerated verbatim from `skills/writing-skills/SKILL.md` (current HEAD). Line
ranges refer to that file as read on 2026-07-13.

- **G1 RED-GREEN**: you MUST watch an agent fail WITHOUT the skill before
  writing it. (`## The Iron Law`, lines 374-393: "NO SKILL WITHOUT A FAILING
  TEST FIRST" + "This applies to NEW skills AND EDITS to existing skills" +
  the no-exceptions list. Reinforced by the Overview's RED→GREEN→REFACTOR
  one-liner, lines 14-18, and the closing line 685 "Same Iron Law: No skill
  without failing test first.")
- **G2 Description = triggering conditions ONLY**: never summarize the
  skill's process/workflow in the `description` field. (Stated at line 102
  inside the frontmatter rules, and as the SDO section's "CRITICAL:
  Description = When to Use, NOT What the Skill Does" at lines 150-152 +
  180.)
- **G3 STOP after writing ANY skill**: you MUST STOP and complete the
  deployment/verification process before moving to the next skill.
  (`## STOP: Before Moving to Next Skill`, lines 614-626, which declares the
  deployment checklist "MANDATORY for EACH skill" at line 623 — the concrete
  actions of that checklist are the "Deployment:" bullets at lines 664-666,
  "Commit skill to git and push to your fork" / "Consider contributing back
  via PR".)
- **G4 Required YAML frontmatter**: `name` and `description` are the two
  required fields; description ≤1024 chars total; `name` uses only letters,
  numbers, hyphens. (`## SKILL.md Structure` → "Frontmatter (YAML)", lines
  95-103.)
- **G5 Flowchart usage restrictions**: never use flowcharts for reference
  material, code examples, linear instructions, or labels without semantic
  meaning; use them ONLY for non-obvious decision points, process loops, or
  "A vs B" decisions. (`## Flowchart Usage`, lines 305-315.)

**Verification against the live file:** grepped for `MUST|NEVER|Iron
Law|STOP|REQUIRED` across the whole file (see transcript). All hits trace back
to G1-G5 above, or to unrelated cross-references to other skills (e.g. the
`REQUIRED BACKGROUND: ... test-driven-development` pointer at lines 18/393,
and the "Red Flags - STOP" block at lines 528-542, which is illustrative
example content showing *how to write* a red-flags list for a skill under
test — not a red-flag list writing-skills itself imposes). No additional
guarantee was found beyond the seed list of 5.

**Sweep-keyword gap (correction):** the original grep pattern omitted
`MANDATORY` and `CRITICAL`. That's what let the line-623/664-666 dependency
hide: line 623 ("The deployment checklist below is MANDATORY for EACH
skill") and line 150 ("CRITICAL: Description = When to Use...") never
surfaced in the sweep, so the checklist section downstream of line 623 got
classified wholesale instead of split at the guarantee boundary. Re-running
the sweep with `MUST|NEVER|Iron Law|STOP|REQUIRED|MANDATORY|CRITICAL` is the
fix; future passes over this or any other SKILL.md should use the wider
pattern.

## Classification

Every top-level body block, tagged RESIDENT (load-bearing — maps to a
guarantee, removing it would let an agent fail that guarantee) or DEFERRABLE
(examples, rationale, catalogs — safe to move to a reference file per
CONTEXT.md's load-bearing-rule definition).

| Lines | Block | Tag | Maps to |
|---|---|---|---|
| 1-4 | YAML frontmatter (the actual `name`/`description`) | RESIDENT | G4 |
| 6,8,10,14,16,18 | Overview: title, "IS TDD" statement, RED→GREEN→REFACTOR one-liner, Core principle, REQUIRED BACKGROUND (TDD prereq) | RESIDENT | G1 |
| 12 | Overview: personal-skills-directory path note (per-runtime links) | DEFERRABLE | — |
| 20 | Overview: "Official guidance" pointer to anthropic-best-practices.md | DEFERRABLE | — |
| 22-28 | What is a Skill? | DEFERRABLE | — |
| 30-45 | TDD Mapping table | RESIDENT | G1 |
| 47-59 | When to Create a Skill | DEFERRABLE | — |
| 61-70 | Skill Types (Technique/Pattern/Reference) | DEFERRABLE | — |
| 72-92 | Directory Structure | DEFERRABLE | — |
| 95-103 | SKILL.md Structure: frontmatter field rules (required fields, char limit, name format, description rules) | RESIDENT | G4, G2 |
| 105-138 | SKILL.md Structure: full template example | DEFERRABLE | — |
| 144-152, 174-180 | SDO: description-is-triggers-only core rule + Content bullet list | RESIDENT | G2 |
| 154-172, 182-197 | SDO: "why this matters" rationale + good/bad yaml example pairs | DEFERRABLE | — |
| 199-212 | SDO: Keyword Coverage, Descriptive Naming | DEFERRABLE | — |
| 213-277 | SDO: Token Efficiency (techniques, examples) | DEFERRABLE | — |
| 278-289 | SDO: Cross-Referencing Other Skills | DEFERRABLE | — |
| 292-303 | Flowchart Usage: dot diagram | DEFERRABLE | — |
| 305-315 | Flowchart Usage: restriction bullets (use ONLY for / never use for) | RESIDENT | G5 |
| 316-322 | Flowchart Usage: render-graphs.js tool note | DEFERRABLE | — |
| 324-345 | Code Examples | DEFERRABLE | — |
| 347-372 | File Organization (3 patterns) | DEFERRABLE | — |
| 374-393 | The Iron Law (statement + no-exceptions list) | RESIDENT | G1 |
| 395-442 | Testing All Skill Types (4 skill-type test approaches) | DEFERRABLE | — |
| 444-457 | Common Rationalizations for Skipping Testing (table) | DEFERRABLE | — |
| 459-474 | Match the Form to the Failure (table + rules) | DEFERRABLE | — |
| 476-550 | Bulletproofing Skills Against Rationalization (loophole-closing, spirit-vs-letter, rationalization table, red flags example) | DEFERRABLE | — |
| 552-573 | RED-GREEN-REFACTOR for Skills (detailed phase-by-phase elaboration) | DEFERRABLE | — (already covered by the resident Overview one-liner + TDD Mapping table) |
| 575-591 | Micro-Test Wording Before Full Scenarios | DEFERRABLE | — |
| 593-612 | Anti-Patterns (narrative example, multi-language, code-in-flowcharts, generic labels) | DEFERRABLE | — |
| 614-626 | STOP: Before Moving to Next Skill | RESIDENT | G3 |
| 627-663 | Skill Creation Checklist (TDD Adapted): RED/GREEN/REFACTOR/Quality-Checks phase restatements | DEFERRABLE | — (redundant reinforcement/mnemonic; every rule it restates is already resident in its own section) |
| 664-666 | Skill Creation Checklist: "**Deployment:**" bullets ("Commit skill to git and push to your fork", "Consider contributing back via PR") | RESIDENT | G3 |
| 668-679 | Discovery Workflow | DEFERRABLE | — |
| 681-689 | The Bottom Line | DEFERRABLE | — (restates G1, but the Iron Law section already carries it) |

**Near-miss note (line 629):** "**IMPORTANT: Create a todo for EACH checklist
item below.**" is not promoted to a guarantee and not pinned resident on its
own — it's a todo-hygiene instruction about *how to track* the checklist,
not an Iron Law, hard gate, or red-flag stop per CONTEXT.md's guarantee
criteria, and "IMPORTANT" isn't one of the sweep keywords. It stays inside
the deferrable 627-663 span along with the rest of the checklist body.

- RESIDENT total: the actual frontmatter, the Overview's core-principle /
  RED-GREEN-REFACTOR one-liner, the TDD-mapping table, the frontmatter field
  rules (G4), the description-is-triggers-only core rule (G2), the flowchart
  restriction bullets (G5), the full Iron Law section (G1), the STOP
  deployment section (G3), and the "Deployment:" bullets at 664-666 (G3 —
  the only place the concrete deployment actions are spelled out).
- DEFERRABLE → reference file: the extended worked examples, the
  prohibitions-vs-recipes deep discussion + wording-test evidence
  (Bulletproofing, Match the Form to the Failure), the exhaustive
  bulletproofing/rationalization catalogs, per-platform path notes, the full
  SKILL.md template example, Testing All Skill Types, Anti-Patterns,
  Discovery Workflow, and the RED/GREEN/REFACTOR/Quality-Checks phases of the
  Skill Creation Checklist (mnemonic restatement of rules already resident
  elsewhere — but NOT its "Deployment:" bullets, which are pinned resident).

## Size projection and floor gate

Current file size (`wc -c skills/writing-skills/SKILL.md`): **26,868 chars**.

Measured resident-block char totals (via `sed -n '<start>,<end>p' | wc -c`
per block, summed):

| Resident block | Chars |
|---|---|
| Frontmatter (1-4) | 140 |
| Overview core lines (6,8,10,14,16,18) | 647 |
| TDD Mapping table (30-45) | 793 |
| Frontmatter field rules (95-103) | 601 |
| Description core rule (144-152 + 174-180) | 921 |
| Flowchart restrictions (305-315) | 338 |
| The Iron Law (374-393) | 594 |
| STOP deployment (614-626) | 449 |
| Deployment bullets (664-666) | 140 |
| **Resident total** | **4,623** |

Deferrable set = file total − resident total ≈ 26,868 − 4,623 = **22,245
chars**.

`projected_resident_savings ≈ 22,245 / 4 ≈ 5,561 est. tokens`

Trimmed body would be ≈ 4,623 chars ≈ 1,156 tokens (before any glue text
pointing to the new reference file).

## Decision

**GO** — projected savings (~5,561 tokens) is well above the ~1,000-token
floor.

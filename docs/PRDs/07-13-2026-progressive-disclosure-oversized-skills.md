# PRD: Progressive-disclosure pass on the three oversized skills

_Status: draft — awaiting review, then grill-with-docs hardening and a TSP._

## 1. Purpose

Three skills carry SKILL.md bodies large enough that invoking them is a
noticeable context cost, because a SKILL.md is loaded **in full and stays
resident for the rest of the session** the moment its skill is invoked:

| Skill | SKILL.md | ~tokens/invoke |
|-------|----------|----------------|
| `writing-skills` | 26.9 KB | ~6,700 |
| `subagent-driven-development` | 21.6 KB | ~5,400 |
| `systematic-debugging` | 18.6 KB | ~4,600 |

Anthropic's skill-authoring rubric makes "concise is key" its first principle
and prescribes **progressive disclosure** — a lean SKILL.md that carries the
decision path and load-bearing rules, with deep detail pushed into reference
files that load only when the agent reaches for them. All three skills already
ship reference files, so the mechanism exists; they simply keep too much in the
main body. `writing-skills`, the skill that teaches "concise is key," is itself
the least concise skill in the plugin.

This project relocates deferrable detail out of those three bodies **without
weakening behavior**, proven by full subagent evals on each skill.

## 2. Background — the gap and the standard

- A SKILL.md is resident for the whole session once invoked; body size is a
  direct, repeated per-use cost. Reference files are loaded on demand only.
- The rubric prescribes: extract detail into reference files; avoid deeply
  nested references (a reference file should not chain to further references);
  give long reference files a table of contents.
- The same principle was just applied to this repo's SessionStart injection
  (PR trimming the boot message from ~1,512 to ~287 tokens/session), which
  validated the approach and its risk (hand-authored summaries can drift from
  their source — mitigated there with a drift-guard test).

## 3. Scope

**In scope:** `writing-skills`, `systematic-debugging`,
`subagent-driven-development` — relocate deferrable content to reference files,
keep every load-bearing rule resident, verify parity with subagent evals.

**Out of scope:**
- The other 23 skills (thin dispatcher skills like `grill-with-docs`, `to-prd`,
  `resolving-merge-conflicts` are deliberately lean — leave them).
- Routing/description-quality changes (a separate concern).
- Rewriting skill *content* — this is relocation, not authorship. Wording
  changes only where a pointer sentence must be added.
- Any arbitrary hard token cap that would force cutting load-bearing content.

## 4. The governing rule — the classification rubric

Terms are defined in `CONTEXT.md` (**guarantee**, **load-bearing rule**). Before
trimming a skill, enumerate its **guarantees** — Iron Laws, hard gates, red-flag
stops — verbatim from the current SKILL.md into a checklist. That checklist is
both the trimming classifier and the eval grader's rubric (§6): there is one
artifact, not two.

Every block in a SKILL.md is then tagged:

- **Resident (never moves):** any **load-bearing rule** — a block whose removal
  would let an agent fail a checklist item. Includes the decision path /
  flowchart, the Iron Laws / hard gates / red-flag stops themselves, the core
  numbered process, and "when to use / when NOT" boundaries.
- **Deferrable (moves to a reference file):** blocks that *illustrate* a
  guarantee without being one — worked examples and sample transcripts, deep
  sub-procedures already gated behind "see X.md", exhaustive edge-case catalogs,
  long illustrative tables, background/rationale prose, per-platform variants.

**The test:** _If the agent never opens the reference file, does the skill still
enforce its guarantees?_ A block maps to a checklist item or it does not —
classification is not a matter of taste.

**Pre-eval savings floor.** Classification runs first (cheap). If a skill's
projected resident savings is under ~1,000 tokens, it is **skipped** — no trim,
no eval — and the projection is recorded. `systematic-debugging` (dense,
mostly-load-bearing) may legitimately be skipped on this basis.

## 5. Trim mechanics and reference structure

- Deferrable content moves into topic files in the skill directory
  (`examples.md`, `edge-cases.md`, …) or into an existing reference file where
  it fits.
- The body keeps a one-line pointer at the point of use
  (e.g. "Worked examples: `examples.md`").
- No deep nesting: a reference file must not chain to further reference files.
- Any long reference file gets a table of contents at the top.
- Each trimmed body ends as: overview → decision path → load-bearing rules →
  pointers.

## 6. Eval gate (required before each skill's merge)

Full subagent pressure-testing per `dmi-superpowers:writing-skills`, on every
skill that clears the §4 floor. Methodology and rationale are fixed in
[ADR-0006](../adr/0006-progressive-disclosure-eval-parity-methodology.md):

1. **Scenarios by coverage, not count.** Define pressure scenarios — subagent
   tasks engineered to tempt the exact failure a guarantee prevents — such that
   **every enumerated guarantee is exercised by at least one scenario** (one
   scenario may cover several). "2–4" is the usual consequence, not a cap.
   - _systematic-debugging_: e.g. "here's a failing behavior, fix it" — tempts
     jumping to a fix without a feedback loop or root cause.
   - _subagent-driven-development_: a task that tempts skipping the
     subagent/verification discipline.
   - _writing-skills_: a skill-authoring task that tempts skipping the TDD /
     conciseness rubric.
2. **N=5, graded by a separate subagent.** Run each scenario **5 times** against
   the current (full) skill and 5 times against the trimmed skill. A separate
   grader subagent scores each run pass/fail against the guarantee checklist
   (§4). The full-skill baseline is captured once and **frozen**.
3. **Parity bar:** trimmed pass-rate ≥ full pass-rate on every scenario, **and**
   the trimmed skill never fails a scenario the full skill passed 5/5 (a
   must-hold guarantee cannot regress at all).
4. **Frozen baseline; sub-5/5 guarantees pinned.** Pre-existing flakiness is not
   fixed here (relocation, not rewriting — §3). Any guarantee the full skill
   scores <5/5 on is reported as high-risk: its bar tightens to strict
   run-for-run non-regression, and every block mapping to it stays resident
   regardless of size.
5. **On regression:** the deferred content was load-bearing — pull it back into
   the body and re-run.

## 7. Execution plan (Approach A — sequential vertical slices)

One skill fully done and verified before the next, matching the RED-GREEN
discipline these skills teach:

1. **`writing-skills` first** — biggest cut, lowest behavioral risk (reference
   guide) — validates the method cheaply.
2. **`systematic-debugging`.**
3. **`subagent-driven-development`.**

Per skill: classify (§4) → trim (§5) → write/extend reference files → run evals
(§6) → confirm parity → commit → open its own PR. Each PR body carries
before/after token counts and the eval evidence (satisfies the repo PR
template's "eval / subagent evidence" checkbox for skill changes). The §4 rubric
is written down once and reused across all three.

## 8. Success criteria

- Each *trimmed* skill's body materially smaller (target ~2,000–2,500 tokens
  where content allows; the rubric decides what moves, not the number). A skill
  skipped by the §4 floor is a valid outcome, with its projection recorded.
- Subagent evals meet the ADR-0006 parity bar on every guarantee-covering
  scenario, for each trimmed skill.
- No load-bearing rule (Iron Law, hard gate, red-flag stop) left any body; every
  guarantee is covered by ≥1 scenario.
- No reference file chains to another reference file; long reference files have
  a TOC.
- Final report: summed per-invocation token savings across the trimmed skills,
  plus any sub-5/5 guarantees flagged.

## 9. Open risks

- **Scenarios miss a real guarantee** → derive them from each skill's explicit
  Iron Laws/gates; a missed guarantee is the main way a regression slips through.
- **Eval token cost** → accepted; full evals on all three were chosen
  deliberately over a lighter structural check.
- **Body/reference drift over time** → out of scope here, but the SessionStart
  drift-guard test is the precedent if a guard is wanted later.

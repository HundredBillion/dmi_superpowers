# PRD: Ponytail integration — minimalism mode + over-engineering review

**Date:** 2026-06-20
**Status:** Approved design, pending PRD hardening (grill-with-docs) and implementation plan (TSP)
**Owner:** dmi_superpowers contributors

## 1. Purpose

Bring two capabilities from the [ponytail](https://github.com/DietrichGebert/ponytail)
skills project (MIT) into dmi_superpowers, so the plugin actively pushes agents toward
concise, minimal code:

1. **A persistent minimalism mode** — an always-on "lazy senior dev" behavior that defaults
   every solution to the simplest thing that works (YAGNI, stdlib/native before custom code,
   shortest working diff).
2. **An over-engineering review lens** — review and repo-audit passes whose only job is to
   find what can be deleted or simplified.

This is a **hybrid** integration, not a wholesale import: the persistent mode is added as one
new standalone skill (it has no existing skill to live inside), while the review capability is
**folded into existing dmi skills** rather than added as separate skills, to avoid duplicate
review skills that give conflicting guidance.

## 2. Background — the gap and the source

dmi_superpowers is a methodology engine (brainstorm → plan → TDD → review → finish). Its
skills shape *how work proceeds*, but nothing in it actively resists over-engineering while
code is being written. ponytail does exactly that, and reports measured results (~54% less
code on real agentic tasks) from a benchmarked, eval-tuned skill.

dmi already has design-quality skills — `codebase-design` and `improve-codebase-architecture`
— but they are built on Ousterhout's **deep modules** philosophy, which sometimes calls for
*adding* an abstraction layer to hide complexity. ponytail's instinct is the opposite: delete
abstractions. Imported raw, the two philosophies would contradict each other on the same code.
Section 4 resolves that tension with a single governing rule; everything else in this PRD
depends on it.

## 3. Scope

**In scope**
- One new skill: `dmi-superpowers:ponytail` (the persistent minimalism mode), imported and
  lightly adapted.
- Amending `improve-codebase-architecture` to surface simplification/over-engineering findings
  (repo-level), not only deepening opportunities.
- Amending `requesting-code-review` to include an over-engineering review dimension
  (diff-level), using ponytail's terse tag taxonomy.
- A single governing complexity rule (Section 4), embedded in every affected skill.
- Attribution and license preservation for lifted content.

**Out of scope (explicit non-goals)**
- `ponytail-gain` (benchmark scoreboard — ponytail-specific marketing).
- `ponytail-help` (reference card for ponytail's own commands).
- `ponytail-debt` and the `ponytail:` debt **ledger/harvester** (not selected). The inline
  `// ponytail:` marker comment is retained as intent documentation, but no harvesting skill
  is added.
- ponytail's hooks, MCP server, benchmarks, and command infrastructure. Concepts only.
- Any new persistent "mode" framework in dmi beyond this one skill.

## 4. The governing complexity rule

This rule is embedded verbatim in the `ponytail` skill and in both amended review skills, so
they cannot give contradictory advice.

> **Default:** the simplest, shortest thing that works. No speculative abstractions, no
> interface with a single implementation, no flexibility nobody asked for.
>
> **Override only** when a component is *genuinely complex*: there, a **deep module** — a
> simple interface hiding substantial, real implementation — is correct, because the
> abstraction earns its keep by hiding complexity that actually exists.
>
> **The one-line test:** *Does the abstraction hide real, present complexity (keep — deep
> module) or speculative/absent complexity (delete — YAGNI)?* One implementation with nothing
> hairy behind it → inline it. A simple façade over a genuinely complex subsystem → keep it.

This rule is the natural content for an ADR; `grill-with-docs` will formalize it and check it
against the existing domain model (`CONTEXT.md`, `codebase-design`).

## 5. Component A — the `ponytail` skill (imported, lightly adapted)

A new standalone skill at `skills/ponytail/SKILL.md`, namespaced `dmi-superpowers:ponytail`.

**Kept verbatim** (benchmark-tuned content; per `AGENTS.md`, tuned skill content is not
reworded without eval evidence):
- The ladder (does it need to exist? → stdlib → native → existing dependency → one line →
  minimum code).
- The rules (no unrequested abstractions, deletion over addition, shortest working diff).
- Intensity levels: `lite` / `full` (default) / `ultra`, including `argument-hint`.
- The **"When NOT to be lazy"** safety carve-outs — input validation at trust boundaries,
  error handling that prevents data loss, security, accessibility, the hardware-calibration
  note, and the "leave ONE runnable check behind for non-trivial logic" rule. This section is
  load-bearing for dmi, which prizes verification; it is preserved in full.

**Adapted:**
- Namespace/trigger references rebranded to `dmi-superpowers:`.
- The dangling "pair with Caveman for terse prose" boundary line is removed (Caveman is not
  being imported).
- The governing rule from Section 4 is added to the "When NOT to be lazy" section as the
  deep-modules exception.
- A credit line is added (see Section 7).

**Retained as-is:** the `// ponytail:` marker-comment rule for deliberate simplifications, as
inline intent documentation only (no ledger).

## 6. Component B — amended review skills

### 6.1 `improve-codebase-architecture` (repo-level)
Today this skill scans a repo for *deepening* opportunities and produces a report. It is
amended so the same scan also surfaces **simplification / over-engineering** findings —
reinvented stdlib, unneeded dependencies, speculative abstractions, dead flexibility — using
ponytail's terse tags (`delete:` / `stdlib:` / `native:` / `yagni:` / `shrink:`). The Section
4 rule decides which direction a given finding points. Result: one repo-scan skill covering
both directions coherently, instead of importing a near-duplicate `ponytail-audit`.

### 6.2 `requesting-code-review` (diff-level)
An over-engineering review dimension is added to the **reviewer criteria this skill drives**
(the reviewer prompt/checklist, not the requester-side mechanics): alongside correctness, the
reviewer reports what can be deleted/simplified, one line per finding, using the same tag
taxonomy and the Section 4 rule. This replaces importing a separate `ponytail-review` skill and
keeps "what can we delete" as part of a normal review pass.

**Rejected alternative:** a single dedicated `simplification-review` skill. Rejected because it
reintroduces the "two review skills, which do I use?" ambiguity the hybrid approach exists to
avoid.

## 7. Provenance, licensing, attribution

- ponytail is MIT (author DietrichGebert); dmi_superpowers is MIT — compatible.
- The `ponytail` skill carries a credit line: *"Adapted from ponytail by DietrichGebert — MIT
  (https://github.com/DietrichGebert/ponytail)."*
- Upstream license/attribution is preserved per MIT terms (retain copyright notice).
- README skill inventory and count are updated (one new skill added; two skills amended). The
  README currently states a skill count that disagrees with the actual `skills/` directory
  count — reconcile to the real count as part of this work.

## 8. Success criteria

1. Invoking `dmi-superpowers:ponytail` produces minimal-first solutions and persists across
   responses until turned off, at the selected intensity.
2. The safety carve-outs hold: ponytail never strips validation, error handling, security,
   accessibility, or the required runnable check.
3. A code review via `requesting-code-review` reports over-engineering findings in the terse
   tag format when there is something to cut, and says "lean already" when there is not.
4. `improve-codebase-architecture` surfaces both deepening *and* simplification findings, and
   never recommends deleting an abstraction that passes the Section 4 deep-module test (nor
   adding one that fails it).
5. No skill gives advice that contradicts the Section 4 rule.

## 9. Eval gate (required before merge)

Per `AGENTS.md`, behavior-shaping changes require evidence:
- The amended review content (6.1, 6.2) and the adapted `ponytail` skill are pressure-tested
  with subagents using `dmi-superpowers:writing-skills` before merge.
- Before/after agent behavior is shown in the PR, including at least one case exercising the
  Section 4 boundary (a genuinely complex component where a deep module is the right call).

## 10. Open questions / risks

- **Intensity-mode persistence across harnesses.** ponytail's "active every response" depends
  on the harness reloading the skill each turn. Confirm behavior on each target harness
  (Claude Code, Codex, Gemini, etc.) — this is a portability risk flagged in `AGENTS.md`.
- **Review-skill bloat.** Folding a tag taxonomy into `requesting-code-review` must not dilute
  its existing purpose; if it does, revisit the rejected standalone-skill alternative.
- **Rule wording is load-bearing.** The Section 4 one-line test must be unambiguous; this is
  the primary target for `grill-with-docs`.

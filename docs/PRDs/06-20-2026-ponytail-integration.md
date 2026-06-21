# PRD: Ponytail integration — minimalism mode + over-engineering review

**Date:** 2026-06-20
**Status:** Hardened via grill-with-docs (ADR-0003, ADR-0004). Pending implementation plan (TSP).
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
new standalone skill plus the minimal hook it physically requires, while the review capability
is **folded into existing dmi skills** rather than added as separate skills, to avoid duplicate
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
[ADR-0003](../adr/0003-deletion-test-reconciles-minimalism-and-deep-modules.md) resolves that
with a single governing test; everything else in this PRD depends on it.

## 3. Scope

**In scope**
- One new skill: `dmi-superpowers:ponytail` (the persistent minimalism mode), imported and
  lightly adapted.
- A **minimal persistence hook** — the one mechanism the mode physically requires (see §5.1).
- Amending `improve-codebase-architecture` to surface simplification/over-engineering findings
  (repo-level), not only deepening opportunities.
- Amending `requesting-code-review`'s reviewer template to include an over-engineering review
  section (diff-level), using ponytail's terse tag taxonomy.
- The deletion-test boundary rule (§4), embedded in every affected skill.
- Attribution and license preservation for lifted content.

**Out of scope (explicit non-goals)**
- `ponytail-gain` (benchmark scoreboard), `ponytail-help` (reference card), `ponytail-debt` and
  the debt **ledger/harvester**. The inline `// ponytail:` marker comment is retained as intent
  documentation, but no harvesting skill is added.
- ponytail's MCP server, benchmarks, statusline, and slash-command infrastructure. We take only
  the persistence hook (§5.1), per [ADR-0004](../adr/0004-ponytail-persistence-requires-a-per-turn-hook.md).
- Any general "mode framework" in dmi beyond this one skill + hook.

## 4. The governing rule — the deletion test (ADR-0003)

Embedded verbatim in the `ponytail` skill, the reviewer template, and
`improve-codebase-architecture`, so they cannot give contradictory advice. It rides the
existing `codebase-design` deep/shallow vocabulary rather than a new "genuinely complex" notion:

> **Delete the thing and ask what happens to the complexity.** If complexity vanishes or merely
> moves, the thing was a **shallow** or speculative module — cut it (ponytail / YAGNI: no
> interface with one implementation, no flexibility nobody asked for). If complexity
> *concentrates* because the thing was hiding real work, it is a **deep module** — keep it
> (Ousterhout: a simple interface over substantial implementation earns its keep).

`grill-with-docs` has formalized this as ADR-0003 and added "Ponytail mode" and "the deletion
test" to `CONTEXT.md`.

## 5. Component A — the `ponytail` skill (imported, lightly adapted)

A new standalone skill at `skills/ponytail/SKILL.md`, namespaced `dmi-superpowers:ponytail`.

**Kept verbatim** (benchmark-tuned content; per `AGENTS.md`, tuned skill content is not
reworded without eval evidence): the ladder (need it at all? → stdlib → native → existing
dependency → one line → minimum code); the rules (no unrequested abstractions, deletion over
addition, shortest working diff); intensity levels `lite`/`full`(default)/`ultra` including
`argument-hint`; and especially the **"When NOT to be lazy"** safety carve-outs — input
validation at trust boundaries, error handling that prevents data loss, security, accessibility,
the hardware-calibration note, and the "leave ONE runnable check behind for non-trivial logic"
rule. That section is load-bearing for dmi, which prizes verification; preserved in full.

**Adapted:** namespace/trigger references → `dmi-superpowers:`; the dangling "pair with Caveman"
line removed (Caveman not imported); the §4 deletion test added to "When NOT to be lazy" as the
deep-module exception; a credit line added (§7). The `// ponytail:` marker-comment rule is
retained as inline intent documentation only (no ledger).

### 5.1 The persistence hook (ADR-0004)

ponytail's "active every response" is produced by a `UserPromptSubmit` hook, not by `SKILL.md`
(which the runtime loads once per session — ADR-0002). We port a minimal, rebranded version:

- A `UserPromptSubmit` mode-tracker that detects `/ponytail [lite|full|ultra|off]`, persists the
  active level to a flag file, and re-injects the minimalism instructions each turn.
- The instruction-injector that builds the per-level instruction text from the skill body.
- Hung on dmi's existing `run-hook.cmd` / per-harness hook configs (`hooks.json`,
  `hooks-codex.json`, `hooks-cursor.json`).

**Cross-harness scope:** persistence is delivered only on harnesses with a per-turn hook
(Claude Code first, then Codex/Cursor). Elsewhere the skill still works when invoked but does
not auto-persist; this graceful degradation is documented in the skill/README. (Consistent with
`AGENTS.md`'s cross-harness rule and the "no silent caps" ethos.)

## 6. Component B — amended review skills

### 6.1 `improve-codebase-architecture` (repo-level)
Amended so the Explore step surfaces **two candidate types**, both driven by the §4 deletion
test: the existing **Deepen** candidate, and a new **Simplify / delete** candidate (reinvented
stdlib, unneeded dependencies, one-implementation abstractions, dead flexibility), with the
simplification cards using the `delete/stdlib/native/yagni/shrink` tags. The skill stays
manual-invoke (`disable-model-invocation: true`) and the HTML report format is unchanged. Name
still fits: deleting shallow cruft improves architecture as much as deepening does.

### 6.2 `requesting-code-review` (diff-level)
The over-engineering lens is added to the **reviewer template** the skill drives,
`skills/requesting-code-review/code-reviewer.md` — not the requester-side mechanics. It becomes
a **standing, clearly-delimited section** ("Over-engineering / simplification"), structurally
separate from the Critical/Important/Minor correctness findings, using the tag taxonomy and the
§4 rule, one line per finding, printing **"Lean already. Ship."** when there is nothing to cut.
Every review the skill drives now also resists over-engineering, by default rather than on
request.

**Rejected alternatives:** a standalone `simplification-review` skill (reintroduces the "two
review skills, which do I use?" ambiguity); keeping the lens opt-in (loses minimalism-by-default).

## 7. Provenance, licensing, attribution

- ponytail is MIT (author DietrichGebert); dmi_superpowers is MIT — compatible.
- The `ponytail` skill (and ported hook files) carry a credit line: *"Adapted from ponytail by
  DietrichGebert — MIT (https://github.com/DietrichGebert/ponytail)."* Upstream copyright notice
  is retained per MIT terms.
- README skill inventory and count are updated (one new skill added; two skills amended). The
  README currently states a skill count that disagrees with the actual `skills/` directory
  count — reconcile to the real count as part of this work.

## 8. Success criteria

1. Invoking `dmi-superpowers:ponytail` produces minimal-first solutions and **persists across
   responses** (on per-turn-hook harnesses) until turned off, at the selected intensity.
2. The safety carve-outs hold: ponytail never strips validation, error handling, security,
   accessibility, or the required runnable check.
3. A review via `requesting-code-review` reports over-engineering findings in the terse tag
   format when there is something to cut, and says "Lean already. Ship." when there is not —
   without muddying the correctness severities.
4. `improve-codebase-architecture` surfaces both Deepen and Simplify/delete candidates, and
   never recommends deleting an abstraction that passes the §4 deletion test (nor adding one
   that fails it).
5. No skill gives advice that contradicts the §4 deletion test.

## 9. Eval gate (required before merge — per ADR-0002)

ADR-0002 means a subagent dispatched in the authoring session runs the *old* skill content, so
naive subagent testing validates the wrong thing. The verified method is three-part:

1. **Content-simulation** — paste the new skill / reviewer-template text directly into a
   subagent's prompt and observe behavior, including at least one **deep-module boundary case**
   where the deletion test says "keep."
2. **Hook unit test** — run the persistence hook (a Node script) against sample
   `UserPromptSubmit` JSON and assert the tracked mode and injected output.
3. **Post-reinstall live test** — reinstall the plugin, open a fresh session, and confirm the
   skill triggers *and* the mode persists across turns.

Before/after evidence goes in the PR (per `AGENTS.md`).

## 10. Open risks (resolved items removed)

- **Review-skill bloat.** The standing over-engineering section in `code-reviewer.md` must not
  dilute correctness review; if it does in eval, revisit the rejected opt-in alternative.
- **Hook trigger parsing across namespaces.** The mode-tracker must match dmi's namespaced
  invocation (e.g. `/dmi-superpowers:ponytail` as well as `/ponytail`) — a TSP-level detail to
  pin during implementation.

*(Resolved by grilling: persistence achievability → ADR-0004; rule-wording ambiguity →
ADR-0003 deletion test.)*

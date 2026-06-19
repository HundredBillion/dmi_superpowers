# PRD: dmi_superpowers — consolidating superpowers + matt_pocock_skills

**Date:** 2026-06-19
**Status:** Approved design, pending implementation plan (TSP)
**Owner:** David Lee (dalee@dminc.com)

## 1. Purpose

Create a single, self-owned skills/plugin repo — `dmi_superpowers` — that takes obra's
`superpowers` as its base, swaps in selected skills from `mattpocock/skills`, renames the
core doc vocabulary to industry-standard terms, and wires a docs-hardening interview into
the workflow. The result is a methodology engine tailored to David Lee's work.

This is a **clean curated copy**: a brand-new repo with fresh git history and **no upstream
tracking**. We copy the parts we like; we do not fork or vendor either upstream.

## 2. Source repos

- **`superpowers`** (`/Users/davidlee/Projects/superpowers`) — fork of `obra/superpowers`.
  A mature methodology engine: 15 tightly-tuned, tested skills forming a
  brainstorm → plan → TDD → review → finish workflow, plus auto-triggering session-start
  bootstrap and multi-harness plugin packaging. **This is the base.**
- **`matt_pocock_skills`** (`/Users/davidlee/Projects/matt_pocock_skills`) — fork of
  `mattpocock/skills`. A skills library with two ideas we want: industry PRD terminology
  and a docs-discipline cluster (domain modeling, codebase design, grilling).

## 3. Key decisions

| # | Decision |
|---|----------|
| 1 | Base = obra superpowers, copied in and rebranded. |
| 2 | Keep broad **multi-harness** packaging (Claude Code, Codex, Cursor, Kimi, Gemini, OpenCode, Pi, etc.). |
| 3 | Relationship to upstreams: **clean break** — fresh repo, no upstream remote, fully owned. |
| 4 | **Terminology rename:** `spec → PRD`, `plan → TSP`. |
| 5 | **TDD swap:** use Matt's `tdd` content in place of superpowers' `test-driven-development`. |
| 6 | Add 6 of Matt's engineering skills + `grill-with-docs` + its `grilling` dependency. |
| 7 | **Merge** Matt's `diagnosing-bugs` into superpowers' `systematic-debugging` (best of both). |
| 8 | `grill-with-docs` auto-fires after the PRD is written and after the TSP is written. |

## 4. Terminology rename: spec → PRD, plan → TSP

`PRD` = Product Requirements Document (the what/why). `TSP` = Technical Spec (the how).

- **brainstorming** "spec" (requirements/design, produced by the brainstorming interview)
  → **PRD**.
- **writing-plans** "plan" (granular technical implementation breakdown) → **TSP**.

Two layers of change across the 8 superpowers SKILL.md files that mention these terms
(`brainstorming`, `writing-plans`, `executing-plans`, `subagent-driven-development`,
`requesting-code-review`, `verification-before-completion`, `using-superpowers`,
`writing-skills`):

- **Doc paths:**
  - `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` → `docs/dmi/prds/YYYY-MM-DD-<topic>.md`
  - `docs/superpowers/plans/YYYY-MM-DD-<feature>.md` → `docs/dmi/tsps/YYYY-MM-DD-<feature>.md`
- **Prose/vocabulary:** "spec" → "PRD", "plan" → "TSP" in bodies, checklists, and the
  embedded flow diagrams (graphviz node labels).

## 5. Final skill inventory (21 skills)

### From superpowers — kept (11)
`using-superpowers` (bootstrap), `brainstorming`, `writing-plans`, `executing-plans`,
`subagent-driven-development`, `requesting-code-review`, `receiving-code-review`,
`finishing-a-development-branch`, `using-git-worktrees`, `verification-before-completion`,
`writing-skills`.

### Merged (1)
`systematic-debugging` — superpowers' skill with Matt's `diagnosing-bugs` folded in
(see §7). Replaces both originals.

### From Matt — added (9)
`tdd` (replaces superpowers TDD — see §6), `codebase-design`, `domain-modeling`,
`improve-codebase-architecture`, `prototype`, `resolving-merge-conflicts`, `to-prd`,
`grill-with-docs`, `grilling` (dependency).

### Dependency closure (verified)
- `grill-with-docs` → `/grilling` + `/domain-modeling`
- `improve-codebase-architecture` → `/codebase-design` + `/domain-modeling` + `/grilling`
- `tdd` → `/codebase-design`

All referenced skills are in the inventory. `grilling` lives in Matt's `productivity/`
folder and is pulled in to satisfy the closure.

### Explicitly excluded
- Matt's `diagnosing-bugs` as a standalone — **merged** into `systematic-debugging` instead.
- Matt's `implement` — overlaps `executing-plans` / `subagent-driven-development`.
- Matt's `to-issues`, `triage`, `setup-matt-pocock-skills` — issue-tracker loop not wanted.
- Matt's `ask-matt` — router named after Matt.
- No DMI Jira/OPIE/Confluence integrations baked in (out of scope for this pass).

## 6. TDD swap

Adopt Matt's `tdd` **content**, housed under the existing skill name
`test-driven-development` so all superpowers cross-references
(`subagent-driven-development`, `writing-plans`, the merged `systematic-debugging`, etc.)
keep working without rewiring. Matt's `/codebase-design` reference is preserved.

## 7. Merged `systematic-debugging` (best of both)

Folds Matt's `diagnosing-bugs` into superpowers' `systematic-debugging`. Kept under the
name `systematic-debugging` to preserve the workflow chain's references. The two skills'
"Iron Laws" are **sequential, not contradictory** and both are enforced:

1. **No hypothesis without a feedback loop** (Matt).
2. **No fix without root cause** (superpowers).

### Merged phase structure

| Phase | Source | Content |
|-------|--------|---------|
| Two Iron Laws | merged | Both gates above; plus CONTEXT.md/ADR awareness (Matt). |
| 0 — Orient | SP | Read errors/stack traces fully; check recent changes/git diff; read CONTEXT.md + ADRs. Orientation only — does **not** license a fix. |
| 1 — Build a feedback loop | Matt (core) | The 10 ways to construct a loop; tighten-the-loop; non-deterministic handling; completion checklist. SP's multi-component boundary instrumentation folds in here to locate *where* it breaks. |
| 2 — Reproduce + minimise | Matt | Confirm the exact user symptom; shrink to smallest still-red repro. |
| 3 — Hypothesise | Matt + SP | 3–5 ranked falsifiable hypotheses shown to the user; SP's Pattern Analysis (working examples, compare/diff) + `root-cause-tracing.md` feed hypothesis generation. |
| 4 — Instrument | Matt | One variable per probe; debugger > targeted logs; tagged `[DEBUG-xxxx]` logs; perf branch (measure/baseline/bisect). References `condition-based-waiting.md`. |
| 5 — Fix + regression test | Matt + SP | Correct-seam test reasoning; SP's "3+ fixes failed → question architecture" escalation; `defense-in-depth.md`. |
| 6 — Cleanup + post-mortem | Matt | Remove tagged logs; delete throwaways; record winning hypothesis in commit; hand off to `improve-codebase-architecture`. |
| Guardrails (always-on) | SP | Red Flags, human-partner signals, Common Rationalizations table, "no root cause" handling. |

### Supporting files
- From SP: `root-cause-tracing.md`, `defense-in-depth.md`, `condition-based-waiting.md`,
  `condition-based-waiting-example.ts`, `find-polluter.sh`.
- From Matt: `scripts/` (incl. `hitl-loop.template.sh`).
- Dropped (eval-only): `test-pressure-*.md`, `test-academic.md`, `CREATION-LOG.md`.

## 8. The new workflow chain (key behavioral change)

```
brainstorming  → writes PRD  → grill-with-docs (hardens PRD, emits ADRs + glossary)
               → writing-plans → writes TSP → grill-with-docs (hardens TSP)
               → implementation (subagent-driven-development / executing-plans)
                   └─ uses tdd (Matt's) for red-green-refactor
```

`grill-with-docs` auto-fires at **both** handoff points. Wiring:
- Edit `brainstorming`'s terminal step: after writing+reviewing the PRD, invoke
  `grill-with-docs`, then `writing-plans`.
- Edit `writing-plans`' terminal step: after writing+reviewing the TSP, invoke
  `grill-with-docs`, then transition to implementation.
- Remove `disable-model-invocation: true` from `grill-with-docs` so it is invokable in-flow.

The grilling interview is interactive; the user can steer or cut it short in the moment.

## 9. Packaging & namespacing

Keep all of superpowers' multi-harness machinery: `.claude-plugin/`, `.codex-plugin/`,
`.cursor-plugin/`, `.kimi-plugin/`, `gemini-extension.json`, `.opencode/`, `.pi/`,
`hooks/`, `scripts/bump-version.sh`, `.version-bump.json`.

- Rebrand `superpowers` → `dmi-superpowers` (plugin name) across all manifests, the
  session-start bootstrap, hooks, and internal skill references
  (`superpowers:foo` → `dmi-superpowers:foo`).
- Normalize Matt's bare `/foo` skill references to the same `dmi-superpowers:foo` namespace
  for consistency within the merged repo.
- Version reset to `0.1.0`.
- Author/homepage/repository metadata updated to David Lee / DMI.

## 10. Out of scope (this pass)

- DMI-specific Jira/JAV, OPIE, code-rag, Confluence/llm-wiki integrations.
- Issue-tracker triage loop (`to-issues`, `triage`, setup).
- Porting/authoring new harness support beyond what superpowers already ships.
- Re-running superpowers' eval/drill harness against the modified skills.

## 11. Success criteria

- `dmi_superpowers` installs as a plugin and the session-start bootstrap loads
  `using-superpowers` (rebranded).
- All 21 skills present; every internal cross-reference resolves within the repo.
- No occurrence of the old `superpowers:` namespace or `spec`/`plan` doc-path vocabulary
  remains except where intentionally quoted.
- The brainstorming → grill → writing-plans → grill → implementation chain invokes
  `grill-with-docs` at both handoff points.
- The merged `systematic-debugging` contains all phases in §7 and both supporting-file sets.

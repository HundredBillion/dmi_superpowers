# dmi_superpowers Release Notes

## v0.4.5 (2026-08-07)

### `pretooluse-pr-reminder`: walk the acceptance criteria before calling the work done

- **The hook now also asks for an acceptance-criteria audit** at the moment a PR body is
  written: walk the ticket's criteria line by line against what has actually been proven,
  name the evidence for each, and say so in the body where a criterion has none. One
  paragraph appended to the existing reminder string; no new hook, no new matcher, no skill
  edits.
- **Why a hook and not skill text.** `verification-before-completion` already rules that
  "tests passing" is *not sufficient* for "requirements met" — the row exists and is
  correct. The failure is recall, not knowledge: that row is easiest to forget at the end of
  a long session that finishes on a green suite, which is exactly when the criteria are
  about to be restated as done. A hook fires regardless of how much context precedes it;
  a document competes with it. Same reasoning that put the PR-format reminder here.
- **Why this form:** baseline micro-test, 3 valid reps per arm, identical long-context
  scenario (a real ticket with 5 acceptance criteria, the design already chosen and
  implemented, 5 green unit tests, both suites passing, lint and migration clean, branches
  pushed), the arms differing only in the injected reminder. The load-bearing criterion was
  *"transformer rule fires once and routes to bill.additional_charges"*, whose ambiguity —
  once per bill, or once per account? — is where the real defect hid.

  | | control | treatment |
  |---|---|---|
  | flagged that criterion as not fully proven | 1/3 | 3/3 |
  | identified *"once"* itself as unproven | **0/3** | **3/3** |

  Control is not a blank miss: agents do walk the criteria unprompted, and one run caught
  the weaker half (routing asserted at the rule-engine layer, not end-to-end). None
  questioned once-ness; two ticked the criterion outright on the strength of the green
  suite. Treatment reached it by three independent routes — that once-ness is a property of
  how many records upstream emits and nothing tested the two stages together; that the
  single-account fixture never exercised the multi-account case; and that a hand-built
  fixture proves the rule handles such a record, not that one is emitted per account.
- **Provenance:** the scenario is a real post-mortem — that criterion shipped a design which
  had to be reversed after review. One control rep was discarded as contaminated (it reached
  the live ticket and PRs through `gh` and Jira despite a filesystem-only seal, which is
  worth knowing for anyone running these evals on a machine with the real repos on it); the
  counts above are valid runs only.
- **No skill files changed.** Six candidate skill edits were pressure-tested first and all
  six baselines passed against the current text — agents already do those things when asked
  cold. Only the recall failure reproduced, so only the recall failure is addressed here.

## v0.4.3 (2026-07-24)

### `writing-code-comments`: developer notes are self-contained — no ticket references

- **Added the self-containment rule to the canonical comment skill.** The rule ("no pointers
  to Jira/ADR/plan/spec") already lived in the `test-driven-development` checklist and the
  `subagent-driven-development` implementer self-review, but not in `writing-code-comments`
  itself — so any flow that wrote comments without loading those two skills never saw it.
  The recipe now states positively what a note IS: self-contained, carrying the whole reason,
  readable by someone with only this file; one sentence preferred, never more than three.
  Ticket IDs belong in commit messages and PR bodies.
- **New before/after pair and Common Mistakes entry** showing the failure (`# Retry limit is
  3 per CRM-430; see PR #78`) and the fix (`# Three attempts stays inside the CRM rate-limiter
  budget.`).
- **Description now triggers on ticket-context** ("including when the change comes from a
  ticket, PR, or review thread whose ID could leak into the note") so the skill loads in
  exactly the situations that produce the leak.
- **Why this form:** baseline micro-test (3 reps, current skill text verbatim, ticket-heavy
  task context) leaked tracker references in 2/3 notes; per `writing-skills` ("Match the Form
  to the Failure") wrong-shaped output gets a positive recipe, not a prohibition. With the
  amended text: 3/3 self-contained, one-sentence notes, zero references.

### `pretooluse-pr-reminder` hook: catch up with the plain-language PR style

- The hook still demanded an "analogy-led" Summary and "do not skip the analogy" — wording
  from v0.4.1 that v0.4.2's `creating-a-pull-request` explicitly reversed ("Skip analogies").
  The reminder now matches the skill: plain-language problem-then-solution Summary, no
  analogies.

## v0.4.1 (2026-06-22)

### `creating-a-pull-request`: analogies that teach, not decorate

- **Rewrote the Summary guidance** from "use analogies to keep things fun" (which produced
  one-line garnish similes the agent dropped after a sentence) into a positive recipe: keep
  learning fun by carrying the whole Summary on ONE sustained analogy — pick a single concrete
  world, map every technical noun to it 1:1, make the metaphor do the reasoning (the *why* and
  the gotchas), and give the actors agency.
- **Upgraded the skill's own worked example** to practice the recipe (a sustained
  messenger/neighbor/door world that carries the retry + circuit-breaker behavior), and
  reframed the "No analogy" mistake into "Throwaway analogy" (simile abandoned / world switched
  / reverted to literal).
- **Why this form:** the baseline failure is wrong-shaped output, not a skipped rule, so per
  `writing-skills` ("Match the Form to the Failure") the fix is a positive recipe, not a
  prohibition. Verified with a control-vs-treatment subagent micro-test (5 reps each, fresh
  task): the recipe took single-sustained-world adherence from 3/5 to 5/5, gave 5/5 strong
  actor agency, and collapsed cross-rep variance — while the control switched worlds mid-summary
  and reverted to literal prose.

## v0.4.0 (2026-06-22)

### Deterministic reminder to use `creating-a-pull-request`

- **New Claude Code `PreToolUse` hook** (`hooks/pretooluse-pr-reminder`): fires before a Bash
  call and, when the command is about to author a PR body (`gh pr create`, or `gh pr edit` with
  `--body`/`--body-file`), injects a reminder to invoke the `creating-a-pull-request` skill —
  so the body leads with a plain-language, analogy-led Summary instead of the technical summary.
- **Why:** until now the only thing keeping a skill from being skipped was the agent
  self-policing the `using-superpowers` rule; under momentum ("just open the PR") that fails.
  The hook moves the reminder from judgment to a deterministic trigger at the exact moment the
  PR command runs. Non-blocking by design (it nudges, it does not deny) so it can't deadlock the
  legitimate `gh pr create` that follows invoking the skill.
- **Scope:** Claude Code only. Cursor/Codex `PreToolUse` wiring is intentionally left out
  (those manifests currently wire SessionStart only); the hook script itself already emits the
  cursor/SDK output shapes if those platforms wire it later.

## v0.3.0 (2026-06-21)

### Persistent minimalism mode + over-engineering review lens

- **New `ponytail` skill** (adapted from [ponytail](https://github.com/DietrichGebert/ponytail), MIT): a persistent minimalism mode that defaults every solution to the simplest thing that works (YAGNI → stdlib → native → existing dep → one line), at intensity `lite`/`full`/`ultra`. Off by default.
- **Per-turn persistence via a Claude Code `UserPromptSubmit` hook** (four dependency-free Node modules under `hooks/`). Activated by plain-text triggers (`ponytail [level]`, `be lazy`) — not a slash command — and re-injected every turn while active, so it survives across responses and sessions until turned off (`normal mode` / `stop ponytail`).
- **Over-engineering lens** folded into existing skills: `requesting-code-review` gains a standing "Over-engineering / simplification" output section (tag taxonomy `delete:/stdlib:/native:/yagni:/shrink:`), and `improve-codebase-architecture` gains a "Simplify / delete" candidate type. Both governed by the deletion test, which reconciles minimalism with Ousterhout deep modules — so neither over-deletes an abstraction that genuinely hides complexity.
- Skill inventory reconciled to 25 and corrected to match `skills/`; upstream ponytail credited.

## v0.1.0 (2026-06-19)

### Initial dmi_superpowers consolidation

This is the first release of `dmi_superpowers` — an open-source consolidation of the
superpowers plugin (v6.0.3) and Matt Pocock's skills into a single coherent methodology engine.

**What was consolidated:**

- All core superpowers skills (brainstorming, writing-plans, executing-plans,
  subagent-driven-development, systematic-debugging, verification-before-completion,
  requesting-code-review, receiving-code-review, using-git-worktrees,
  finishing-a-development-branch, using-superpowers, writing-skills)
- Matt Pocock's skills (grill-with-docs, improve-codebase-architecture, to-prd,
  to-issues, triage, say, deep-research, jav-story, prototype)
- TDD skill replacing the built-in test-driven-development with the `tdd` skill variant

**What was changed:**

- Package name and repository metadata updated to `dmi-superpowers` / `HundredBillion/dmi_superpowers`
- Skill namespace prefixed as `dmi-superpowers:` for harness compatibility
- All top-level docs and metadata rebranded to dmi_superpowers
- Upstream contributor governance removed in favor of this repo's own contribution guide (`AGENTS.md`)
- Design documents (PRDs, TSPs) preserved in `docs/PRDs/` and `docs/TSPs/` for reference

# dmi_superpowers Release Notes

## v0.6.1 (2026-08-23)

Cuts four of the six rules v0.6.0 added to `writing-code-comments`, because the eval that
should have gated v0.6.0 was run afterwards and showed those four were already being
followed without them. Patch: this removes guidance, changes no description, and leaves
v0.6.0's core change standing.

The eval ran two arms — 0.5.1 and 0.6.0 — five blind runs each, one scenario, a separate
grader per run, graders unaware a second arm existed. Full results and caveats are on #29.

| Guarantee | 0.5.1 | 0.6.0 | outcome |
|-----------|-------|-------|---------|
| names the three sources rather than counting them | 1/5 | 4/5 | kept, tightened |
| quotes `'Bulk Import'` / `'Bulk Update'` literally | 0/5 | 4/5 | kept, tightened |
| accounts for every early return | 5/5 | 5/5 | **cut** |
| states no invented number | 5/5 | 5/5 | **cut** |
| states rules forwards | 5/5 | 4/5 | **cut** |
| names the omission's dependent | 5/5 | 4/5 | **cut** |

### `writing-code-comments`

- **Cut `Every Number Is A Claim`, `Account For Every Exit`, `State Rules Forwards, And
  Lead With The Present`, and the Common Mistakes bullet on naming an omission's
  dependent.** All four scored 5/5 against the *old* text: agents accounted for every
  exit, declined a planted "68 columns" fact, stated rules forwards, and named the
  downstream job with no instruction to. Two of the four then scored 4/5 with the new
  text, which points the wrong way. Guidance that costs tokens on every load and changes
  no behaviour is guidance to delete.
- **Tightened the two that earned their place** into checks rather than prose. Naming
  instead of counting is stated as a step to run before writing a note, and the
  near-homograph rule is stated as a correctness requirement, since both sit at 4/5 with
  the new text — reduced, not prevented.
- **Kept but still untested:** `Defer, Don't Paraphrase`, `Name The Destination, Not The
  Transport`, and `Mechanics`. The scenario never exercised them, so they are neither
  supported nor refuted. They need a fixture with an outbound side effect and a
  delegating caller.
- The v0.6.0 length rule stands. It resolves a contradiction inside the skill — extract a
  spanning invariant, then cap the resulting note at three sentences — rather than an
  empirical finding, and no checklist item measured it.

## v0.6.0 (2026-08-23)

Rewrites `writing-code-comments` around a length rule that scales, plus six new rules and six
red flags. Minor rather than patch even though no skill description changed: the core principle
is *reversed*, not extended, and a changelog reader needs to notice that.

The evidence is one session that rewrote every developer note in a Rails PR after the author
said, repeatedly, that he could not understand them. Nine commits, roughly nineteen distinct
defects. Not one comment was too long in the way the skill warned about — every defect was a
comment that was too *thin*: missing a name, a number, a third case, a destination.

### `writing-code-comments`

- **Length now follows what the note guards.** The old rule was "one sentence if possible,
  never more than three", applied to every comment alike. The skill also told you to extract a
  spanning invariant and let one note carry it — and then capped that note at three sentences,
  which made it unwritable. Two kinds are now named: an **inline note** keeps the three-sentence
  cap; an **invariant note**, sitting on the owner of a rule that spans callers, runs as long as
  the rule takes. The test is that every line answers a question you can name.
- **Name It, Don't Point At It.** Five of the seven defects found in a final audit pass were
  this one defect: "these three", "two columns", "the chain", "the reader below", a bare "it",
  and "the non-creating lookup" followed by the name of the creating one. Also: quote literal
  values when two identifiers are near-homographs, because paraphrasing `'Bulk Import'` and
  `'Bulk Update'` as "the bulk import" made a note read as contradicting its own code.
- **Every Number Is A Claim.** Two of the three specific claims written that session were
  wrong. "every writer of any of its ninety columns" described a 68-column table, checkable
  with one call. A four-provider mapping was presented as the complete set of seven. When a
  claim cannot be verified, state what is known plus the failure mode, not a false inventory.
- **Account For Every Exit.** Four notes summarised two of three early returns. A reader who
  counts the returns and finds one unexplained assumes it is a bug.
- **Defer, Don't Paraphrase.** A caller restating one of its callee's three reasons was correct
  when written and wrong the moment the callee's own note improved. Point at it and stop. And
  before writing "See X", read X — in one case X already said it, so the pointer was a duplicate.
- **Name The Destination, Not The Transport.** "leaves through a queue that no rollback reaches"
  sent readers hunting for a table. The effect was an email a person at another company acts on,
  irreversible by anything in the codebase — which is what made the surrounding ordering care
  look proportionate instead of fussy.
- **State Rules Forwards, And Lead With The Present.** Positively, never inverted in a relative
  clause (`whose reverts this guard exists to lose to` said the guard loses), rule before
  history, and warning before justification.
- **Mechanics.** One sentence per line, never breaking mid-sentence, which makes each sentence's
  budget `LineLength − comment prefix` and moves with indentation. Measure rather than eyeball:
  a sentence that will not fit is usually two ideas. Plainness costs lines and that is the trade.
- **Six new red flags**: explaining an omission without naming what depends on it; under-
  describing a side effect (`# try to find` above `find_or_create_by`); naming the method in its
  own doc comment (`# def foo` already means dead code in 18 places in the target repo); saying
  what was wrong without saying why it was *silent*; adjacent branches making opposite safety
  choices undocumented; and a comment positioned to annotate the line above the one it explains.

### `verification-before-completion`

- **"0 examples" has a second cause.** The table blamed a filter matching nothing. In the
  session it was a loader crash before collection — a missing `RAILS_ENV=test` left a test-group
  gem undefined, and the run printed `0 examples, 0 failures`, which reads like a pass.

## v0.5.1 (2026-08-22)

Eight verification gates (#27), each derived from a specific way one real session went wrong
while fixing a device-model bug in a Rails app. Patch rather than minor: no skill description
changed, so nothing changes about when a skill loads — only what it demands once loaded.

The through-line is that none of the eight was a reasoning failure. In every case the
conclusion was reasonable given what had been looked at, and wrong because of what had not
been. So each is written as a gate at the step where the mistake happens, not as advice to
remember later.

### `systematic-debugging`

- **Census discipline (Phase 3).** A search for every writer of a value, piped through
  `head -40`, hid three writers — one of them a real instance of the bug being fixed — and the
  commit message then claimed the bug closed. A command whose output feeds a completeness claim
  may not be truncated: print the count first, and if you truncate you forfeit *every / all /
  only / the N writers* until you re-run unbounded.
- **A claim someone else makes gets the same check (Phase 5).** The section already required
  going to read the consumer for claims you generate yourself. Review comments, tickets and
  inherited summaries arrive pre-stamped as authoritative and skipped it entirely. In the
  session a finding whose facts were all correct rested on a false premise, and the test
  written to lock the behaviour down is what disproved it.
- **Measure what a guard gates (Phase 5).** The obvious repair to a freshness condition would
  have silently stopped model updates for roughly 20,000 devices. A guard's behaviour is a
  property of the data flowing through it, not of the expression, so count the population that
  passes it now and after.

### `verification-before-completion`

- **The check must be able to fail.** `docker exec` without `-i` does not forward stdin, so a
  `--stdin` linter read an empty buffer and reported "no offenses detected" — a green it was
  structurally incapable of not producing. Know the last time a command failed before citing
  it; if it never has, break an input on purpose. Includes a table of the usual ways a check
  silently cannot fail.
- **Verify by artifact kind, not proximity.** Locale files were changed and the specs near
  them were run; the repo's own i18n check is what caught the breakage, twice. A table maps
  artifact kinds — locales, migrations, views, routes, dependencies, schemas — to the check
  that guards each.

### `codebase-design`

- **Find the solved twin.** A new module was proposed for per-provider key handling thirty
  lines below the same problem already solved in the same file. Search the file, then its
  directory, then the repo, and name the precedent you are following or state that none
  exists. A second home for knowledge that already has one is the most common way a
  well-intentioned module makes a codebase worse.

### `improve-codebase-architecture`

- **Measured, not estimated, line counts.** A Simplify/delete card claimed a ~280-line saving
  estimated from file sizes; reading all seven files put the real figure at 41. A sevenfold
  overstatement in a document whose only purpose is prioritisation. The count must come from
  performing or dry-running the deletion, or be labelled an estimate with its method.

### `writing-code-comments`

- **A repeated comment is a design smell.** The skill correctly produced a one-sentence note
  explaining why a merge had to follow a filter — and that note was then pasted into seven
  files. A comment defending an invariant a tidy-up would break is a guard that cannot enforce
  itself; extract the rule and let the comment live once beside it.

## v0.5.0 (2026-08-07)

Sweep from an architecture review of this repo (`/dmi-superpowers:improve-codebase-architecture`
run against itself). Minor rather than patch: the shipped payload loses 4,296 lines and four
skill descriptions changed, which affects when those skills load.

### Broken for users — fixed

- **The documented install command did not work.** `README.md` said
  `dmi-superpowers@dmi-superpowers-marketplace`; `a20afa9` renamed the marketplace to
  `dmi-marketplace` on 2026-06-19 and the README never followed, so the `@<marketplace>`
  suffix could not resolve. The OpenCode guide pinned `#v0.2.0` (this repo has zero git tags)
  and the Kimi guide pinned a `consolidation` branch that does not exist; both now point at
  `main`.
- **`systematic-debugging`'s Phase 6 handoff could never fire.** It hands off to
  `improve-codebase-architecture`, which carried `disable-model-invocation: true` — so the
  model could not invoke it and the instruction silently no-opped. Not a decision this repo
  made: the flag arrived with the upstream import (`d404478`) and the handoff arrived from a
  merge (`ab4dd5e`) **the same day**, and nobody reconciled them. The flag is gone and the
  description is now a `Use when…` trigger naming the two situations that should reach it,
  with its file-writing side effect stated.
- **The PR reminder and ponytail never ran outside Claude.** `hooks-codex.json` and
  `hooks-cursor.json` registered only `SessionStart` while `hooks.json` registered three
  events, leaving the Cursor and Copilot branches inside those scripts as unreachable code.
  Both configs now register all three.

### One place decides the harness output shape

Four harnesses want three JSON envelopes, and that three-way branch was written out in every
hook that injects context — plus a fourth copy in `ponytail-runtime.js` that detected Codex
from `PLUGIN_DATA`, a variable **no bash hook ever read**, so one Codex session could be
`codex` to node and `unknown` to bash at the same moment. Detection and shape now live in
`hooks/harness-shapes.json`, applied by the new `hooks/emit-context` and required by the node
runtime. Adding a harness is a table row.

The table is parsed with `sed`, not `jq`: `jq` is not a safe dependency inside a session-start
hook, since a user without it would lose the bootstrap entirely. The file is kept one harness
per line for that reason, and CI asserts the two runtimes still agree.

### Deleted — 4,296 lines

`docs/TSPs/` (2,344) were execution scripts for shipped work with every checkbox still
unchecked and absolute paths to another machine. `docs/PRDs/` (732) are covered by
ADR-0003/0004/0005/0006, which carry `## Considered Options`.
`writing-plans/plan-document-reviewer-prompt.md` (49) had **zero inbound references** and was
superseded by `SKILL.md:145-155`. `writing-skills/anthropic-best-practices.md` (1,150) was a
third of that skill's shipped payload behind one bare-filename mention two hops deep.
`.pre-commit-config.yaml` guarded an `evals/` tree that does not exist, so all three of its
hooks were inert. Git history keeps every one of them; what was being paid for was
working-tree and shipped-payload cost.

### `AGENTS.md` points instead of restating

It restated the PR format and drifted: it asked for **an analogy** in the Summary long after
`creating-a-pull-request`, `.github/PULL_REQUEST_TEMPLATE.md` and the `pretooluse-pr-reminder`
hook had all settled on the opposite rule. Because `CLAUDE.md` is an 11-byte delegation to it,
Claude loaded the wrong rule every session while the hook fired the right one at PR time. The
restatement is gone — the skill is now the only statement of the format.

Also corrected: *"No automated test suite"* (two test files exist), *"~25 skills"* (26), and
*"verify skill changes by running them in a real session"*, which **ADR-0002** says is
impossible for working-tree skill edits; it now describes content-simulation plus
post-reinstall confirmation and cites the ADR.

### CI — nothing ran on a PR before

`.github/workflows/validate.yml` runs the two hook tests, `scripts/lint-shell.sh`, JSON parsing
of every manifest, the version audit, a check that the README install command matches the
declared marketplace name, hook parity across the three configs, and a check that
`emit-context` agrees with the shape table. The middle two would each have caught a bug that
shipped. It calls `lint-shell.sh` rather than `shellcheck` directly so CI enforces the repo's
existing `--severity=warning` policy rather than a stricter invented one.

### Trigger collisions

`grilling` claimed *"any 'grill' trigger phrases"* while `grill-with-docs` had no `Use when…`
clause at all (against `writing-skills:50`); `dispatching-parallel-agents` and
`subagent-driven-development` both said "independent tasks" with nothing to choose between
them and shared a byte-identical paragraph. All four descriptions now discriminate, and the
duplicated paragraph is a pointer.

`grill-with-docs` was **kept**, against the review's own recommendation to cut it: it is
referenced 11 times across 3 skills, including inside `brainstorming`'s graphviz flowchart and
its *"the ONLY skills you invoke after brainstorming"* constraint — the name is a protocol
token, not an alias.

### Eval methodology wired to its callers

`AGENTS.md` and the PR template both gate PRs on evaluation evidence and neither named the
method; `writing-skills`, the skill the methodology is about, never said "eval". All three now
point at `docs/evals/README.md` and ADR-0006. Not fixed here: the three `*-guarantees.md` files
still cite line ranges that no longer resolve.

### Not verified

The Cursor and Codex hook registrations are unverified **on those harnesses** — the configs
parse and `emit-context` produces the right envelope for each, but no Cursor or Codex instance
was available to confirm they accept `preToolUse` / `userPromptSubmit` under those schema
names. Claude is unaffected either way. The four description rewrites also ship without a
baseline/treatment eval: per ADR-0002 working-tree skill edits are not invokable in-session,
and each fixes a provable contradiction in the text rather than a measured behaviour delta.

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

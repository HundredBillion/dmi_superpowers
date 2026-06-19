# PRD: `say` — the canonical communication skill

**Date:** 2026-06-19
**Status:** Approved design, pending PRD hardening (grill-with-docs) and implementation plan (TSP)
**Owner:** David Lee (dalee@dminc.com)

## 1. Purpose

Add a new skill, `dmi-superpowers:say`, that governs *how* findings and prose reach a
human reader. It standardizes communication across two situations:

1. **Explaining code findings** during `grilling`, `grill-with-docs`, and
   `systematic-debugging` (or standalone) — in language a non-developer can follow, while
   staying specific enough that the developer can make decisions about the code.
2. **Drafting or rewriting general prose** for a human reader (Slack, Jira, PR, email).

It is both standalone-invokable (`/say`) and referenced by other skills — the same dual
nature as `tdd` and `brainstorming`. It absorbs and replaces David's personal global
`/say` command (`~/.claude/commands/say.md`), which gets retired once this lands.

## 2. Background — the model and the gap

`/say` today rewrites/drafts general prose using ten plain-language rules
(from plainlanguage.gov). It works well for messages addressed to people, but it does
nothing for the more frequent need: explaining *what the code does and what's wrong with
it* during a grilling or debugging session, where the reader needs plain framing **and**
exact technical anchors to decide.

The core tension this skill resolves: **plain enough to follow, specific enough to decide
on.** A single-register explanation either buries a less-technical reader in jargon or
strips out the anchors a developer needs to act.

## 3. Key decisions

| # | Decision |
|---|----------|
| 1 | One skill, **two modes**: code-findings mode and general-prose mode. |
| 2 | Slug = `say`; replaces the personal global `/say` command. |
| 3 | Standalone-invokable **and** referenced by other skills (like `tdd`, `brainstorming`). |
| 4 | Code-findings mode follows a fixed **four-beat** structure. |
| 5 | Governing principle for code findings: **pair, don't pick** — every finding carries both registers. |
| 6 | General-prose mode is **plain-only** (no technical register), audience = non-developer. |
| 7 | Wire `grilling`, `grill-with-docs`, `systematic-debugging` to reference `say`. |
| 8 | Built using the `writing-skills` skill. |

## 4. Two modes

### 4a. Code-findings mode

Active when explaining something about code — during `grilling` / `grill-with-docs` /
`systematic-debugging`, or when invoked standalone on a finding. Every finding follows
this four-beat structure:

1. **Headline** — the plain-language bottom line: what it means for the product/user.
2. **What this code does** — one or two sentences of context, so the reader needs no prior
   familiarity with the file.
3. **What's wrong** (or **What's happening**, for non-bug findings such as a grilling
   "here's how this currently works" point) — split into two registers:
   - *Plain:* the consequence in human terms.
   - *Technical:* exact file / function / line range + the precise mechanism.
4. **Your call** — the concrete decision, presented as options. Each option reads:
   **plain choice** *(technical action)* — trade-off.

**Worked example** (a swallowed-error bug found during `systematic-debugging`):

> **Failed payments are being reported as successful.**
>
> **What this code does:** `PaymentService.charge()` is the step that actually bills a
> customer's card. When a charge fails, it's supposed to retry a few times before giving up.
>
> **What's wrong:**
> - *Plain:* If every retry fails, the code still acts like the payment worked — so a
>   customer could get their order without paying.
> - *Technical:* `charge()` lines 40–52 — the retry loop catches and discards every
>   exception, so after retries are exhausted the method returns normally instead of
>   propagating the failure.
>
> **Your call** — two options:
> - **Block the order** *(fail hard, propagate the error)* — safer, nobody slips through unpaid.
> - **Let it through, flag for review** *(catch → emit `PaymentFailed` to the review queue)* —
>   friendlier to the customer, but someone has to staff the queue.

### 4b. General-prose mode

Active when drafting/rewriting a message addressed to a human (Slack, Jira, PR, email).
High-level, non-technical prose a non-developer understands. Carries forward `/say`'s ten
plain-language rules as its foundation (write for the reader, main point first, active
voice, short sentences, common words, no hidden verbs, define jargon, cut hedging,
concrete over abstract, read it aloud). **No technical register** — keep it high-level.

Input/output behavior is inherited from today's `/say`:
- Brief/topic → generate a fresh draft. Existing text → rewrite in place.
- Default to ready-to-paste prose, matching the medium and the user's voice.
- If the input is unclear, ask one short clarifying question first.

## 5. Governing principle: pair, don't pick

For code findings, every finding and every decision carries **both** registers — plain
meaning **and** exact technical anchor — woven together, never one at the expense of the
other. The *Technical* line is the load-bearing anchor: it always names specific code
(file / function / lines) so the finding is decidable, never just "somewhere in the
payment flow."

This dissolves any "who is the reader?" mode-switch for code findings: a product-minded
reader follows the bold text and trade-offs; the developer reads the parenthetical
technical actions. Both are served at once.

## 6. Mode selection

The skill picks by output type:
- *A finding about code* → code-findings mode.
- *A message addressed to a person* → general-prose mode.

When ambiguous, it asks one short clarifying question (mirroring how `/say` handles
unclear input today).

## 7. Integration / wiring

- New `skills/say/SKILL.md`, authored using the `writing-skills` skill.
- Add one reference line to each of `grilling`, `grill-with-docs`, and
  `systematic-debugging` SKILL.md, pointing to `say` as the communication style for
  reporting findings to the user. This is light-touch: `grilling` is only ~10 lines and
  takes a single added line cleanly.
- Register the skill in the README inventory (currently "22 skills" → 23) and any other
  manifest that lists skills.

This edit to existing `skills/*/SKILL.md` files is explicitly authorized by this task,
per the repo `CLAUDE.md` rule ("Do not re-touch `skills/*/SKILL.md` ... unless a task
explicitly covers them").

## 8. Deprecating `/say`

Delete `~/.claude/commands/say.md` once `dmi-superpowers:say` covers both modes.

⚠️ **Out-of-repo step.** That file lives in David's personal global `~/.claude`, not in
this repository. Its deletion is a manual step flagged at hand-off — it is **not** a
change committed within this repo's PRD/TSP cycle.

## 9. Non-goals (YAGNI)

- No per-reader "audience dial" or auto-detection of who is reading. Code findings always
  pair both registers; prose mode is always plain-only. No tuning knob.
- No new tooling, scripts, or hooks — this is a markdown skill.
- No changes to skills beyond the three named in §7.
- No attempt to make general-prose mode emit technical detail.

## 10. Testing / verification

- Authored and verified per the `writing-skills` skill (frontmatter, description triggers,
  structure).
- Confirm the skill loads and triggers: standalone `/say`, and automatically when
  `grilling` / `grill-with-docs` / `systematic-debugging` report a finding.
- Sanity-check both modes against worked examples: a code finding (the §4a example) and a
  prose rewrite (an existing `/say`-style message).

## 11. Success criteria

- `dmi-superpowers:say` exists, triggers both standalone and via the three referenced skills.
- A code finding produced under the skill shows all four beats with paired registers and a
  specific technical anchor.
- A prose request produces plain, non-technical, ready-to-paste output equivalent to
  today's `/say`.
- README/inventory updated; `/say` global command retirement flagged at hand-off.

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
| 2 | Slug = `say`; replaces the personal global `/say` command via **clean cutover** (delete it, no shim). |
| 3 | Standalone-invokable **and** referenced by other skills (like `tdd`, `brainstorming`). |
| 4 | `say` is a **communication style layered onto each skill**, not a rigid template. Four-beat is its full form; grilling uses only the explanatory beats. |
| 5 | Governing principle for code findings: **pair, don't pick** — every finding carries both registers. |
| 6 | General-prose mode is **plain-only** (no code-level detail), readable by a non-developer. |
| 7 | **Audience/destination selects the mode**, not subject matter. |
| 8 | Wire `grilling`, `grill-with-docs`, `systematic-debugging` via an **imperative reference at the exact reporting moment** — no inline duplication. |
| 9 | Built using the `writing-skills` skill. |

## 4. Two modes

`say` is a **communication style layered onto each skill**, not a rigid template each
skill must adopt wholesale. Each referenced skill keeps its own structure and invokes
`say` only at the moment it communicates about code. Concretely:

- **systematic-debugging** reports *findings* (root cause, hypothesis) → uses the full
  **four-beat**.
- **grilling / grill-with-docs** ask *questions* → "Your call" is already the question
  itself, so the four-beat would collapse. They use only the **explanatory beats**
  (beats 2–3: "what this code does" / "what's happening", paired registers) to set up a
  question, then their own question-and-recommended-answer format takes over.

### 4a. Code-findings mode

Active when explaining something about code *to the developer, in-session, so they can
decide* — during `systematic-debugging` (or standalone on a finding). The full form is
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
concrete over abstract, read it aloud).

**"No technical register" means no code-level detail** — no file / function / line
numbers, no `charge()`-style anchors. It does **not** mean omitting scope or impact:
which systems are affected, what you're doing, and what the reader should do are *content*
the reader needs and stay in.

**Worked example** — a rough braindump rewritten for a team Slack channel:

> *Input:* "i found a bug in krypton and i'm fixing it now but there's a chance that it
> will impact argon, and helium"
>
> *Output:* **Heads up:** I found a bug in Krypton and I'm fixing it now. There's a chance
> the fix touches Argon and Helium too — I'll flag here if either is affected. No action
> needed from anyone yet.

(Argon and Helium stay — naming the affected systems is content, not jargon.)

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

**Audience/destination selects the mode, not subject matter.** *Where the message is
going* decides — not what it is about:
- *Explaining to the developer, in-session, to decide on* → code-findings mode (four-beat,
  paired registers).
- *A message addressed to a person on a human channel* (Slack/Jira/PR/email) →
  general-prose mode — **even when its subject is a bug**. The Krypton example in §4b is
  about a bug, yet it routes to prose mode because it is sent to a channel.

When genuinely ambiguous, the skill asks one short clarifying question (mirroring how
`/say` handles unclear input today).

## 7. Integration / wiring

- New `skills/say/SKILL.md`, authored using the `writing-skills` skill.
- Wire each of `grilling`, `grill-with-docs`, and `systematic-debugging` with an
  **imperative reference placed at the exact moment a finding is reported** — not a soft
  "see also." Worded as a hard instruction, e.g. *"When you report a root cause or
  hypothesis to the user, format it with `dmi-superpowers:say`."* Anchor points:
  - `systematic-debugging`: the root-cause report, and any hypothesis presented for a decision.
  - `grilling` / `grill-with-docs`: the code explanation that sets up a question (not the
    running commentary). `grilling` is ~10 lines and takes a single added line cleanly.
- **The boundary for when the imperative fires:** *understand-or-decide vs.
  status-narration.* If the message tells the user something about the code they must grasp
  or decide on → use `say`. If it just narrates what the agent is doing ("running tests",
  "reading the file") → don't.
- **No inline duplication.** `say` is the single source of truth; the skills reference it.
  If the imperative reference proves flaky in practice, the fallback (deferred, not in this
  PRD) is a short inline echo in each skill. See ADR 0001.
- Register the skill in the README inventory (currently "22 skills" → 23) and any other
  manifest that lists skills.

This edit to existing `skills/*/SKILL.md` files is explicitly authorized by this task,
per the repo `CLAUDE.md` rule ("Do not re-touch `skills/*/SKILL.md` ... unless a task
explicitly covers them").

## 8. Deprecating `/say`

**Clean cutover.** Delete `~/.claude/commands/say.md` once `dmi-superpowers:say` covers
both modes. After cutover, invoke the skill via `/dmi-superpowers:say` or rely on
auto-trigger; the bare `/say` command goes away (whether a bare `/say` *alias* to the skill
survives is a Claude Code behaviour we did not rely on).

**No shim.** We explicitly rejected replacing `~/.claude/commands/say.md` with a one-line
delegating stub. The `/say` command originates from another author; overwriting it to
delegate would clobber their work. We leave the original `/say` concept untouched for
anyone else and simply stop using our local copy.

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

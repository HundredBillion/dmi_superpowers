# Say Communication Skill — Technical Spec

> **For agentic workers:** REQUIRED SUB-SKILL: Use dmi-superpowers:subagent-driven-development (recommended) or dmi-superpowers:executing-plans to implement this TSP task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `dmi-superpowers:say` skill that communicates code findings in paired plain/technical language and rewrites general prose for humans, then wire it into `systematic-debugging` and `grilling`.

**Architecture:** A single new markdown skill (`skills/say/SKILL.md`) with two modes selected by audience/destination. `systematic-debugging` and `grilling` get imperative references at their exact reporting moments; `grill-with-docs` inherits via `grilling`. README's existing `say` row is updated to describe the real skill.

**Tech Stack:** Markdown SKILL.md files. Verification is via the `writing-skills` methodology — subagent pressure scenarios (RED baseline → GREEN with skill present), not a code test runner.

## Global Constraints

- Skill namespace: `dmi-superpowers:` — cross-skill references are written `dmi-superpowers:say`.
- SKILL.md frontmatter requires exactly two keys: `name` and `description`. `name` must equal the directory name (`say`).
- **Pair, don't pick:** every code finding carries both registers (plain meaning + exact technical anchor); the technical register names specific file/function/lines.
- **Audience/destination selects the mode, not subject matter:** a message sent to a human channel is general-prose mode even when its subject is a bug.
- `say` is a communication *style* layered onto other skills, not a rigid template; **no inline duplication** of `say`'s content into other skills — reference it.
- Only `README.md` enumerates skills by name; the plugin manifests auto-discover `./skills/`, so no manifest edits are required.
- Commit after each task. Branch: `say-skill` (already checked out).

---

### Task 1: Create the `say` skill

**Files:**
- Create: `skills/say/SKILL.md`
- Verify (no file): subagent pressure scenarios via the Agent tool

**Interfaces:**
- Consumes: nothing (first task).
- Produces: the skill `dmi-superpowers:say` with two modes — code-findings (four-beat, paired registers) and general-prose (plain-language rewrite). Tasks 2–3 reference it by that exact name.

- [ ] **Step 1: Write the RED baseline scenario (code-findings)**

Dispatch a subagent (Agent tool, `general-purpose`) WITHOUT mentioning `say`, prompt verbatim:

> Here is a code snippet:
> ```js
> async charge(card, amount) {
>   for (let i = 0; i < 3; i++) {
>     try { return await gateway.bill(card, amount); }
>     catch (e) { /* retry */ }
>   }
> }
> ```
> `charge()` is supposed to bill a card and retry on failure. Report what's wrong with this code to the developer so they can decide what to do.

Record the output. Expected RED: it explains the bug but does NOT use the four-beat (no plain/technical split, no "Your call" options pairing plain choice with technical action). This is the baseline failure that justifies the skill.

- [ ] **Step 2: Write the RED baseline scenario (general-prose)**

Dispatch a second subagent WITHOUT mentioning `say`, prompt verbatim:

> Rewrite this for a team Slack channel: "i found a bug in krypton and i'm fixing it now but there's a chance that it will impact argon, and helium"

Record the output. Expected RED: likely acceptable but inconsistent — may add preamble, drop the affected systems, or over-formalize. Documents the gap.

- [ ] **Step 3: Create `skills/say/SKILL.md`**

Write this exact content:

````markdown
---
name: say
description: Use when reporting a finding about code to the user during grilling, grill-with-docs, or systematic-debugging, and when drafting or rewriting prose for a human reader (Slack, Jira, PR, email). Pairs plain-language meaning with exact technical anchors so a non-developer can follow and the developer can decide.
---

# Say — Communicate Clearly to a Human

`say` governs *how* you communicate to a person. It has two modes. **The audience/destination selects the mode — not the subject matter.**

- Explaining something about the code **to the developer, in-session, so they can decide** → **code-findings mode**.
- Drafting or rewriting a message **addressed to a person on a human channel** (Slack, Jira, PR, email) → **general-prose mode** — even when the subject is a bug.

When genuinely ambiguous, ask one short clarifying question before writing.

`say` is a **communication style** you layer on at the moment you communicate — not a template that replaces the structure of whatever skill you are running.

## Code-findings mode

Use when explaining code to the developer so they can decide. The full form is four beats:

1. **Headline** — the plain bottom line: what it means for the product or user.
2. **What this code does** — one or two sentences of context, so the reader needs no prior familiarity with the file.
3. **What's wrong** (or **What's happening**, for non-bug findings) — split into two registers:
   - *Plain:* the consequence in human terms.
   - *Technical:* exact file / function / line range and the precise mechanism.
4. **Your call** — the decision, as options. Each option reads: **plain choice** *(technical action)* — trade-off.

**Governing principle — pair, don't pick.** Every finding carries *both* registers, woven together, never one at the expense of the other. The *Technical* line is the load-bearing anchor: always name specific code so the finding is decidable — never "somewhere in the payment flow."

### Worked example

> **Failed payments are being reported as successful.**
>
> **What this code does:** `PaymentService.charge()` is the step that actually bills a customer's card. When a charge fails, it is supposed to retry a few times before giving up.
>
> **What's wrong:**
> - *Plain:* If every retry fails, the code still acts like the payment worked — so a customer could get their order without paying.
> - *Technical:* `charge()` lines 40–52 — the retry loop catches and discards every exception, so after retries are exhausted the method returns normally instead of propagating the failure.
>
> **Your call** — two options:
> - **Block the order** *(fail hard, propagate the error)* — safer, nobody slips through unpaid.
> - **Let it through, flag for review** *(catch → emit `PaymentFailed` to the review queue)* — friendlier to the customer, but someone has to staff the queue.

### Layering onto other skills

`say` is invoked by other skills at the moment they communicate about code; it does not replace their structure.

- **systematic-debugging** reports findings (root cause, hypothesis) → use the **full four-beat**.
- **grilling / grill-with-docs** ask questions → "Your call" is already the question, so do not force the four-beat. Use only the **explanatory beats** (beats 2–3: *what this code does* / *what's happening*, paired registers) to set up the question, then ask the question in grilling's own format.

## General-prose mode

Use when drafting or rewriting a message addressed to a human reader. Plain, concise prose a non-developer understands. Apply these rules (from plainlanguage.gov):

1. Write for the reader, not yourself. Lead with what they need.
2. Main point first. No throat-clearing ("I wanted to mention that…").
3. Active voice. Name the actor.
4. Short sentences, one idea each.
5. Common words over fancy ones (use → utilize, about → regarding, start → commence).
6. No hidden verbs ("decide", not "make a decision").
7. Avoid jargon, or define it on first use.
8. Cut hedging and filler ("basically", "just", "I think", "in order to" → "to").
9. Concrete over abstract — name the system, the number, the action.
10. Read it aloud. If you would not say it to a coworker, rewrite it.

**"No technical detail" means no code-level detail** — no file / function / line numbers, no `charge()`-style anchors. It does **not** mean omitting scope or impact: which systems are affected, what you are doing, and what the reader should do stay in.

### Worked example

> *Input:* "i found a bug in krypton and i'm fixing it now but there's a chance that it will impact argon, and helium"
>
> *Output:* **Heads up:** I found a bug in Krypton and I'm fixing it now. There's a chance the fix touches Argon and Helium too — I'll flag here if either is affected. No action needed from anyone yet.

(Argon and Helium stay — naming the affected systems is content, not jargon.)

### Input / output behavior

- A brief or topic → generate a fresh draft. Existing text (or a file of text) → rewrite in place, then add a one-line note on the biggest change.
- Default to ready-to-paste prose — no "Here's a draft:" preamble.
- Match the medium (Slack → casual; PR → markdown sections; email → greeting + body) and the user's voice if a sample is given.
````

- [ ] **Step 4: Verify frontmatter**

Run: `head -4 skills/say/SKILL.md`
Expected: a `---` line, `name: say`, a `description:` line beginning `Use when`, and a closing `---`.

- [ ] **Step 5: Run the GREEN scenarios (skill present)**

Re-dispatch both subagents from Steps 1–2, this time prefixing each prompt with:

> Use the dmi-superpowers:say skill. <original prompt>

Expected GREEN:
- Code-findings scenario: output has all four beats — **Headline**, **What this code does**, **What's wrong** split into *Plain* and *Technical* (naming `charge()` and the discarded exception), and **Your call** with at least two options each pairing a plain choice with a technical action.
- General-prose scenario: plain, ready-to-paste Slack message that keeps Krypton, Argon, and Helium, drops code-level detail, and has no "Here's a draft:" preamble.

If either fails, refine SKILL.md wording to close the gap, then re-run.

- [ ] **Step 6: Commit**

```bash
git add skills/say/SKILL.md
git commit -m "feat: add say communication skill (code findings + general prose)"
```

---

### Task 2: Wire `systematic-debugging` to `say`

**Files:**
- Modify: `skills/systematic-debugging/SKILL.md` (after line 174, Phase 3; after line 198, Phase 5)
- Verify (no file): subagent pressure scenario

**Interfaces:**
- Consumes: `dmi-superpowers:say` (Task 1) — code-findings mode, full four-beat.
- Produces: imperative references that fire when hypotheses and the root cause are reported to the user.

- [ ] **Step 1: Add the Phase 3 imperative (hypotheses)**

In `skills/systematic-debugging/SKILL.md`, find this exact line (end of the Phase 3 "Show the ranked list" paragraph, line 174):

```
They often have domain knowledge that re-ranks instantly ("we just deployed a change to #3"), or know hypotheses they've already ruled out. Cheap checkpoint, big time saver. Don't block on it — proceed with your ranking if the user is AFK.
```

Insert immediately after it (new blank line, then):

```
**When you present the ranked hypotheses to the user, format each with `dmi-superpowers:say` (code-findings mode):** plain headline, what the suspect code does, and the *Plain* / *Technical* split — so the user can re-rank on meaning, not jargon.
```

- [ ] **Step 2: Add the Phase 5 imperative (root cause)**

In the same file, find this exact line (Phase 5, line 198):

```
**If no correct seam exists, that itself is the finding.** Note it. The codebase architecture is preventing the bug from being locked down. Flag this for Phase 6.
```

Insert immediately after it (new blank line, then):

```
**When you report the confirmed root cause to the user, format it with `dmi-superpowers:say` (the full four-beat):** Headline → What this code does → What's wrong (*Plain* / *Technical*, naming the exact file/function/lines) → Your call. This is a finding the user must understand and decide on — not status narration.
```

- [ ] **Step 3: Verify the inserts landed**

Run: `grep -n "dmi-superpowers:say" skills/systematic-debugging/SKILL.md`
Expected: exactly two matches — one in Phase 3, one in Phase 5.

- [ ] **Step 4: Run the GREEN scenario**

Dispatch a subagent (Agent tool, `general-purpose`), prompt verbatim:

> Use the dmi-superpowers:systematic-debugging skill. You are at Phase 3 with these confirmed facts: `OrderService.submit()` (lines 88–95) writes the order to the DB before the payment is confirmed, so unpaid orders appear as placed. Present your ranked hypotheses to the user, then report the root cause.

Expected GREEN: hypotheses and root cause are reported in `say` style — a plain headline plus a *Plain* / *Technical* split naming `OrderService.submit()` lines 88–95, and a "Your call" with paired options. Process narration ("running the loop") is NOT four-beated.

If it does not invoke `say`, strengthen the imperative wording (make it a directive sentence at the reporting moment) and re-run.

- [ ] **Step 5: Commit**

```bash
git add skills/systematic-debugging/SKILL.md
git commit -m "feat: wire systematic-debugging to say at hypothesis and root-cause reports"
```

---

### Task 3: Wire `grilling` to `say` (covers `grill-with-docs`)

**Files:**
- Modify: `skills/grilling/SKILL.md` (append one paragraph)
- Verify (no file): subagent pressure scenario + confirm `grill-with-docs` inherits

**Interfaces:**
- Consumes: `dmi-superpowers:say` (Task 1) — explanatory beats only (beats 2–3).
- Produces: an imperative reference that fires when grilling explains code to set up a question.

- [ ] **Step 1: Confirm `grill-with-docs` delegates to `grilling`**

Run: `cat skills/grill-with-docs/SKILL.md`
Expected: its body is "Run a `dmi-superpowers:grilling` session, using the `dmi-superpowers:domain-modeling` skill." Because it delegates entirely to `grilling`, wiring `grilling` covers `grill-with-docs` — no separate edit to `grill-with-docs`.

- [ ] **Step 2: Append the imperative to `grilling`**

In `skills/grilling/SKILL.md`, find this exact final line:

```
If a question can be answered by exploring the codebase, explore the codebase instead.
```

Insert immediately after it (new blank line, then):

```
When a question requires explaining a piece of code first, format that explanation with `dmi-superpowers:say` (code-findings mode, explanatory beats only): say in plain terms what the code does and what is happening, paired with the exact file/function, then ask your question. Do not wrap the question itself in the four-beat — the question is your "Your call".
```

- [ ] **Step 3: Verify the insert landed**

Run: `grep -n "dmi-superpowers:say" skills/grilling/SKILL.md`
Expected: exactly one match.

- [ ] **Step 4: Run the GREEN scenario**

Dispatch a subagent (Agent tool, `general-purpose`), prompt verbatim:

> Use the dmi-superpowers:grilling skill. The plan reuses `AuthMiddleware.verify()` (lines 20–34), which currently trusts an unsigned header. Grill me about whether to keep using it — ask your first question.

Expected GREEN: before asking, the agent explains in plain terms what `AuthMiddleware.verify()` does and what is happening (the unsigned-header risk), paired with the file/function reference — then asks one question. The question itself is NOT formatted as a four-beat finding.

If it does not invoke `say`, strengthen the imperative and re-run.

- [ ] **Step 5: Commit**

```bash
git add skills/grilling/SKILL.md
git commit -m "feat: wire grilling to say for code explanations that set up questions"
```

---

### Task 4: Update the README `say` row

**Files:**
- Modify: `README.md:50`

**Interfaces:**
- Consumes: the now-real `skills/say/` (Task 1).
- Produces: an accurate inventory description.

- [ ] **Step 1: Update the description**

In `README.md`, find this exact line (line 50):

```
| `say` | Draft/rewrite prose for human readers |
```

Replace it with:

```
| `say` | Communicate code findings in plain + technical pairs, and rewrite prose for human readers |
```

- [ ] **Step 2: Verify**

Run: `grep -n "| \`say\` |" README.md`
Expected: one match with the new description.

Note: do NOT change the "22 skills" counts on lines 9 and 15. The README's inventory already listed `say` and has pre-existing count/row inconsistencies unrelated to this work; reconciling them is out of scope for this TSP.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update README say row to reflect the two-mode skill"
```

---

### Task 5: Final verification and out-of-repo handoff

**Files:** none (verification + handoff note only)

- [ ] **Step 1: Confirm the full wiring**

Run: `grep -rn "dmi-superpowers:say" skills/`
Expected: matches in `skills/systematic-debugging/SKILL.md` (2) and `skills/grilling/SKILL.md` (1). `skills/say/SKILL.md` exists with valid frontmatter.

- [ ] **Step 2: Confirm skill discovery**

Run: `ls -d skills/*/ | wc -l`
Expected: 23 (was 22). The plugin manifests point at `./skills/`, so the new directory is auto-discovered — no manifest edit needed.

- [ ] **Step 3: Flag the out-of-repo deletion (manual, do NOT commit)**

Report to the user: the personal global command `~/.claude/commands/say.md` should be deleted by hand to complete the clean cutover (PRD §8). This file is outside this repo and is intentionally left to the user — and a delegating shim was rejected so the original author's `/say` stays intact. After deletion, invoke the skill via `/dmi-superpowers:say` or rely on auto-trigger.

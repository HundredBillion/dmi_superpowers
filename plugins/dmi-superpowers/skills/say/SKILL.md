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

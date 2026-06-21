# dmi_superpowers

A self-owned skills plugin: a methodology engine of brainstorm → plan → TDD → review →
finish skills for coding agents. This glossary pins the vocabulary the skills share when
they talk *to a human reader* — the language of the `say` communication skill and the
skills that reference it.

## Language

### Communication (the `say` skill)

**Communication style**:
A reusable way of phrasing output that one skill layers onto another, rather than a rigid
output template. `say` is a communication style: `grilling`, `grill-with-docs`, and
`systematic-debugging` invoke it at the moment they report something, and keep their own
structure otherwise.
_Avoid_: Format, template, mode (when you mean the style itself).

**Code-findings mode**:
The `say` behaviour used when explaining something about the code *to the developer,
in-session, so they can decide*. Produces the four-beat with paired registers.
_Avoid_: Technical mode, debug mode.

**General-prose mode**:
The `say` behaviour used when drafting or rewriting a message *addressed to a person* on a
human channel (Slack, Jira, PR, email). Plain, concise, no code-level detail.
_Avoid_: Writing mode, say-mode.

**Audience/destination**:
What selects the `say` mode — *where the message is going*, not what it is about. A message
sent to a channel is general-prose mode even when its subject is a bug; a bug explained
in-session for a decision is code-findings mode.
_Avoid_: Topic, subject (as the selector).

**Pairing** (verb: *to pair*):
Carrying both registers together in a single finding — plain meaning **and** exact
technical anchor — never one at the expense of the other. The governing rule of
code-findings mode: "pair, don't pick."
_Avoid_: Translating, dumbing down.

**Register**:
One of the two voices a finding speaks in. The *plain register* states the consequence in
human terms; the *technical register* names the exact file / function / lines and the
precise mechanism. The technical register is the load-bearing anchor that makes a finding
decidable.
_Avoid_: Level, layer, tone.

**Four-beat**:
The full shape of a code finding: **Headline** → **What this code does** →
**What's wrong / What's happening** (split into the two registers) → **Your call**. The
complete form used by `systematic-debugging`; `grilling` uses only the explanatory beats to
set up a question.
_Avoid_: Template, structure, sections.

### Minimalism (the `ponytail` skill)

**Ponytail mode**:
The persistent minimalism behavior the `ponytail` skill switches on — defaults every solution
to the simplest thing that works (YAGNI, stdlib/native before custom code, shortest working
diff), and stays active across responses until turned off. Has intensity levels (`lite` /
`full` / `ultra`).
_Avoid_: Lazy mode, minimal mode (when you mean the skill's standing behavior).

**The deletion test**:
The single boundary test that decides minimalism-vs-abstraction (from `codebase-design`): delete
the thing — if complexity vanishes or just moves, it was shallow → cut it; if complexity
concentrates because it was hiding real work, it is a **deep module** → keep it. The canonical
arbiter between `ponytail` and `codebase-design`.
_Avoid_: The complexity rule, the genuinely-complex test.

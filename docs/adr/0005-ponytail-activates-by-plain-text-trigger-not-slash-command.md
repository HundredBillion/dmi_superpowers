# Ponytail mode is switched by a plain-text trigger and stored in a global flag

Ponytail's persistent mode is turned on by the `UserPromptSubmit` hook pattern-matching the
user's prompt. We deliberately do **not** ship a `/ponytail` slash command (PRD §3 excludes
slash-command infrastructure), and we do not rely on the `/ponytail` slash *form* reaching the
hook: Claude Code's handling of an unregistered slash command is undocumented and possibly
version-dependent — it may intercept `/ponytail ultra` as an unknown command before the hook
ever runs. Only a slash-free prompt is guaranteed to reach `UserPromptSubmit` unmodified. So the
reliable triggers are plain-text, whole-message phrases — `ponytail [lite|full|ultra]`,
`be lazy`, `lazy mode` to activate; `stop ponytail` / `normal mode` to deactivate — with the
`/`, `@`, `$` prefixed forms matched only as a best-effort bonus where a harness does pass them
through. The active level is stored in one global flag file (`~/.claude/.ponytail-active`), so
the mode persists across responses **and** sessions until turned off.

## Considered Options

- **Register a minimal `/ponytail` command file.** Rejected: reintroduces the slash-command
  infrastructure §3 deliberately excluded, for a UX gain we can get from plain-text triggers.
- **Match the slash form only.** Rejected: bets the headline feature on undocumented unknown-
  slash-command behavior; if Claude Code intercepts it, the mode never turns on.
- **Per-session or per-project flag.** Rejected: session-keying and cleanup are infrastructure
  the mode doesn't need (YAGNI); a global flag gives true "it stays on until I switch it off"
  semantics matching upstream ponytail.

## Consequences

Activation is a small, explicit phrase set (whole-message match) to avoid false positives —
the broader skill-description phrases (`simplest solution`, `yagni`, `do less`) still let the
model invoke the skill for a single response, but only the explicit triggers start persistence.
Invoking the skill by name loads its guidance but does **not** start persistence; only a trigger
phrase the hook catches does. The global flag means turning ponytail on in one project keeps it
on in unrelated projects until `stop ponytail`; the per-turn injected `PONYTAIL MODE ACTIVE`
text is the only running signal, since the statusline badge is out of scope.

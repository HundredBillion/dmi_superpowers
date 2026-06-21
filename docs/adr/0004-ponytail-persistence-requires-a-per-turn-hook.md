# Ponytail's persistent mode requires a per-turn hook — dmi's first beyond SessionStart

Ponytail's "active every response" behavior is produced by a `UserPromptSubmit` hook that
re-injects the minimalism instructions and tracks the active intensity (`lite`/`full`/`ultra`)
on every turn — *not* by `SKILL.md`, which the runtime loads once per session (see
[ADR-0002](0002-skill-verification-content-simulation.md)). To deliver a genuinely persistent
minimalism mode rather than a one-shot skill that fades, we port a minimal, rebranded version of
that hook (mode-tracker + instruction-injector + a mode flag file). This is the **first per-turn
hook in dmi**, which otherwise ships only a `SessionStart` bootstrap.

## Considered Options

- **Accept a one-shot skill, no persistence.** Rejected: surrenders the headline capability —
  the whole point is resisting drift back to over-building across a session.
- **Port ponytail's full hook/runtime/statusline/MCP suite.** Rejected: unnecessary
  infrastructure; we take only the hook the mode physically requires.

## Consequences

Persistence works only on harnesses that support a per-turn hook (Claude Code first, then
Codex/Cursor). Elsewhere the `ponytail` skill degrades gracefully to invoke-on-demand, and that
degradation is documented. This is a deliberate departure from the PRD's original "concepts
only, no hooks" scope: the minimalism *mode* cannot exist without this one hook.
